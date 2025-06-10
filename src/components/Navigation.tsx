'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUserData } from '@/lib/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
    <nav className="hidden md:flex space-x-8">
      {userRole === 'employer' ? (
        <>
          <Link href="/employer-dashboard" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            📊 대시보드
          </Link>
          <Link href="/employer-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
            👥 인재 검색
          </Link>
          <Link href="/employer-dashboard/inquiries" className="text-gray-600 hover:text-gray-900 transition-colors">
            📋 채용 관리
          </Link>
          <Link href="/employer-setup" className="text-gray-600 hover:text-gray-900 transition-colors">
            ⚙️ 기업 설정
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            🚪 로그아웃
          </button>
        </>
      ) : userRole === 'jobseeker' ? (
        <>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            🏠 홈
          </Link>
          <Link href="/portfolios" className="text-gray-600 hover:text-gray-900 transition-colors">
            💼 포트폴리오
          </Link>
          <Link href="/profile" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            👤 내 프로필
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
          >
            🚪 로그아웃
          </button>
        </>
      ) : (
        <>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            🏠 홈
          </Link>
          <Link href="/portfolios" className="text-gray-600 hover:text-gray-900 transition-colors">
            💼 포트폴리오
          </Link>
          <Link href="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            로그인
          </Link>
        </>
      )}
    </nav>
  );
} 