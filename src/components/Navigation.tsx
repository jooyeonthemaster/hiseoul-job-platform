'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { checkEmployerApprovalStatus } from '@/lib/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ArrowLeftOnRectangleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { getAllPrograms } from '@/lib/customPrograms';
import type { PortfolioProgram } from '@/lib/programs';

export default function Navigation() {
  const { user, userData, loading: authLoading } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;
  const canBrowsePortfolios = userData?.role === 'employer' || hasAdminAccess;

  // 연도별 아카이브 과정(예: 2025 수료생)은 메인 과정 선택 대신 상단 탭으로 분리 노출
  const [archivedPrograms, setArchivedPrograms] = useState<PortfolioProgram[]>([]);
  useEffect(() => {
    if (!canBrowsePortfolios) {
      setArchivedPrograms([]);
      return;
    }
    getAllPrograms().then((programs) => setArchivedPrograms(programs.filter((program) => program.archived)));
  }, [canBrowsePortfolios]);

  useEffect(() => {
    const loadApprovalStatus = async () => {
      if (!authLoading && userData) {
        // 기업 사용자인 경우 승인 상태도 로드
        if (userData.role === 'employer') {
          try {
            const status = await checkEmployerApprovalStatus(user!.uid);
            setApprovalStatus(status);
          } catch (error) {
            console.error('Navigation - Error loading approval status:', error);
            setApprovalStatus(null);
          }
        } else {
          setApprovalStatus(null);
        }
      } else {
        setApprovalStatus(null);
      }

      setLoading(false);
    };

    loadApprovalStatus();
  }, [user, userData, authLoading]);

  if (authLoading || loading) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const navLinkClass =
    'flex items-center gap-2 px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium group';
  const menuItemClass =
    'flex items-center gap-3 px-4 py-3 text-ink-600 hover:bg-azure-50/70 hover:text-azure-700 transition-colors';

  return (
    <header className="fixed top-0 w-full glass-nav z-50">
      <div className="container-wide">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex min-w-0 items-center group">
            <img
              src="/images/logo.png"
              alt="구직자 · 구인기업 면접심사 매칭 플랫폼 Logo"
              className="h-8 w-auto max-w-[10.75rem] object-contain group-hover:scale-105 transition-all duration-300 sm:h-10 sm:max-w-none"
            />
          </Link>

          {/* 데스크톱 메인 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {/* 포트폴리오 둘러보기는 기업회원·관리자만 (비로그인/구직자에게는 미노출) */}
            {canBrowsePortfolios && (
              <Link href="/portfolios" className={navLinkClass}>
                <DocumentTextIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>포트폴리오</span>
              </Link>
            )}
            {/* 연도별 아카이브 과정 — 클라이언트 요청: 메인 과정 선택 카드가 아닌 상단 탭으로 분리.
                md~lg 구간에서는 헤더가 넘치지 않도록 '2025 수료생' 형태의 짧은 라벨을 쓴다. */}
            {canBrowsePortfolios &&
              archivedPrograms.map((program) => {
                const year = program.name.match(/^(20\d{2})/)?.[1];
                const shortLabel = year ? `${year} 수료생` : program.shortName;
                return (
                  <Link key={program.id} href={`/portfolios?program=${program.id}`} className={navLinkClass}>
                    <AcademicCapIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span className="hidden whitespace-nowrap lg:inline">{program.shortName}</span>
                    <span className="whitespace-nowrap lg:hidden">{shortLabel}</span>
                  </Link>
                );
              })}
            <Link href="/companies" className={navLinkClass}>
              <BuildingOffice2Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>기업정보</span>
            </Link>
          </nav>

          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/60 backdrop-blur-md border border-white/70 hover:bg-white/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60 shadow-glass-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-azure-500 to-azure-600 rounded-full flex items-center justify-center shadow-glow">
                    <span className="text-white font-medium text-sm">
                      {userData?.name?.charAt(0) || user?.displayName?.charAt(0) || '사'}
                    </span>
                  </div>
                  <span className="text-ink-700 font-medium hidden sm:block">
                    {userData?.name || user?.displayName || '사용자'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-ink-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 사용자 드롭다운 메뉴 */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl py-2 z-[70] overflow-hidden"
                    >
                      {(userData?.role === 'jobseeker' || (!userData && user && !loading)) && (
                        <>
                          <Link href={`/portfolios/${user.uid}`} className={menuItemClass} onClick={() => setIsUserMenuOpen(false)}>
                            <BriefcaseIcon className="w-5 h-5" />
                            <span>내 포트폴리오</span>
                          </Link>
                          <Link href="/profile" className={menuItemClass} onClick={() => setIsUserMenuOpen(false)}>
                            <UserIcon className="w-5 h-5" />
                            <span>마이페이지</span>
                          </Link>
                        </>
                      )}

                      {userData?.role === 'employer' && (
                        <>
                          <Link href="/employer-dashboard" className={menuItemClass} onClick={() => setIsUserMenuOpen(false)}>
                            <Cog6ToothIcon className="w-5 h-5" />
                            <span>대시보드</span>
                          </Link>
                          <Link href="/employer-dashboard/company" className={menuItemClass} onClick={() => setIsUserMenuOpen(false)}>
                            <BuildingOfficeIcon className="w-5 h-5" />
                            <span>기업정보 관리</span>
                          </Link>
                          <div className="px-4 py-2">
                            {approvalStatus === 'pending' && <Badge tone="honey">🕐 승인 심사중</Badge>}
                            {approvalStatus === 'approved' && <Badge tone="mint">✅ 승인 완료</Badge>}
                            {approvalStatus === 'rejected' && <Badge tone="coral">❌ 승인 거절됨</Badge>}
                            {!approvalStatus && <Badge tone="neutral">⏳ 상태 확인중</Badge>}
                          </div>
                        </>
                      )}

                      {hasAdminAccess && (
                        <Link href="/admin" className={menuItemClass} onClick={() => setIsUserMenuOpen(false)}>
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span>관리자 페이지</span>
                        </Link>
                      )}

                      <hr className="my-2 border-ink-100" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-coral-600 hover:bg-coral-100/60 transition-colors"
                      >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span>로그아웃</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/auth"
                  className="text-ink-600 hover:text-azure-700 transition-colors font-medium px-2 py-2 sm:px-3 sm:py-2 rounded-xl hover:bg-azure-50/70 flex items-center gap-1 sm:gap-2"
                  title="로그인"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm sm:text-base">로그인</span>
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="btn-primary !px-3 !py-2 sm:!px-5 text-sm sm:text-base"
                  title="회원가입"
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">회원가입</span>
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-colors"
            >
              {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/50 mt-2 space-y-2 pb-4 pt-3"
            >
              {/* 포트폴리오 둘러보기는 기업회원·관리자만 (비로그인/구직자에게는 미노출) */}
              {canBrowsePortfolios && (
                <Link
                  href="/portfolios"
                  className="flex items-center gap-3 px-4 py-3 text-ink-600 hover:bg-azure-50/70 hover:text-azure-700 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>포트폴리오</span>
                </Link>
              )}
              {canBrowsePortfolios &&
                archivedPrograms.map((program) => (
                  <Link
                    key={program.id}
                    href={`/portfolios?program=${program.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-ink-600 hover:bg-azure-50/70 hover:text-azure-700 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <AcademicCapIcon className="w-5 h-5" />
                    <span>{program.shortName}</span>
                  </Link>
                ))}
              <Link
                href="/companies"
                className="flex items-center gap-3 px-4 py-3 text-ink-600 hover:bg-azure-50/70 hover:text-azure-700 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingOffice2Icon className="w-5 h-5" />
                <span>기업정보</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
