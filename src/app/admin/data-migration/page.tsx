'use client';

import { useState, useEffect } from 'react';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassSelect } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

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
    <div className="relative min-h-screen overflow-x-clip">
      <AuroraBackground />

      <div className="relative z-10 container-wide py-16 md:py-24">
        {/* 헤더 */}
        <ScrollReveal>
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
              Data Migration
            </span>
            <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-ink-900 leading-[1.1]">
              🔄 데이터 마이그레이션 관리자
            </h1>
            <p className="mt-5 text-ink-500 text-base md:text-lg leading-relaxed max-w-3xl">
              기존 채용공고 데이터를 Gemini AI로 재분석하여 카테고리를 개선합니다
            </p>
          </div>
        </ScrollReveal>

        {/* 현재 상태 */}
        <ScrollRevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScrollRevealItem>
            <GlassCard hover className="h-full p-7">
              <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-sm font-medium text-ink-500">전체 데이터</h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="font-display text-3xl font-bold text-ink-900">{status?.total || 0}</div>
              <p className="text-xs text-ink-400 mt-1">크롤링된 채용공고</p>
            </GlassCard>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <GlassCard hover className="h-full p-7">
              <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-sm font-medium text-ink-500">분석 완료</h3>
                <span className="text-2xl">✅</span>
              </div>
              <div className="font-display text-3xl font-bold text-mint-600">{status?.analyzed || 0}</div>
              <p className="text-xs text-ink-400 mt-1">Gemini 분석 완료</p>
            </GlassCard>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <GlassCard hover className="h-full p-7">
              <div className="flex flex-row items-center justify-between space-y-0 pb-3">
                <h3 className="text-sm font-medium text-ink-500">분석 대기</h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="font-display text-3xl font-bold text-honey-600">{status?.remaining || 0}</div>
              <p className="text-xs text-ink-400 mt-1">분석이 필요한 데이터</p>
            </GlassCard>
          </ScrollRevealItem>
        </ScrollRevealStagger>

        {/* 진행률 */}
        {status && (
          <ScrollReveal>
            <GlassCard className="p-7 mb-8">
              <h3 className="text-xl font-semibold text-ink-900 mb-5">마이그레이션 진행률</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-ink-700">
                  <span>전체 진행률</span>
                  <span className="font-display font-semibold text-azure-700">{status.progress}%</span>
                </div>
                <div className="w-full bg-azure-50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-azure-400 to-azure-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>

                {status.remaining > 0 && (
                  <div className="bg-honey-100/60 backdrop-blur-md p-4 rounded-2xl border border-honey-400/40">
                    <p className="text-sm text-honey-600">
                      ⚠️ {status.remaining}개의 데이터가 Gemini 분석을 기다리고 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>
        )}

        {/* 카테고리 분포 */}
        {status?.categoryDistribution && Object.keys(status.categoryDistribution).length > 0 && (
          <ScrollReveal>
            <GlassCard className="p-7 mb-8">
              <h3 className="text-xl font-semibold text-ink-900 mb-5">현재 카테고리 분포</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(status.categoryDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="text-center p-4 glass rounded-2xl">
                      <Badge tone="azure" className="mb-2">{category}</Badge>
                      <div className="font-display text-2xl font-bold text-ink-900">{count}</div>
                      <div className="text-xs text-ink-400">
                        {status.total > 0 ? Math.round((count / status.total) * 100) : 0}%
                      </div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        )}

        {/* 마이그레이션 설정 */}
        <ScrollReveal>
          <GlassCard strong className="p-7 mb-8">
            <h3 className="text-xl font-semibold text-ink-900 mb-5">🚀 마이그레이션 실행</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    배치 크기
                  </label>
                  <GlassSelect
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                  >
                    <option value={5}>5개씩</option>
                    <option value={10}>10개씩</option>
                    <option value={20}>20개씩</option>
                  </GlassSelect>
                  <p className="text-xs text-ink-400 mt-2">
                    한 번에 처리할 데이터 개수
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    실행 모드
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center text-ink-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        checked={isDryRun}
                        onChange={() => setIsDryRun(true)}
                        className="mr-2 accent-azure-500"
                      />
                      테스트 실행
                    </label>
                    <label className="flex items-center text-ink-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mode"
                        checked={!isDryRun}
                        onChange={() => setIsDryRun(false)}
                        className="mr-2 accent-azure-500"
                      />
                      실제 실행
                    </label>
                  </div>
                  <p className="text-xs text-ink-400 mt-2">
                    {isDryRun ? '실제 데이터를 변경하지 않습니다' : '실제로 데이터를 업데이트합니다'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <GlassButton
                  onClick={runMigration}
                  disabled={isLoading || status?.remaining === 0}
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>🤖</span>
                  )}
                  {isDryRun ? '테스트 실행' : 'Gemini 마이그레이션 실행'}
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  onClick={fetchStatus}
                  disabled={isLoading}
                >
                  <span>🔄</span>
                  상태 새로고침
                </GlassButton>
              </div>

              {status?.remaining === 0 && (
                <div className="bg-mint-100/60 backdrop-blur-md p-4 rounded-2xl border border-mint-400/40">
                  <p className="text-sm text-mint-600">
                    🎉 모든 데이터가 Gemini로 분석되었습니다!
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* 마이그레이션 결과 */}
        {migrationResult && (
          <ScrollReveal>
            <GlassCard className="p-7">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="text-xl font-semibold text-ink-900">📊 마이그레이션 결과</h3>
                {migrationResult.dryRun && (
                  <Badge tone="azure">테스트 모드</Badge>
                )}
              </div>

              <div className="space-y-5">
                {/* 통계 */}
                <div className="grid grid-cols-3 gap-4 p-5 glass rounded-3xl">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-ink-900">{migrationResult.processed}</div>
                    <div className="text-sm text-ink-500">처리됨</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-mint-600">{migrationResult.success}</div>
                    <div className="text-sm text-ink-500">성공</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-coral-600">{migrationResult.errors}</div>
                    <div className="text-sm text-ink-500">실패</div>
                  </div>
                </div>

                {/* 개별 결과 */}
                <div className="space-y-2 max-h-96 overflow-y-auto glass rounded-2xl divide-y divide-ink-100">
                  {(migrationResult.results || []).map((result, index) => (
                    <div key={result.id} className="flex items-center justify-between p-3 hover:bg-azure-50/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink-900 truncate">{result.title}</div>
                        <div className="text-sm text-ink-500 truncate">{result.company}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {result.success ? (
                          <>
                            <Badge tone="neutral">{result.oldCategory}</Badge>
                            <span className="text-ink-400">→</span>
                            <Badge tone="mint">{result.newCategory}</Badge>
                            {result.confidence && (
                              <Badge tone="azure">
                                {Math.round(result.confidence * 100)}%
                              </Badge>
                            )}
                            <span className="text-mint-600 text-lg">✅</span>
                          </>
                        ) : (
                          <>
                            <Badge tone="coral">{result.oldCategory}</Badge>
                            <span className="text-coral-600 text-lg">❌</span>
                            {result.error && (
                              <span className="text-xs text-coral-600 max-w-32 truncate" title={result.error}>
                                {result.error}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!migrationResult.results || migrationResult.results.length === 0) && (
                    <div className="text-center py-8 text-ink-400">
                      마이그레이션 결과가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}