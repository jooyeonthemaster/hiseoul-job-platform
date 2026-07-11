'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, getEmployerWithApprovalStatus, getAllPortfolios, deleteUserAccount } from '@/lib/auth';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BriefcaseIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  MapPinIcon,
  AcademicCapIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  HomeIcon,
  XMarkIcon,
  DocumentTextIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  PORTFOLIO_PROGRAMS,
  getAllowedProgramIdsForEmployer,
  isEmployerProgramRestricted,
  portfolioMatchesProgram,
  type PortfolioProgram,
} from '@/lib/programs';
import { getAllPrograms } from '@/lib/customPrograms';
import { getVisiblePortfolioProgramIds } from '@/lib/programSettings';
import { formatKoreanDate } from '@/lib/dateUtils';

// ─────────────────────────────────────────────────────────────
//  매칭데이 확정 일정 (클라이언트 공지 기준)
// ─────────────────────────────────────────────────────────────
const SCHEDULE = [
  { date: new Date(2026, 6, 15), label: '07.15 (수)', title: '채용신청서 마감', desc: '채용 신청서 제출 마감일' },
  { date: new Date(2026, 6, 20), label: '07.20 (월)', title: '면접 안내', desc: '기업별 면접 일정 개별 안내' },
  { date: new Date(2026, 6, 22), label: '07.22 (수)', title: '매칭데이 행사', desc: '행사장 대면 면접 진행' },
] as const;
const MATCHING_DAY_PLACE = '서울특별시 영등포구 영등포로 33, 5층 스타트런 행사장';

function getDday(target: Date): { text: string; passed: boolean; today: boolean } {
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((target.getTime() - todayMid.getTime()) / 86400000);
  if (diff === 0) return { text: 'D-DAY', passed: false, today: true };
  if (diff > 0) return { text: `D-${diff}`, passed: false, today: false };
  return { text: '종료', passed: true, today: false };
}

