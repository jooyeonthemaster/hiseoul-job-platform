import { NextRequest, NextResponse } from 'next/server';
import { JobPosting } from '@/types';
import { sampleJobPostings } from '@/data/sample-job-postings';
import { transformRawDataToJobPosting, RawJobData, getCrawledJobsFromFirebase } from '@/lib/crawler';

// 크롤링된 데이터를 시뮬레이션하는 함수 (실제로는 크롤링 API에서 가져옴)
async function getCrawledJobData(): Promise<RawJobData[]> {
  const crawledJobs: RawJobData[] = [];
  
  // 잡코리아 크롤링 시뮬레이션
  try {
    const jobkoreaResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/crawler/jobkorea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: '개발', maxPages: 2 })
    });
    
    if (jobkoreaResponse.ok) {
      const jobkoreaData = await jobkoreaResponse.json();
      if (jobkoreaData.success && jobkoreaData.data?.jobs) {
        crawledJobs.push(...jobkoreaData.data.jobs);
      }
    }
  } catch (error) {
    console.log('잡코리아 크롤링 실패:', error);
  }
  
  // 잡플래닛 크롤링 시뮬레이션
  try {
    const jobplanetResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/crawler/jobplanet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: '개발', maxPages: 2 })
    });
    
    if (jobplanetResponse.ok) {
      const jobplanetData = await jobplanetResponse.json();
      if (jobplanetData.success && jobplanetData.data?.jobs) {
        crawledJobs.push(...jobplanetData.data.jobs);
      }
    }
  } catch (error) {
    console.log('잡플래닛 크롤링 실패:', error);
  }
  
  return crawledJobs;
}

// 크롤링된 데이터를 JobPosting으로 변환
function convertCrawledDataToJobPostings(crawledData: RawJobData[]): JobPosting[] {
  return crawledData.map((rawJob, index) => {
    const baseJobPosting = transformRawDataToJobPosting(rawJob, `crawled-${Date.now()}-${index}`);
    
    // JobPosting에 필요한 모든 필드 채우기
    const jobPosting: JobPosting = {
      id: baseJobPosting.id!,
      employerId: baseJobPosting.employerId!,
      companyName: baseJobPosting.companyName!,
      title: baseJobPosting.title!,
      jobCategory: baseJobPosting.jobCategory!,
      description: baseJobPosting.description!,
      location: baseJobPosting.location!,
      workType: baseJobPosting.workType!,
      salary: baseJobPosting.salary!,
      category: baseJobPosting.category!,
      skills: baseJobPosting.skills!,
      requirements: baseJobPosting.requirements!,
      responsibilities: baseJobPosting.responsibilities!,
      benefits: baseJobPosting.benefits!,
      preferredQualifications: baseJobPosting.preferredQualifications!,
      workingHours: baseJobPosting.workingHours!,
      recruiterInfo: baseJobPosting.recruiterInfo!,
      isActive: baseJobPosting.isActive!,
      createdAt: baseJobPosting.createdAt!,
      updatedAt: baseJobPosting.updatedAt!,
      deadline: baseJobPosting.deadline,
      // 크롤링된 데이터임을 표시하는 추가 정보
      source: rawJob.source,
      externalUrl: rawJob.url
    };
    
    return jobPosting;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCrawled = searchParams.get('includeCrawled') !== 'false'; // 기본값은 true
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const workType = searchParams.get('workType');
    const location = searchParams.get('location');
    
    console.log('채용공고 API 호출:', { includeCrawled, limit, category, workType, location });
    
    let allJobs: JobPosting[] = [...sampleJobPostings];
    
    // 크롤링된 데이터 포함하기
    if (includeCrawled) {
      try {
        // 파이어베이스에서 크롤링된 데이터 직접 조회
        const crawledJobPostings = await getCrawledJobsFromFirebase(limit);
        
        console.log(`파이어베이스에서 크롤링된 채용공고 ${crawledJobPostings.length}개 조회`);
        allJobs = [...allJobs, ...crawledJobPostings];
      } catch (error) {
        console.error('파이어베이스 크롤링 데이터 조회 실패:', error);
        
        // 파이어베이스 실패 시 API를 통한 크롤링 시도
        try {
          const crawledData = await getCrawledJobData();
          const crawledJobPostings = convertCrawledDataToJobPostings(crawledData);
          
          console.log(`API를 통한 크롤링된 채용공고 ${crawledJobPostings.length}개 추가`);
          allJobs = [...allJobs, ...crawledJobPostings];
        } catch (apiError) {
          console.error('API 크롤링 데이터 통합 실패:', apiError);
          // 모든 크롤링 실패해도 샘플 데이터는 계속 제공
        }
      }
    }
    
    // 필터링 적용
    let filteredJobs = allJobs;
    
    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.jobCategory === category);
    }
    
    if (workType && workType !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.workType === workType);
    }
    
    if (location && location !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // 정렬 (최신순)
    filteredJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 제한
    const limitedJobs = filteredJobs.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: {
        jobs: limitedJobs,
        total: filteredJobs.length,
        sampleCount: sampleJobPostings.length,
        crawledCount: allJobs.length - sampleJobPostings.length
      }
    });
    
  } catch (error) {
    console.error('채용공고 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '채용공고를 불러오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      data: {
        jobs: sampleJobPostings.slice(0, 10), // 오류 시 샘플 데이터라도 제공
        total: sampleJobPostings.length,
        sampleCount: sampleJobPostings.length,
        crawledCount: 0
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();
    
    if (action === 'refresh-crawled-data') {
      // 크롤링 데이터 새로고침
      const crawledData = await getCrawledJobData();
      const crawledJobPostings = convertCrawledDataToJobPostings(crawledData);
      
      return NextResponse.json({
        success: true,
        message: `${crawledJobPostings.length}개의 새로운 채용공고를 크롤링했습니다.`,
        data: {
          jobs: crawledJobPostings.slice(0, 10), // 최대 10개만 미리보기
          total: crawledJobPostings.length
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '지원되지 않는 액션입니다.'
    }, { status: 400 });
    
  } catch (error) {
    console.error('채용공고 POST API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '요청 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 