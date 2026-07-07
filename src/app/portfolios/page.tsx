'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  FunnelIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPortfolio, getAllPortfolios, getEmployerWithApprovalStatus } from '@/lib/auth';
import PortfolioAccessModal from '@/components/PortfolioAccessModal';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { fadeUp, staggerContainer } from '@/components/ui/motion';
import {
  DEFAULT_VISIBLE_PROGRAM_IDS,
  PORTFOLIO_PROGRAMS,
  SPECIALITY_ICON_MAP,
  getAllowedProgramIdsForEmployer,
  getPrimarySpeciality,
  getProgramById,
  getProgramForPortfolio,
  isEmployerProgramRestricted,
  portfolioMatchesProgram,
  splitSpecialities,
  type PortfolioProgram,
  type ProgramCourseType,
} from '@/lib/programs';
import { getAllPrograms } from '@/lib/customPrograms';
import { getVisiblePortfolioProgramIds } from '@/lib/programSettings';

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  email: string;
  speciality: string;
  phone?: string;
  address?: string;
  skills: string[];
  languages: string[];
  experience?: any[];
  education?: any[];
  description: string;
  rating: number;
  projects: number;
  verified: boolean;
  isPublic: boolean;
  profileImage?: string;
  currentCourse?: string;
  courseType?: ProgramCourseType | null;
  createdAt?: Date;
  updatedAt?: Date;
}

