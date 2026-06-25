// 크롤링 관련 유틸리티 함수들
import { JobPosting } from '@/types';
import { analyzeJobPostingsBatch } from './gemini';

// 크롤링된 원시 데이터 타입
export interface RawJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  workType?: string;
  deadline?: string;
  url: string;
  source: 'jobkorea' | 'jobplanet';
  scrapedAt: Date;
}

// 크롤링 설정
export const CRAWLER_CONFIG = {
  jobkorea: {
    baseUrl: 'https://www.jobkorea.co.kr',
    searchEndpoint: '/Search/',
    maxPages: 5,
    delay: 2000, // 2초 딜레이
  },
  jobplanet: {
    baseUrl: 'https://www.jobplanet.co.kr',
    searchEndpoint: '/job',
    maxPages: 5,
    delay: 2000,
  },
} as const;

// 크롤링 카테고리 매핑
export const CATEGORY_MAPPING = {
  '개발': ['프론트엔드', '백엔드', '풀스택', '앱개발', '웹개발', 'React', 'Node.js', 'Java', 'Python'],
  '디자인': ['UI/UX', '웹디자인', '그래픽디자인', 'Figma', 'Adobe'],
  '데이터': ['데이터분석', '데이터사이언스', 'AI', 'ML', '머신러닝', '빅데이터'],
  '마케팅': ['디지털마케팅', 'SNS마케팅', '퍼포먼스마케팅', '브랜드마케팅'],
  '영업': ['B2B영업', 'B2C영업', '해외영업', '기술영업'],
  '기획': ['서비스기획', '사업기획', '전략기획', 'PM', 'PO'],
} as const;

// 원시 데이터를 JobPosting 형태로 변환
export function transformRawDataToJobPosting(rawData: RawJobData, id: string): Partial<JobPosting> {
  // 카테고리 자동 분류
  const jobCategory = categorizeJob(rawData.title, rawData.description);
  
  // 근무 형태 파싱
  const workType = parseWorkType(rawData.workType || '');
  
  // 급여 정보 파싱
  const salary = parseSalary(rawData.salary || '');
  
  return {
    id,
    employerId: `employer-${Date.now()}`,
    companyName: rawData.company,
    title: rawData.title,
    jobCategory,
    description: rawData.description,
    location: rawData.location,
    workType,
    salary,
    category: jobCategory,
    skills: extractSkills(rawData.title, rawData.description),
    isActive: true,
    createdAt: rawData.scrapedAt,
    updatedAt: rawData.scrapedAt,
    deadline: rawData.deadline ? new Date(rawData.deadline) : undefined,
    // 기본값들
    requirements: ['상세 요구사항은 공고를 확인해주세요'],
    responsibilities: ['상세 업무내용은 공고를 확인해주세요'],
    benefits: ['복리후생은 공고를 확인해주세요'],
    preferredQualifications: ['우대사항은 공고를 확인해주세요'],
    workingHours: '상세 근무시간은 공고를 확인해주세요',
    recruiterInfo: {
      name: '채용담당자',
      position: '인사팀',
      phone: '문의 바랍니다',
      email: '문의 바랍니다'
    }
  };
}

// 제목과 설명으로 직무 카테고리 자동 분류
function categorizeJob(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return '기타';
}

// 근무 형태 파싱
function parseWorkType(workTypeStr: string): 'fulltime' | 'parttime' | 'contract' | 'intern' {
  const text = workTypeStr.toLowerCase();
  
  if (text.includes('인턴') || text.includes('intern')) return 'intern';
  if (text.includes('계약') || text.includes('contract')) return 'contract';
  if (text.includes('파트') || text.includes('part')) return 'parttime';
  
  return 'fulltime';
}

// 급여 정보 파싱
function parseSalary(salaryStr: string): { type: '연봉' | '월급' | '시급' | '기타'; amount?: string; negotiable?: boolean } {
  if (!salaryStr) {
    return { type: '기타', negotiable: true };
  }
  
  const hasAnnual = salaryStr.includes('연봉') || salaryStr.includes('년');
  const hasMonthly = salaryStr.includes('월급') || salaryStr.includes('월');
  const hasHourly = salaryStr.includes('시급') || salaryStr.includes('시간');
  
  let type: '연봉' | '월급' | '시급' | '기타' = '기타';
  if (hasAnnual) type = '연봉';
  else if (hasMonthly) type = '월급';
  else if (hasHourly) type = '시급';
  
  return {
    type,
    amount: salaryStr,
    negotiable: salaryStr.includes('협의') || salaryStr.includes('상담')
  };
}

