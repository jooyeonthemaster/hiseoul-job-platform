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
import JobInquiryDetailModal from '@/components/JobInquiryDetailModal';
import { calculateProfileCompletion as calculateProfileCompletionUtil } from '@/lib/profileCompletion';
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
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
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
  
  // Modal states
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

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
      
      // 프로필 데이터를 직접 로드하여 완성도 계산
      const profileData = await getJobSeekerProfile(user.uid);
      const portfolio = await getPortfolio(user.uid);
      
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

  // 채용 제안 상태 업데이트 함수
  const handleInquiryStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const inquiryRef = doc(db, 'jobInquiries', inquiryId);
      await updateDoc(inquiryRef, {
        status: newStatus,
        respondedAt: new Date()
      });

      // 로컬 상태 업데이트
      setJobInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, status: newStatus, respondedAt: new Date() }
            : inquiry
        )
      );

      // 수락/거절일 때만 모달 닫기
      if (newStatus === 'accepted' || newStatus === 'rejected') {
        setShowInquiryModal(false);
        setSelectedInquiry(null);
        alert(newStatus === 'accepted' ? '채용 제안을 수락했습니다!' : '채용 제안을 거절했습니다.');
      }
      // 'read' 상태는 조용히 처리 (alert 없음)
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 모달 열기 함수
  const openInquiryModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
    
    // 읽음 상태로 업데이트 (sent 상태인 경우에만)
    if (inquiry.status === 'sent') {
      handleInquiryStatusUpdate(inquiry.id, 'read');
    }
  };

  // 모달 닫기 함수
  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setSelectedInquiry(null);
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
                테크벤처 잡 매칭
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
              onDetailClick={openInquiryModal}
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
      {/* Job Inquiry Detail Modal */}
      {showInquiryModal && selectedInquiry && (
        <JobInquiryDetailModal
          isOpen={showInquiryModal}
          inquiry={selectedInquiry}
          onStatusUpdate={handleInquiryStatusUpdate}
          onClose={closeInquiryModal}
        />
      )}
    </div>
  );
}