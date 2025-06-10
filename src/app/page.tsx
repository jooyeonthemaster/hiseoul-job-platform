'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { logOut, getUserData } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  BriefcaseIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightIcon,
  UserIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon,
  StarIcon,
  BuildingOfficeIcon as BuildingOfficeIconSolid
} from '@heroicons/react/24/solid';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'employer'>('jobseeker');
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'jobseeker' | 'employer' | 'admin' | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
          setUserRole(userData.role);
          // 기업 사용자 자동 리다이렉트 제거 - 메인 페이지에서도 접근 가능하도록
        }
      }
    };

    checkUserRole();
  }, [user, router]);

  const stats = [
    { label: '등록된 포트폴리오', value: '1,200+', icon: BriefcaseIcon },
    { label: '참여 기업', value: '450+', icon: BuildingOfficeIcon },
    { label: '성공 매칭', value: '890+', icon: UserGroupIcon },
    { label: '평균 매칭률', value: '85%', icon: ChartBarIcon },
  ];

  const features = [
    {
      title: '포트폴리오 기반 매칭',
      description: '실무 경험과 프로젝트 결과물을 통한 정확한 인재 매칭',
      icon: BriefcaseIcon,
    },
    {
      title: '실시간 채용 프로세스',
      description: '온라인 지원부터 면접까지 streamlined 채용 과정',
      icon: ChartBarIcon,
    },
    {
      title: '서울시 인증 기업',
      description: '하이서울브랜드 기업들과의 검증된 채용 기회',
      icon: CheckCircleIcon,
    },
  ];

  const testimonials = [
    {
      name: '김민수',
      role: '디지털 마케터',
      company: '테크스타트업',
      content: '포트폴리오를 통해 정확한 매칭이 이루어져 현재 회사에서 만족스럽게 일하고 있습니다.',
      rating: 5,
    },
    {
      name: '박소영',
      role: '채용 담당자',
      company: '하이서울브랜드기업',
      content: '우수한 인재들의 실무 능력을 포트폴리오로 미리 확인할 수 있어 채용 효율성이 크게 향상되었습니다.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-2xl font-bold gradient-text">HiSeoul</span>
            </div>
            
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
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                소개
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {userRole === 'jobseeker' ? (
                    // 구직자 메뉴
                    <>
                      <Link href="/portfolios" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                        포트폴리오
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
                        대시보드
                      </Link>
                      <Link href="/employer-dashboard/company" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                        <BuildingOfficeIcon className="w-5 h-5 mr-1" />
                        기업정보
                      </Link>
                    </>
                  ) : null}
                  <Link href="/settings" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2">
                    <Cog6ToothIcon className="w-5 h-5 mr-1" />
                    설정
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await logOut();
                        window.location.reload(); // 페이지 새로고침으로 상태 리셋
                      } catch (error) {
                        console.error('로그아웃 오류:', error);
                      }
                    }}
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.png"
            alt="HiSeoul Job Platform Background"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-indigo-600/10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              서울시 공식 인증 구인구직 플랫폼
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-gray-900">모든 직군의 인재와</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                서울시 기업
              </span>
              <span className="text-gray-900">을 연결합니다</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              개발자부터 디자이너, 마케터까지 모든 직군의 포트폴리오 기반 매칭으로
              <br />
              <span className="font-semibold text-gray-800">최고의 인재와 우수한 기업이 만나는 플랫폼</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {isAuthenticated && userRole === 'employer' ? (
                // 기업 사용자용 CTA
                <>
                  <Link href="/employer-dashboard" className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2 inline-block" />
                    기업 대시보드로 이동
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/portfolios" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    인재 검색하기
                    <UserGroupIcon className="w-5 h-5 ml-2 inline-block group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/employer-setup" className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg w-full sm:w-auto">
                    기업 정보 수정
                  </Link>
                </>
              ) : isAuthenticated && userRole === 'jobseeker' ? (
                // 구직자용 CTA
                <>
                  <Link href="/portfolios" className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    내 포트폴리오 보기
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/profile" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    마이페이지
                    <UserIcon className="w-5 h-5 ml-2 inline-block group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/portfolios" className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg w-full sm:w-auto">
                    다른 포트폴리오 둘러보기
                  </Link>
                </>
              ) : (
                // 비로그인 사용자용 CTA
                <>
                  <Link href="/auth" className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    구직자로 시작하기
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/portfolios" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto">
                    포트폴리오 둘러보기
                    <svg className="w-5 h-5 ml-2 inline-block group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <Link href="/auth" className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg w-full sm:w-auto">
                    기업 회원가입
                  </Link>
                </>
              )}
            </div>

            {/* Video Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/RNVUAf8JhRo"
                    title="HiSeoul Job Platform 소개 영상"
                    className="w-full h-full rounded-3xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
              </section>

        {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-slate-100 border-t border-gray-200 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800">
              어떻게 작동하나요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              혁신적인 3단계 프로세스로 완벽한 매칭을 경험하세요
            </p>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20">
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  activeTab === 'jobseeker'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                구직자용
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  activeTab === 'employer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_8px_24px_rgba(99,102,241,0.3)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                기업용
              </button>
            </div>
          </div>

          {/* Enhanced Process Steps with Connection Lines */}
          <div className="relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
              <svg className="w-full h-4" viewBox="0 0 800 16" fill="none">
                <path 
                  d="M150 8 L350 8 M450 8 L650 8" 
                  stroke="url(#gradient1)" 
                  strokeWidth="3" 
                  strokeDasharray="8,8"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {activeTab === 'jobseeker' ? (
                <>
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(59,130,246,0.3)] group-hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          1
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">포트폴리오 등록</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          모든 직군의 프로젝트와 경험을 담은 포트폴리오를 작성하세요
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_32px_rgba(99,102,241,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          2
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">기업 매칭</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          AI 기반 매칭 시스템이 당신의 스킬과 맞는 기업을 추천합니다
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(147,51,234,0.3)] group-hover:shadow-[0_12px_32px_rgba(147,51,234,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          3
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">온라인 지원</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          관심 있는 기업에 클릭 한 번으로 간편하게 지원하세요
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(99,102,241,0.3)] group-hover:shadow-[0_12px_32px_rgba(99,102,241,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          1
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">기업 정보 등록</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          회사 소개와 모든 직군의 채용 요구사항을 상세히 입력하세요
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(147,51,234,0.3)] group-hover:shadow-[0_12px_32px_rgba(147,51,234,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          2
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">인재 검색</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          다양한 직군의 포트폴리오를 통해 검증된 우수 인재를 찾아보세요
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-3xl font-bold shadow-[0_8px_24px_rgba(16,185,129,0.3)] group-hover:shadow-[0_12px_32px_rgba(16,185,129,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                          3
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">채용 진행</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          플랫폼 내에서 모든 채용 과정을 효율적으로 관리하세요
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">왜 HiSeoul을 선택하나요?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              기존 구인구직 사이트와는 다른 차별화된 서비스를 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white border border-gray-200 rounded-2xl p-10 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">사용자 후기</h2>
            <p className="text-xl text-gray-600">
              실제 이용자들의 생생한 경험담을 확인하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-6 h-6 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 border-t border-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            무료 회원가입으로 더 나은 커리어의 첫걸음을 내디뎌보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register?type=jobseeker" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
              구직자로 시작하기
            </Link>
            <Link href="/register?type=employer" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
              기업 회원가입
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-2xl font-bold">HiSeoul</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                서울시 중소기업과 모든 직군의 전문 인재를 연결하는 프리미엄 구인구직 플랫폼
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">서비스</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/portfolios" className="hover:text-white transition-colors text-lg">포트폴리오</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors text-lg">채용공고</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors text-lg">기업정보</Link></li>
                <li><Link href="/matching" className="hover:text-white transition-colors text-lg">AI 매칭</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">지원</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors text-lg">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors text-lg">문의하기</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors text-lg">FAQ</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors text-lg">개인정보처리방침</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">연락처</h3>
              <div className="text-gray-400 space-y-3 text-lg">
                <p>이메일: hiseoulnewjob@naver.com</p>
                <p>전화: 010-3721-0204</p>
                <p>담당: 김기홍 전 HBA 사무국장</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-10 text-center text-gray-400 text-lg">
            <p>&copy; 2024 HiSeoul Job Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
