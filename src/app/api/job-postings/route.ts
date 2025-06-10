import { NextRequest, NextResponse } from 'next/server';
import { sampleJobPostings } from '@/data/sample-job-postings';
import { JobPosting } from '@/types';

// GET - 채용공고 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const skills = searchParams.get('skills');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredJobs = [...sampleJobPostings];

    // 카테고리 필터링
    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.category.toLowerCase().includes(category.toLowerCase()) ||
        job.jobCategory.toLowerCase().includes(category.toLowerCase())
      );
    }

    // 지역 필터링
    if (location && location !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // 스킬 필터링
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredJobs = filteredJobs.filter(job =>
        job.skills.some(skill => 
          skillArray.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill)
          )
        )
      );
    }

    // 활성 상태 필터링
    filteredJobs = filteredJobs.filter(job => job.isActive);

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const response = {
      jobs: paginatedJobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredJobs.length / limit),
        totalItems: filteredJobs.length,
        hasNextPage: endIndex < filteredJobs.length,
        hasPrevPage: page > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('채용공고 조회 오류:', error);
    return NextResponse.json(
      { error: '채용공고를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST - 새 채용공고 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = ['title', 'jobCategory', 'description', 'location', 'employerId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field}는 필수 항목입니다.` },
          { status: 400 }
        );
      }
    }

    // 새 채용공고 생성
    const newJobPosting: JobPosting = {
      id: `job-${Date.now()}`,
      employerId: body.employerId,
      companyName: body.companyName || '회사명',
      title: body.title,
      jobCategory: body.jobCategory,
      description: body.description,
      requirements: body.requirements || [],
      responsibilities: body.responsibilities || [],
      salary: body.salary || { type: '연봉', negotiable: true },
      location: body.location,
      workingHours: body.workingHours || '09:00 ~ 18:00',
      workType: body.workType || 'fulltime',
      benefits: body.benefits || [],
      preferredQualifications: body.preferredQualifications || [],
      recruiterInfo: body.recruiterInfo || {
        name: '채용담당자',
        position: '인사팀',
        phone: '02-0000-0000',
        email: 'hr@company.com'
      },
      category: body.category || 'IT/웹/통신',
      skills: body.skills || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deadline: body.deadline ? new Date(body.deadline) : undefined
    };

    // 실제 환경에서는 여기서 데이터베이스에 저장
    // 현재는 샘플 데이터에 추가 (메모리에만 저장)
    sampleJobPostings.push(newJobPosting);

    return NextResponse.json(
      { 
        message: '채용공고가 성공적으로 생성되었습니다.',
        jobPosting: newJobPosting
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('채용공고 생성 오류:', error);
    return NextResponse.json(
      { error: '채용공고 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 