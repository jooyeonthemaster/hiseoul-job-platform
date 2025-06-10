import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where, limit as firestoreLimit } from 'firebase/firestore';
import { analyzeJobPostingWithGemini } from '@/lib/gemini';
import { RawJobData } from '@/lib/crawler';

// 기존 데이터를 Gemini로 재분석하여 마이그레이션
export async function POST(request: NextRequest) {
  try {
    const { batchSize = 10, dryRun = false } = await request.json();
    
    console.log(`🔄 데이터 마이그레이션 시작 (배치 크기: ${batchSize}, 드라이 런: ${dryRun})`);
    
    // 파이어베이스에서 모든 크롤링된 데이터 조회
    const crawledJobsRef = collection(db, 'crawled-jobs');
    const q = query(crawledJobsRef); // 제한 없이 모든 데이터 조회
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: '크롤링된 데이터가 없습니다.',
        data: { processed: 0, total: 0 }
      });
    }
    
    // geminiAnalyzed가 없거나 false인 문서만 필터링
    const unanalyzedDocs = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.geminiAnalyzed; // undefined 또는 false
    }).slice(0, batchSize); // 배치 크기만큼만 처리
    
    console.log(`📋 전체 데이터: ${querySnapshot.size}개, 미분석 데이터: ${unanalyzedDocs.length}개`);
    
    if (unanalyzedDocs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '마이그레이션할 데이터가 없습니다. 모든 데이터가 이미 Gemini로 분석되었습니다.',
        data: { processed: 0, total: querySnapshot.size, remaining: 0 }
      });
    }
    
    const migrationResults = [];
    let successCount = 0;
    let errorCount = 0;
    
    // 각 문서를 Gemini로 재분석
    for (const docSnapshot of unanalyzedDocs) {
      const docData = docSnapshot.data();
      const docId = docSnapshot.id;
      
      try {
        console.log(`🤖 Gemini 재분석 중: ${docData.title} (${docData.companyName})`);
        
        // RawJobData 형태로 변환
        const rawJobData: RawJobData = {
          title: docData.title || '',
          company: docData.companyName || '',
          location: docData.location || '',
          description: docData.description || '',
          salary: docData.salary?.amount || '',
          workType: docData.workType || '',
          deadline: docData.deadline ? docData.deadline.toDate?.()?.toISOString() : undefined,
          url: docData.externalUrl || '',
          source: docData.source || 'jobkorea',
          scrapedAt: docData.createdAt?.toDate?.() || new Date()
        };
        
        // Gemini로 분석
        const enhancedData = await analyzeJobPostingWithGemini(rawJobData);
        
        // 드라이 런이 아닌 경우에만 실제 업데이트
        if (!dryRun) {
          const updateData = {
            // 기존 필드 유지하면서 Gemini 분석 결과 추가
            category: enhancedData.category,
            jobCategory: enhancedData.category,
            categoryConfidence: enhancedData.categoryConfidence,
            skills: enhancedData.skills,
            requirements: enhancedData.requirements,
            benefits: enhancedData.benefits,
            salaryInfo: enhancedData.salaryInfo,
            geminiAnalyzed: true,
            geminiModel: enhancedData.geminiModel,
            analysisTimestamp: enhancedData.analysisTimestamp,
            migratedAt: new Date(),
          };
          
          await updateDoc(doc(db, 'crawled-jobs', docId), updateData);
          console.log(`✅ 업데이트 완료: ${docId}`);
        }
        
        migrationResults.push({
          id: docId,
          title: docData.title,
          company: docData.companyName,
          oldCategory: docData.category || docData.jobCategory,
          newCategory: enhancedData.category,
          confidence: enhancedData.categoryConfidence,
          success: true
        });
        
        successCount++;
        
        // API 레이트 리밋 방지
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 마이그레이션 실패 (${docId}):`, error);
        
        migrationResults.push({
          id: docId,
          title: docData.title,
          company: docData.companyName,
          oldCategory: docData.category || docData.jobCategory,
          error: error instanceof Error ? error.message : String(error),
          success: false
        });
        
        errorCount++;
      }
    }
    
    const summary = {
      processed: unanalyzedDocs.length,
      success: successCount,
      errors: errorCount,
      dryRun,
      total: querySnapshot.size,
      remaining: querySnapshot.size - (successCount + errorCount),
      results: migrationResults.slice(0, 10) // 최대 10개 결과만 반환
    };
    
    console.log(`🎉 마이그레이션 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);
    
    return NextResponse.json({
      success: true,
      message: `데이터 마이그레이션 완료 (성공: ${successCount}, 실패: ${errorCount})`,
      data: summary
    });
    
  } catch (error) {
    console.error('🚨 마이그레이션 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '데이터 마이그레이션 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 마이그레이션 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'status') {
      // 마이그레이션 상태 확인
      const crawledJobsRef = collection(db, 'crawled-jobs');
      
      // 모든 데이터 조회
      const totalQuery = query(crawledJobsRef);
      const totalSnapshot = await getDocs(totalQuery);
      const totalCount = totalSnapshot.size;
      
      // 분석 완료/미완료 수 계산
      let analyzedCount = 0;
      const categoryDistribution: Record<string, number> = {};
      
      totalSnapshot.forEach(doc => {
        const data = doc.data();
        const isAnalyzed = !!data.geminiAnalyzed; // undefined는 false로 처리
        
        if (isAnalyzed) {
          analyzedCount++;
          const category = data.category || data.jobCategory || '기타';
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        }
      });
      
      console.log(`📊 상태 조회: 전체 ${totalCount}개, 분석완료 ${analyzedCount}개, 미분석 ${totalCount - analyzedCount}개`);
      
      return NextResponse.json({
        success: true,
        data: {
          total: totalCount,
          analyzed: analyzedCount,
          remaining: totalCount - analyzedCount,
          progress: totalCount > 0 ? Math.round((analyzedCount / totalCount) * 100) : 0,
          categoryDistribution
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '지원되지 않는 액션입니다.'
    }, { status: 400 });
    
  } catch (error) {
    console.error('마이그레이션 상태 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '마이그레이션 상태를 조회할 수 없습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 