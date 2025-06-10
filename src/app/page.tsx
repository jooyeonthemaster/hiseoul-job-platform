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
  BuildingOfficeIcon,
  ClockIcon
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
    <div className="min-h-screen pt-20">

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-40 overflow-hidden">
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
              <span className="text-gray-900">우수한 인재와</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                서울시 기업
              </span>
              <span className="text-gray-900">을 연결합니다</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-gray-800">포트폴리오 기반 매칭으로 최고의 인재와 우수한 기업이 만나는 플랫폼</span>
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
      <section className="py-40 relative overflow-hidden">
        {/* Enhanced Background with Dynamic Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/60"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Floating Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-8 h-8 border-2 border-blue-200 rotate-45 animate-float"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-indigo-200 rounded-full animate-float animation-delay-200"></div>
          <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-200 rotate-45 animate-float animation-delay-400"></div>
          <div className="absolute bottom-20 right-10 w-6 h-6 border-2 border-emerald-200 rounded-full animate-float animation-delay-600"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-32">
            <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-800 font-semibold text-sm mb-8 shadow-sm">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></span>
              검증된 매칭 시스템
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-10 leading-tight">
              <span className="text-gray-900">성공적인 매칭을 위한</span><br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                스마트 프로세스
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              AI 기반 매칭 알고리즘과 전문적인 검증 시스템으로<br />
              <span className="text-blue-600 font-semibold">평균 85% 매칭 성공률</span>을 달성하는 혁신적인 프로세스
            </p>
            
            {/* Success Metrics */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                <div className="text-gray-600 text-sm">매칭 성공률</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">3일</div>
                <div className="text-gray-600 text-sm">평균 응답시간</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">1,200+</div>
                <div className="text-gray-600 text-sm">성공 사례</div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-24">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/40">
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`relative px-12 py-6 rounded-2xl font-bold text-lg transition-all duration-500 group ${
                  activeTab === 'jobseeker'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_12px_32px_rgba(59,130,246,0.4)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                {activeTab === 'jobseeker' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                )}
                <div className="relative flex items-center space-x-3">
                  <UserGroupIcon className="w-6 h-6" />
                  <span>구직자 여정</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`relative px-12 py-6 rounded-2xl font-bold text-lg transition-all duration-500 group ${
                  activeTab === 'employer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_12px_32px_rgba(99,102,241,0.4)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                {activeTab === 'employer' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                )}
                <div className="relative flex items-center space-x-3">
                  <BuildingOfficeIcon className="w-6 h-6" />
                  <span>기업 여정</span>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Process Flow */}
          <div className="relative">
            {/* Progressive Connection Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
              <div className="relative h-1 bg-gray-200 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full animate-pulse opacity-60"></div>
              </div>
              {/* Progress Dots */}
              <div className="absolute -top-2 left-0 w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-indigo-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute -top-2 right-0 w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            
            {/* Process Duration Indicator */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-green-800 font-semibold text-sm shadow-sm">
                <ClockIcon className="w-4 h-4 mr-2" />
                전체 프로세스: {activeTab === 'jobseeker' ? '평균 7-10일' : '평균 5-7일'}
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-16 relative">
              {activeTab === 'jobseeker' ? (
                <>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          01
                        </div>
                      </div>
                      
                      {/* Icon Container */}
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <BriefcaseIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        포트폴리오 작성
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        전문적인 포트폴리오 템플릿을 활용해<br />
                        당신의 역량과 프로젝트를 효과적으로 어필하세요
                      </p>
                      
                      {/* Key Benefits */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-blue-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>AI 기반 포트폴리오 최적화</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-blue-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>업계별 맞춤 템플릿 제공</span>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 2-3일
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          02
                        </div>
                      </div>
                      
                      {/* Icon Container */}
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(99,102,241,0.3)] group-hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <ChartBarIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                        스마트 매칭
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        AI 알고리즘이 당신의 스킬, 경험, 선호도를<br />
                        분석하여 최적의 기업을 매칭해드립니다
                      </p>
                      
                      {/* Key Benefits */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-indigo-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>95% 매칭 정확도</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-indigo-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>실시간 추천 알림</span>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 1-2일
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          03
                        </div>
                      </div>
                      
                      {/* Icon Container */}
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(147,51,234,0.3)] group-hover:shadow-[0_25px_50px_rgba(147,51,234,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <ArrowRightIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                        원클릭 지원
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        관심 기업에 원클릭으로 지원하고<br />
                        실시간으로 지원 현황을 추적하세요
                      </p>
                      
                      {/* Key Benefits */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-purple-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>즉시 지원 확인</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-purple-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>진행상황 실시간 알림</span>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 3-5일
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          01
                        </div>
                      </div>
                      
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(99,102,241,0.3)] group-hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <BuildingOfficeIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                        기업 프로필 등록
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        하이서울브랜드 기업 인증과 함께<br />
                        상세한 기업 정보를 등록하세요
                      </p>
                      
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-indigo-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>서울시 공식 인증</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-indigo-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>전담 컨설턴트 배정</span>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 1-2일
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          02
                        </div>
                      </div>
                      
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(147,51,234,0.3)] group-hover:shadow-[0_25px_50px_rgba(147,51,234,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <MagnifyingGlassIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                        인재 발굴
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        AI 추천 시스템으로 검증된<br />
                        우수 인재를 빠르게 발굴하세요
                      </p>
                      
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-purple-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>포트폴리오 기반 검색</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-purple-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>스킬 매칭 점수 제공</span>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-purple-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 2-3일
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          03
                        </div>
                      </div>
                      
                      <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <UserGroupIcon className="w-16 h-16 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                        스마트 채용
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed mb-8">
                        통합 채용 관리 시스템으로<br />
                        효율적인 채용 프로세스를 완성하세요
                      </p>
                      
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center justify-center text-sm text-emerald-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>실시간 지원자 관리</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-emerald-600">
                          <CheckCircleIcon className="w-4 h-4 mr-2" />
                          <span>자동 스케줄링 시스템</span>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-medium text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        소요시간: 2-4일
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Bottom CTA Section */}
            <div className="mt-24 text-center">
              {!isAuthenticated ? (
                <Link href="/auth" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-[0_12px_32px_rgba(59,130,246,0.3)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.4)] transition-all duration-300 hover:scale-105">
                  <span className="mr-3">
                    {activeTab === 'jobseeker' ? '무료로 시작하기' : '기업 회원가입'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  href={
                    userRole === 'jobseeker' 
                      ? '/profile' 
                      : userRole === 'employer' 
                      ? '/employer-dashboard' 
                      : '/profile'
                  } 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-lg shadow-[0_12px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">
                    {userRole === 'jobseeker' 
                      ? '포트폴리오 작성하기' 
                      : userRole === 'employer' 
                      ? '대시보드로 이동' 
                      : '마이페이지로 이동'
                    }
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              )}
              <p className="text-gray-500 text-sm mt-4">
                {!isAuthenticated ? (
                  activeTab === 'jobseeker' 
                    ? '지금 가입하면 포트폴리오 템플릿 무료 제공' 
                    : '하이서울브랜드 기업 우선 인증 혜택'
                ) : (
                  userRole === 'jobseeker' 
                    ? '나만의 포트폴리오를 만들어 취업 기회를 늘려보세요' 
                    : userRole === 'employer' 
                    ? '우수한 인재들을 발굴하고 채용하세요' 
                    : '서비스를 최대한 활용해보세요'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              차별화된 서비스
            </div>
            <h2 className="text-6xl lg:text-7xl font-bold mb-8 text-gray-900 leading-tight">
              왜 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HiSeoul</span>을<br />
              선택하나요?
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              기존 구인구직 사이트와는 차원이 다른 혁신적인 서비스로<br />
              <span className="text-blue-600 font-semibold">성공적인 매칭</span>을 보장합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                {/* Card Background with Enhanced Design */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-3xl p-12 text-center hover:-translate-y-4 transition-all duration-500">
                  {/* Enhanced Icon Design */}
                  <div className="relative mb-10">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-[0_12px_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_20px_60px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <feature.icon className="w-14 h-14 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  {/* Additional Feature Highlights */}
                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium text-sm">
                      {index === 0 && "95% 매칭 성공률"}
                      {index === 1 && "평균 3일 내 응답"}
                      {index === 2 && "450+ 인증 기업"}
                    </span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Statistics Row */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-600">등록된 포트폴리오</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">450+</div>
              <div className="text-gray-600">참여 기업</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">890+</div>
              <div className="text-gray-600">성공 매칭</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">95%</div>
              <div className="text-gray-600">매칭 성공률</div>
            </div>
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
          {!isAuthenticated ? (
            <>
              <h2 className="text-5xl font-bold text-white mb-8">
                지금 바로 시작하세요
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                무료 회원가입으로 더 나은 커리어의 첫걸음을 내디뎌보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  구직자로 시작하기
                </Link>
                <Link href="/auth" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
                  기업 회원가입
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-5xl font-bold text-white mb-8">
                {userRole === 'jobseeker' ? '취업 성공을 위한 다음 단계' : userRole === 'employer' ? '채용 성공을 위한 다음 단계' : '서비스를 더 활용해보세요'}
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                {userRole === 'jobseeker' 
                  ? '포트폴리오를 완성하고 맞춤형 채용 정보를 받아보세요' 
                  : userRole === 'employer' 
                  ? '우수한 인재를 찾고 효율적인 채용 프로세스를 경험하세요' 
                  : 'HiSeoul의 다양한 기능을 통해 목표를 달성하세요'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {userRole === 'jobseeker' ? (
                  <>
                    <Link href="/profile" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      포트폴리오 작성하기
                    </Link>
                    <Link href="/jobs" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
                      채용공고 보기
                    </Link>
                  </>
                ) : userRole === 'employer' ? (
                  <>
                    <Link href="/employer-dashboard" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      대시보드로 이동
                    </Link>
                    <Link href="/employer-dashboard/jobs" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
                      채용공고 작성하기
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      마이페이지
                    </Link>
                    <Link href="/settings" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
                      설정
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
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
                <li><span className="text-gray-500 text-lg cursor-not-allowed">AI 매칭 (준비중)</span></li>
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
