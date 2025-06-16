'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { logOut, getUserData, getJobSeekerProfile, getPortfolio } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { calculateProfileCompletion, ProfileCompletionResult } from '@/lib/profileCompletion';
import { JobSeekerProfile } from '@/types';
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
import TutorialOverlay from '@/components/TutorialOverlay';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'employer'>('employer');
  const { isAuthenticated, user, userData, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'jobseeker' | 'employer' | 'admin' | null>(null);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionResult | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // 새 기업 회원가입 시 강제 새로고침 처리
  useEffect(() => {
    const newEmployerSignup = localStorage.getItem('newEmployerSignup');
    if (newEmployerSignup === 'true') {
      // 플래그 제거
      localStorage.removeItem('newEmployerSignup');
      
      // 강제 새로고침 실행
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      // loading이 완료되고 user가 있을 때만 체크
      if (!loading && user) {
        if (userData) {
          setUserRole(userData.role);
          
          // 기업 사용자이고 첫 로그인이거나 설정을 완료하지 않은 경우 튜토리얼 표시
          if (userData.role === 'employer' && 
              (userData.isFirstLogin || !userData.hasCompletedSetup)) {
            setShowTutorial(true);
          } else {
            setShowTutorial(false);
          }
        }
      } else if (!loading && !user) {
        // 로그인하지 않은 경우
        setUserRole(null);
        setShowTutorial(false);
      }
    };

    checkUserRole();
  }, [user, userData, loading]);

  // 구직자 프로필 완성도 가져오기
  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (user && userData?.role === 'jobseeker') {
        console.log('🏠 메인 페이지: 프로필 완성도 계산 시작');
        setProfileLoading(true);
        try {
          const [profile, portfolio] = await Promise.all([
            getJobSeekerProfile(user.uid),
            getPortfolio(user.uid)
          ]);
          
          console.log('🏠 메인 페이지: 가져온 데이터');
          console.log('   - profile:', profile);
          console.log('   - profile.profile:', profile?.profile);
          console.log('   - profile.profile.skills:', profile?.profile?.skills);
          console.log('   - profile.profile.languages:', profile?.profile?.languages);
          console.log('   - portfolio:', portfolio);
          
          // 프로필 페이지와 동일한 방식으로 데이터 변환
          const profileData = profile?.profile ? {
            ...profile.profile,
            // 배열이 아닌 경우 빈 배열로 초기화
            skills: Array.isArray(profile.profile.skills) ? profile.profile.skills : [],
            languages: Array.isArray(profile.profile.languages) ? profile.profile.languages : [],
            experience: Array.isArray(profile.profile.experience) ? profile.profile.experience : [],
            education: Array.isArray(profile.profile.education) ? profile.profile.education : []
          } : null;
          
          console.log('🏠 메인 페이지: 변환된 profileData:', profileData);
          
          const completion = calculateProfileCompletion(
            profileData,
            !!portfolio
          );
          console.log('🏠 메인 페이지: 계산된 완성도:', completion);
          setProfileCompletion(completion);
        } catch (error) {
          console.error('프로필 완성도 계산 오류:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileCompletion();
  }, [user, userData]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const stats = [
    { label: '등록된 포트폴리오', value: '1,200+', icon: BriefcaseIcon },
    { label: '참여 기업', value: '450+', icon: BuildingOfficeIcon },
    { label: '성공 매칭', value: '890+', icon: UserGroupIcon },
    { label: '평균 매칭률', value: '85%', icon: ChartBarIcon },
  ];

  const features = [
    {
      title: '자기소개 영상',
      description: '교육생 1분 자기소개 영상으로 인재의 역량과 개성을 확인하세요',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: '다국적 인재',
      description: '귀사에서 필요로 하는 다양한 국가의 우수 인재들이 참가합니다',
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: '이력서 & 포트폴리오',
      description: '이력서와 자소서, 개별 포트폴리오까지 한눈에 확인 가능합니다',
      icon: ({ className }: { className?: string }) => (
        <BriefcaseIcon className={className} />
      ),
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
      company: '테크벤처 잡 매칭',
      content: '우수한 인재들의 실무 능력을 포트폴리오로 미리 확인할 수 있어 채용 효율성이 크게 향상되었습니다.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen pt-20 -mt-16">

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-40 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.png"
            alt="테크벤처 잡 매칭 Job Platform Background"
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
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-medium text-xs sm:text-sm mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              서울시 공식 인증 구인구직 플랫폼
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="text-gray-900">우수한 인재와</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                서울시 기업
              </span>
              <span className="text-gray-900">을 연결합니다</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-gray-800">포트폴리오 기반 매칭으로 최고의 인재와 <br />
                 우수한 기업이 만나는 플랫폼</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
              {isAuthenticated && userRole === 'employer' ? (
                // 기업 사용자용 CTA
                <>
                  <Link href="/employer-dashboard" className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline-block" />
                    기업 대시보드로 이동
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/portfolios" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    인재 검색하기
                    <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/employer-setup" className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 hover:shadow-lg w-full sm:w-auto text-sm sm:text-base">
                    기업 정보 수정
                  </Link>
                </>
              ) : isAuthenticated && userRole === 'jobseeker' ? (
                // 구직자용 CTA
                <>
                  <Link href={`/portfolios/${user?.uid}`} className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    내 포트폴리오 보기
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/profile" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    마이페이지
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:scale-110 transition-transform" />
                  </Link>
                </>
              ) : (
                // 비로그인 사용자용 CTA
                <>
                  <Link href="/auth" className="group bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    구직자로 시작하기
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/portfolios" className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto text-sm sm:text-base">
                    포트폴리오 둘러보기
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 inline-block group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <Link href="/auth" className="group border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 hover:shadow-lg w-full sm:w-auto text-sm sm:text-base">
                    기업 회원가입
                  </Link>
                </>
                          )}
          </div>

          {/* 구직자 프로필 완성도 섹션 */}
          {isAuthenticated && userRole === 'jobseeker' && profileCompletion && (
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                    프로필 완성도
                  </h2>
                  <span className="text-xl sm:text-2xl font-bold text-indigo-600">{profileCompletion.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${profileCompletion.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm sm:text-base text-gray-600">프로필을 완성하여 더 많은 기회를 얻으세요!</p>
                    {profileCompletion.missingItems.length > 0 && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        미완성 항목: {profileCompletion.missingItems.slice(0, 3).join(', ')}
                        {profileCompletion.missingItems.length > 3 && ` 외 ${profileCompletion.missingItems.length - 3}개`}
                      </p>
                    )}
                  </div>
                                     <Link 
                     href="/profile" 
                     className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                     </svg>
                     <span>포트폴리오 완성하기</span>
                   </Link>
                </div>
              </div>
            </div>
          )}

          {/* Video Preview */}
          {/* 
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
            */}
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
            <div className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-blue-800 font-semibold text-xs sm:text-sm mb-6 sm:mb-8 shadow-sm">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 sm:mr-3 animate-pulse"></span>
              검증된 매칭 시스템
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-8 sm:mb-10 leading-tight">
              <span className="text-gray-900">성공적인 매칭을 위한</span><br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                스마트 프로세스
              </span>
            </h2>
            {/* 
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              AI 기반 매칭 알고리즘과 전문적인 검증 시스템으로<br />
              <span className="text-blue-600 font-semibold">평균 85% 매칭 성공률</span>을 달성하는 혁신적인 프로세스
            </p>
            */}
            
            {/* Success Metrics */}
            {/*
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
            */}
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex justify-center mb-24">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/40">
              <button
                onClick={() => setActiveTab('employer')}
                className={`relative px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-500 group ${
                  activeTab === 'employer'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_12px_32px_rgba(99,102,241,0.4)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                {activeTab === 'employer' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                )}
                <div className="relative flex items-center space-x-2 sm:space-x-3">
                  <BuildingOfficeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>기업 여정</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`relative px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-500 group ${
                  activeTab === 'jobseeker'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_12px_32px_rgba(59,130,246,0.4)] scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                {activeTab === 'jobseeker' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                )}
                <div className="relative flex items-center space-x-2 sm:space-x-3">
                  <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>구직자 여정</span>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Process Flow */}
          <div className="relative">
            {/* Progressive Connection Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl">
              <div className="relative h-1 bg-gray-200 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 to-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 via-purple-400 to-emerald-400 rounded-full animate-pulse opacity-60"></div>
              </div>
              {/* Progress Dots */}
              <div className="absolute -top-2 left-0 w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute -top-2 left-1/3 transform -translate-x-1/2 w-5 h-5 bg-indigo-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute -top-2 left-2/3 transform -translate-x-1/2 w-5 h-5 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute -top-2 right-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            
            {/* Process Duration Indicator */}
            {/*
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full text-green-800 font-semibold text-sm shadow-sm">
                <ClockIcon className="w-4 h-4 mr-2" />
                전체 프로세스: {activeTab === 'employer' ? '평균 5-7일' : '평균 7-10일'}
              </div>
            </div>
            */}
            
            <div className="grid lg:grid-cols-4 gap-16 relative">
              {activeTab === 'employer' ? (
                <>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          01
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(99,102,241,0.3)] group-hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                        자기소개 영상 확인
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        참가자들의 1분 자기소개 영상을 확인하고<br />
                        귀사에 맞는 인재들을 선별하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-indigo-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>전체 영상 한번에 확인</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-indigo-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>인재 스크리닝 완료</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          02
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(147,51,234,0.3)] group-hover:shadow-[0_25px_50px_rgba(147,51,234,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <BriefcaseIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                        포트폴리오 확인
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        상단의 포트폴리오 버튼을 눌러서<br />
                        지원자의 상세 포트폴리오를 확인하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-purple-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>실무 프로젝트 확인</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-purple-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>스킬셋 검증</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          03
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                        채용 신청서 작성
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        선별된 인재에게 채용 신청서를<br />
                        작성하여 전송하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-emerald-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>간편한 신청서 양식</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-emerald-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>마감: 6월 19일</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          04
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <UserGroupIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        인턴 매칭
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        6월 20일에 기업별로<br />
                        면접 안내를 드립니다
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-blue-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>면접 일정 자동 배정</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-blue-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>최종 매칭 완료</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          01
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(59,130,246,0.3)] group-hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <BriefcaseIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                        포트폴리오 & 영상 제작
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                        전문적인 포트폴리오와<br />
                        1분 자기소개 영상을 제작하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-blue-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>포트폴리오 템플릿 제공</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-blue-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>영상 가이드라인 제공</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          02
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(99,102,241,0.3)] group-hover:shadow-[0_25px_50px_rgba(99,102,241,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <UserIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                        플랫폼 등록
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        플랫폼에 프로필을 등록하고<br />
                        포트폴리오를 업로드하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-indigo-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>프로필 검증 완료</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-indigo-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>포트폴리오 공개</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          03
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(147,51,234,0.3)] group-hover:shadow-[0_25px_50px_rgba(147,51,234,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <ClockIcon className="w-12 h-12 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                        기업 매칭 대기
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        기업들이 포트폴리오를 확인하고<br />
                        채용 신청을 할 때까지 대기하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-purple-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>실시간 관심 기업 알림</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-purple-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>매칭 현황 확인</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-6 group-hover:rotate-3 transition-transform duration-500"></div>
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/40 rounded-3xl p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] group-hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-4">
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          04
                        </div>
                      </div>
                      
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.3)] group-hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                        면접 & 최종 선발
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        6월 20일 면접 안내를 받고<br />
                        최종 선발 과정을 진행하세요
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-center text-xs text-emerald-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>면접 일정 안내</span>
                        </div>
                        <div className="flex items-center justify-center text-xs text-emerald-600">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          <span>인턴십 기회 확정</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Bottom CTA Section */}
            <div className="mt-24 text-center">
              {!isAuthenticated ? (
                <Link href="/auth" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-[0_12px_32px_rgba(99,102,241,0.3)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-105">
                  <span className="mr-3">
                    {activeTab === 'employer' ? '기업 회원가입' : '무료로 시작하기'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  href={
                    userRole === 'employer' 
                      ? '/employer-dashboard' 
                      : userRole === 'jobseeker' 
                      ? '/profile' 
                      : '/profile'
                  } 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-lg shadow-[0_12px_32px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-3">
                    {userRole === 'employer' 
                      ? '대시보드로 이동' 
                      : userRole === 'jobseeker' 
                      ? '포트폴리오 작성하기' 
                      : '마이페이지로 이동'
                    }
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              )}
              <p className="text-gray-500 text-sm mt-4">
                {!isAuthenticated ? (
                  activeTab === 'employer' 
                    ? '테크벤처 잡 매칭' 
                    : '지금 가입하면 포트폴리오 템플릿 무료 제공'
                ) : (
                  userRole === 'employer' 
                    ? '우수한 인재들을 발굴하고 채용하세요' 
                    : userRole === 'jobseeker' 
                    ? '나만의 포트폴리오를 만들어 취업 기회를 늘려보세요' 
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
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-700 font-medium text-xs sm:text-sm mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              차별화된 서비스
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-6 sm:mb-8 text-gray-900 leading-tight">
              왜 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">테크벤처 잡 매칭</span>을<br />
              선택하나요?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              기존 구인구직 사이트와는 차원이 다른 혁신적인 서비스로<br />
              <span className="text-blue-600 font-semibold">성공적인 매칭</span>을 보장합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-24">
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
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                    {feature.description}
                  </p>
                  
                  {/* Additional Feature Highlights */}
                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium text-sm">
                      {index === 0 && "1분 완성형 영상"}
                      {index === 1 && "글로벌 인재풀"}
                      {index === 2 && "통합 문서 관리"}
                    </span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 참가자 역량 섹션 */}
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white mb-16 sm:mb-20 md:mb-24">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">참가자 역량</h3>
            <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
              <div className="text-left">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">해외 판로개척 위한 자국 시장조사</h4>
                <div className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed">
                  <p className="mb-3 sm:mb-4">+ 생성형 AI활용 시장조사 보고서 작성</p>
                  <p>글로벌 시장 진출을 위한 전문적인 시장 분석과 AI 기반 인사이트를 제공합니다.</p>
                </div>
                <Link 
                  href="/portfolios" 
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base"
                >
                  <BriefcaseIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Explore Portfolio
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h5 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">자기소개 영상</h5>
                  <p className="text-xs sm:text-sm opacity-90">교육생 1분 자기소개 영상</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h5 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">다국적 인재</h5>
                  <p className="text-xs sm:text-sm opacity-90">귀사에서 필요로 하는 다양한 국가의 인재 참가</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
                  <BriefcaseIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-white" />
                  <h5 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">이력서 자소서</h5>
                  <p className="text-xs sm:text-sm opacity-90">이력서와 자소서, 개별 포트폴리오까지 한눈에 확인</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI 도구 활용 능력 섹션 */}
          <div className="mt-24 mb-16">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-full text-purple-700 font-medium text-xs sm:text-sm mb-4 sm:mb-6">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                전문 도구 활용 능력
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">
                우리 인재들이 활용하는 <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">최신 AI 도구</span>
              </h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                최신 AI 기술과 디자인 도구를 자유자재로 활용하여<br />
                프로페셔널한 결과물을 만들어내는 인재들입니다
              </p>
            </div>

            {/* 도구 카테고리 탭 */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="bg-white rounded-2xl p-1 shadow-xl border border-gray-100 w-full max-w-4xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                  <div className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-xl font-semibold text-center text-xs sm:text-sm md:text-base">
                    텍스트 기반 콘텐츠
                  </div>
                  <div className="px-3 sm:px-6 py-2 sm:py-3 bg-teal-500 text-white rounded-xl font-semibold text-center text-xs sm:text-sm md:text-base">
                    이미지 기반 콘텐츠
                  </div>
                  <div className="px-3 sm:px-6 py-2 sm:py-3 bg-indigo-500 text-white rounded-xl font-semibold text-center text-xs sm:text-sm md:text-base">
                    프레젠테이션 콘텐츠
                  </div>
                </div>
              </div>
            </div>

            {/* 도구 그리드 */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              
              {/* 텍스트 기반 콘텐츠 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.888 4.36a5.99 5.99 0 0 0-2.681 6.258 6.046 6.046 0 0 0 2.9 6.51A6.065 6.065 0 0 0 7.456 21a5.99 5.99 0 0 0 6.258-2.681 6.046 6.046 0 0 0 6.51-2.9 5.985 5.985 0 0 0 2.058-5.598z"/>
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-200">
                    <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <h4 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-gray-800">ChatGPT</h4>
                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                        블로그 글, 기사, 소셜 미디어 포스트
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                        이메일 뉴스레터, 광고 문구
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                        다양한 텍스트 콘텐츠 작성
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">딥시크</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        데이터 기반 리포트, 분석 자료
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        자동 요약, 전문 문서
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        정밀성 콘텐츠 제작
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 이미지 기반 콘텐츠 */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 border border-teal-200">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">달리 (DALL-E)</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        SNS 포스트, 광고 배너, 일러스트
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        포스터, 제품 디자인 목업
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        창의적인 이미지 제작
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">캔바 (Canva)</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        인포그래픽, 프레젠테이션 슬라이드
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        SNS 이미지, 브로셔, 초대장
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                        디자인 작업 전반
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 프레젠테이션 콘텐츠 */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-8 border border-indigo-200">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="text-white font-bold text-xl">γ</div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">감마</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        비즈니스 프레젠테이션, 제품 소개
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        투자 제안서, 교육 자료
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        슬라이드 콘텐츠 제작
                      </li>
                    </ul>
                  </div>
                  
                  {/* 추가 도구들을 위한 공간 */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                    <h4 className="font-bold text-lg mb-3 text-gray-800">기타 전문 도구</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        Figma, Adobe Creative Suite
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        Notion, Miro, Slack 협업 도구
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3"></div>
                        Google Workspace, Microsoft 365
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 CTA */}
            <div className="text-center mt-12 sm:mt-16">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">이런 전문 도구들을 자유자재로 활용하는 인재들</h4>
                <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90">최신 기술과 트렌드를 빠르게 습득하고 적용하는 능력을 갖춘 우수 인재들입니다</p>
                <Link 
                  href="/portfolios" 
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base"
                >
                  <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  인재 포트폴리오 확인하기
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900">사용자 후기</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
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
                <p className="text-gray-700 mb-6 sm:mb-8 italic text-sm sm:text-base md:text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg mr-3 sm:mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm sm:text-base">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8">
                지금 바로 시작하세요
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-12 leading-relaxed">
                무료 회원가입으로 더 나은 커리어의 첫걸음을 내디뎌보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-sm sm:text-base">
                  구직자로 시작하기
                </Link>
                <Link href="/auth" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 sm:py-4 md:py-5 px-6 sm:px-8 md:px-10 rounded-xl transition-all duration-200 hover:shadow-xl text-sm sm:text-base">
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
                  : '테크벤처 잡 매칭의 다양한 기능을 통해 목표를 달성하세요'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {userRole === 'jobseeker' ? (
                  <>
                    <Link href="/profile" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      포트폴리오 작성하기
                    </Link>
                    {/* <Link href="/jobs" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-xl transition-all duration-200 hover:shadow-xl">
                      채용공고 보기
                    </Link> */}
                  </>
                ) : userRole === 'employer' ? (
                  <>
                    <Link href="/employer-dashboard" className="bg-white text-blue-600 hover:bg-gray-50 font-bold py-5 px-10 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      대시보드로 이동
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
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                  <img 
                    src="/images/logo.png" 
                    alt="테크벤처 잡 매칭 Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-1xl font-bold">(사)기술벤처스타트업협회</span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                서울시 중소기업과 모든 직군의 전문 인재를 연결하는 프리미엄 구인구직 플랫폼
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">서비스</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/portfolios" className="hover:text-white transition-colors text-lg">포트폴리오</Link></li>
                {/* <li><Link href="/jobs" className="hover:text-white transition-colors text-lg">채용공고</Link></li> */}
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
                <p>이메일: tvs@techventure.co.kr</p>
                <p>전화: 010-2734-8624</p>
                <p>담당: 조지형 사무국장</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-10 text-center text-gray-400 text-lg">
            <p>&copy; 2025 (사)기술벤처스타트업협회 All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 튜토리얼 오버레이 */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
}
