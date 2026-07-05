'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  TagIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { JobPosting } from '@/types';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { formatKoreanDate } from '@/lib/dateUtils';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!params?.id) return;

      try {
        const response = await fetch(`/api/job-postings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          console.error('채용공고를 불러오는데 실패했습니다.');
          router.push('/jobs');
        }
      } catch (error) {
        console.error('API 호출 오류:', error);
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params?.id, router]);

  const getWorkTypeLabel = (workType: string) => {
    const labels: { [key: string]: string } = {
      'fulltime': '정규직',
      'parttime': '계약직',
      'contract': '파트타임',
      'intern': '인턴'
    };
    return labels[workType] || workType;
  };

  const handleApply = async () => {
    setIsApplying(true);
    // TODO: 실제 지원 로직 구현
    setTimeout(() => {
      setIsApplying(false);
      alert('지원이 완료되었습니다!');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide py-32">
          <div className="flex items-center justify-center h-64">
            <GlassCard strong className="px-12 py-10">
              <div className="flex flex-col items-center space-y-5">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-500"></div>
                <p className="text-ink-500 font-medium">채용공고를 불러오고 있습니다...</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide py-32">
          <ScrollReveal className="mx-auto max-w-xl">
            <GlassCard strong className="text-center px-8 py-14">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shadow-glass-sm">
                <BriefcaseIcon className="w-10 h-10" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-3">채용공고를 찾을 수 없습니다</h1>
              <p className="text-ink-500 leading-relaxed mb-8">요청하신 채용공고가 삭제되었거나 존재하지 않습니다.</p>
              <GlassButton href="/jobs" size="lg">
                <ArrowLeftIcon className="w-5 h-5" />
                채용공고 목록으로 돌아가기
              </GlassButton>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />

      {/* Back link */}
      <div className="relative z-10 container-wide pt-10">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-ink-500 hover:text-azure-700 bg-white/55 backdrop-blur-md border border-white/60 shadow-glass-sm transition-colors duration-300"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          채용공고 목록으로 돌아가기
        </Link>
      </div>

      <div className="relative z-10 container-wide py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 lg:space-y-10"
        >
          {/* Hero Header */}
          <ScrollReveal>
            <GlassCard strong className="relative overflow-hidden p-8 lg:p-12">
              <AuroraBackground variant="subtle" className="opacity-40" />
              <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-3 mb-5">
                    <Badge tone="azure" icon={<TagIcon className="w-4 h-4" />}>
                      {job.jobCategory}
                    </Badge>
                    <Badge tone="mint" icon={<BriefcaseIcon className="w-4 h-4" />}>
                      {getWorkTypeLabel(job.workType)}
                    </Badge>
                  </div>

                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 mb-5 leading-[1.1]">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-ink-500">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-azure-500" />
                      <span className="font-medium text-ink-700">{job.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5 text-azure-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-azure-500" />
                      <span>마감: {formatKoreanDate(job.deadline, { fallback: '상시모집' })}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="lg:ml-8 space-y-3 shrink-0">
                  <GlassButton
                    onClick={handleApply}
                    disabled={isApplying}
                    size="lg"
                    className="w-full lg:w-auto"
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        지원 중...
                      </>
                    ) : (
                      '지원하기'
                    )}
                  </GlassButton>



                  {/* 크롤링 소스 표시 */}
                  {(job as any).source && (
                    <div className="text-sm text-ink-400 text-center">
                      출처: {(job as any).source === 'jobkorea' ? '잡코리아' : (job as any).source === 'jobplanet' ? '잡플래닛' : (job as any).source}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Info Cards */}
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                {job.salary.amount && (
                  <div className="glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 text-ink-500 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-azure-500" />
                      <span className="font-medium">급여</span>
                    </div>
                    <p className="text-lg font-semibold text-ink-900">
                      {job.salary.amount}
                      {job.salary.negotiable && (
                        <span className="text-sm text-azure-600 ml-2">(협의가능)</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="glass rounded-3xl p-5">
                  <div className="flex items-center gap-2 text-ink-500 mb-2">
                    <ClockIcon className="w-5 h-5 text-azure-500" />
                    <span className="font-medium">근무시간</span>
                  </div>
                  <p className="text-lg font-semibold text-ink-900">
                    {job.workingHours}
                  </p>
                </div>

                <div className="glass rounded-3xl p-5">
                  <div className="flex items-center gap-2 text-ink-500 mb-2">
                    <TagIcon className="w-5 h-5 text-azure-500" />
                    <span className="font-medium">급여 형태</span>
                  </div>
                  <p className="text-lg font-semibold text-ink-900">
                    {job.salary.type}
                  </p>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Job Description */}
              <ScrollReveal>
                <GlassCard className="p-8 lg:p-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-6">채용 상세</h2>
                  <div className="prose max-w-none">
                    <p className="text-ink-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Requirements */}
              <ScrollReveal>
                <GlassCard className="p-8 lg:p-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-6">지원 자격</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600">
                          <CheckIcon className="w-4 h-4" />
                        </span>
                        <span className="text-ink-700 leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </ScrollReveal>

              {/* Responsibilities */}
              <ScrollReveal>
                <GlassCard className="p-8 lg:p-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-6">주요 업무</h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-600">
                          <CheckIcon className="w-4 h-4" />
                        </span>
                        <span className="text-ink-700 leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </ScrollReveal>

              {/* Preferred Qualifications */}
              {job.preferredQualifications.length > 0 && (
                <ScrollReveal>
                  <GlassCard className="p-8 lg:p-10">
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-6">우대사항</h2>
                    <ul className="space-y-3">
                      {job.preferredQualifications.map((qual, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl bg-honey-100 border border-honey-400/40 flex items-center justify-center text-honey-600">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                          <span className="text-ink-700 leading-relaxed">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </ScrollReveal>
              )}

              {/* Benefits */}
              {job.benefits.length > 0 && (
                <ScrollReveal>
                  <GlassCard className="p-8 lg:p-10">
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-6">복리후생</h2>
                    <ul className="space-y-3">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl bg-mint-100 border border-mint-400/40 flex items-center justify-center text-mint-600">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                          <span className="text-ink-700 leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </ScrollReveal>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Required Skills */}
              <ScrollReveal>
                <GlassCard className="p-7">
                  <h3 className="font-semibold text-xl text-ink-900 mb-5">필요 기술</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} tone="azure">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Recruiter Info */}
              <ScrollReveal>
                <GlassCard className="p-7">
                  <h3 className="font-semibold text-xl text-ink-900 mb-5">채용 담당자</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="font-medium text-ink-900">{job.recruiterInfo.name}</p>
                        <p className="text-sm text-ink-500">{job.recruiterInfo.position}</p>
                      </div>
                    </div>

                    {job.recruiterInfo.phone && (
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shrink-0">
                          <PhoneIcon className="w-5 h-5" />
                        </span>
                        <span className="text-ink-700">{job.recruiterInfo.phone}</span>
                      </div>
                    )}

                    {job.recruiterInfo.email && (
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shrink-0">
                          <EnvelopeIcon className="w-5 h-5" />
                        </span>
                        <span className="text-ink-700 break-all">{job.recruiterInfo.email}</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Apply Section */}
              <ScrollReveal>
                <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-azure-600 via-azure-500 to-sky-cool-500 p-7 text-white shadow-glass-lg">
                  <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
                  <div className="relative">
                    <h3 className="font-display text-xl font-bold tracking-tight text-white mb-3">지원하기</h3>
                    <p className="text-white/85 leading-relaxed mb-5">
                      이 채용공고에 관심이 있으시다면 지금 바로 지원해보세요!
                    </p>
                    <GlassButton
                      onClick={handleApply}
                      disabled={isApplying}
                      variant="secondary"
                      className="w-full !text-azure-700"
                    >
                      {isApplying ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-600 mr-2"></div>
                          지원 중...
                        </>
                      ) : (
                        '지원하기'
                      )}
                    </GlassButton>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}