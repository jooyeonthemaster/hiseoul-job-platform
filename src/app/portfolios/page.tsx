'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  getPrimarySpeciality,
  getProgramById,
  getProgramForPortfolio,
  portfolioMatchesProgram,
  splitSpecialities,
  type PortfolioProgram,
  type ProgramCourseType,
} from '@/lib/programs';
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
  portfolios,
  onSelectProgram,
}: {
  programs: PortfolioProgram[];
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
          const count = portfolios.filter((portfolio) => portfolioMatchesProgram(portfolio, program.id)).length;
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

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {program.curriculum.slice(0, 3).map((item) => (
                    <div key={item.step} className="rounded-2xl border border-azure-100 bg-azure-50/60 p-3">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-azure-600">{item.step}</div>
                      <div className="mt-1 text-sm font-semibold text-ink-900">{item.title}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <GlassButton onClick={() => onSelectProgram(program.id)} className="w-full">
                    과정 설명과 영상 보기
                  </GlassButton>
                </div>
              </GlassCard>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

function ProgramIntro({
  program,
  portfolios,
  onBack,
  onShowTalents,
}: {
  program: PortfolioProgram;
  portfolios: Portfolio[];
  onBack: () => void;
  onShowTalents: () => void;
}) {
  const count = portfolios.filter((portfolio) => portfolioMatchesProgram(portfolio, program.id)).length;

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white/70 hover:text-azure-700"
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
          </div>
        </div>
      </GlassCard>

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

export default function PortfoliosPage() {
  const { user, userData } = useAuth();
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

      const ids = await getVisiblePortfolioProgramIds();
      setVisibleProgramIds(ids);
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

  const visiblePrograms = useMemo(
    () => PORTFOLIO_PROGRAMS.filter((program) => visibleProgramIds.includes(program.id)),
    [visibleProgramIds],
  );
  const selectedProgram = getProgramById(selectedProgramId);
  const selectedProgramPortfolios = selectedProgram
    ? portfolios.filter((portfolio) => portfolioMatchesProgram(portfolio, selectedProgram.id))
    : [];

  const availableSpecialities = useMemo(() => {
    const values = selectedProgramPortfolios.flatMap((portfolio) => splitSpecialities(portfolio.speciality));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ko'));
  }, [selectedProgramPortfolios]);

  const filteredPortfolios = selectedProgramPortfolios
    .filter((portfolio) => {
      const profileProgram = getProgramForPortfolio(portfolio);
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
  };

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
              <Link href="/" className="flex items-center gap-2 font-medium text-ink-500 transition-colors hover:text-azure-700">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
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
              <AcademicCapIcon className="mx-auto h-12 w-12 text-azure-500" />
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink-900">
                현재 공개된 과정이 없습니다
              </h2>
              <p className="mt-2 text-ink-500">관리자 메뉴에서 기업에게 노출할 포트폴리오 과정을 선택해주세요.</p>
            </GlassCard>
          ) : !selectedProgram ? (
            <ProgramChooser programs={visiblePrograms} portfolios={portfolios} onSelectProgram={handleSelectProgram} />
          ) : !showTalentGrid ? (
            <ProgramIntro
              program={selectedProgram}
              portfolios={portfolios}
              onBack={() => {
                setSelectedProgramId(null);
                setShowTalentGrid(false);
              }}
              onShowTalents={() => setShowTalentGrid(true)}
            />
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowTalentGrid(false)}
                    className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-ink-500 transition hover:bg-white/70 hover:text-azure-700"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    과정 설명으로
                  </button>
                  <Badge tone={selectedProgram.courseType === 'foreign' ? 'coral' : 'azure'}>
                    {selectedProgram.audience} · {selectedProgram.hours}
                  </Badge>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
                    {selectedProgram.shortName} 교육생
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500">
                    사진과 핵심 역량을 먼저 확인한 뒤, 개인 포트폴리오에서 자기소개·영상·프로젝트 문서를 자세히 검토하세요.
                  </p>
                </div>
                {hasAdminAccess && (
                  <Badge tone="neutral" className="self-start lg:self-auto">
                    관리자 열람
                  </Badge>
                )}
              </div>

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