function ProgramTags({ program }: { program: PortfolioProgram }) {
  return (
    <div className="flex flex-wrap gap-2">
      {program.tags.map((tag) => (
        <Badge key={tag} tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function AccessStatusBanner({ employerStatus }: { employerStatus: any }) {
  if (!employerStatus) return null;

  if (employerStatus.approvalStatus === 'pending') {
    return (
      <ScrollReveal className="mb-7">
        <div className="glass-strong rounded-3xl border-honey-400/40 p-5 shadow-glass">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-honey-100">
              <ClockIcon className="h-6 w-6 text-honey-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink-900">승인 대기 중</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                기업 승인 완료 후 과정별 포트폴리오를 열람할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    );
  }

  return null;
}

function ProgramChooser({
  programs,
  archivedPrograms,
  matchPrograms,
  portfolios,
  onSelectProgram,
}: {
  programs: PortfolioProgram[];
  /** 연도별 아카이브 과정(지난 진행 사례) — 하단 별도 섹션으로 노출 */
  archivedPrograms: PortfolioProgram[];
  /** 과정-포트폴리오 매칭용 전체(정적+커스텀) 과정 목록 */
  matchPrograms: PortfolioProgram[];
  portfolios: Portfolio[];
  onSelectProgram: (programId: string) => void;
}) {
  return (
    <div className="space-y-8">
      <ScrollReveal>
        <GlassCard strong className="overflow-hidden p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
            <div>
              <Badge tone="azure" icon={<AcademicCapIcon className="h-4 w-4" />}>
                과정별 포트폴리오
              </Badge>
              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-5xl">
                어떤 과정의 교육생을 확인할까요?
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-500 md:text-lg">
                과정마다 배운 내용, 실습 범위, 채용 활용도가 다릅니다. 먼저 과정 설명과 전체 소개 영상을 확인한 뒤 개인 포트폴리오 목록으로 이동하세요.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: `${programs.length}개`, label: '노출 과정' },
                { value: `${portfolios.length}명`, label: '등록 교육생' },
                { value: '영상+포트폴리오', label: '검토 방식' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/70 bg-white/60 p-4 text-center shadow-glass-sm">
                  <div className="font-display text-xl font-bold text-ink-900 md:text-2xl">{item.value}</div>
                  <div className="mt-1 text-xs font-semibold text-ink-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </ScrollReveal>

      <div className="grid gap-5 lg:grid-cols-2">
        {programs.map((program) => {
          const count = portfolios.filter((portfolio) =>
            portfolioMatchesProgram(portfolio, program.id, matchPrograms),
          ).length;
          return (
            <ScrollReveal key={program.id}>
              <GlassCard hover className="flex h-full flex-col p-6 md:p-7">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
                      {program.audience} · {program.hours}
                    </Badge>
                    <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900">
                      {program.name}
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-center shadow-glass-sm">
                    <div className="font-display text-2xl font-bold text-azure-700">{count}</div>
                    <div className="text-xs font-semibold text-ink-400">교육생</div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-ink-500">{program.summary}</p>
                <div className="mt-5">
                  <ProgramTags program={program} />
                </div>

                {/* 커스텀 과정(연도별 아카이브 등)은 커리큘럼 데이터가 없으므로 자연 생략 */}
                {program.curriculum.length > 0 && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {program.curriculum.slice(0, 3).map((item) => (
                      <div key={item.step} className="rounded-2xl border border-azure-100 bg-azure-50/60 p-3">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-azure-600">{item.step}</div>
                        <div className="mt-1 text-sm font-semibold text-ink-900">{item.title}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <GlassButton onClick={() => onSelectProgram(program.id)} className="w-full">
                    {program.curriculum.length > 0 ? '과정 설명과 영상 보기' : '과정 설명 보기'}
                  </GlassButton>
                </div>
              </GlassCard>
            </ScrollReveal>
          );
        })}
      </div>

      {/* ── 연도별 아카이브: 지난 진행 사례 ──
          클라이언트 요청 — 2025 수료 과정은 현재 과정과 섞지 않고 '진행 사례' 섹션으로 구분해
          설명과 함께 노출한다. (상단 네비 탭으로도 동일하게 진입 가능) */}
      {archivedPrograms.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-ink-200" />
            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.22em] text-ink-400">
              Past Program
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-ink-200" />
          </div>

          {archivedPrograms.map((program) => {
            const year = program.name.match(/^(20\d{2})/)?.[1] || '지난';
            const count = portfolios.filter((portfolio) =>
              portfolioMatchesProgram(portfolio, program.id, matchPrograms),
            ).length;
            return (
              <ScrollReveal key={program.id}>
                <GlassCard strong className="overflow-hidden p-0">
                  <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    {/* 좌: 진행 사례 설명 */}
                    <div className="flex flex-col justify-center bg-gradient-to-br from-white/40 to-azure-50/40 p-7 md:p-9">
                      <Badge tone="neutral" icon={<ClockIcon className="h-4 w-4" />} className="self-start">
                        {year}년 진행 사례
                      </Badge>
                      <h2 className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight text-ink-900 md:text-3xl">
                        {year}년에 운영이 완료된
                        <br className="hidden md:block" /> 채용연계 과정입니다
                      </h2>
                      <p className="mt-4 text-sm leading-relaxed text-ink-500 md:text-base">
                        서울시 매력일자리 사업으로 {year}년에 운영을 마친 과정으로, 교육과 수료가 모두 완료된
                        상태입니다. 수료생들의 포트폴리오를 현재 과정과 동일한 방식으로 열람하고, 채용 신청까지
                        진행할 수 있습니다.
                      </p>
                      <ul className="mt-6 space-y-2.5">
                        {[
                          `${year}년 교육·수료 완료 인재 ${count}명`,
                          '포트폴리오 열람과 채용 신청 모두 가능',
                          `상단 '${program.shortName}' 탭에서도 바로 진입`,
                        ].map((line) => (
                          <li key={line} className="flex items-start gap-2.5 text-sm text-ink-600">
                            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-azure-500" />
                            <span className="leading-relaxed">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 우: 과정 카드 */}
                    <div className="flex flex-col border-t border-white/60 p-7 md:p-9 lg:border-l lg:border-t-0">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
                          {program.audience} · {program.hours}
                        </Badge>
                        <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-center shadow-glass-sm">
                          <div className="font-display text-2xl font-bold text-azure-700">{count}</div>
                          <div className="text-xs font-semibold text-ink-400">교육생</div>
                        </div>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold leading-snug tracking-tight text-ink-900 md:text-2xl">
                        {program.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-500">{program.summary}</p>
                      <div className="mt-5">
                        <ProgramTags program={program} />
                      </div>
                      <div className="mt-auto pt-6">
                        <GlassButton onClick={() => onSelectProgram(program.id)} className="w-full">
                          {year}년 수료생 포트폴리오 보기
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgramIntro({
  program,
  matchPrograms,
  portfolios,
  onBack,
  onShowTalents,
}: {
  program: PortfolioProgram;
  matchPrograms: PortfolioProgram[];
  portfolios: Portfolio[];
  onBack: () => void;
  onShowTalents: () => void;
}) {
  const count = portfolios.filter((portfolio) =>
    portfolioMatchesProgram(portfolio, program.id, matchPrograms),
  ).length;

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-2xl border border-azure-200 bg-white/75 px-4 py-2.5 text-sm font-semibold text-azure-700 shadow-glass-sm transition hover:bg-white"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        과정 선택으로
      </button>

      <GlassCard strong className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="p-6 md:p-9">
            <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'} icon={<AcademicCapIcon className="h-4 w-4" />}>
              {program.audience} · {program.hours}
            </Badge>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 md:text-5xl">
              {program.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-600">{program.overview}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{program.talentNote}</p>
            <div className="mt-6">
              <ProgramTags program={program} />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <GlassButton onClick={onShowTalents} size="lg">
                구직자 개인 포트폴리오 확인
              </GlassButton>
              <div className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/65 px-5 py-3 text-sm font-semibold text-ink-600 shadow-glass-sm">
                현재 {count}명 표시
              </div>
            </div>
          </div>

          <div className="bg-ink-900 p-4 md:p-6">
            {program.youtubeId ? (
              <>
                <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-glass-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${program.youtubeId}?rel=0&modestbranding=1`}
                    title={`${program.name} 전체 소개 영상`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 flex items-center gap-3 text-white/80">
                  <PlayCircleIcon className="h-5 w-5 text-azure-300" />
                  <p className="text-sm font-medium">과정 전체 소개 영상과 교육생 검토 전 확인용 콘텐츠입니다.</p>
                </div>
              </>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04]">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06]">
                  <PlayCircleIcon className="h-9 w-9 text-azure-300/70" />
                </div>
                <p className="text-sm font-medium text-white/60">과정 소개 영상이 준비 중입니다</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {program.curriculum.length > 0 && (
      <ScrollReveal>
        <GlassCard strong className="overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-azure-600">Curriculum</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
                {program.curriculumLabel}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{program.curriculumIntro}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {[
                { value: program.hours, label: '총 교육시간' },
                {
                  value: `${program.curriculum.length}${program.courseType === 'foreign' ? '파트' : '단계'}`,
                  label: '실전 구성',
                },
                { value: '채용연계', label: '과정 유형' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[104px] rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-center shadow-glass-sm"
                >
                  <div className="font-display text-lg font-bold text-azure-700">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] font-semibold text-ink-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-6 grid divide-y divide-white/70 overflow-hidden rounded-3xl border border-white/70 bg-white/55 shadow-glass-sm ${
              program.curriculum.length >= 5
                ? 'xl:grid-cols-5 xl:divide-x xl:divide-y-0'
                : 'lg:grid-cols-3 lg:divide-x lg:divide-y-0'
            }`}
          >
            {program.curriculum.map((item, index) => (
              <div
                key={item.step}
                className={`group relative flex gap-4 p-5 transition-colors hover:bg-azure-50/50 md:p-6 ${
                  program.curriculum.length >= 5 ? 'xl:flex-col' : 'lg:flex-col'
                }`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-4 right-2 select-none font-display text-[88px] font-bold leading-none text-azure-500/[0.08]"
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 font-display text-lg font-bold text-white shadow-glow">
                    {index + 1}
                  </div>
                </div>
                <div className="relative min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-azure-600">{item.step}</div>
                  <h3 className="mt-1 text-lg font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-lg border border-azure-100 bg-azure-50/80 px-2 py-1 text-xs font-medium text-azure-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-azure-500 via-sky-cool-400 to-azure-600 p-5 text-white shadow-glass sm:flex-row sm:items-center md:px-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold">{program.curriculumOutcome.title}</div>
              <p className="mt-0.5 text-sm leading-relaxed text-white/90">{program.curriculumOutcome.description}</p>
            </div>
          </div>
        </GlassCard>
      </ScrollReveal>
      )}

      {program.skills.length > 0 && (
      <ScrollReveal>
        <GlassCard className="p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-azure-600">What They Learned</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
                핵심 실무 역량
              </h2>
            </div>
            <Badge tone="azure" className="px-4 py-1.5">
              {program.skills.length}개 실무 역량
            </Badge>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {program.skills.map((skill) => (
              <div
                key={skill.title}
                className="flex gap-4 rounded-3xl border border-white/70 bg-white/65 p-5 shadow-glass-sm transition-colors hover:bg-white/85"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-xl">
                  {skill.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-ink-900">{skill.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{skill.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </ScrollReveal>
      )}

      {program.workHoursNote && (
        <GlassCard className="p-6 md:p-7">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">{program.workHoursNote.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{program.workHoursNote.description}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {program.workHoursNote.table.map((row) => (
              <div key={row.period} className="rounded-2xl border border-white/70 bg-white/65 p-4">
                <div className="text-sm font-semibold text-ink-900">{row.period}</div>
                <div className="mt-1 text-sm text-azure-700">{row.hours}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-400">{program.workHoursNote.note}</p>
        </GlassCard>
      )}
    </div>
  );
}

function PortfoliosPageInner() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const programParam = searchParams?.get('program') ?? null;
  const reduceMotion = useReducedMotion();
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;
  // 기업 회원에게는 카드에서 바로 채용 신청서 작성으로 이어지는 진입점을 제공한다
  const isEmployer = userData?.role === 'employer';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [employerStatus, setEmployerStatus] = useState<any>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [visibleProgramIds, setVisibleProgramIds] = useState<string[]>(DEFAULT_VISIBLE_PROGRAM_IDS);
  const [allPrograms, setAllPrograms] = useState<PortfolioProgram[]>(PORTFOLIO_PROGRAMS);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [showTalentGrid, setShowTalentGrid] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setAccessChecked(true);
        setShowAccessModal(true);
        return;
      }

      try {
        const access = await canAccessPortfolio(user.uid);
        setHasAccess(access);

        if (userData?.role === 'employer') {
          const status = await getEmployerWithApprovalStatus(user.uid);
          setEmployerStatus(status);
        }

        if (!access) {
          setShowAccessModal(true);
        }
      } catch (error) {
        console.error('Error checking portfolio access:', error);
        setHasAccess(false);
        setShowAccessModal(true);
      } finally {
        setAccessChecked(true);
      }
    };

    if (user !== undefined) {
      checkAccess();
    }
  }, [user, userData]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!accessChecked || !hasAccess) return;

      const [ids, programs] = await Promise.all([getVisiblePortfolioProgramIds(), getAllPrograms()]);
      setVisibleProgramIds(ids);
      setAllPrograms(programs);
    };

    loadSettings();
  }, [accessChecked, hasAccess]);

  useEffect(() => {
    const loadPortfolios = async () => {
      if (!accessChecked) return;

      if (!hasAccess) {
        setPortfolios([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getAllPortfolios(false);
        setPortfolios(data as Portfolio[]);
      } catch (error) {
        console.error('Error loading portfolios:', error);
        setPortfolios([]);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolios();
  }, [accessChecked, hasAccess]);

  // 전역 노출 설정 ∩ (기업 회원이면) 관리자가 그 기업에 허용한 과정.
  // allowedProgramIds 필드가 없는 기업(레거시)은 전체 허용으로 동작한다.
  const employerRestricted = isEmployer && !hasAdminAccess && isEmployerProgramRestricted(employerStatus);
  const visiblePrograms = useMemo(() => {
    const globallyVisible = allPrograms.filter((program) => visibleProgramIds.includes(program.id));
    if (!isEmployer || hasAdminAccess) return globallyVisible;
    const allowedIds = getAllowedProgramIdsForEmployer(
      employerStatus,
      globallyVisible.map((program) => program.id),
    );
    return globallyVisible.filter((program) => allowedIds.includes(program.id));
  }, [allPrograms, visibleProgramIds, isEmployer, hasAdminAccess, employerStatus]);

  const selectedProgram = getProgramById(selectedProgramId, allPrograms);
  const selectedProgramPortfolios = selectedProgram
    ? portfolios.filter((portfolio) => portfolioMatchesProgram(portfolio, selectedProgram.id, allPrograms))
    : [];

  const availableSpecialities = useMemo(() => {
    const values = selectedProgramPortfolios.flatMap((portfolio) => splitSpecialities(portfolio.speciality));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [selectedProgramPortfolios]);

  const filteredPortfolios = selectedProgramPortfolios
    .filter((portfolio) => {
      const profileProgram = getProgramForPortfolio(portfolio, allPrograms);
      const fields = [
        portfolio.name,
        portfolio.speciality,
        portfolio.description,
        portfolio.currentCourse,
        profileProgram?.shortName,
        ...(portfolio.skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = fields.includes(searchTerm.toLowerCase());
      const matchesSpeciality =
        selectedSpeciality === 'all' || splitSpecialities(portfolio.speciality).includes(selectedSpeciality);

      return matchesSearch && matchesSpeciality;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko');
        case 'recent':
        default:
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      }
    });

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setShowTalentGrid(false);
    setSearchTerm('');
    setSelectedSpeciality('all');
    setSortBy('recent');
    // 단계 전환은 라우트 이동이 아니므로 스크롤을 직접 최상단으로 복원한다
    window.scrollTo(0, 0);
  };

  // 단계 뒤로가기 (인재 목록 → 과정 설명 → 과정 선택). 상단 툴바와 본문 버튼이 공용으로 사용한다.
  const handleStepBack = () => {
    if (showTalentGrid) {
      setShowTalentGrid(false);
    } else {
      setSelectedProgramId(null);
      // 네비 탭(?program=...)으로 진입한 경우 쿼리를 지워 새로고침 시 재진입되지 않게 한다
      if (programParam) router.replace('/portfolios', { scroll: false });
    }
    window.scrollTo(0, 0);
  };

  // 상단 네비 탭(?program=아카이브 과정)으로 직접 진입 지원
  useEffect(() => {
    if (!programParam) return;
    if (visiblePrograms.some((program) => program.id === programParam)) {
      setSelectedProgramId(programParam);
      setShowTalentGrid(false);
      window.scrollTo(0, 0);
    }
  }, [programParam, visiblePrograms]);

  // 열람 권한이 뒤늦게 로드되어 보고 있던 과정이 차단되면 과정 선택 화면으로 되돌린다
  useEffect(() => {
    if (selectedProgramId && !visiblePrograms.some((program) => program.id === selectedProgramId)) {
      setSelectedProgramId(null);
      setShowTalentGrid(false);
    }
  }, [selectedProgramId, visiblePrograms]);

  if (!accessChecked) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-azure-aurora">
        <AuroraBackground />
        <GlassCard strong className="relative z-10 px-10 py-12 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-azure-200 border-b-azure-500" />
          <p className="font-medium text-ink-500">접근 권한을 확인하고 있습니다...</p>
        </GlassCard>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-azure-aurora px-5">
          <AuroraBackground variant="vivid" />
          <GlassCard strong className="relative z-10 max-w-lg px-10 py-14 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-4xl border border-azure-100 bg-azure-50 shadow-glass-sm">
              <LockClosedIcon className="h-10 w-10 text-azure-500" />
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
              접근 권한이 필요합니다
            </h1>
            <p className="leading-relaxed text-ink-500">승인된 기업 회원만 과정별 포트폴리오를 열람할 수 있습니다.</p>
          </GlassCard>
        </div>
        <PortfolioAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          userRole={userData?.role}
          approvalStatus={employerStatus?.approvalStatus}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#F0F8FF_0%,#E7F2FC_42%,#EAF4FF_100%)]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-azure-aurora opacity-75" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 w-28 bg-gradient-to-r from-azure-100/70 via-azure-100/25 to-transparent" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 w-28 bg-gradient-to-l from-azure-100/70 via-azure-100/25 to-transparent" />

      <div className="glass-nav sticky top-16 z-40 border-b border-white/50">
        <div className="mx-auto w-full max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* 과정에 들어와 있으면 좌측 상단 버튼은 '한 단계 뒤로'가 된다.
                  (사용자가 뒤로 가려고 습관적으로 누르는 위치가 '홈으로'라 홈으로 이탈하던 문제 수정) */}
              {selectedProgram ? (
                <button
                  type="button"
                  onClick={handleStepBack}
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-azure-200 bg-white/75 px-3.5 py-2 text-sm font-semibold text-azure-700 shadow-glass-sm transition hover:bg-white"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{showTalentGrid ? '과정 설명으로' : '과정 선택으로'}</span>
                </button>
              ) : (
                <Link href="/" className="flex items-center gap-2 font-medium text-ink-500 transition-colors hover:text-azure-700">
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>홈으로</span>
                </Link>
              )}
              <div className="h-6 w-px bg-ink-200" />
              <h1 className="truncate font-display text-2xl font-bold tracking-tight text-gradient-azure md:text-3xl">
                포트폴리오
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              {employerStatus?.approvalStatus === 'approved' && (
                <>
                  <p className="hidden whitespace-nowrap text-right text-xs leading-snug text-ink-400 xl:block">
                    과정별 교육 내용과 소개 영상을 확인한 뒤, 해당 과정 교육생의 개인 포트폴리오를 검토할 수 있습니다
                  </p>
                  <Badge tone="mint" icon={<CheckCircleIcon className="h-4 w-4" />} className="hidden px-4 py-1.5 sm:inline-flex">
                    승인 기업 전용
                  </Badge>
                </>
              )}
              <Badge tone="azure" className="px-4 py-1.5">
                총 {portfolios.length}명의 교육생
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-[1760px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 xl:px-10">
        <div className="relative z-10">
          {userData?.role === 'employer' && <AccessStatusBanner employerStatus={employerStatus} />}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-azure-200 border-b-azure-500" />
            </div>
          ) : visiblePrograms.length === 0 ? (
            <GlassCard strong className="px-8 py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-4xl border border-azure-100 bg-azure-50 shadow-glass-sm">
                {employerRestricted ? (
                  <LockClosedIcon className="h-10 w-10 text-azure-500" />
                ) : (
                  <AcademicCapIcon className="h-10 w-10 text-azure-500" />
                )}
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                {employerRestricted ? '현재 열람 가능한 과정이 없습니다' : '현재 공개된 과정이 없습니다'}
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-500">
                {employerRestricted
                  ? '매칭 기간이 종료되었거나 열람 권한이 아직 설정되지 않았습니다. 교육생 개인정보 보호를 위해 관리자가 허용한 과정만 열람할 수 있습니다.'
                  : '관리자 메뉴에서 기업에게 노출할 포트폴리오 과정을 선택해주세요.'}
              </p>
            </GlassCard>
          ) : !selectedProgram ? (
            <ProgramChooser
              // 아카이브 과정(2025 등)은 현재 과정 카드와 섞지 않고 하단 '진행 사례' 섹션으로 분리
              programs={visiblePrograms.filter((program) => !program.archived)}
              archivedPrograms={visiblePrograms.filter((program) => program.archived)}
              matchPrograms={allPrograms}
              portfolios={portfolios}
              onSelectProgram={handleSelectProgram}
            />
          ) : !showTalentGrid ? (
            <ProgramIntro
              program={selectedProgram}
              matchPrograms={allPrograms}
              portfolios={portfolios}
              onBack={handleStepBack}
              onShowTalents={() => {
                setShowTalentGrid(true);
                window.scrollTo(0, 0);
              }}
            />
          ) : (
            <div className="space-y-8">
              <button
                type="button"
                onClick={handleStepBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-azure-200 bg-white/75 px-4 py-2.5 text-sm font-semibold text-azure-700 shadow-glass-sm transition hover:bg-white"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                과정 설명으로
              </button>

              {/* 목록 최상단: 과정 요약 + 교육생 전체 자기소개 영상 (클라이언트 요청 — 목록 진입 시 가장 먼저 보이도록) */}
              <ScrollReveal>
                <GlassCard strong className="overflow-hidden p-0">
                  <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="flex flex-col justify-center p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={selectedProgram.courseType === 'foreign' ? 'coral' : 'azure'}>
                          {selectedProgram.audience} · {selectedProgram.hours}
                        </Badge>
                        {hasAdminAccess && <Badge tone="neutral">관리자 열람</Badge>}
                      </div>
                      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
                        {selectedProgram.shortName} 교육생
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500 md:text-base">
                        사진과 핵심 역량을 먼저 확인한 뒤, 개인 포트폴리오에서 자기소개·영상·프로젝트 문서를 자세히 검토하세요.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-glass-sm">
                          <UserGroupIcon className="h-4 w-4 text-azure-500" />
                          교육생 {selectedProgramPortfolios.length}명
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/65 px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-glass-sm">
                          <PlayCircleIcon className="h-4 w-4 text-azure-500" />
                          전체 자기소개 영상
                        </div>
                      </div>
                    </div>

                    <div className="bg-ink-900 p-4 md:p-5">
                      {selectedProgram.introVideoId || selectedProgram.youtubeId ? (
                        <>
                          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-glass-lg">
                            <iframe
                              src={`https://www.youtube.com/embed/${selectedProgram.introVideoId || selectedProgram.youtubeId}?rel=0&modestbranding=1`}
                              title={`${selectedProgram.name} 교육생 전체 자기소개 영상`}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                          <div className="mt-3.5 flex items-center gap-2.5 text-white/80">
                            <PlayCircleIcon className="h-5 w-5 shrink-0 text-azure-300" />
                            <p className="text-sm font-medium">
                              교육생 전체 자기소개 영상 — 개인 포트폴리오를 열람하기 전에 전체 교육생을 한눈에 확인하세요.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] py-10">
                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.06]">
                            <PlayCircleIcon className="h-9 w-9 text-azure-300/70" />
                          </div>
                          <p className="px-6 text-center text-sm font-medium leading-relaxed text-white/60">
                            교육생 전체 자기소개 영상이 아직 등록되지 않았습니다
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal>
                <div className="glass-strong rounded-3xl p-4 shadow-glass sm:p-5">
                  {/* 검색이 주인공: 셀렉트는 데스크톱에서 고정폭.
                      GlassSelect 기본 w-full 을 flex 행에 직접 두면 검색창(flex-1)이 짜부라지므로 반드시 폭을 제한한다. */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-azure-500" />
                        <GlassInput
                          type="text"
                          placeholder="이름, 전문분야, 스킬로 검색..."
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          className="pl-12"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FunnelIcon className="h-5 w-5 shrink-0 text-azure-500" />
                        <GlassSelect
                          value={selectedSpeciality}
                          onChange={(event) => setSelectedSpeciality(event.target.value)}
                          className="sm:w-48"
                        >
                          <option value="all">전체 전문분야</option>
                          {availableSpecialities.map((speciality) => (
                            <option key={speciality} value={speciality}>
                              {speciality}
                            </option>
                          ))}
                        </GlassSelect>
                      </div>

                      <GlassSelect
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="sm:w-36 sm:shrink-0"
                      >
                        <option value="recent">최신순</option>
                        <option value="name">이름순</option>
                      </GlassSelect>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                variants={reduceMotion ? undefined : staggerContainer()}
                initial={reduceMotion ? false : 'hidden'}
                animate={reduceMotion ? false : 'show'}
              >
                {filteredPortfolios.map((portfolio) => {
                  const specialities = splitSpecialities(portfolio.speciality);
                  const primarySpeciality = getPrimarySpeciality(portfolio.speciality);
                  return (
                    <motion.div key={portfolio.id} variants={reduceMotion ? undefined : fadeUp} className="h-full">
                      <GlassCard hover className="group relative flex h-full flex-col overflow-hidden rounded-3xl">
                        <div className="relative h-52 overflow-hidden rounded-t-3xl bg-gradient-to-br from-azure-100 via-sky-cool-200 to-azure-200">
                          {portfolio.profileImage ? (
                            <img
                              src={portfolio.profileImage}
                              alt={`${portfolio.name} 프로필`}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <div className="flex h-24 w-24 items-center justify-center rounded-4xl bg-white/70 text-5xl shadow-glass-sm">
                                {SPECIALITY_ICON_MAP[primarySpeciality] || '👤'}
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-ink-900/10 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-display text-lg font-bold tracking-tight text-white drop-shadow-lg">
                              {portfolio.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {(specialities.length > 0 ? specialities : [primarySpeciality]).slice(0, 2).map((speciality) => (
                              <span
                                key={speciality}
                                className="inline-flex max-w-full items-center rounded-full bg-gradient-to-r from-azure-500 to-azure-600 px-3 py-1 text-xs font-semibold text-white shadow-glow"
                              >
                                {speciality}
                              </span>
                            ))}
                            {specialities.length > 2 && (
                              <Badge tone="neutral">+{specialities.length - 2}</Badge>
                            )}
                          </div>

                          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-500">
                            {portfolio.description || `${primarySpeciality} 전문가입니다.`}
                          </p>

                          {portfolio.languages?.length > 0 && (
                            <div className="mb-3">
                              <h4 className="mb-2 text-xs font-semibold text-ink-700">언어</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {portfolio.languages.slice(0, 3).map((language) => (
                                  <Badge key={language} tone="mint">
                                    {language}
                                  </Badge>
                                ))}
                                {portfolio.languages.length > 3 && (
                                  <span className="self-center text-xs text-ink-400">+{portfolio.languages.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mb-4">
                            <h4 className="mb-2 text-xs font-semibold text-ink-700">주요 스킬</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {(portfolio.skills || []).slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  className="max-w-full rounded-lg border border-azure-100 bg-azure-50 px-2 py-1 text-xs text-azure-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {(portfolio.skills || []).length > 3 && (
                                <span className="self-center text-xs text-ink-400">+{portfolio.skills.length - 3}개</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto rounded-2xl border border-white/70 bg-white/65 p-3 text-center shadow-glass-sm">
                            <div className="text-xs font-bold text-ink-900">수행 중인 과정</div>
                            <div className="mt-1 line-clamp-2 text-xs text-ink-500">
                              {portfolio.currentCourse || selectedProgram.name}
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <GlassButton
                              href={`/portfolios/${portfolio.id}`}
                              variant={isEmployer ? 'secondary' : 'primary'}
                              className="flex-1 !rounded-xl !px-3 !py-2 !text-sm"
                            >
                              포트폴리오 보기
                            </GlassButton>
                            {isEmployer && (
                              <GlassButton
                                href={`/employer-dashboard/contact/${portfolio.id}`}
                                className="flex-1 !rounded-xl !px-3 !py-2 !text-sm"
                              >
                                <EnvelopeIcon className="h-4 w-4" />
                                채용 신청
                              </GlassButton>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}

                {filteredPortfolios.length === 0 && (
                  <div className="col-span-full">
                    <GlassCard strong className="px-8 py-20 text-center">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-4xl border border-azure-100 bg-azure-50 shadow-glass-sm">
                        <UserGroupIcon className="h-10 w-10 text-azure-500" />
                      </div>
                      <h3 className="mb-3 font-display text-2xl font-bold tracking-tight text-ink-900">
                        표시할 교육생이 없습니다
                      </h3>
                      <p className="mb-8 text-ink-500">검색어나 전문분야 필터를 조정해보세요.</p>
                      <GlassButton
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedSpeciality('all');
                        }}
                      >
                        전체 보기
                      </GlassButton>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// useSearchParams 는 Suspense 경계가 필요하다 (정적 프리렌더 대응)
export default function PortfoliosPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-azure-aurora">
          <AuroraBackground />
          <GlassCard strong className="relative z-10 px-10 py-12 text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-azure-200 border-b-azure-500" />
            <p className="font-medium text-ink-500">포트폴리오를 불러오고 있습니다...</p>
          </GlassCard>
        </div>
      }
    >
      <PortfoliosPageInner />
    </Suspense>
  );
}
