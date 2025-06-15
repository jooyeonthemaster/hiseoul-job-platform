'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { checkEmployerApprovalStatus } from '@/lib/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const { user, userData, loading: authLoading } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const loadApprovalStatus = async () => {
      console.log('🔍 Navigation - loadApprovalStatus 시작');
      console.log('📋 Navigation - user:', !!user);
      console.log('📋 Navigation - userData:', userData);
      console.log('📋 Navigation - authLoading:', authLoading);
      
      if (!authLoading && userData) {
        console.log('👤 Navigation - userRole:', userData.role);
        
        // 기업 사용자인 경우 승인 상태도 로드
        if (userData.role === 'employer') {
          console.log('🏢 Navigation - 기업 사용자 감지, 승인 상태 확인 중');
          try {
            const status = await checkEmployerApprovalStatus(user!.uid);
            console.log('🏢 Navigation - 승인 상태:', status);
            setApprovalStatus(status);
          } catch (error) {
            console.error('❌ Navigation - Error loading approval status:', error);
            setApprovalStatus(null);
          }
        } else {
          setApprovalStatus(null);
        }
      } else {
        console.log('🚫 Navigation - 사용자 데이터 없음 또는 로딩 중');
        setApprovalStatus(null);
      }
      
      setLoading(false);
      console.log('✅ Navigation - loadApprovalStatus 완료');
    };

    loadApprovalStatus();
  }, [user, userData, authLoading]);

  // 추가 디버깅 로그
  console.log('🎯 Navigation 렌더링 상태:', {
    user: !!user,
    userData,
    userRole: userData?.role,
    approvalStatus,
    authLoading,
    loading
  });

  if (authLoading || loading) {
    console.log('⏳ Navigation - 로딩 중');
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

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/images/logo.png" 
              alt="HiSeoul Logo" 
              className="h-10 w-auto group-hover:scale-105 transition-all duration-300"
            />
          </Link>
          
          {/* 데스크톱 메인 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/portfolios" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium group"
            >
              <DocumentTextIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>포트폴리오</span>
            </Link>
            <Link 
              href="/companies" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium group"
            >
              <BuildingOffice2Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>기업정보</span>
            </Link>
          </nav>
          
          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {userData?.name?.charAt(0) || user?.displayName?.charAt(0) || '사'}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:block">
                    {userData?.name || user?.displayName || '사용자'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 사용자 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[70]">
                    {(userData?.role === 'jobseeker' || (!userData && user && !loading)) && (
                      <>
                        <Link 
                          href={`/portfolios/${user.uid}`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BriefcaseIcon className="w-5 h-5" />
                          <span>내 포트폴리오</span>
                        </Link>
                        <Link 
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <UserIcon className="w-5 h-5" />
                          <span>마이페이지</span>
                        </Link>
                      </>
                    )}
                    
                    {userData?.role === 'employer' && (
                      <>
                        <Link 
                          href="/employer-dashboard"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span>대시보드</span>
                        </Link>
                        <Link 
                          href="/employer-dashboard/company"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <BuildingOfficeIcon className="w-5 h-5" />
                          <span>기업정보 관리</span>
                        </Link>
                        <div className="px-4 py-2">
                          {approvalStatus === 'pending' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              🕐 승인 심사중
                            </span>
                          )}
                          {approvalStatus === 'approved' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              ✅ 승인 완료
                            </span>
                          )}
                          {approvalStatus === 'rejected' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              ❌ 승인 거절됨
                            </span>
                          )}
                          {!approvalStatus && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              ⏳ 상태 확인중
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    
                    {userData?.role === 'admin' && (
                      <Link 
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>관리자 페이지</span>
                      </Link>
                    )}
                    
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/auth" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  로그인
                </Link>
                <Link 
                  href="/auth" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  회원가입
                </Link>
              </div>
            )}
            
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-2 pt-4 pb-4 space-y-2">
            <Link 
              href="/portfolios"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>포트폴리오</span>
            </Link>
            <Link 
              href="/companies"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BuildingOffice2Icon className="w-5 h-5" />
              <span>기업정보</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
} 