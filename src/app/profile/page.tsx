'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  WelcomeHeader,
  ProfileCompletionCard,
  FavoriteCompaniesCard,
  PortfolioStatusCard,
  RecommendedCompaniesCard
} from '@/components/dashboard';
import { calculateProfileCompletion as calculateProfileCompletionUtil } from '@/lib/profileCompletion';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  updateUserProfile,
  registerPortfolio,
  getPortfolio,
  getFavoriteCompanies,
  getAllEmployers,
  getEmployerById
} from '@/lib/auth';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassDropdown } from '@/components/ui/GlassDropdown';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { PORTFOLIO_PROGRAMS, getProgramByCourseName } from '@/lib/programs';

export default function ProfilePage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();  
  // State management
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [portfolioRegistered, setPortfolioRegistered] = useState(false);
  const [registeringPortfolio, setRegisteringPortfolio] = useState(false);
  const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    profileCompletion: 0,
    totalFavorites: 0,
    totalInquiries: 0,
    portfolioViews: 0
  });
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [recommendedCompanies, setRecommendedCompanies] = useState<any[]>([]);

  // Redirect if not authenticated or not jobseeker
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user && userData && userData.role === 'employer') {
      router.push('/employer-dashboard');
      return;
    }

    if (user && userData && userData.role === 'jobseeker') {
      loadProfileAndDashboard();
      checkPortfolioRegistration();
    }
  }, [user, userData, authLoading]);

  const loadProfileAndDashboard = async () => {
    // 먼저 프로필을 로드하여 formData를 설정
    const profileFormData = await loadProfile();
    // 그 다음에 대시보드 데이터를 로드하여 정확한 프로필 완성도를 계산
    await loadDashboardData(profileFormData);
  };

  const loadProfile = async () => {
    if (!user || !userData) return null;

    try {
      setLoading(true);
      const profileData = await getJobSeekerProfile(user.uid);
      console.log('loadProfile - profileData:', profileData);
      
      setProfile(profileData);
      const newFormData = {
        name: userData.name,
        email: userData.email,
        phone: profileData?.profile?.phone || '',
        address: profileData?.profile?.address || '',
        skills: profileData?.profile?.skills?.join(', ') || '',
        languages: profileData?.profile?.languages?.join(', ') || '',
        speciality: profileData?.profile?.speciality || '',
        profileImage: profileData?.profile?.profileImage || '',
        currentCourse: profileData?.profile?.currentCourse || '',
        courseType: profileData?.profile?.courseType || ''
      };
      
      console.log('loadProfile - setting formData:', newFormData);
      setFormData(newFormData);
      return newFormData; // 새로 설정한 formData를 반환
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPortfolioRegistration = async () => {
    if (!user || !userData) return;

    try {
      const portfolio = await getPortfolio(user.uid, true);
      setPortfolioRegistered(!!portfolio);
    } catch (error) {
      console.error('Error checking portfolio:', error);
    }
  };
  const loadDashboardData = async (profileFormData?: any) => {
    if (!user || !userData) return;

    try {
      setLoadingDashboard(true);
      
      // Load favorite companies
      const favoriteIds = await getFavoriteCompanies(user.uid);
      const favoriteCompaniesData = [];      
      for (const companyId of favoriteIds) {
        const companyData = await getEmployerById(companyId);
        if (companyData) {
          favoriteCompaniesData.push({
            companyId: companyId,
            ...companyData
          });
        }
      }
      setFavoriteCompanies(favoriteCompaniesData);
      
      // 프로필 데이터를 직접 로드하여 완성도 계산
      const profileData = await getJobSeekerProfile(user.uid);
      const portfolio = await getPortfolio(user.uid, true);
      
      // 메인 페이지와 동일한 방식으로 데이터 변환
      const profileForCalculation = profileData?.profile ? {
        skills: Array.isArray(profileData.profile.skills) ? profileData.profile.skills : [],
        languages: Array.isArray(profileData.profile.languages) ? profileData.profile.languages : [],
        experience: Array.isArray(profileData.profile.experience) ? profileData.profile.experience : [],
        education: Array.isArray(profileData.profile.education) ? profileData.profile.education : [],
        speciality: profileData.profile.speciality,
        phone: profileData.profile.phone,
        address: profileData.profile.address,
        profileImage: profileData.profile.profileImage,
        selfIntroduction: profileData.profile.selfIntroduction
      } : null;
      
      const completion = profileForCalculation ? 
        calculateProfileCompletionUtil(profileForCalculation, !!portfolio).percentage : 0;
      
      console.log('👤 프로필 페이지: loadDashboardData에서 계산된 완성도:', completion);
      
      // 포트폴리오 상태도 업데이트
      setPortfolioRegistered(!!portfolio);
      
      // Load recommended companies
      const allCompanies = await getAllEmployers();
      const recommended = getRecommendedCompanies(allCompanies);
      setRecommendedCompanies(recommended.slice(0, 3));
      
      // Update dashboard stats
      // REQ2(관리자 중개형): 받은 채용 제안 수는 구직자에게 노출하지 않는다.
      setDashboardStats({
        profileCompletion: completion,
        totalFavorites: favoriteIds.length,
        totalInquiries: 0,
        portfolioViews: Math.floor(Math.random() * 50) + 10 // Mock data
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };
  const calculateProfileCompletion = (dataToCheck?: any) => {
    console.log('👤 프로필 페이지: calculateProfileCompletion 호출');
    console.log('👤 프로필 페이지: profile 상태:', profile);
    console.log('👤 프로필 페이지: portfolioRegistered:', portfolioRegistered);
    
    if (!profile?.profile) {
      console.log('👤 프로필 페이지: No profile data found, returning 0');
      return 0;
    }
    
    // 메인 페이지와 동일한 방식으로 데이터 변환 (Firebase 원본 데이터 사용)
    const profileData = {
      skills: Array.isArray(profile.profile.skills) ? profile.profile.skills : [],
      languages: Array.isArray(profile.profile.languages) ? profile.profile.languages : [],
      experience: Array.isArray(profile.profile.experience) ? profile.profile.experience : [],
      education: Array.isArray(profile.profile.education) ? profile.profile.education : [],
      speciality: profile.profile.speciality,
      phone: profile.profile.phone,
      address: profile.profile.address,
      profileImage: profile.profile.profileImage,
      selfIntroduction: profile.profile.selfIntroduction
    };
    
    console.log('👤 프로필 페이지: 변환된 profileData:', profileData);
    
    const result = calculateProfileCompletionUtil(profileData, portfolioRegistered);
    console.log(`👤 프로필 페이지: Profile completion: ${result.completedCount}/${result.totalItems} = ${result.percentage}%`);
    
    return result.percentage;
  };

  const getRecommendedCompanies = (companies: any[]) => {
    // 사용자의 스킬과 관련된 회사 추천 로직
    const userSkills = formData.skills?.toLowerCase().split(',').map((s: string) => s.trim()) || [];
    const userSpeciality = formData.speciality?.toLowerCase() || '';
    
    return companies
      .filter(company => {
        const companyIndustry = company.company?.industry?.toLowerCase() || '';
        const companyDescription = company.company?.description?.toLowerCase() || '';
        
        return userSkills.some((skill: string) => 
          companyIndustry.includes(skill) || companyDescription.includes(skill)
        ) || companyIndustry.includes(userSpeciality) || companyDescription.includes(userSpeciality);
      })
      .sort(() => Math.random() - 0.5); // 랜덤 정렬
  };

  const resolveCourseType = (courseName?: string, fallback?: 'domestic' | 'foreign' | '') => {
    return getProgramByCourseName(courseName)?.courseType || fallback || undefined;
  };

  const handleCourseSelect = (programId: string) => {
    const program = PORTFOLIO_PROGRAMS.find((item) => item.id === programId);
    setFormData((prev: any) => ({
      ...prev,
      currentCourse: program?.name || '',
      courseType: program?.courseType || '',
    }));
  };

  const handleSaveProfile = async (data: any) => {
    if (!user || !userData) return;

    try {
      setLoading(true);

      // Update user profile
      await updateUserProfile(user.uid, { name: data.name });

      // Update jobseeker profile
      // 주의: updateJobSeekerProfile 은 profile 객체 전체를 덮어쓴다.
      // 기존 profile 을 먼저 spread 해 자격증/수상/영상/자기소개/courseType 등
      // 이 화면에서 편집하지 않는 필드가 유실되지 않도록 병합-보존한다.
      await updateJobSeekerProfile(user.uid, {
        ...(profile?.profile || {}),
        phone: data.phone || '',
        address: data.address || '',
        speciality: data.speciality || '',
        profileImage: data.profileImage || '',
        currentCourse: data.currentCourse || '',
        courseType: resolveCourseType(data.currentCourse, data.courseType || profile?.profile?.courseType || ''),
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: data.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: profile?.profile?.experience || [],
        education: profile?.profile?.education || []
      });

      await refreshUserData();
      await loadProfile();
      await loadDashboardData();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  const handlePortfolioRegister = async () => {
    if (!user || !userData) return;

    try {
      setRegisteringPortfolio(true);

      await registerPortfolio(user.uid, {
        name: formData.name,
        speciality: formData.speciality || '일반',
        phone: formData.phone,
        address: formData.address,
        skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: profile?.profile?.experience || [],
        education: profile?.profile?.education || [],
        description: `${formData.speciality ? formData.speciality + ' 전문가' : ''}${formData.skills ? '. 보유 스킬: ' + formData.skills : ''}`,
        currentCourse: formData.currentCourse || '',
        courseType: resolveCourseType(formData.currentCourse, formData.courseType || ''),
        profileImage: formData.profileImage,
        certificates: profile?.profile?.certificates || [],
        awards: profile?.profile?.awards || [],
        introVideo: profile?.profile?.introVideo || '',
        introVideos: profile?.profile?.introVideos || [],
        selfIntroduction: profile?.profile?.selfIntroduction || undefined,
        mediaContent: profile?.profile?.mediaContent || [],
        externalLinks: profile?.profile?.externalLinks || [],
        portfolioPdfs: profile?.profile?.portfolioPdfs || [],
        additionalDocuments: profile?.profile?.additionalDocuments || []
      });

      setPortfolioRegistered(true);
      alert('포트폴리오가 성공적으로 등록되었습니다!');
      router.push('/portfolios');
    } catch (error) {
      console.error('Error registering portfolio:', error);
      alert('포트폴리오 등록 중 오류가 발생했습니다.');
    } finally {
      setRegisteringPortfolio(false);
    }
  };

  // Get missing fields for profile completion
  const getMissingFields = () => {
    if (!profile?.profile) {
      return [];
    }
    
    // 메인 페이지와 동일한 방식으로 데이터 변환 (Firebase 원본 데이터 사용)
    const profileData = {
      skills: Array.isArray(profile.profile.skills) ? profile.profile.skills : [],
      languages: Array.isArray(profile.profile.languages) ? profile.profile.languages : [],
      experience: Array.isArray(profile.profile.experience) ? profile.profile.experience : [],
      education: Array.isArray(profile.profile.education) ? profile.profile.education : [],
      speciality: profile.profile.speciality,
      phone: profile.profile.phone,
      address: profile.profile.address,
      profileImage: profile.profile.profileImage,
      selfIntroduction: profile.profile.selfIntroduction
    };
    
    const result = calculateProfileCompletionUtil(profileData, portfolioRegistered);
    return result.missingItems;
  };

  if (authLoading || loading || loadingDashboard) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-azure-aurora">
        <AuroraBackground />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-500"></div>
          <p className="text-sm text-ink-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-azure-aurora">
      <AuroraBackground />

      {/* Main Dashboard Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
        {/* Welcome Header */}
        <WelcomeHeader 
          userName={userData.name} 
          stats={dashboardStats} 
          profileImage={formData.profileImage}
          onProfileImageUpdate={async (imageUrl: string) => {
            console.log('🖼️ onProfileImageUpdate 호출됨, imageUrl:', imageUrl);
            console.log('🖼️ 현재 profile 상태:', profile);
            
            // 프로필 이미지 업데이트
            setFormData((prev: any) => ({ ...prev, profileImage: imageUrl }));
            
            // 데이터베이스에 저장
            try {
              const currentProfile = profile?.profile || {};
              console.log('🖼️ 저장할 프로필 데이터:', { ...currentProfile, profileImage: imageUrl });
              
              await updateJobSeekerProfile(user!.uid, {
                ...currentProfile,
                profileImage: imageUrl
              });
              
              console.log('🖼️ 프로필 이미지 저장 완료');
              await refreshUserData();
              await loadProfile(); // 프로필 다시 로드
            } catch (error) {
              console.error('프로필 이미지 저장 오류:', error);
              alert('프로필 이미지 저장 중 오류가 발생했습니다.');
            }
          }}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ProfileCompletionCard
              completionPercentage={dashboardStats.profileCompletion}
              onEditClick={() => router.push('/profile/edit')}
              missingFields={getMissingFields()}
            />
          </div>

          <div className="relative z-20 xl:col-span-5">
            <ScrollReveal className="h-full">
              <GlassCard className="h-full p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">Course</span>
                    <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-ink-900">수행 중인 과정</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-azure-600 shadow-glass-sm">
                    <AcademicCapIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* 과정 선택 — 전체 너비로 배치해 긴 과정명이 잘리지 않고 줄바꿈되도록 함 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-ink-700">
                      현재 참여 중인 교육과정이나 프로그램
                    </label>
                    <GlassDropdown
                      value={getProgramByCourseName(formData.currentCourse)?.id || ''}
                      onChange={(id) => handleCourseSelect(id)}
                      placeholder="수행 중인 과정을 선택하세요"
                      options={PORTFOLIO_PROGRAMS.map((program) => ({
                        value: program.id,
                        label: program.name,
                      }))}
                    />
                  </div>

                  {/* 과정 분류 + 저장 */}
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-end">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-ink-700">
                        과정 분류
                      </label>
                      <div className="flex min-h-[50px] items-center rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-sm font-semibold text-ink-700 shadow-glass-sm">
                        {getProgramByCourseName(formData.currentCourse)
                          ? `${getProgramByCourseName(formData.currentCourse)?.audience} · ${getProgramByCourseName(formData.currentCourse)?.hours}`
                          : '과정 선택 후 자동 분류'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-relaxed text-ink-400">
                        기업이 과정별로 포트폴리오를 탐색할 때 사용됩니다.
                      </p>
                      <GlassButton
                        onClick={() => handleSaveProfile(formData)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                        size="sm"
                      >
                        {loading ? '저장 중...' : '과정 정보 저장'}
                      </GlassButton>
                    </div>
                  </div>

                  {formData.currentCourse && (
                    <div className="glass rounded-2xl border border-mint-400/40 bg-mint-100/60 p-3">
                      <p className="text-sm text-mint-600">
                        <span className="font-semibold">현재 과정:</span> {formData.currentCourse}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>

          <div className="xl:col-span-4">
            <PortfolioStatusCard 
              isRegistered={portfolioRegistered}
              views={dashboardStats.portfolioViews}
              userId={user?.uid}
              onRegisterClick={handlePortfolioRegister}
            />
          </div>

          <div className="xl:col-span-4">
            <RecommendedCompaniesCard 
              companies={recommendedCompanies}
              loading={loadingDashboard}
            />
          </div>

          <div className="xl:col-span-4">
            <FavoriteCompaniesCard
              companies={favoriteCompanies}
              loading={loadingDashboard}
            />
          </div>
          {/*
            REQ2(완전 관리자 중개형): 받은 채용 제안(JobInquiriesCard) 및 상세 모달은
            구직자에게 노출하지 않는다. 관련 로딩/상태/핸들러도 제거함.
          */}
        </div>
      </div>
    </div>
  );
}
