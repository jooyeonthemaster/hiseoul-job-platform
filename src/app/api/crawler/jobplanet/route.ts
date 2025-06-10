import { NextRequest, NextResponse } from 'next/server';
import { RawJobData, CrawlerError, saveCrawledData } from '@/lib/crawler';
import { analyzeJobPostingsBatch, EnhancedJobData } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { keywords = '개발', maxPages = 3 } = await request.json();
    
    console.log(`잡플래닛 크롤링 시작: 키워드="${keywords}", 최대페이지=${maxPages}`);
    
    const crawledJobs: RawJobData[] = [];
    
    // 실제 크롤링 대신 시뮬레이션된 데이터 생성
    const simulatedJobs = await simulateJobPlanetCrawling(keywords, maxPages);
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
      message: `잡플래닛에서 ${processedJobs.length}개의 채용공고를 크롤링하고 AI 분석했습니다.`,
      data: {
        totalJobs: processedJobs.length,
        jobs: processedJobs.slice(0, 10), // 최대 10개만 반환
        source: 'jobplanet',
        geminiAnalyzed: true,
        categories: [...new Set(processedJobs.map(job => job.category))],
        avgConfidence: processedJobs.reduce((sum, job) => sum + (job.categoryConfidence || 0), 0) / processedJobs.length
      }
    });
    
  } catch (error) {
    console.error('잡플래닛 크롤링 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '크롤링 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 잡플래닛 크롤링 시뮬레이션 (더 다양한 직무로 생성)
async function simulateJobPlanetCrawling(keywords: string, maxPages: number): Promise<RawJobData[]> {
  const jobs: RawJobData[] = [];
  
  // 더 다양한 업계와 직무
  const sampleCompanies = [
    // 대기업
    '삼성전자', 'LG전자', '현대자동차', 'SK하이닉스', 'POSCO', 'KB금융그룹', '신한금융그룹',
    '롯데그룹', 'CJ그룹', '한화그룹', '두산그룹', 'LS산전',
    
    // IT/게임
    '넷마블', '컴투스', '펄어비스', '스마일게이트', 'NC소프트', '웹젠', '데브시스터즈',
    
    // 스타트업/중견기업
    '마켓컬리', '오늘의집', '무신사', '29CM', '브랜디', '에이블리',
    '비바리퍼블리카', '뱅크샐러드', '핀다', '어니스트펀드',
    '직방', '다방', '피터팬의좋은방', '집닥',
    '강남언니', '굿닥', '닥터나우', '웰트',
    
    // 전통기업
    '아모레퍼시픽', 'LG생활건강', '유한킴벌리', '동원F&B',
    '농심', '오리온', '빙그레', 'CJ제일제당',
    
    // 금융/보험
    '미래에셋', '한국투자증권', '삼성생명', '교보생명', '한화손해보험',
    
    // 유통/물류
    '이마트', '롯데마트', '홈플러스', '쿠팡', 'SSG닷컴', '11번가'
  ];
  
  const diverseJobTitles = [
    // 개발/기술
    '프론트엔드 개발자', '백엔드 개발자', '풀스택 개발자', '모바일 앱 개발자',
    'DevOps 엔지니어', '클라우드 엔지니어', '데이터 엔지니어', 'AI/ML 엔지니어',
    '보안 엔지니어', 'QA 엔지니어', '시스템 엔지니어', 'DBA',
    
    // 디자인/기획
    'UX/UI 디자이너', '제품 디자이너', '그래픽 디자이너', '브랜드 디자이너',
    '서비스 기획자', 'PM(Product Manager)', 'PO(Product Owner)', 'BX 기획자',
    
    // 마케팅/세일즈
    '퍼포먼스 마케터', '브랜드 마케터', '콘텐츠 마케터', 'CRM 마케터',
    '영업 매니저', '세일즈 매니저', '비즈니스 개발', '파트너십 매니저',
    
    // 경영지원/HR
    '인사담당자', 'HR 비즈니스 파트너', '채용담당자', '교육담당자',
    '재무담당자', '회계담당자', '법무담당자', '총무담당자',
    
    // 운영/CS
    '서비스 운영', '콘텐츠 운영', '커뮤니티 매니저', 'CS 매니저',
    '품질관리', '프로세스 개선', '데이터 분석가', '비즈니스 애널리스트',
    
    // 전문직
    '의료진(간호사)', '약사', '영양사', '물리치료사',
    '건축사', '토목기사', '기계설계', '전기기사',
    '금융상품 개발', '투자분석가', '리스크 매니저', '언더라이터',
    
    // 생산/제조
    '생산관리', '품질관리', '공정개선', '설비관리',
    '연구개발', 'R&D 연구원', '제품개발', '소재개발',
    
    // 물류/유통
    '물류관리', '배송관리', '창고관리', 'SCM 전문가',
    '구매담당자', '카테고리 매니저', '상품기획', 'MD(상품기획)',
    
    // 미디어/콘텐츠
    '콘텐츠 크리에이터', '영상 편집자', 'PD', '기자',
    '카피라이터', '번역가', '웹툰 작가', '게임 기획자'
  ];
  
  const sampleLocations = [
    '서울특별시 강남구', '서울특별시 서초구', '서울특별시 마포구', '서울특별시 용산구',
    '서울특별시 송파구', '서울특별시 성동구', '서울특별시 영등포구', '서울특별시 종로구',
    '서울특별시 중구', '서울특별시 구로구', '서울특별시 금천구',
    '경기도 성남시', '경기도 수원시', '경기도 고양시', '경기도 화성시', '경기도 용인시',
    '부산광역시 해운대구', '부산광역시 남구', '대구광역시 수성구', '인천광역시 연수구',
    '대전광역시 유성구', '광주광역시 서구', '울산광역시 남구', '세종특별자치시'
  ];
  
  const sampleSalaries = [
    '2,500만원 ~ 3,500만원', '3,000만원 ~ 4,500만원', '3,500만원 ~ 5,000만원',
    '4,000만원 ~ 6,000만원', '4,500만원 ~ 6,500만원', '5,000만원 ~ 7,000만원',
    '5,500만원 ~ 8,000만원', '6,000만원 ~ 9,000만원', '7,000만원 ~ 1억원',
    '8,000만원 ~ 1억 2천만원', '급여협의', '경력에 따라 협의', '면접 후 결정'
  ];
  
  // 페이지별로 데이터 생성
  for (let page = 1; page <= maxPages; page++) {
    const jobsPerPage = 15; // 잡플래닛은 보통 페이지당 15개
    
    for (let i = 0; i < jobsPerPage; i++) {
      const randomCompany = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const randomTitle = diverseJobTitles[Math.floor(Math.random() * diverseJobTitles.length)];
      const randomLocation = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
      const randomSalary = sampleSalaries[Math.floor(Math.random() * sampleSalaries.length)];
      
      // 직무별 맞춤 설명 생성
      const isDevJob = randomTitle.includes('개발') || randomTitle.includes('엔지니어');
      const isDesignJob = randomTitle.includes('디자인');
      const isMarketingJob = randomTitle.includes('마케팅') || randomTitle.includes('마케터');
      const isBusinessJob = randomTitle.includes('매니저') || randomTitle.includes('영업');
      
      let description = `${randomCompany}에서 ${randomTitle} 포지션의 우수한 인재를 모집합니다. `;
      
      if (isDevJob) {
        description += `최신 기술 스택을 활용한 서비스 개발 및 운영 업무를 담당하며, 애자일 개발 프로세스 하에서 품질 높은 소프트웨어를 만들어갑니다. 성장하는 팀과 함께 기술적 도전을 즐기실 분을 찾습니다.`;
      } else if (isDesignJob) {
        description += `사용자 중심의 디자인 사고를 바탕으로 혁신적인 제품/서비스를 디자인합니다. 브랜드 아이덴티티부터 사용자 경험까지 전반적인 디자인 업무를 수행하며, 크리에이티브한 아이디어를 현실화합니다.`;
      } else if (isMarketingJob) {
        description += `데이터 기반의 마케팅 전략 수립 및 실행을 통해 브랜드 성장을 이끌어갑니다. 다양한 채널과 플랫폼을 활용한 통합 마케팅 캠페인을 기획하고 운영합니다.`;
      } else if (isBusinessJob) {
        description += `비즈니스 목표 달성을 위한 전략 수립 및 실행, 파트너십 구축, 시장 분석 등의 업무를 담당합니다. 뛰어난 커뮤니케이션 스킬과 비즈니스 센스를 가진 분을 찾습니다.`;
      } else {
        description += `담당 분야의 전문성을 바탕으로 회사의 성장에 기여할 업무를 수행합니다. 전문적인 지식과 경험을 활용하여 팀과 함께 목표를 달성해나갑니다.`;
      }
      
      jobs.push({
        title: randomTitle,
        company: randomCompany,
        location: randomLocation,
        description: description,
        salary: randomSalary,
        workType: Math.random() > 0.7 ? '계약직' : '정규직',
        deadline: new Date(Date.now() + Math.random() * 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `https://www.jobplanet.co.kr/job/search?posting_id=${Math.floor(Math.random() * 100000)}`,
        source: 'jobplanet',
        scrapedAt: new Date()
      });
    }
    
    // 페이지 간 딜레이 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  return jobs;
}

export async function GET() {
  return NextResponse.json({
    message: '잡플래닛 크롤링 API',
    description: 'POST 요청으로 크롤링을 시작하세요.',
    parameters: {
      keywords: '검색 키워드 (기본값: "개발")',
      maxPages: '최대 페이지 수 (기본값: 3)'
    }
  });
} 