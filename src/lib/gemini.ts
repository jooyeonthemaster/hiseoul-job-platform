import { GoogleGenerativeAI } from '@google/generative-ai';
import { RawJobData } from './crawler';

// Gemini API 초기화
let genAI: GoogleGenerativeAI | null = null;

function initializeGemini() {
  if (!genAI) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('🚨 NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다.');
      throw new Error('Gemini API 키가 필요합니다.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('🤖 Gemini AI 초기화 완료');
  }
  return genAI;
}

// 확장된 카테고리 시스템
export const ENHANCED_CATEGORIES = {
  // 기술/개발
  '프론트엔드 개발': ['React', 'Vue', 'Angular', '프론트엔드', 'Frontend', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
  '백엔드 개발': ['Node.js', 'Java', 'Python', 'Go', 'PHP', 'Ruby', '백엔드', 'Backend', 'API', '서버'],
  '모바일 개발': ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', '앱개발', '모바일'],
  '데브옵스': ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', '인프라', '클라우드'],
  '데이터': ['데이터분석', 'Data', 'ML', 'AI', '머신러닝', '인공지능', 'Python', 'SQL', '빅데이터'],
  'QA/테스트': ['QA', 'QC', '테스트', 'Test', '품질관리', '자동화테스트'],
  
  // 디자인/기획
  'UI/UX 디자인': ['UI', 'UX', 'Figma', 'Sketch', '디자인', 'Design', '사용자경험'],
  '그래픽 디자인': ['그래픽', 'Photoshop', 'Illustrator', '브랜딩', '비주얼'],
  '서비스 기획': ['기획', '서비스기획', 'PM', 'PO', 'Product', '프로덕트'],
  
  // 비즈니스
  '마케팅': ['마케팅', 'Marketing', '디지털마케팅', 'SNS', '퍼포먼스', '브랜드'],
  '영업': ['영업', 'Sales', 'B2B', 'B2C', '세일즈', '비즈니스개발'],
  '경영지원': ['경영지원', 'HR', '인사', '총무', '재무', '회계', '법무'],
  '고객서비스': ['고객서비스', 'CS', '고객상담', '콜센터', '고객관리'],
  
  // 전문직
  '금융': ['금융', '은행', '증권', '보험', '투자', '자산관리', 'Finance'],
  '의료': ['의료', '병원', '간호', '약사', '의사', '헬스케어'],
  '교육': ['교육', '강사', '교사', '연구', '학습', '교육기획'],
  '법무': ['법무', '변호사', '법률', '컴플라이언스', '계약'],
  
  // 기타
  '제조/생산': ['제조', '생산', '품질관리', '공장', '기계', '전자'],
  '물류/유통': ['물류', '유통', '배송', '운송', '창고', 'SCM'],
  '건설/건축': ['건설', '건축', '토목', '설계', '시공', '부동산'],
  '미디어/콘텐츠': ['미디어', '콘텐츠', '방송', '영상', '편집', '크리에이티브']
} as const;

export type EnhancedCategory = keyof typeof ENHANCED_CATEGORIES;

// Gemini를 활용한 채용공고 분석 및 정제
export interface EnhancedJobData {
  // 기본 정보 (정제된)
  title: string;
  company: string;
  location: string;
  description: string;
  
  // AI 분석 결과
  category: EnhancedCategory;
  categoryConfidence: number; // 0-1 점수
  
  // 추출된 정보
  skills: string[];
  requirements: string[];
  benefits: string[];
  salaryInfo: {
    type: '연봉' | '월급' | '시급' | '기타';
    min?: number;
    max?: number;
    currency: string;
    negotiable: boolean;
  };
  
  // 메타데이터
  analysisTimestamp: Date;
  geminiModel: string;
}

// Gemini 프롬프트 템플릿
const ANALYSIS_PROMPT = `
다음은 한국의 채용공고 데이터입니다. 이를 분석하여 JSON 형태로 정제된 정보를 제공해주세요.

채용공고 정보:
제목: {title}
회사: {company}
위치: {location}
설명: {description}
급여: {salary}

분석 요청사항:
1. 직무 카테고리 분류 (아래 카테고리 중 가장 적합한 것 선택)
2. 카테고리 신뢰도 (0-1 사이의 점수)
3. 기술 스택/스킬 추출
4. 자격 요건 추출  
5. 복리후생 추출
6. 급여 정보 파싱

사용 가능한 카테고리:
${Object.keys(ENHANCED_CATEGORIES).join(', ')}

응답 형식 (JSON):
{
  "category": "가장 적합한 카테고리",
  "categoryConfidence": 0.95,
  "skills": ["기술1", "기술2", "기술3"],
  "requirements": ["요구사항1", "요구사항2"],
  "benefits": ["복리후생1", "복리후생2"],
  "salaryInfo": {
    "type": "연봉",
    "min": 3000,
    "max": 5000,
    "currency": "만원",
    "negotiable": false
  },
  "refinedTitle": "정제된 직무명",
  "refinedDescription": "핵심 업무 내용 요약"
}

중요: 응답은 반드시 유효한 JSON 형태여야 하며, 한국어로 작성해주세요.
`;

// Gemini API를 사용한 채용공고 분석
export async function analyzeJobPostingWithGemini(rawJob: RawJobData): Promise<EnhancedJobData> {
  try {
    console.log(`🤖 Gemini 분석 시작: ${rawJob.company} - ${rawJob.title}`);
    
    const gemini = initializeGemini();
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // 프롬프트 생성
    const prompt = ANALYSIS_PROMPT
      .replace('{title}', rawJob.title)
      .replace('{company}', rawJob.company)
      .replace('{location}', rawJob.location)
      .replace('{description}', rawJob.description.substring(0, 1000)) // 길이 제한
      .replace('{salary}', rawJob.salary || '정보 없음');
    
    console.log('📝 Gemini 프롬프트 전송...');
    
    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    console.log('📨 Gemini 응답 수신:', responseText.substring(0, 200) + '...');
    
    // JSON 파싱
    let analysisResult;
    try {
      // JSON 코드 블록 제거 및 정제
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      console.log('원본 응답:', responseText);
      
      // 파싱 실패 시 기본값 사용
      analysisResult = generateFallbackAnalysis(rawJob);
    }
    
    // 결과 검증 및 정제
    const enhancedData: EnhancedJobData = {
      title: analysisResult.refinedTitle || rawJob.title,
      company: rawJob.company,
      location: rawJob.location,
      description: analysisResult.refinedDescription || rawJob.description,
      
      category: validateCategory(analysisResult.category),
      categoryConfidence: Math.min(Math.max(analysisResult.categoryConfidence || 0.5, 0), 1),
      
      skills: Array.isArray(analysisResult.skills) ? analysisResult.skills.slice(0, 10) : [],
      requirements: Array.isArray(analysisResult.requirements) ? analysisResult.requirements.slice(0, 5) : [],
      benefits: Array.isArray(analysisResult.benefits) ? analysisResult.benefits.slice(0, 5) : [],
      
      salaryInfo: {
        type: analysisResult.salaryInfo?.type || '기타',
        min: analysisResult.salaryInfo?.min,
        max: analysisResult.salaryInfo?.max,
        currency: analysisResult.salaryInfo?.currency || '만원',
        negotiable: analysisResult.salaryInfo?.negotiable || false
      },
      
      analysisTimestamp: new Date(),
      geminiModel: 'gemini-2.0-flash'
    };
    
    console.log(`✅ Gemini 분석 완료: ${enhancedData.category} (신뢰도: ${enhancedData.categoryConfidence})`);
    return enhancedData;
    
  } catch (error) {
    console.error(`🚨 Gemini 분석 실패 (${rawJob.company}):`, error);
    
    // 오류 시 기본 분석 결과 반환
    return generateFallbackAnalysis(rawJob);
  }
}

// 카테고리 유효성 검증
function validateCategory(category: string): EnhancedCategory {
  if (category && Object.keys(ENHANCED_CATEGORIES).includes(category)) {
    return category as EnhancedCategory;
  }
  
  // 기본값으로 키워드 기반 분류 시도
  const text = category?.toLowerCase() || '';
  
  for (const [cat, keywords] of Object.entries(ENHANCED_CATEGORIES)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return cat as EnhancedCategory;
    }
  }
  
  return '서비스 기획'; // 기본 카테고리
}

