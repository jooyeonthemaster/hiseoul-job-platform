'use client';

import { useState } from 'react';
import { PlayIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, Field } from '@/components/ui/GlassField';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
    <div className="relative min-h-screen overflow-hidden py-16 md:py-20">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        {/* Header */}
        <SectionHeading
          eyebrow="크롤러 도구"
          title="채용공고 크롤링 관리"
          subtitle="잡코리아와 잡플래닛에서 최신 채용공고를 수집합니다"
        />

        {/* Controls */}
        <ScrollReveal className="mt-14">
          <GlassCard strong className="p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 mb-7">크롤링 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="검색 키워드" htmlFor="crawler-keywords">
                <GlassInput
                  id="crawler-keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="예: 개발, 디자인, 마케팅"
                />
              </Field>

              <Field label="최대 페이지 수" htmlFor="crawler-maxpages">
                <GlassInput
                  id="crawler-maxpages"
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  min="1"
                  max="10"
                />
              </Field>

              <div className="flex items-end">
                <GlassButton
                  onClick={handleCrawlAll}
                  disabled={isJobKoreaCrawling || isJobPlanetCrawling}
                  className="w-full"
                >
                  <PlayIcon className="w-5 h-5" />
                  전체 크롤링 시작
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Crawling Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-8">
          {/* 잡코리아 */}
          <ScrollReveal>
            <GlassCard hover className="h-full p-8">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center mr-4 shadow-glass-sm shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-azure-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-ink-900">잡코리아</h3>
                    <p className="text-sm text-ink-500 truncate">www.jobkorea.co.kr</p>
                  </div>
                </div>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={handleJobKoreaCrawl}
                  disabled={isJobKoreaCrawling}
                  className="shrink-0"
                >
                  {isJobKoreaCrawling ? (
                    <>
                      <ClockIcon className="w-4 h-4 animate-spin" />
                      크롤링 중...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      크롤링 시작
                    </>
                  )}
                </GlassButton>
              </div>

              {/* 결과 표시 */}
              {jobKoreaResult && (
                <div className={`p-4 rounded-2xl border ${
                  jobKoreaResult.success
                    ? 'bg-mint-100/60 border-mint-400/40'
                    : 'bg-coral-100/60 border-coral-400/40'
                }`}>
                  <div className="flex items-center mb-2 gap-2">
                    {jobKoreaResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-mint-600 shrink-0" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-coral-600 shrink-0" />
                    )}
                    <span className={`font-medium ${
                      jobKoreaResult.success ? 'text-mint-600' : 'text-coral-600'
                    }`}>
                      {jobKoreaResult.message}
                    </span>
                  </div>

                  {jobKoreaResult.success && jobKoreaResult.data && (
                    <div className="text-sm text-ink-600">
                      총 {jobKoreaResult.data.totalJobs}개의 채용공고를 수집했습니다.
                    </div>
                  )}

                  {jobKoreaResult.error && (
                    <div className="text-sm text-coral-600 mt-2">
                      오류: {jobKoreaResult.error}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </ScrollReveal>

          {/* 잡플래닛 */}
          <ScrollReveal delay={0.08}>
            <GlassCard hover className="h-full p-8">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center mr-4 shadow-glass-sm shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-azure-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-ink-900">잡플래닛</h3>
                    <p className="text-sm text-ink-500 truncate">www.jobplanet.co.kr</p>
                  </div>
                </div>
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={handleJobPlanetCrawl}
                  disabled={isJobPlanetCrawling}
                  className="shrink-0"
                >
                  {isJobPlanetCrawling ? (
                    <>
                      <ClockIcon className="w-4 h-4 animate-spin" />
                      크롤링 중...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4" />
                      크롤링 시작
                    </>
                  )}
                </GlassButton>
              </div>

              {/* 결과 표시 */}
              {jobPlanetResult && (
                <div className={`p-4 rounded-2xl border ${
                  jobPlanetResult.success
                    ? 'bg-mint-100/60 border-mint-400/40'
                    : 'bg-coral-100/60 border-coral-400/40'
                }`}>
                  <div className="flex items-center mb-2 gap-2">
                    {jobPlanetResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-mint-600 shrink-0" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-coral-600 shrink-0" />
                    )}
                    <span className={`font-medium ${
                      jobPlanetResult.success ? 'text-mint-600' : 'text-coral-600'
                    }`}>
                      {jobPlanetResult.message}
                    </span>
                  </div>

                  {jobPlanetResult.success && jobPlanetResult.data && (
                    <div className="text-sm text-ink-600">
                      총 {jobPlanetResult.data.totalJobs}개의 채용공고를 수집했습니다.
                    </div>
                  )}

                  {jobPlanetResult.error && (
                    <div className="text-sm text-coral-600 mt-2">
                      오류: {jobPlanetResult.error}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* 크롤링된 데이터 미리보기 */}
        {(jobKoreaResult?.success || jobPlanetResult?.success) && (
          <ScrollReveal className="mt-8">
            <GlassCard strong className="p-8 md:p-10">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 mb-6">크롤링 결과 미리보기</h3>

              <div className="space-y-8">
                {jobKoreaResult?.success && jobKoreaResult.data && (
                  <div>
                    <h4 className="font-semibold text-azure-700 mb-3 flex items-center gap-2">
                      잡코리아
                      <Badge tone="azure">{jobKoreaResult.data.totalJobs}개</Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobKoreaResult.data.jobs.slice(0, 4).map((job, index) => (
                        <div key={index} className="glass rounded-2xl p-4">
                          <h5 className="font-semibold text-ink-900 mb-1">{job.title}</h5>
                          <p className="text-sm text-ink-500 mb-1">{job.company}</p>
                          <p className="text-xs text-ink-400">{job.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {jobPlanetResult?.success && jobPlanetResult.data && (
                  <div>
                    <h4 className="font-semibold text-azure-700 mb-3 flex items-center gap-2">
                      잡플래닛
                      <Badge tone="azure">{jobPlanetResult.data.totalJobs}개</Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobPlanetResult.data.jobs.slice(0, 4).map((job, index) => (
                        <div key={index} className="glass rounded-2xl p-4">
                          <h5 className="font-semibold text-ink-900 mb-1">{job.title}</h5>
                          <p className="text-sm text-ink-500 mb-1">{job.company}</p>
                          <p className="text-xs text-ink-400">{job.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </ScrollReveal>
        )}

        {/* 주의사항 */}
        <ScrollReveal className="mt-8">
          <GlassCard className="p-6 md:p-8 bg-honey-100/50 border-honey-400/40">
            <h3 className="text-lg font-semibold text-honey-600 mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              크롤링 관련 주의사항
            </h3>
            <ul className="text-sm text-ink-600 space-y-1.5">
              <li>• 현재는 시뮬레이션 데이터를 생성합니다 (실제 웹사이트 크롤링 제한)</li>
              <li>• 실제 크롤링을 위해서는 각 사이트의 robots.txt와 이용약관을 확인해야 합니다</li>
              <li>• 서버 사이드에서 크롤링을 수행하여 CORS 문제를 해결할 수 있습니다</li>
              <li>• 크롤링 빈도를 조절하여 서버에 부하를 주지 않도록 주의하세요</li>
            </ul>
          </GlassCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
