'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserData } from '@/lib/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid);
          setUserRole(userData?.role || null);
        } catch (error) {
          console.error('Error loading user role:', error);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    };

    loadUserRole();
  }, [user]);

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold gradient-text">HiSeoul</span>
          </Link>
          
          {/* 메인 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/portfolios" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              포트폴리오
            </Link>
            <Link href="/companies" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              기업정보
            </Link>
            <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              채용공고
            </Link>
          </nav>
          
          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {userRole === 'jobseeker' ? (
                  // 구직자 메뉴
                  <>
                    <Link href={`/portfolios/${user.uid}`} className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      💼 내 포트폴리오
                    </Link>
                    <Link href="/profile" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      <UserIcon className="w-5 h-5 mr-1" />
                      마이페이지
                    </Link>
                  </>
                ) : userRole === 'employer' ? (
                  // 기업 메뉴
                  <>
                    <Link href="/employer-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      📊 대시보드
                    </Link>
                    <Link href="/employer-dashboard/company" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      <BuildingOfficeIcon className="w-5 h-5 mr-1" />
                      기업정보
                    </Link>
                    <Link href="/employer-setup" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                      ⚙️ 기업 설정
                    </Link>
                  </>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                  로그인
                </Link>
                <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 