interface SentInquiry {
  id: string;
  jobSeekerName: string;
  proposedPosition: string;
  matchingDayAttendance?: 'attend' | 'unavailable';
  sentAt: any;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [programCounts, setProgramCounts] = useState<Record<string, number>>({});
  const [visibleProgramIds, setVisibleProgramIds] = useState<string[]>([]);
  const [allPrograms, setAllPrograms] = useState<PortfolioProgram[]>(PORTFOLIO_PROGRAMS);
  const [programRestricted, setProgramRestricted] = useState(false);
  const [allowedProgramIds, setAllowedProgramIds] = useState<string[] | null>(null);
  const [sentInquiries, setSentInquiries] = useState<SentInquiry[]>([]);
  const [sentTotal, setSentTotal] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Firebase 인증 복원이 끝나기 전에는 판단하지 않는다 (직접 URL 진입 시 홈으로 튕기는 레이스 방지)
      if (authLoading) return;

      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'employer') {
          router.push('/');
          return;
        }

        const employerData = await getEmployerWithApprovalStatus(user.uid);
        if (!employerData || !(employerData as any).company?.name) {
          router.push('/employer-setup');
          return;
        }

        setCompanyInfo((employerData as any).company || {});
        const status = employerData.approvalStatus || 'pending';
        setApprovalStatus(status);
        setRejectedReason((employerData as any).rejectedReason || null);

        // 관리자가 이 기업에 허용한 과정 (필드 없음 = 전체 허용, 빈 배열 = 전면 차단)
        const restricted = isEmployerProgramRestricted(employerData as any);
        setProgramRestricted(restricted);
        setAllowedProgramIds(
          restricted
            ? ((employerData as any).allowedProgramIds as unknown[]).filter(
                (id): id is string => typeof id === 'string',
              )
            : null,
        );

        // 인재 데이터는 승인된 기업에게만 로드한다.
        // (미승인 기업에게 전체 인재 명단이 노출되던 문제 수정 — 열람 정책은 /portfolios 와 동일하게)
        if (status === 'approved') {
          const [portfolios, programIds, mergedPrograms] = await Promise.all([
            getAllPortfolios(),
            getVisiblePortfolioProgramIds(),
            getAllPrograms(),
          ]);
          setVisibleProgramIds(programIds);
          setAllPrograms(mergedPrograms);
          const counts: Record<string, number> = {};
          mergedPrograms.forEach((program) => {
            counts[program.id] = portfolios.filter((p: any) =>
              portfolioMatchesProgram(p, program.id, mergedPrograms),
            ).length;
          });
          setProgramCounts(counts);
        } else {
          const [programIds, mergedPrograms] = await Promise.all([
            getVisiblePortfolioProgramIds(),
            getAllPrograms(),
          ]);
          setVisibleProgramIds(programIds);
          setAllPrograms(mergedPrograms);
        }

        // 내가 보낸 채용 신청서 (본인 선택 내역 — 관리자 중개형 원칙에 저촉되지 않음)
        const inquiriesSnap = await getDocs(
          query(collection(db, 'jobInquiries'), where('employerId', '==', user.uid)),
        );
        const rows = inquiriesSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as any))
          .sort((a, b) => (b.sentAt?.seconds || 0) - (a.sentAt?.seconds || 0));
        setSentTotal(rows.length);

        const recent = rows.slice(0, 4);
        const withNames: SentInquiry[] = await Promise.all(
          recent.map(async (row) => {
            let jobSeekerName = '교육생';
            try {
              const u = await getDoc(doc(db, 'users', row.jobSeekerId));
              if (u.exists()) jobSeekerName = u.data().name || jobSeekerName;
            } catch {
              /* 이름 조회 실패 시 기본 라벨 유지 */
            }
            return {
              id: row.id,
              jobSeekerName,
              proposedPosition: row.proposedPosition || '-',
              matchingDayAttendance: row.matchingDayAttendance,
              sentAt: row.sentAt,
            };
          }),
        );
        setSentInquiries(withNames);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, router]);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      await deleteUserAccount(user.uid);
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (error: any) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴에 실패했습니다: ' + error.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-azure-50">
        <AuroraBackground variant="subtle" />
        <div className="relative flex flex-col items-center space-y-5">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500"></div>
          <p className="text-ink-500 font-medium">대시보드를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  const isApproved = approvalStatus === 'approved';
  // 전역 노출 설정 ∩ 관리자가 이 기업에 허용한 과정.
  // 연도별 아카이브 과정(2025 등)은 상단 네비 탭 전용이므로 대시보드 카드에서는 제외한다.
  const globallyVisiblePrograms = allPrograms.filter(
    (program) => visibleProgramIds.includes(program.id) && !program.archived,
  );
  const visiblePrograms = programRestricted
    ? globallyVisiblePrograms.filter((program) =>
        getAllowedProgramIdsForEmployer(
          { allowedProgramIds: allowedProgramIds ?? [] },
          globallyVisiblePrograms.map((p) => p.id),
        ).includes(program.id),
      )
    : globallyVisiblePrograms;
  const navItemBase =
    'group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300';

  return (
    // overflow-hidden 은 position:sticky 를 무력화하므로 x축 clip 만 적용한다
    <div className="relative min-h-screen overflow-x-clip bg-azure-50">
      <AuroraBackground variant="subtle" />

      {/* Modern Sidebar Layout */}
      <div className="relative flex items-start">
        {/* Sidebar — 전역 네비(4rem) 아래에 고정되어 본문 스크롤 내내 왼쪽 기둥이 비지 않는다 */}
        <div className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
          <div className="flex h-full flex-col glass-strong border-r border-white/60 m-0 rounded-none">
            <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-6">
              <div className="flex items-center flex-shrink-0 px-7">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-11 h-11 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-display font-bold text-lg">H</span>
                  </div>
                  <div>
                    <span className="text-lg font-display font-bold tracking-tight text-ink-900">면접심사 매칭 플랫폼</span>
                    <p className="text-xs text-ink-400 mt-0.5">기업 대시보드</p>
                  </div>
                </Link>
              </div>

              {/* Company Profile Card */}
              <div className="mt-8 mx-6">
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-azure-100 to-azure-50 rounded-2xl flex items-center justify-center border border-white/70 shadow-glass-sm">
                      <BuildingOfficeIcon className="w-8 h-8 text-azure-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-ink-900 truncate">
                        {companyInfo?.name}
                      </h3>
                      <p className="text-sm text-ink-500 mt-1">{companyInfo?.industry}</p>
                      <div className="flex items-center mt-3">
                        {approvalStatus === 'approved' ? (
                          <Badge tone="mint" icon={<span className="w-2 h-2 bg-mint-500 rounded-full" />}>
                            인증 기업
                          </Badge>
                        ) : approvalStatus === 'rejected' ? (
                          <Badge tone="coral" icon={<span className="w-2 h-2 bg-coral-500 rounded-full" />}>
                            승인 거절
                          </Badge>
                        ) : (
                          <Badge tone="honey" icon={<span className="w-2 h-2 bg-honey-500 rounded-full" />}>
                            승인 대기
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-8 flex-1 space-y-1.5 px-6">
                <Link
                  href="/employer-dashboard"
                  className={`${navItemBase} bg-azure-500/10 border border-azure-200 text-azure-700`}
                >
                  <ChartBarIcon className="text-azure-500 mr-4 h-5 w-5" />
                  대시보드
                </Link>

                <Link
                  href="/portfolios"
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <UserGroupIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
                  과정별 포트폴리오
                </Link>

                <Link
                  href="/employer-dashboard/inquiries"
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <DocumentTextIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
                  보낸 채용 신청서
                </Link>

                <Link
                  href="/employer-setup"
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <BriefcaseIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
                  기업 설정
                </Link>

                <Link
                  href="/employer-guide"
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <BookOpenIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
                  이용 안내
                </Link>

                <div className="pt-4 border-t border-ink-100 mt-6">
                  <Link
                    href="/"
                    className={`${navItemBase} text-ink-600 hover:text-ink-900 hover:bg-azure-50/70`}
                  >
                    <HomeIcon className="text-ink-400 group-hover:text-ink-600 mr-4 h-5 w-5 transition-colors" />
                    메인 페이지
                  </Link>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`${navItemBase} w-full mt-1.5 text-coral-600 hover:text-coral-700 hover:bg-coral-100/50`}
                  >
                    <TrashIcon className="text-coral-400 group-hover:text-coral-600 mr-4 h-5 w-5 transition-colors" />
                    회원 탈퇴
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Navigation — 데스크톱은 사이드바가 브랜딩을 담당하므로 모바일에서만 노출 */}
          <header className="glass-nav border-b border-white/50 lg:hidden">
            <div className="px-5 sm:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-azure-500 to-azure-600 rounded-xl flex items-center justify-center shadow-glow">
                    <span className="text-white font-display font-bold text-sm">H</span>
                  </div>
                  <span className="text-lg font-display font-bold tracking-tight text-ink-900">기업 대시보드</span>
                </Link>

                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-azure-500 to-azure-600 rounded-xl flex items-center justify-center shadow-glow">
                    <BuildingOfficeIcon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-ink-900">{companyInfo?.name}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12 space-y-8">
              {/* 승인 상태 알림 */}
              {approvalStatus && approvalStatus !== 'approved' && (
                <ScrollReveal>
                  {approvalStatus === 'pending' ? (
                    <div className="glass rounded-3xl p-5 border-honey-400/40">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-honey-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-honey-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-semibold text-ink-900">승인 대기 중</h3>
                          <div className="mt-1.5 text-sm text-ink-500">
                            <p>귀하의 기업 회원가입이 승인 대기 중입니다. 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : approvalStatus === 'rejected' && (
                    <div className="glass rounded-3xl p-5 border-coral-400/40">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-coral-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-coral-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-semibold text-ink-900">가입 거절됨</h3>
                          <div className="mt-1.5 text-sm text-ink-500">
                            <p>귀하의 기업 회원가입이 거절되었습니다.</p>
                            {rejectedReason && (
                              <p className="mt-1">거절 사유: {rejectedReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollReveal>
              )}

              {/* ── 헤더: 인사 + 핵심 CTA ── */}
              <ScrollReveal>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-ink-900 leading-tight">
                      안녕하세요, <span className="text-gradient-azure">{companyInfo?.name}</span> 님
                    </h1>
                    <p className="mt-2.5 text-ink-500 text-base leading-relaxed">
                      {isApproved
                        ? '과정별 포트폴리오에서 교육생을 검토하고 채용 신청서를 제출하세요.'
                        : '기업 승인이 완료되면 교육생 포트폴리오 열람과 채용 신청이 가능합니다.'}
                    </p>
                  </div>
                  {isApproved && (
                    <GlassButton href="/portfolios" size="md" className="shrink-0 self-start sm:self-auto">
                      <UserGroupIcon className="w-5 h-5" />
                      과정별 포트폴리오 보기
                      <ArrowRightIcon className="w-4 h-4" />
                    </GlassButton>
                  )}
                </div>
              </ScrollReveal>

              {/* ── 주요 일정 (D-day) ── */}
              <ScrollReveal>
                <GlassCard className="p-6 md:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                        <CalendarDaysIcon className="w-5 h-5" />
                      </span>
                      <h2 className="text-lg font-semibold text-ink-900">주요 일정</h2>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-ink-500">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-azure-500" />
                      <span className="break-keep">{MATCHING_DAY_PLACE}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {SCHEDULE.map((item, index) => {
                      const dday = getDday(item.date);
                      return (
                        <div
                          key={item.title}
                          className={`relative overflow-hidden rounded-2xl border p-5 ${
                            dday.today
                              ? 'border-coral-400/60 bg-coral-100/40'
                              : dday.passed
                                ? 'border-white/70 bg-white/40'
                                : 'border-azure-100 bg-azure-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold tracking-wide ${dday.passed ? 'text-ink-300' : 'text-azure-600'}`}>
                              STEP {index + 1}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                dday.today
                                  ? 'bg-coral-500 text-white'
                                  : dday.passed
                                    ? 'bg-ink-100 text-ink-400'
                                    : 'bg-azure-500 text-white'
                              }`}
                            >
                              {dday.text}
                            </span>
                          </div>
                          <div className={`mt-3 font-display text-xl font-bold tabular-nums ${dday.passed ? 'text-ink-400' : 'text-ink-900'}`}>
                            {item.label}
                          </div>
                          <div className={`mt-1 text-sm font-semibold ${dday.passed ? 'text-ink-400' : 'text-ink-800'}`}>{item.title}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* ── 과정별 교육생 ── */}
              <ScrollReveal>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                    <AcademicCapIcon className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-semibold text-ink-900">과정별 교육생</h2>
                </div>

                {visiblePrograms.length === 0 && (
                  <GlassCard className="p-10 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-azure-100 bg-azure-50 shadow-glass-sm">
                      <LockClosedIcon className="h-8 w-8 text-azure-500" />
                    </div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-ink-900">
                      현재 열람 가능한 과정이 없습니다
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                      {programRestricted
                        ? '매칭 기간이 종료되었거나 열람 권한이 아직 설정되지 않았습니다. 교육생 개인정보 보호를 위해 관리자가 허용한 과정만 열람할 수 있습니다.'
                        : '관리자가 노출할 과정을 설정하면 이곳에 표시됩니다.'}
                    </p>
                  </GlassCard>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                  {visiblePrograms.map((program) => (
                    <GlassCard key={program.id} hover={isApproved} className="flex h-full flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
                            {program.audience} · {program.hours}
                          </Badge>
                          <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink-900 break-keep">
                            {program.name}
                          </h3>
                        </div>
                        {isApproved && (
                          <div className="shrink-0 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-center shadow-glass-sm">
                            <div className="font-display text-xl font-bold text-azure-700 tabular-nums">
                              {programCounts[program.id] ?? 0}
                            </div>
                            <div className="text-[11px] font-semibold text-ink-400">교육생</div>
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-ink-500 line-clamp-2">{program.summary}</p>

                      <div className="mt-auto pt-5">
                        {isApproved ? (
                          <GlassButton href="/portfolios" variant="secondary" size="sm" className="w-full">
                            과정 소개와 교육생 보기
                            <ArrowRightIcon className="w-4 h-4" />
                          </GlassButton>
                        ) : (
                          <div className="flex items-center justify-center gap-2 rounded-2xl border border-ink-100 bg-white/50 px-4 py-2.5 text-sm font-medium text-ink-400">
                            <LockClosedIcon className="h-4 w-4" />
                            기업 승인 후 열람 가능
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </ScrollReveal>

              {/* ── 내가 보낸 채용 신청서 ── */}
              <ScrollReveal>
                <GlassCard className="p-6 md:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                        <EnvelopeIcon className="w-5 h-5" />
                      </span>
                      <h2 className="text-lg font-semibold text-ink-900">
                        보낸 채용 신청서
                        {sentTotal > 0 && <span className="ml-2 text-base font-semibold text-azure-600">{sentTotal}건</span>}
                      </h2>
                    </div>
                    {sentTotal > 0 && (
                      <Link
                        href="/employer-dashboard/inquiries"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-azure-600 transition-colors hover:text-azure-700"
                      >
                        전체 보기
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  {sentInquiries.length > 0 ? (
                    <div className="divide-y divide-ink-100/70 rounded-2xl border border-white/70 bg-white/50">
                      {sentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                              <span className="font-semibold text-ink-900">{inquiry.jobSeekerName}</span>
                              <span className="truncate text-sm text-ink-500">{inquiry.proposedPosition}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-ink-400">
                              {formatKoreanDate(inquiry.sentAt?.toDate?.() || inquiry.sentAt, { fallback: '' })} · 관리자 검토 후 매칭데이 일정으로 조율됩니다
                            </p>
                          </div>
                          {inquiry.matchingDayAttendance === 'unavailable' ? (
                            <Badge tone="coral">매칭데이 참석 불가</Badge>
                          ) : (
                            <Badge tone="mint">매칭데이 참석</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/40 px-6 py-10 text-center">
                      <EnvelopeIcon className="mx-auto h-9 w-9 text-ink-200" />
                      <p className="mt-3 text-sm font-medium text-ink-500">아직 보낸 채용 신청서가 없습니다</p>
                      {isApproved && (
                        <>
                          <p className="mt-1 text-xs text-ink-400">
                            과정별 포트폴리오에서 교육생을 검토한 뒤, 7월 15일(수)까지 신청서를 제출하세요.
                          </p>
                          <GlassButton href="/portfolios" size="sm" className="mt-5">
                            <UserGroupIcon className="w-4 h-4" />
                            교육생 검토 시작하기
                          </GlassButton>
                        </>
                      )}
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-strong rounded-4xl shadow-glass-lg p-7 max-w-md w-full"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/60 border border-white/70 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-white/90 transition-all duration-300"
                aria-label="닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-coral-100 rounded-2xl flex items-center justify-center border border-coral-400/40">
                  <ExclamationTriangleIcon className="w-6 h-6 text-coral-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">회원 탈퇴</h3>
                  <p className="text-sm text-ink-500">정말로 탈퇴하시겠습니까?</p>
                </div>
              </div>

              <div className="bg-coral-100/50 border border-coral-400/40 rounded-2xl p-4 mb-6">
                <p className="text-sm text-ink-700">
                  <strong className="text-coral-700">주의:</strong> 회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <ul className="mt-2 text-sm text-ink-500 list-disc list-inside space-y-0.5">
                  <li>기업 정보 및 프로필</li>
                  <li>채용 공고 및 지원 내역</li>
                  <li>모든 활동 기록</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  취소
                </GlassButton>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-glass hover:from-coral-400 hover:to-coral-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/60"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white mr-2"></div>
                      탈퇴 중...
                    </div>
                  ) : (
                    '탈퇴하기'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
