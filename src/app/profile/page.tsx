'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  WelcomeHeader,
  ProfileCompletionCard,
  FavoriteCompaniesCard,
  JobInquiriesCard,
  PortfolioStatusCard,
  RecommendedCompaniesCard
} from '@/components/dashboard';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  updateUserProfile,
  logOut,
  registerPortfolio,
  getPortfolio,
  getFavoriteCompanies,
  getAllEmployers,
  getEmployerById
} from '@/lib/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const router = useRouter();  
  // State management
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [portfolioRegistered, setPortfolioRegistered] = useState(false);
  const [registeringPortfolio, setRegisteringPortfolio] = useState(false);
  const [jobInquiries, setJobInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
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
      loadJobInquiries();
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
        currentCourse: profileData?.profile?.currentCourse || ''
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
      const portfolio = await getPortfolio(user.uid);
      setPortfolioRegistered(!!portfolio);
    } catch (error) {
      console.error('Error checking portfolio:', error);
    }
  };
  const loadJobInquiries = async () => {
    if (!user || !userData) return;

    try {
      setLoadingInquiries(true);
      // 임시로 orderBy 제거하여 인덱스 에러 방지
      const inquiriesQuery = query(
        collection(db, 'jobInquiries'),
        where('jobSeekerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(inquiriesQuery);
      const inquiries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate() // Firestore timestamp를 Date로 변환
      }))
      // 클라이언트 사이드에서 정렬
      .sort((a, b) => {
        if (!a.sentAt || !b.sentAt) return 0;
        return b.sentAt.getTime() - a.sentAt.getTime();
      });
      
      setJobInquiries(inquiries);
    } catch (error) {
      console.error('Error loading job inquiries:', error);
    } finally {
      setLoadingInquiries(false);
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
      
      // Calculate profile completion using passed profileFormData or current formData
      const completion = calculateProfileCompletion(profileFormData || formData);
      
      // Load recommended companies
      const allCompanies = await getAllEmployers();
      const recommended = getRecommendedCompanies(allCompanies);
      setRecommendedCompanies(recommended.slice(0, 3));
      
      // Update dashboard stats
      setDashboardStats({
        profileCompletion: completion,
        totalFavorites: favoriteIds.length,
        totalInquiries: jobInquiries.length,
        portfolioViews: Math.floor(Math.random() * 50) + 10 // Mock data
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };
  const calculateProfileCompletion = (dataToCheck?: any) => {
    // 매개변수로 받은 데이터를 우선 사용, 없으면 현재 formData 사용
    const currentData = dataToCheck || formData;
    console.log('calculateProfileCompletion - using data:', currentData);
    
    if (!currentData) {
      console.log('No data found, returning 0');
      return 0;
    }
    
    const fields = ['name', 'phone', 'address', 'speciality', 'skills', 'languages'];
    const completedFields = fields.filter(field => {
      const hasValue = currentData[field] && currentData[field].trim() !== '';
      console.log(`Field ${field}: ${currentData[field]} -> ${hasValue ? 'completed' : 'missing'}`);
      return hasValue;
    });
    
    const percentage = Math.round((completedFields.length / fields.length) * 100);
    console.log(`Profile completion: ${completedFields.length}/${fields.length} = ${percentage}%`);
    
    return percentage;
  };

  const getRecommendedCompanies = (companies: any[]) => {
    if (!formData.skills) return companies.slice(0, 3);
    
    const userSkills = formData.skills.toLowerCase().split(',').map((s: string) => s.trim());
    
    return companies
      .filter(company => company.company?.name)
      .sort((a, b) => {
        const aSkillMatch = userSkills.some((skill: string) => 
          a.company?.description?.toLowerCase().includes(skill) ||
          a.company?.requirements?.toLowerCase().includes(skill)
        );
        const bSkillMatch = userSkills.some((skill: string) => 
          b.company?.description?.toLowerCase().includes(skill) ||
          b.company?.requirements?.toLowerCase().includes(skill)
        );
        
        return bSkillMatch ? 1 : aSkillMatch ? -1 : 0;
      });
  };
  const handleSaveProfile = async (data: any) => {
    if (!user || !userData) return;

    try {
      setLoading(true);

      // Update user profile
      await updateUserProfile(user.uid, { name: data.name });

      // Update jobseeker profile
      await updateJobSeekerProfile(user.uid, {
        phone: data.phone || '',
        address: data.address || '',
        speciality: data.speciality || '',
        profileImage: data.profileImage || '',
        currentCourse: data.currentCourse || '',
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
        profileImage: formData.profileImage
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

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  // Get missing fields for profile completion
  const getMissingFields = () => {
    const fields = {
      name: '이름',
      phone: '전화번호',
      address: '주소',
      speciality: '전문분야',
      skills: '보유 스킬',
      languages: '언어'
    };
    
    return Object.entries(fields)
      .filter(([key]) => !formData[key] || formData[key].trim() === '')
      .map(([_, label]) => label);
  };

  if (authLoading || loading || loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-indigo-600"
              >
                HiSeoul
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userData.name}님 
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Completion Card */}
            <ProfileCompletionCard 
              completionPercentage={dashboardStats.profileCompletion}
              onEditClick={() => router.push('/profile/edit')}
              missingFields={getMissingFields()}
            />

            {/* Current Course Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">수행 중인 과정</h3>
                <div className="text-2xl">📚</div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 참여 중인 교육과정이나 프로그램
                  </label>
                  <input
                    type="text"
                    value={formData.currentCourse || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, currentCourse: e.target.value }))}
                    placeholder="예: 영상콘텐츠 마케터 양성과정 3기, 외국인 유학생 AI 마케터 인턴과정"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleSaveProfile(formData)}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? '저장 중...' : '과정 정보 저장'}
                </button>
                {formData.currentCourse && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">현재 과정:</span> {formData.currentCourse}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Favorite Companies Card */}
            <FavoriteCompaniesCard 
              companies={favoriteCompanies}
              loading={loadingDashboard}
            />

            {/* Job Inquiries Card */}
            <JobInquiriesCard 
              inquiries={jobInquiries}
              loading={loadingInquiries}
              onRefresh={loadJobInquiries}
              onDetailClick={(inquiry) => {
                alert('상세보기 기능은 추후 구현 예정입니다.');
              }}
            />
          </div>
          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Portfolio Status Card */}
            <PortfolioStatusCard 
              isRegistered={portfolioRegistered}
              views={dashboardStats.portfolioViews}
              userId={user?.uid}
              onRegisterClick={handlePortfolioRegister}
            />

            {/* Recommended Companies Card */}
            <RecommendedCompaniesCard 
              companies={recommendedCompanies}
              loading={loadingDashboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
}