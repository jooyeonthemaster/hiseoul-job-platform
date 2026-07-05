'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { JobPosting } from '@/types';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassSelect, Field } from '@/components/ui/GlassField';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { staggerContainer, fadeUp } from '@/components/ui/motion';
import { formatKoreanDate } from '@/lib/dateUtils';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError(null);
        const response = await fetch('/api/jobs?includeCrawled=true&limit=100');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setJobs(data.data.jobs || []);
            console.log(`총 ${data.data.jobs.length}개 채용공고 로드 (샘플: ${data.data.sampleCount}, 크롤링: ${data.data.crawledCount})`);
          } else {
            setError(data.message || '채용공고를 불러오는데 실패했습니다.');
          }
        } else {
          setError('채용공고를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 크롤링 데이터 새로고침 함수
  const refreshCrawledData = async () => {
    setLoading(true);
    try {
      setError(null);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-crawled-data' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 데이터 새로고침
          const refreshResponse = await fetch('/api/jobs?includeCrawled=true&limit=100');
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setJobs(refreshData.data.jobs || []);
            }
          }
        }
      }
    } catch (error) {
      console.error('크롤링 새로고침 오류:', error);
      setError('크롤링 새로고침 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const reduceMotion = useReducedMotion();

  // 필터링된 채용공고
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || job.jobCategory === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || job.location.includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(jobs.map(job => job.jobCategory)));

  // 지역 목록 추출 (간단하게 처리)
  const locations = Array.from(new Set(jobs.map(job => {
    const parts = job.location.split(' ');
    return parts[0]; // 첫 번째 단어만 (서울특별시, 경기도 등)
  })));

  const getWorkTypeLabel = (workType: string) => {
    const labels: { [key: string]: string } = {
      'fulltime': '정규직',
      'parttime': '계약직',
      'contract': '파트타임',
      'intern': '인턴'
    };
    return labels[workType] || workType;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AuroraBackground />
        <div className="container-wide py-32">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-5">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-100 border-t-azure-500"></div>
              <p className="text-ink-500 font-medium">채용공고를 불러오고 있습니다...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-clip">
      {/* ============================ Body ============================ */}
      <section className="relative pt-28 lg:pt-32 pb-28 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          {/* Heading + Refresh */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">
              채용 공고
            </h1>
            <GlassButton
              onClick={refreshCrawledData}
              disabled={loading}
              size="md"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              크롤링 새로고침
            </GlassButton>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <ScrollReveal className="mb-6">
              <div className="glass-strong rounded-3xl border border-coral-400/40 px-5 py-4">
                <div className="flex items-center gap-3 text-coral-600">
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Search and Filters */}
          <ScrollReveal>
            <GlassCard strong className="mb-8 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-azure-400 h-5 w-5 pointer-events-none z-10" />
                    <GlassInput
                      type="text"
                      placeholder="채용공고 제목, 회사명, 기술스택으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>

                {/* Filter Button */}
                <GlassButton
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  size="md"
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  필터
                </GlassButton>
              </div>

              {/* Filters */}
              <AnimatePresence initial={false}>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-ink-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Filter */}
                        <Field label="직무 카테고리">
                          <GlassSelect
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                          >
                            <option value="all">모든 직무</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </GlassSelect>
                        </Field>

                        {/* Location Filter */}
                        <Field label="근무 지역">
                          <GlassSelect
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                          >
                            <option value="all">모든 지역</option>
                            {locations.map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </GlassSelect>
                        </Field>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </ScrollReveal>

          {/* Job Statistics */}
          <ScrollReveal delay={0.06}>
            <GlassCard className="mb-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">
                    채용공고 <span className="text-gradient-azure">{filteredJobs.length}개</span>
                  </h2>
                  <p className="text-sm md:text-base text-ink-500 mt-1.5">
                    {searchTerm ? `"${searchTerm}"에 대한 검색 결과` : '최신 채용공고를 확인해보세요'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-ink-400">
                  <span className="font-medium">정렬</span>
                  <GlassSelect className="w-auto py-2 text-sm text-ink-700">
                    <option>최신순</option>
                    <option>마감임박순</option>
                    <option>급여순</option>
                  </GlassSelect>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Job Listings */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
            variants={reduceMotion ? undefined : staggerContainer()}
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? false : 'show'}
          >
            {filteredJobs.map((job) => {
              return (
                <motion.div key={job.id} variants={reduceMotion ? undefined : fadeUp}>
                  <GlassCard hover className="h-full flex flex-col p-7">
                    {/* Company Name - Highlighted */}
                    <div className="mb-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow flex-shrink-0">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-azure-700 truncate">
                              {job.companyName}
                            </h4>
                            {/* 크롤링 소스 표시 */}
                            {job.source && job.source !== 'manual' && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge tone="mint" className="!px-2 !py-0.5 !text-[11px]">
                                  {job.source === 'jobkorea' ? '잡코리아' : '잡플래닛'}
                                </Badge>
                                {job.externalUrl && (
                                  <a
                                    href={job.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-azure-600 hover:text-azure-700 underline"
                                  >
                                    원본보기
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-ink-400 flex-shrink-0 mt-1">
                          {getWorkTypeLabel(job.workType)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="azure" icon={<TagIcon className="w-3.5 h-3.5" />}>
                          {job.jobCategory}
                        </Badge>
                        {/* 데이터 타입 배지 */}
                        {job.source ? (
                          <Badge tone="mint" className="!px-2 !py-1">실시간</Badge>
                        ) : (
                          <Badge tone="neutral" className="!px-2 !py-1">샘플</Badge>
                        )}
                      </div>
                    </div>

                    {/* Job Header */}
                    <div className="mb-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="group"
                      >
                        <h3 className="text-lg md:text-xl font-bold text-ink-900 group-hover:text-azure-700 transition-colors mb-3 line-clamp-2">
                          {job.title}
                        </h3>
                      </Link>
                      <div className="flex items-center text-sm text-ink-500">
                        <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 text-azure-400" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-ink-500 mb-5 text-sm leading-relaxed line-clamp-3">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-azure-50/80 border border-azure-100 text-azure-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-white/70 border border-white/70 text-ink-400">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-6 text-sm text-ink-500">
                      {job.salary.amount && (
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-2 flex-shrink-0 text-azure-400" />
                          <span className="truncate">{job.salary.amount}</span>
                          {job.salary.negotiable && (
                            <span className="ml-1 text-xs text-azure-600">(협의가능)</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0 text-azure-400" />
                        <span>마감: {formatKoreanDate(job.deadline, { fallback: '상시모집' })}</span>
                      </div>
                      {job.workingHours && (
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 flex-shrink-0 text-azure-400" />
                          <span className="truncate">{job.workingHours}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <GlassButton
                        href={`/jobs/${job.id}`}
                        className="w-full"
                      >
                        상세보기
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <ScrollReveal>
              <GlassCard strong className="p-12 sm:p-16">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-4xl bg-azure-50 border border-azure-100 flex items-center justify-center mb-6 shadow-glass-sm">
                    <BriefcaseIcon className="w-10 h-10 text-azure-400" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-ink-500 mb-8">다른 검색 조건을 시도해보세요.</p>
                  <GlassButton
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                    }}
                    variant="secondary"
                  >
                    필터 초기화
                  </GlassButton>
                </div>
              </GlassCard>
            </ScrollReveal>
          )}

          {/* Load More Button */}
          {filteredJobs.length > 0 && (
            <ScrollReveal className="text-center mt-14">
              <GlassButton variant="outline" size="lg">
                더 많은 채용공고 보기
              </GlassButton>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}
