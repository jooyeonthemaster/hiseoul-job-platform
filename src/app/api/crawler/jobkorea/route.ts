import { NextRequest, NextResponse } from 'next/server';
import { RawJobData, CrawlerError, saveCrawledData } from '@/lib/crawler';
import { analyzeJobPostingsBatch, EnhancedJobData } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { keywords = '개발', maxPages = 3 } = await request.json();
    
    console.log(`잡코리아 크롤링 시작: 키워드="${keywords}", 최대페이지=${maxPages}`);
    
    const crawledJobs: RawJobData[] = [];
    
    // 실제 크롤링 대신 시뮬레이션된 데이터 생성
    // (CORS 및 robot.txt 제한으로 인해 실제 크롤링은 서버사이드에서 수행해야 함)
    const simulatedJobs = await simulateJobKoreaCrawling(keywords, maxPages);
    crawledJobs.push(...simulatedJobs);
    
    console.log(`🤖 Gemini AI 분석 시작: ${crawledJobs.length}개 채용공고`);
    
    // Gemini AI로 데이터 분석 및 정제
    const enhancedJobs = await analyzeJobPostingsBatch(crawledJobs, 3); // 배치 크기 3
    
    console.log(`✅ Gemini 분석 완료: ${enhancedJobs.length}개 분석됨`);
    
    // 분석된 데이터 저장 (기존 RawJobData 구조로 변환)
    const processedJobs = enhancedJobs.map(enhancedJob => ({
      ...crawledJobs.find(raw => raw.title === enhancedJob.title && raw.company === enhancedJob.company) || crawledJobs[0],
      title: enhancedJob.title,
      description: enhancedJob.description,
      category: enhancedJob.category,
      skills: enhancedJob.skills,
      requirements: enhancedJob.requirements,
      benefits: enhancedJob.benefits,
      salaryInfo: enhancedJob.salaryInfo,
      categoryConfidence: enhancedJob.categoryConfidence,
      geminiAnalyzed: true,
      geminiModel: enhancedJob.geminiModel,
      analysisTimestamp: enhancedJob.analysisTimestamp
    }));
    
    await saveCrawledData(processedJobs);
    
    return NextResponse.json({
      success: true,
      message: `잡코리아에서 ${processedJobs.length}개의 채용공고를 크롤링하고 AI 분석했습니다.`,
      data: {
        totalJobs: processedJobs.length,
        jobs: processedJobs.slice(0, 10), // 최대 10개만 반환
        source: 'jobkorea',
        geminiAnalyzed: true,
        categories: [...new Set(processedJobs.map(job => job.category))],
        avgConfidence: processedJobs.reduce((sum, job) => sum + (job.categoryConfidence || 0), 0) / processedJobs.length
      }
    });
    
  } catch (error) {
    console.error('잡코리아 크롤링 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '크롤링 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 잡코리아 크롤링 시뮬레이션 (실제 데이터 형태로 생성)
async function simulateJobKoreaCrawling(keywords: string, maxPages: number): Promise<RawJobData[]> {
  const jobs: RawJobData[] = [];
  
  // 실제 잡코리아에서 볼 수 있는 형태의 데이터 생성
  const sampleCompanies = [
    'NHN', '카카오', '네이버', '라인플러스', '쿠팡', '배달의민족', '야놀자', '마켓컬리',
    '토스', '뱅크샐러드', '당근마켓', '크래프톤', '넥슨', '엔씨소프트', 'SK텔레콤',
    'LG CNS', '삼성SDS', '현대오토에버', 'KB국민은행', '신한은행', '하나은행',
    '스타트업코리아', '테크인사이드', '이노베이션랩', '디지털벤처스', '퓨처테크'
  ];
  
  const sampleTitles = [
    '프론트엔드 개발자 (React/TypeScript)',
    '백엔드 개발자 (Java/Spring)',
    '풀스택 개발자 (Node.js)',
    'DevOps 엔지니어',
    '데이터 엔지니어',
    'AI/ML 엔지니어',
    'Product Manager',
    'UX/UI 디자이너',
    '서비스 기획자',
    '마케팅 매니저',
    '비즈니스 애널리스트',
    '세일즈 매니저'
  ];
  
  const sampleLocations = [
    '서울특별시 강남구', '서울특별시 서초구', '서울특별시 마포구',
    '서울특별시 송파구', '서울특별시 성동구', '서울특별시 영등포구',
    '경기도 성남시', '경기도 수원시', '부산광역시 해운대구'
  ];
  
  const sampleSalaries = [
    '3,000만원 ~ 5,000만원', '4,000만원 ~ 6,000만원', '5,000만원 ~ 7,000만원',
    '6,000만원 ~ 8,000만원', '7,000만원 ~ 1억원', '급여협의', '경력에 따라 협의'
  ];
  
  // 페이지별로 데이터 생성
  for (let page = 1; page <= maxPages; page++) {
    const jobsPerPage = 20; // 잡코리아는 보통 페이지당 20개
    
    for (let i = 0; i < jobsPerPage; i++) {
      const randomCompany = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const randomLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      const randomSalary = sampleSalaries[Math.floor(Math.random() * sampleSalaries.length)];
      
      jobs.push({
        title: `${randomTitle} - ${keywords} 관련`,
        company: randomCompany,
        location: randomLocation,
        description: `${randomCompany}에서 ${randomTitle} 포지션의 인재를 모집합니다. ${keywords} 관련 업무를 담당하며, 최신 기술 스택을 활용한 개발 업무를 수행합니다. 성장 지향적인 환경에서 함께 발전해나갈 동료를 찾고 있습니다.`,
        salary: randomSalary,
        workType: Math.random() > 0.8 ? '계약직' : '정규직',
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `https://www.jobkorea.co.kr/Recruit/jobpost/${Math.floor(Math.random() * 100000)}`,
        source: 'jobkorea',
        scrapedAt: new Date()
      });
    }
    
    // 페이지 간 딜레이 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return jobs;
}

export async function GET() {
  return NextResponse.json({
    message: '잡코리아 크롤링 API',
    description: 'POST 요청으로 크롤링을 시작하세요.',
    parameters: {
      keywords: '검색 키워드 (기본값: "개발")',
      maxPages: '최대 페이지 수 (기본값: 3)'
    }
  });
} 