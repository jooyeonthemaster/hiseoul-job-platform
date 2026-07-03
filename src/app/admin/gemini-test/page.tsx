'use client';

import { useState } from 'react';
import {
  SparklesIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BeakerIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

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

  // 결과 패널 — 성공=mint / 실패=coral 글래스 틴트
  const renderResult = (result: TestResult) => (
    <div
      className={`mt-6 rounded-3xl border p-6 backdrop-blur-md ${
        result.success
          ? 'bg-mint-100/50 border-mint-400/40'
          : 'bg-coral-100/50 border-coral-400/40'
      }`}
    >
      <div className="flex items-center mb-3">
        {result.success ? (
          <CheckCircleIcon className="w-6 h-6 text-mint-600 mr-3 shrink-0" />
        ) : (
          <XCircleIcon className="w-6 h-6 text-coral-600 mr-3 shrink-0" />
        )}
        <span className={`font-semibold ${result.success ? 'text-mint-600' : 'text-coral-600'}`}>
          {result.message}
        </span>
      </div>

      {result.success && result.data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="glass rounded-2xl px-4 py-3">
              <span className="block text-ink-400 text-xs mb-1">총 채용공고</span>
              <span className="font-display font-bold text-lg text-ink-900">{result.data.totalJobs}개</span>
            </div>
            <div className="glass rounded-2xl px-4 py-3">
              <span className="block text-ink-400 text-xs mb-1">AI 분석</span>
              <span className="font-display font-bold text-lg text-ink-900">
                {result.data.geminiAnalyzed ? '완료' : '미완료'}
              </span>
            </div>
          </div>

          {result.data.categories && (
            <div>
              <span className="font-medium text-ink-700 block mb-2">분석된 카테고리</span>
              <div className="flex flex-wrap gap-2">
                {result.data.categories.map((cat: string, idx: number) => (
                  <Badge key={idx} tone="azure">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.data.avgConfidence && (
            <div className="text-sm">
              <span className="font-medium text-ink-700">평균 신뢰도:</span>
              <span className="ml-2 text-azure-600 font-semibold">
                {(result.data.avgConfidence * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}

      {result.error && (
        <div className="text-sm text-coral-600 mt-3">
          오류: {result.error}
        </div>
      )}

      <div className="text-xs text-ink-400 mt-3">
        테스트 시간: {result.timestamp.toLocaleString('ko-KR')}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-azure-50/70 via-white to-sky-cool-200/40">
      <AuroraBackground />

      <div className="relative z-10 container-wide py-20 md:py-28">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
              Gemini AI 크롤링 테스트
            </span>
            <h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-5">
              <span className="text-gradient-azure">🤖 Gemini AI 크롤링 테스트</span>
            </h1>
            <p className="text-ink-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              실제 Gemini API를 활용한 채용공고 분석 및 정제 시스템을 테스트합니다
            </p>
          </div>
        </ScrollReveal>

        {/* 데이터 마이그레이션 링크 추가 */}
        <ScrollReveal delay={0.05}>
          <GlassCard className="p-8 mb-10">
            <h2 className="font-display font-bold tracking-tight text-2xl md:text-3xl text-ink-900 mb-2">
              �� Gemini AI 크롤링 테스트
            </h2>
            <p className="text-ink-500 leading-relaxed mb-6">
              Gemini 2.0 Flash 모델을 사용한 채용공고 분석 및 카테고리 분류 테스트
            </p>

            {/* 데이터 마이그레이션 링크 추가 */}
            <div className="glass rounded-3xl p-6">
              <h3 className="font-semibold text-lg text-ink-900 mb-2">📊 데이터 관리</h3>
              <p className="text-sm text-ink-500 leading-relaxed mb-4">
                기존 채용공고 데이터를 Gemini AI로 재분석하여 카테고리를 개선할 수 있습니다.
              </p>
              <GlassButton href="/admin/data-migration" variant="primary" size="md">
                <ArrowPathIcon className="w-5 h-5" />
                데이터 마이그레이션 관리자
                <ArrowRightIcon className="w-5 h-5" />
              </GlassButton>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* 빠른 실행 버튼 */}
        <ScrollReveal delay={0.1}>
          <GlassCard strong className="p-8 md:p-10 mb-10 text-center">
            <SectionHeading
              align="center"
              title="🚀 빠른 테스트"
              className="mb-8"
              titleClassName="text-2xl md:text-3xl"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassButton
                onClick={handleJobKoreaTest}
                disabled={isTestingJobKorea}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isTestingJobKorea ? (
                  <>
                    <ClockIcon className="w-5 h-5 animate-spin" />
                    잡코리아 테스트 중...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="w-5 h-5" />
                    잡코리아 테스트
                  </>
                )}
              </GlassButton>

              <GlassButton
                onClick={handleJobPlanetTest}
                disabled={isTestingJobPlanet}
                variant="primary"
                size="md"
                className="w-full"
              >
                {isTestingJobPlanet ? (
                  <>
                    <ClockIcon className="w-5 h-5 animate-spin" />
                    잡플래닛 테스트 중...
                  </>
                ) : (
                  <>
                    <BeakerIcon className="w-5 h-5" />
                    잡플래닛 테스트
                  </>
                )}
              </GlassButton>

              <GlassButton
                onClick={handleAllTests}
                disabled={isTestingJobKorea || isTestingJobPlanet}
                variant="secondary"
                size="md"
                className="w-full"
              >
                <PlayIcon className="w-5 h-5" />
                전체 테스트
              </GlassButton>
            </div>

            <div className="mt-6 flex justify-center">
              <GlassButton onClick={fetchTestStats} variant="outline" size="md">
                <ChartBarIcon className="w-5 h-5" />
                통계 새로고침
              </GlassButton>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* 테스트 결과 */}
        <ScrollRevealStagger className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 잡코리아 결과 */}
          <ScrollRevealItem>
            <GlassCard hover className="h-full p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center mr-4 text-azure-600 shadow-glass-sm">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-ink-900">잡코리아 + Gemini</h3>
                    <p className="text-sm text-ink-500">AI 분석 테스트</p>
                  </div>
                </div>
              </div>

              {jobKoreaResult && renderResult(jobKoreaResult)}
            </GlassCard>
          </ScrollRevealItem>

          {/* 잡플래닛 결과 */}
          <ScrollRevealItem>
            <GlassCard hover className="h-full p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center mr-4 text-azure-600 shadow-glass-sm">
                    <DocumentTextIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-ink-900">잡플래닛 + Gemini</h3>
                    <p className="text-sm text-ink-500">AI 분석 테스트</p>
                  </div>
                </div>
              </div>

              {jobPlanetResult && renderResult(jobPlanetResult)}
            </GlassCard>
          </ScrollRevealItem>
        </ScrollRevealStagger>

        {/* 전체 통계 */}
        {testStats && (
          <ScrollReveal className="mt-10">
            <GlassCard className="p-8 md:p-10">
              <h3 className="font-display font-bold tracking-tight text-xl md:text-2xl text-ink-900 mb-8">
                📊 AI 분석 통계
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6">
                  <h4 className="text-base font-semibold text-ink-700 mb-2">총 분석 채용공고</h4>
                  <p className="font-display text-3xl font-bold text-gradient-azure">{testStats.crawledCount || 0}개</p>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h4 className="text-base font-semibold text-ink-700 mb-2">AI 분석 완료</h4>
                  <p className="font-display text-3xl font-bold text-gradient-azure">{testStats.geminiAnalyzed || 0}개</p>
                </div>
                <div className="glass rounded-3xl p-6">
                  <h4 className="text-base font-semibold text-ink-700 mb-2">분석 성공률</h4>
                  <p className="font-display text-3xl font-bold text-gradient-azure">
                    {testStats.crawledCount > 0 ?
                      ((testStats.geminiAnalyzed || 0) / testStats.crawledCount * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        )}

        {/* 도움말 */}
        <ScrollReveal className="mt-10">
          <GlassCard className="p-8">
            <h3 className="font-semibold text-lg text-ink-900 mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-azure-50 border border-azure-100 text-azure-600">💡</span>
              테스트 가이드
            </h3>
            <ul className="text-sm text-ink-500 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                각 크롤링 소스별로 개별 테스트가 가능합니다
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                Gemini API가 채용공고를 분석하여 정확한 카테고리로 분류합니다
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                기술 스택, 요구사항, 복리후생 등의 정보를 자동으로 추출합니다
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                분석 신뢰도는 0-1 사이의 점수로 표시됩니다
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-azure-500 shrink-0" />
                실제 프로덕션에서는 API 레이트 리밋을 고려해야 합니다
              </li>
            </ul>
          </GlassCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