// Gemini 실패 시 대체 분석
function generateFallbackAnalysis(rawJob: RawJobData): EnhancedJobData {
  console.log('🔄 기본 분석 로직 사용');
  
  const text = (rawJob.title + ' ' + rawJob.description).toLowerCase();
  let category: EnhancedCategory = '서비스 기획';
  
  // 키워드 기반 분류
  for (const [cat, keywords] of Object.entries(ENHANCED_CATEGORIES)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      category = cat as EnhancedCategory;
      break;
    }
  }
  
  return {
    title: rawJob.title,
    company: rawJob.company,
    location: rawJob.location,
    description: rawJob.description,
    category,
    categoryConfidence: 0.6,
    skills: extractBasicSkills(text),
    requirements: ['상세 내용은 공고를 확인해주세요'],
    benefits: ['복리후생은 공고를 확인해주세요'],
    salaryInfo: {
      type: '기타',
      currency: '만원',
      negotiable: true
    },
    analysisTimestamp: new Date(),
    geminiModel: 'fallback'
  };
}

// 기본 스킬 추출
function extractBasicSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
    'Python', 'Java', 'Spring', 'Django', 'Flask',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'SQL',
    'Figma', 'Sketch', 'Photoshop', 'Illustrator'
  ];
  
  return commonSkills.filter(skill => 
    text.includes(skill.toLowerCase())
  ).slice(0, 8);
}

// 배치 분석 (여러 채용공고 동시 처리)
export async function analyzeJobPostingsBatch(rawJobs: RawJobData[], batchSize: number = 5): Promise<EnhancedJobData[]> {
  console.log(`🚀 Gemini 배치 분석 시작: ${rawJobs.length}개 채용공고`);
  
  const results: EnhancedJobData[] = [];
  
  for (let i = 0; i < rawJobs.length; i += batchSize) {
    const batch = rawJobs.slice(i, i + batchSize);
    console.log(`📦 배치 ${Math.floor(i / batchSize) + 1} 처리 중... (${batch.length}개)`);
    
    const batchPromises = batch.map(job => analyzeJobPostingWithGemini(job));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`❌ 배치 분석 실패 (${i + index + 1}):`, result.reason);
        results.push(generateFallbackAnalysis(batch[index]));
      }
    });
    
    // API 레이트 리밋 방지를 위한 딜레이
    if (i + batchSize < rawJobs.length) {
      console.log('⏳ API 레이트 리밋 방지 대기 (2초)...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`🎉 Gemini 배치 분석 완료: ${results.length}개 완료`);
  return results;
} 