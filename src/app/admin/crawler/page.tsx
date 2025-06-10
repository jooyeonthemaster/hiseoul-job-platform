'use client';

import { useState } from 'react';
import { PlayIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface CrawlResult {
  success: boolean;
  message: string;
  data?: {
    totalJobs: number;
    jobs: any[];
    source: string;
  };
  error?: string;
}

export default function CrawlerAdminPage() {
  const [isJobKoreaCrawling, setIsJobKoreaCrawling] = useState(false);
  const [isJobPlanetCrawling, setIsJobPlanetCrawling] = useState(false);
  const [jobKoreaResult, setJobKoreaResult] = useState<CrawlResult | null>(null);
  const [jobPlanetResult, setJobPlanetResult] = useState<CrawlResult | null>(null);
  const [keywords, setKeywords] = useState('개발');
  const [maxPages, setMaxPages] = useState(3);

  // 잡코리아 크롤링 실행
  const handleJobKoreaCrawl = async () => {
    setIsJobKoreaCrawling(true);
    setJobKoreaResult(null);

    try {
      const response = await fetch('/api/crawler/jobkorea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, maxPages }),
      });

      const result: CrawlResult = await response.json();
      setJobKoreaResult(result);
    } catch (error) {
      setJobKoreaResult({
        success: false,
        message: '크롤링 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    } finally {
      setIsJobKoreaCrawling(false);
    }
  };

  // 잡플래닛 크롤링 실행
  const handleJobPlanetCrawl = async () => {
    setIsJobPlanetCrawling(true);
    setJobPlanetResult(null);

    try {
      const response = await fetch('/api/crawler/jobplanet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, maxPages }),
      });

      const result: CrawlResult = await response.json();
      setJobPlanetResult(result);
    } catch (error) {
      setJobPlanetResult({
        success: false,
        message: '크롤링 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    } finally {
      setIsJobPlanetCrawling(false);
    }
  };

  // 모든 소스 크롤링
  const handleCrawlAll = async () => {
    await Promise.all([
      handleJobKoreaCrawl(),
      handleJobPlanetCrawl()
    ]);
  };

  return (
    <div className="min-h-screen gradient-bg py-12">
      <div className="container-premium section-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            채용공고 크롤링 관리
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            잡코리아와 잡플래닛에서 최신 채용공고를 수집합니다
          </p>
        </div>

        {/* Controls */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">크롤링 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                검색 키워드
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="input-field"
                placeholder="예: 개발, 디자인, 마케팅"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                최대 페이지 수
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                min="1"
                max="10"
                className="input-field"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleCrawlAll}
                disabled={isJobKoreaCrawling || isJobPlanetCrawling}
                className="btn-primary w-full"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                전체 크롤링 시작
              </button>
            </div>
          </div>
        </div>

        {/* Crawling Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 잡코리아 */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">잡코리아</h3>
                  <p className="text-sm text-slate-600">www.jobkorea.co.kr</p>
                </div>
              </div>
              <button
                onClick={handleJobKoreaCrawl}
                disabled={isJobKoreaCrawling}
                className="btn-outline px-6 py-2 text-sm"
              >
                {isJobKoreaCrawling ? (
                  <>
                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                    크롤링 중...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    크롤링 시작
                  </>
                )}
              </button>
            </div>

            {/* 결과 표시 */}
            {jobKoreaResult && (
              <div className={`p-4 rounded-lg border ${
                jobKoreaResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {jobKoreaResult.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    jobKoreaResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {jobKoreaResult.message}
                  </span>
                </div>
                
                {jobKoreaResult.success && jobKoreaResult.data && (
                  <div className="text-sm text-green-700">
                    총 {jobKoreaResult.data.totalJobs}개의 채용공고를 수집했습니다.
                  </div>
                )}
                
                {jobKoreaResult.error && (
                  <div className="text-sm text-red-700 mt-2">
                    오류: {jobKoreaResult.error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 잡플래닛 */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">잡플래닛</h3>
                  <p className="text-sm text-slate-600">www.jobplanet.co.kr</p>
                </div>
              </div>
              <button
                onClick={handleJobPlanetCrawl}
                disabled={isJobPlanetCrawling}
                className="btn-outline px-6 py-2 text-sm"
              >
                {isJobPlanetCrawling ? (
                  <>
                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                    크롤링 중...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    크롤링 시작
                  </>
                )}
              </button>
            </div>

            {/* 결과 표시 */}
            {jobPlanetResult && (
              <div className={`p-4 rounded-lg border ${
                jobPlanetResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {jobPlanetResult.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    jobPlanetResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {jobPlanetResult.message}
                  </span>
                </div>
                
                {jobPlanetResult.success && jobPlanetResult.data && (
                  <div className="text-sm text-green-700">
                    총 {jobPlanetResult.data.totalJobs}개의 채용공고를 수집했습니다.
                  </div>
                )}
                
                {jobPlanetResult.error && (
                  <div className="text-sm text-red-700 mt-2">
                    오류: {jobPlanetResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 크롤링된 데이터 미리보기 */}
        {(jobKoreaResult?.success || jobPlanetResult?.success) && (
          <div className="card p-8 mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">크롤링 결과 미리보기</h3>
            
            <div className="space-y-6">
              {jobKoreaResult?.success && jobKoreaResult.data && (
                <div>
                  <h4 className="font-semibold text-blue-600 mb-3">잡코리아 ({jobKoreaResult.data.totalJobs}개)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobKoreaResult.data.jobs.slice(0, 4).map((job, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-slate-900 mb-1">{job.title}</h5>
                        <p className="text-sm text-slate-600 mb-1">{job.company}</p>
                        <p className="text-xs text-slate-500">{job.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {jobPlanetResult?.success && jobPlanetResult.data && (
                <div>
                  <h4 className="font-semibold text-purple-600 mb-3">잡플래닛 ({jobPlanetResult.data.totalJobs}개)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobPlanetResult.data.jobs.slice(0, 4).map((job, index) => (
                      <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-slate-900 mb-1">{job.title}</h5>
                        <p className="text-sm text-slate-600 mb-1">{job.company}</p>
                        <p className="text-xs text-slate-500">{job.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 주의사항 */}
        <div className="card p-6 mt-8 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 크롤링 관련 주의사항</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 현재는 시뮬레이션 데이터를 생성합니다 (실제 웹사이트 크롤링 제한)</li>
            <li>• 실제 크롤링을 위해서는 각 사이트의 robots.txt와 이용약관을 확인해야 합니다</li>
            <li>• 서버 사이드에서 크롤링을 수행하여 CORS 문제를 해결할 수 있습니다</li>
            <li>• 크롤링 빈도를 조절하여 서버에 부하를 주지 않도록 주의하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 