// 기술 스택 추출
function extractSkills(title: string, description: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const skills: string[] = [];
  
  // 기술 스택 키워드들
  const techKeywords = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'express',
    'java', 'spring', 'python', 'django', 'flask', 'php', 'laravel',
    'c#', '.net', 'go', 'rust', 'kotlin', 'swift',
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes',
    'figma', 'sketch', 'photoshop', 'illustrator',
    'git', 'github', 'gitlab', 'jira', 'slack'
  ];
  
  techKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      skills.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  return skills.slice(0, 8); // 최대 8개까지
}

// 크롤링 결과 저장 (파이어베이스) - Gemini 분석 통합
export async function saveCrawledData(data: RawJobData[]): Promise<void> {
  try {
    console.log(`📊 saveCrawledData 시작: ${data.length}개 데이터 저장 시도`);
    
    // 1단계: Gemini로 모든 데이터 분석
    console.log('🤖 Gemini AI 분석 시작...');
    const enhancedJobs = await analyzeJobPostingsBatch(data, 3); // 배치 크기 3개씩
    console.log(`✅ Gemini 분석 완료: ${enhancedJobs.length}개 채용공고 분석`);
    
    // 서버 전용 경로: 보안 규칙(crawled-jobs write: admin)을 우회하려면 Admin SDK 사용
    const { getAdminDb } = await import('@/lib/firebaseAdmin');
    const { FieldValue } = await import('firebase-admin/firestore');
    const adminDb = getAdminDb();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log('🔥 파이어베이스 DB 연결 성공 (Admin SDK)');
    
    // 2단계: 분석된 데이터를 파이어베이스에 저장
    const promises = enhancedJobs.map(async (enhancedJob, index) => {
      try {
        const originalData = data[index];
        console.log(`📄 ${index + 1}/${enhancedJobs.length} 데이터 저장 중...`);
        
        // 기본 JobPosting 구조 생성 (하지만 Gemini 분석 결과 우선 적용)
        const baseJobPosting = transformRawDataToJobPosting(originalData, `crawled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        
        const docData = {
          // 기본 정보
          ...baseJobPosting,
          
          // Gemini 분석 결과로 덮어쓰기
          title: enhancedJob.title,
          category: enhancedJob.category,
          jobCategory: enhancedJob.category,
          description: enhancedJob.description,
          skills: enhancedJob.skills,
          requirements: enhancedJob.requirements,
          benefits: enhancedJob.benefits,
          
          // Gemini 분석 메타데이터
          categoryConfidence: enhancedJob.categoryConfidence,
          salaryInfo: enhancedJob.salaryInfo,
          geminiAnalyzed: true,
          geminiModel: enhancedJob.geminiModel,
          analysisTimestamp: enhancedJob.analysisTimestamp,
          
          // 원본 크롤링 정보
          source: originalData.source,
          externalUrl: originalData.url,
          
          // 파이어베이스 메타데이터
          crawledAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          isActive: true,
          isCrawled: true,
        };
        
        console.log(`💾 파이어베이스에 저장 중: ${enhancedJob.company} - ${enhancedJob.title} (${enhancedJob.category})`);
        const result = await adminDb.collection('crawled-jobs').add(docData);
        console.log(`✅ 저장 완료: ${result.id}`);
        
        return result;
      } catch (saveError) {
        console.error(`❌ 개별 저장 실패 (${index + 1}/${enhancedJobs.length}):`, saveError);
        console.error('실패한 데이터:', enhancedJobs[index]);
        throw saveError;
      }
    });
    
    console.log('⏳ 모든 데이터 저장 대기 중...');
    const results = await Promise.all(promises);
    
    console.log(`🎉 파이어베이스에 ${data.length}개의 Gemini 분석된 채용공고를 성공적으로 저장했습니다!`);
    console.log('📋 저장된 문서 IDs:', results.map(doc => doc.id));
    
    // 분석 통계 로그
    const categoryStats: Record<string, number> = {};
    enhancedJobs.forEach(job => {
      categoryStats[job.category] = (categoryStats[job.category] || 0) + 1;
    });
    console.log('📊 카테고리 분포:', categoryStats);
    
    // 백업용으로 로컬 스토리지에도 저장
    if (typeof window !== 'undefined') {
      const dataToSave = {
        metadata: {
          crawledAt: new Date().toISOString(),
          totalJobs: data.length,
          sources: [...new Set(data.map(job => job.source))],
          firebaseIds: results.map(doc => doc.id),
          geminiAnalyzed: true,
          categoryDistribution: categoryStats
        },
        jobs: enhancedJobs
      };
      localStorage.setItem(`crawled-jobs-${timestamp}`, JSON.stringify(dataToSave));
      console.log('💾 로컬 스토리지 백업 완료 (Gemini 분석 포함)');
    }
    
  } catch (error) {
    console.error('🚨 파이어베이스에 크롤링 데이터 저장 중 치명적 오류:', error);
    console.error('오류 상세:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 파이어베이스 저장 실패 시에도 Gemini 분석은 시도해서 로컬에 저장
    try {
      console.log('🔄 오류 발생으로 기본 분석 후 로컬 저장 시도...');
      
      if (typeof window !== 'undefined') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dataToSave = {
          metadata: {
            crawledAt: new Date().toISOString(),
            totalJobs: data.length,
            sources: [...new Set(data.map(job => job.source))],
            error: 'Firebase save failed',
            errorMessage: error instanceof Error ? error.message : String(error)
          },
          jobs: data
        };
        localStorage.setItem(`crawled-jobs-${timestamp}`, JSON.stringify(dataToSave));
        console.log('💾 오류 발생으로 로컬 스토리지에만 저장 완료');
      }
    } catch (fallbackError) {
      console.error('💥 백업 저장도 실패:', fallbackError);
    }
    
    throw error;
  }
}

// 파이어베이스에서 크롤링된 채용공고 조회 (인덱스 오류 해결)
export async function getCrawledJobsFromFirebase(limit: number = 50): Promise<JobPosting[]> {
  try {
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs, query, orderBy, limit: firestoreLimit } = await import('firebase/firestore');
    
    const crawledJobsRef = collection(db, 'crawled-jobs');
    
    // 인덱스 오류를 피하기 위해 단순한 쿼리 사용 (orderBy만)
    const q = query(
      crawledJobsRef,
      orderBy('crawledAt', 'desc'),
      firestoreLimit(limit * 2) // 여유분을 두고 더 많이 가져와서 필터링
    );
    
    const querySnapshot = await getDocs(q);
    const jobs: JobPosting[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // isActive가 false인 데이터는 클라이언트에서 필터링
      if (data.isActive === false) {
        return;
      }
      
      // Firestore 타임스탬프를 Date로 변환
      const job: JobPosting = {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || undefined,
      } as JobPosting;
      
      jobs.push(job);
    });
    
    // 제한된 개수만 반환
    const limitedJobs = jobs.slice(0, limit);
    
    console.log(`파이어베이스에서 ${limitedJobs.length}개의 크롤링된 채용공고를 조회했습니다. (전체: ${jobs.length}개)`);
    return limitedJobs;
    
  } catch (error) {
    console.error('파이어베이스에서 크롤링 데이터 조회 중 오류:', error);
    
         // 다시 한번 더 단순한 쿼리로 시도
     try {
       console.log('더 단순한 쿼리로 재시도...');
       const { db } = await import('@/lib/firebase');
       const { collection, getDocs, query, limit: firestoreLimit } = await import('firebase/firestore');
       
       const crawledJobsRef = collection(db, 'crawled-jobs');
       const q = query(crawledJobsRef, firestoreLimit(limit));
       
       const querySnapshot = await getDocs(q);
       const jobs: JobPosting[] = [];
       
       querySnapshot.forEach((doc) => {
         const data = doc.data() as any;
         
         // isActive가 false인 데이터는 제외
         if (data.isActive === false) {
           return;
         }
         
         const job: JobPosting = {
           ...data,
           id: doc.id,
           createdAt: data.createdAt?.toDate() || new Date(),
           updatedAt: data.updatedAt?.toDate() || new Date(),
           deadline: data.deadline?.toDate() || undefined,
         } as JobPosting;
         
         jobs.push(job);
       });
       
       console.log(`단순한 쿼리로 ${jobs.length}개의 크롤링된 채용공고를 조회했습니다.`);
       return jobs;
       
     } catch (fallbackError) {
       console.error('단순한 쿼리도 실패:', fallbackError);
       return [];
     }
  }
}

// 크롤링 에러 핸들링
export class CrawlerError extends Error {
  constructor(
    message: string,
    public source: string,
    public url?: string
  ) {
    super(message);
    this.name = 'CrawlerError';
  }
}

// 크롤링 진행상황 추적
export interface CrawlProgress {
  total: number;
  completed: number;
  currentSource: string;
  currentPage: number;
  errors: CrawlerError[];
}

export type CrawlProgressCallback = (progress: CrawlProgress) => void; 