'use client';

import { useState, useEffect } from 'react';

interface MigrationStatus {
  total: number;
  analyzed: number;
  remaining: number;
  progress: number;
  categoryDistribution: Record<string, number>;
}

interface MigrationResult {
  processed: number;
  success: number;
  errors: number;
  dryRun: boolean;
  results: Array<{
    id: string;
    title: string;
    company: string;
    oldCategory: string;
    newCategory?: string;
    confidence?: number;
    error?: string;
    success: boolean;
  }>;
}

export default function DataMigrationPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [batchSize, setBatchSize] = useState(10);
  const [isDryRun, setIsDryRun] = useState(true);

  // 마이그레이션 상태 조회
  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/migrate-data?action=status');
      const data = await response.json();
      console.log('상태 조회 API 응답:', data); // 디버깅용
      
      if (data.success) {
        setStatus(data.data);
      } else {
        console.error('상태 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('상태 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 마이그레이션 실행
  const runMigration = async () => {
    try {
      setIsLoading(true);
      setMigrationResult(null);
      
      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize, dryRun: isDryRun })
      });
      
      const data = await response.json();
      console.log('마이그레이션 API 응답:', data); // 디버깅용
      
      if (data.success) {
        // 안전한 데이터 구조 보장
        const safeResult = {
          processed: data.data?.processed || 0,
          success: data.data?.success || 0,
          errors: data.data?.errors || 0,
          dryRun: data.data?.dryRun || false,
          results: Array.isArray(data.data?.results) ? data.data.results : []
        };
        
        setMigrationResult(safeResult);
        // 마이그레이션 후 상태 새로고침
        setTimeout(fetchStatus, 1000);
      } else {
        console.error('마이그레이션 실패:', data.message);
        alert(`마이그레이션 실패: ${data.message}`);
      }
    } catch (error) {
      console.error('마이그레이션 오류:', error);
      alert(`마이그레이션 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          🔄 데이터 마이그레이션 관리자
        </h1>
        <p className="text-gray-600">
          기존 채용공고 데이터를 Gemini AI로 재분석하여 카테고리를 개선합니다
        </p>
      </div>

      {/* 현재 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">전체 데이터</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold">{status?.total || 0}</div>
          <p className="text-xs text-gray-500">크롤링된 채용공고</p>
        </div>

        <div className="card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">분석 완료</h3>
            <span className="text-2xl text-green-600">✅</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{status?.analyzed || 0}</div>
          <p className="text-xs text-gray-500">Gemini 분석 완료</p>
        </div>

        <div className="card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">분석 대기</h3>
            <span className="text-2xl text-orange-600">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{status?.remaining || 0}</div>
          <p className="text-xs text-gray-500">분석이 필요한 데이터</p>
        </div>
      </div>

      {/* 진행률 */}
      {status && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">마이그레이션 진행률</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>전체 진행률</span>
              <span>{status.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
            
            {status.remaining > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  ⚠️ {status.remaining}개의 데이터가 Gemini 분석을 기다리고 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 카테고리 분포 */}
      {status?.categoryDistribution && Object.keys(status.categoryDistribution).length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">현재 카테고리 분포</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(status.categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="text-center p-3 bg-gray-50 rounded-lg border">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-2">
                    {category}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-500">
                    {status.total > 0 ? Math.round((count / status.total) * 100) : 0}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 마이그레이션 설정 */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">🚀 마이그레이션 실행</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                배치 크기
              </label>
              <select 
                value={batchSize} 
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="input-field"
              >
                <option value={5}>5개씩</option>
                <option value={10}>10개씩</option>
                <option value={20}>20개씩</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                한 번에 처리할 데이터 개수
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                실행 모드
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    checked={isDryRun}
                    onChange={() => setIsDryRun(true)}
                    className="mr-2"
                  />
                  테스트 실행
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    checked={!isDryRun}
                    onChange={() => setIsDryRun(false)}
                    className="mr-2"
                  />
                  실제 실행
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isDryRun ? '실제 데이터를 변경하지 않습니다' : '실제로 데이터를 업데이트합니다'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={runMigration} 
              disabled={isLoading || status?.remaining === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span className="mr-2">🤖</span>
              )}
              {isDryRun ? '테스트 실행' : 'Gemini 마이그레이션 실행'}
            </button>
            
            <button 
              onClick={fetchStatus} 
              disabled={isLoading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🔄</span>
              상태 새로고침
            </button>
          </div>
          
          {status?.remaining === 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                🎉 모든 데이터가 Gemini로 분석되었습니다!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 마이그레이션 결과 */}
      {migrationResult && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">📊 마이그레이션 결과</h3>
            {migrationResult.dryRun && (
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                테스트 모드
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{migrationResult.processed}</div>
                <div className="text-sm text-gray-600">처리됨</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{migrationResult.success}</div>
                <div className="text-sm text-gray-600">성공</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{migrationResult.errors}</div>
                <div className="text-sm text-gray-600">실패</div>
              </div>
            </div>
            
            {/* 개별 결과 */}
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg">
              {(migrationResult.results || []).map((result, index) => (
                <div key={result.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm text-gray-600">{result.company}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          {result.oldCategory}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          {result.newCategory}
                        </span>
                        {result.confidence && (
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                            {Math.round(result.confidence * 100)}%
                          </span>
                        )}
                        <span className="text-green-600 text-lg">✅</span>
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          {result.oldCategory}
                        </span>
                        <span className="text-red-600 text-lg">❌</span>
                        {result.error && (
                          <span className="text-xs text-red-600 max-w-32 truncate" title={result.error}>
                            {result.error}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {(!migrationResult.results || migrationResult.results.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  마이그레이션 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 