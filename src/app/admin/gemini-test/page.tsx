'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

export default function GeminiTestPage() {
  const [isTestingJobKorea, setIsTestingJobKorea] = useState(false);
  const [isTestingJobPlanet, setIsTestingJobPlanet] = useState(false);
  const [jobKoreaResult, setJobKoreaResult] = useState<TestResult | null>(null);
  const [jobPlanetResult, setJobPlanetResult] = useState<TestResult | null>(null);
  const [testStats, setTestStats] = useState<any>(null);

  const handleJobKoreaTest = async () => {
    setIsTestingJobKorea(true);
    setJobKoreaResult(null);
    
    try {
      console.log('🧪 잡코리아 Gemini 테스트 시작...');
      
      const response = await fetch('/api/crawler/jobkorea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keywords: '개발자', 
          maxPages: 2 // 테스트용으로 2페이지만
        })
      });
      
      const data = await response.json();
      
      setJobKoreaResult({
        success: data.success,
        message: data.message,
        data: data.data,
        error: data.error,
        timestamp: new Date()
      });
      
      if (data.success) {
        console.log('✅ 잡코리아 Gemini 테스트 성공:', data.data);
      } else {
        console.error('❌ 잡코리아 Gemini 테스트 실패:', data.error);
      }
      
    } catch (error) {
      console.error('🚨 잡코리아 테스트 오류:', error);
      setJobKoreaResult({
        success: false,
        message: '테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date()
      });
    } finally {
      setIsTestingJobKorea(false);
    }
  };

  const handleJobPlanetTest = async () => {
    setIsTestingJobPlanet(true);
    setJobPlanetResult(null);
    
    try {
      console.log('🧪 잡플래닛 Gemini 테스트 시작...');
      
      const response = await fetch('/api/crawler/jobplanet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keywords: '마케팅', 
          maxPages: 2 // 테스트용으로 2페이지만
        })
      });
      
      const data = await response.json();
      
      setJobPlanetResult({
        success: data.success,
        message: data.message,
        data: data.data,
        error: data.error,
        timestamp: new Date()
      });
      
      if (data.success) {
        console.log('✅ 잡플래닛 Gemini 테스트 성공:', data.data);
      } else {
        console.error('❌ 잡플래닛 Gemini 테스트 실패:', data.error);
      }
      
    } catch (error) {
      console.error('🚨 잡플래닛 테스트 오류:', error);
      setJobPlanetResult({
        success: false,
        message: '테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date()
      });
    } finally {
      setIsTestingJobPlanet(false);
    }
  };

  const handleAllTests = async () => {
    await handleJobKoreaTest();
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
    await handleJobPlanetTest();
  };

  const fetchTestStats = async () => {
    try {
      const response = await fetch('/api/jobs?includeCrawled=true&geminiOnly=true');
      const data = await response.json();
      if (data.success) {
        setTestStats(data.data);
      }
    } catch (error) {
      console.error('통계 조회 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              🤖 Gemini AI 크롤링 테스트
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              실제 Gemini API를 활용한 채용공고 분석 및 정제 시스템을 테스트합니다
            </p>
          </motion.div>
        </div>

        {/* 데이터 마이그레이션 링크 추가 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            �� Gemini AI 크롤링 테스트
          </h1>
          <p className="text-gray-600">
            Gemini 2.0 Flash 모델을 사용한 채용공고 분석 및 카테고리 분류 테스트
          </p>
          
          {/* 데이터 마이그레이션 링크 추가 */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 데이터 관리</h3>
            <p className="text-sm text-blue-700 mb-3">
              기존 채용공고 데이터를 Gemini AI로 재분석하여 카테고리를 개선할 수 있습니다.
            </p>
            <a 
              href="/admin/data-migration"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 데이터 마이그레이션 관리자
            </a>
          </div>
        </div>

        {/* 빠른 실행 버튼 */}
        <div className="card p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">🚀 빠른 테스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleJobKoreaTest}
              disabled={isTestingJobKorea}
              className="btn-primary flex items-center justify-center"
            >
              {isTestingJobKorea ? (
                <>
                  <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
                  잡코리아 테스트 중...
                </>
              ) : (
                <>
                  <BeakerIcon className="w-5 h-5 mr-2" />
                  잡코리아 테스트
                </>
              )}
            </button>
            
            <button
              onClick={handleJobPlanetTest}
              disabled={isTestingJobPlanet}
              className="btn-primary flex items-center justify-center"
            >
              {isTestingJobPlanet ? (
                <>
                  <ClockIcon className="w-5 h-5 mr-2 animate-spin" />
                  잡플래닛 테스트 중...
                </>
              ) : (
                <>
                  <BeakerIcon className="w-5 h-5 mr-2" />
                  잡플래닛 테스트
                </>
              )}
            </button>
            
            <button
              onClick={handleAllTests}
              disabled={isTestingJobKorea || isTestingJobPlanet}
              className="btn-secondary flex items-center justify-center"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              전체 테스트
            </button>
          </div>
          
          <button
            onClick={fetchTestStats}
            className="btn-outline mt-4 flex items-center justify-center mx-auto"
          >
            <ChartBarIcon className="w-5 h-5 mr-2" />
            통계 새로고침
          </button>
        </div>

        {/* 테스트 결과 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 잡코리아 결과 */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">잡코리아 + Gemini</h3>
                  <p className="text-sm text-slate-600">AI 분석 테스트</p>
                </div>
              </div>
            </div>

            {jobKoreaResult && (
              <div className={`p-6 rounded-lg border ${
                jobKoreaResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {jobKoreaResult.success ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
                  )}
                  <span className={`font-semibold ${
                    jobKoreaResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {jobKoreaResult.message}
                  </span>
                </div>
                
                {jobKoreaResult.success && jobKoreaResult.data && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">총 채용공고:</span>
                        <span className="ml-2 text-green-600">{jobKoreaResult.data.totalJobs}개</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">AI 분석:</span>
                        <span className="ml-2 text-green-600">
                          {jobKoreaResult.data.geminiAnalyzed ? '완료' : '미완료'}
                        </span>
                      </div>
                    </div>
                    
                    {jobKoreaResult.data.categories && (
                      <div>
                        <span className="font-medium text-green-700 block mb-2">분석된 카테고리:</span>
                        <div className="flex flex-wrap gap-2">
                          {jobKoreaResult.data.categories.map((cat: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {jobKoreaResult.data.avgConfidence && (
                      <div>
                        <span className="font-medium text-green-700">평균 신뢰도:</span>
                        <span className="ml-2 text-green-600">
                          {(jobKoreaResult.data.avgConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {jobKoreaResult.error && (
                  <div className="text-sm text-red-700 mt-3">
                    오류: {jobKoreaResult.error}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-3">
                  테스트 시간: {jobKoreaResult.timestamp.toLocaleString('ko-KR')}
                </div>
              </div>
            )}
          </div>

          {/* 잡플래닛 결과 */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">잡플래닛 + Gemini</h3>
                  <p className="text-sm text-slate-600">AI 분석 테스트</p>
                </div>
              </div>
            </div>

            {jobPlanetResult && (
              <div className={`p-6 rounded-lg border ${
                jobPlanetResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {jobPlanetResult.success ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
                  )}
                  <span className={`font-semibold ${
                    jobPlanetResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {jobPlanetResult.message}
                  </span>
                </div>
                
                {jobPlanetResult.success && jobPlanetResult.data && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-700">총 채용공고:</span>
                        <span className="ml-2 text-green-600">{jobPlanetResult.data.totalJobs}개</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-700">AI 분석:</span>
                        <span className="ml-2 text-green-600">
                          {jobPlanetResult.data.geminiAnalyzed ? '완료' : '미완료'}
                        </span>
                      </div>
                    </div>
                    
                    {jobPlanetResult.data.categories && (
                      <div>
                        <span className="font-medium text-green-700 block mb-2">분석된 카테고리:</span>
                        <div className="flex flex-wrap gap-2">
                          {jobPlanetResult.data.categories.map((cat: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {jobPlanetResult.data.avgConfidence && (
                      <div>
                        <span className="font-medium text-green-700">평균 신뢰도:</span>
                        <span className="ml-2 text-green-600">
                          {(jobPlanetResult.data.avgConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {jobPlanetResult.error && (
                  <div className="text-sm text-red-700 mt-3">
                    오류: {jobPlanetResult.error}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-3">
                  테스트 시간: {jobPlanetResult.timestamp.toLocaleString('ko-KR')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 전체 통계 */}
        {testStats && (
          <div className="card p-8 mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">📊 AI 분석 통계</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-2">총 분석 채용공고</h4>
                <p className="text-3xl font-bold text-blue-600">{testStats.crawledCount || 0}개</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-800 mb-2">AI 분석 완료</h4>
                <p className="text-3xl font-bold text-purple-600">{testStats.geminiAnalyzed || 0}개</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 mb-2">분석 성공률</h4>
                <p className="text-3xl font-bold text-green-600">
                  {testStats.crawledCount > 0 ? 
                    ((testStats.geminiAnalyzed || 0) / testStats.crawledCount * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="card p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 테스트 가이드</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• 각 크롤링 소스별로 개별 테스트가 가능합니다</li>
            <li>• Gemini API가 채용공고를 분석하여 정확한 카테고리로 분류합니다</li>
            <li>• 기술 스택, 요구사항, 복리후생 등의 정보를 자동으로 추출합니다</li>
            <li>• 분석 신뢰도는 0-1 사이의 점수로 표시됩니다</li>
            <li>• 실제 프로덕션에서는 API 레이트 리밋을 고려해야 합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 