'use client';

import { useState } from 'react';

export default function CrawlerTestPage() {
  const [jobKoreaResult, setJobKoreaResult] = useState<any>(null);
  const [jobPlanetResult, setJobPlanetResult] = useState<any>(null);
  const [firebaseJobs, setFirebaseJobs] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testJobKoreaCrawling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crawler/jobkorea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: '개발', maxPages: 2 })
      });
      const data = await response.json();
      setJobKoreaResult(data);
      console.log('잡코리아 크롤링 결과:', data);
    } catch (error) {
      console.error('잡코리아 크롤링 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const testJobPlanetCrawling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crawler/jobplanet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: '개발', maxPages: 2 })
      });
      const data = await response.json();
      setJobPlanetResult(data);
      console.log('잡플래닛 크롤링 결과:', data);
    } catch (error) {
      console.error('잡플래닛 크롤링 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const testFirebaseQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs?includeCrawled=true&limit=20');
      const data = await response.json();
      setFirebaseJobs(data);
      console.log('파이어베이스 조회 결과:', data);
    } catch (error) {
      console.error('파이어베이스 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">크롤링 테스트 페이지</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 잡코리아 테스트 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">잡코리아 크롤링</h2>
            <button
              onClick={testJobKoreaCrawling}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '잡코리아 크롤링 테스트'}
            </button>
            
            {jobKoreaResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre>{JSON.stringify(jobKoreaResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* 잡플래닛 테스트 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">잡플래닛 크롤링</h2>
            <button
              onClick={testJobPlanetCrawling}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '잡플래닛 크롤링 테스트'}
            </button>
            
            {jobPlanetResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre>{JSON.stringify(jobPlanetResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* 파이어베이스 조회 테스트 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">파이어베이스 조회</h2>
            <button
              onClick={testFirebaseQuery}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '처리 중...' : '파이어베이스 조회 테스트'}
            </button>
            
            {firebaseJobs && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <div className="mb-2">
                  <strong>총 채용공고:</strong> {firebaseJobs.data?.jobs?.length || 0}개
                </div>
                <div className="mb-2">
                  <strong>샘플 데이터:</strong> {firebaseJobs.data?.sampleCount || 0}개
                </div>
                <div className="mb-2">
                  <strong>크롤링 데이터:</strong> {firebaseJobs.data?.crawledCount || 0}개
                </div>
                <details>
                  <summary>전체 응답 보기</summary>
                  <pre className="text-xs mt-2">{JSON.stringify(firebaseJobs, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* 통합 테스트 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">전체 워크플로우 테스트</h2>
          <div className="space-y-4">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  console.log('1. 잡코리아 크롤링 시작...');
                  await testJobKoreaCrawling();
                  
                  console.log('2. 잠시 대기...');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  console.log('3. 잡플래닛 크롤링 시작...');
                  await testJobPlanetCrawling();
                  
                  console.log('4. 잠시 대기...');
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  console.log('5. 파이어베이스 조회...');
                  await testFirebaseQuery();
                  
                  console.log('전체 테스트 완료!');
                } catch (error) {
                  console.error('전체 테스트 실패:', error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {loading ? '전체 테스트 진행 중...' : '전체 워크플로우 테스트 (크롤링 → 저장 → 조회)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 