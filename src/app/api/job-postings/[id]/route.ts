import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { JobPosting } from '@/types';

// GET - 특정 채용공고 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Firestore에서 실제 크롤링된 데이터 조회
    const jobDoc = await getDoc(doc(db, 'crawled-jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: '채용공고를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    const data = jobDoc.data();
    
    // JobPosting 형태로 변환
    const jobPosting: JobPosting = {
      id: jobDoc.id,
      employerId: data.employerId || '',
      companyName: data.companyName || data.company || '',
      title: data.title || '',
      jobCategory: data.jobCategory || data.category || '기타',
      description: data.description || '',
      location: data.location || '',
      workType: data.workType || 'fulltime',
      salary: data.salary || { min: 0, max: 0, negotiable: true },
      category: data.category || data.jobCategory || '기타',
      skills: data.skills || [],
      requirements: data.requirements || [],
      responsibilities: data.responsibilities || [],
      benefits: data.benefits || [],
      preferredQualifications: data.preferredQualifications || [],
      workingHours: data.workingHours || '주 5일, 09:00-18:00',
      recruiterInfo: data.recruiterInfo || {
        name: '채용담당자',
        position: '인사팀',
        phone: '문의 바랍니다',
        email: '문의 바랍니다'
      },
      isActive: data.isActive !== false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deadline: data.deadline?.toDate() || undefined,
      // 크롤링된 데이터 특유 필드
      source: data.source || '',
      externalUrl: data.externalUrl || '',
      // Gemini 분석 결과
      categoryConfidence: data.categoryConfidence,
      salaryInfo: data.salaryInfo,
      geminiAnalyzed: data.geminiAnalyzed || false,
      geminiModel: data.geminiModel,
      analysisTimestamp: data.analysisTimestamp
    };

    return NextResponse.json(jobPosting);

  } catch (error) {
    console.error('채용공고 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '채용공고 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// PUT - 채용공고 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    
    // Firestore에서 문서 확인
    const jobDoc = await getDoc(doc(db, 'crawled-jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: '채용공고를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 채용공고 업데이트
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, 'crawled-jobs', jobId), updateData);

    return NextResponse.json({
      success: true,
      message: '채용공고가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('채용공고 수정 오류:', error);
    return NextResponse.json({
      success: false,
      message: '채용공고 수정에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// DELETE - 채용공고 삭제 (비활성화)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Firestore에서 문서 확인
    const jobDoc = await getDoc(doc(db, 'crawled-jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json({
        success: false,
        message: '채용공고를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 채용공고 비활성화 (실제로 삭제하지 않고 isActive를 false로 설정)
    await updateDoc(doc(db, 'crawled-jobs', jobId), {
      isActive: false,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: '채용공고가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('채용공고 삭제 오류:', error);
    return NextResponse.json({
      success: false,
      message: '채용공고 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 