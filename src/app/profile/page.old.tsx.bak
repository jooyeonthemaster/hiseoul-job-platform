'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  TrophyIcon,
  ArrowRightIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import {
  getJobSeekerProfile,
  getEmployerInfo,
  updateJobSeekerProfile,
  updateEmployerInfo,
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
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [portfolioRegistered, setPortfolioRegistered] = useState(false);
  const [registeringPortfolio, setRegisteringPortfolio] = useState(false);
  const [jobInquiries, setJobInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  
  // 새로운 대시보드 관련 상태들
  const [favoriteCompanies, setFavoriteCompanies] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    profileCompletion: 0,
    totalFavorites: 0,
    totalInquiries: 0,
    portfolioViews: 0
  });
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [recommendedCompanies, setRecommendedCompanies] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user && userData) {
      loadProfile();
      checkPortfolioRegistration();
      if (userData.role === 'jobseeker') {
        loadJobInquiries();
        loadDashboardData();
      }
    }
  }, [user, userData, authLoading]);

  const loadProfile = async () => {
    if (!user || !userData) return;

    try {
      setLoading(true);
      if (userData.role === 'jobseeker') {
        const profileData = await getJobSeekerProfile(user.uid);
        setProfile(profileData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: profileData?.profile?.phone || '',
          address: profileData?.profile?.address || '',
          skills: profileData?.profile?.skills?.join(', ') || '',
          languages: profileData?.profile?.languages?.join(', ') || '',
          speciality: profileData?.profile?.speciality || ''
        });
      } else if (userData.role === 'employer') {
        const companyData = await getEmployerInfo(user.uid);
        setProfile(companyData);
        setFormData({
          name: userData.name,
          email: userData.email,
          companyName: companyData?.company?.name || '',
          industry: companyData?.company?.industry || '',
          size: companyData?.company?.size || '',
          location: companyData?.company?.location || '',
          description: companyData?.company?.description || '',
          website: companyData?.company?.website || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPortfolioRegistration = async () => {
    if (!user || !userData || userData.role !== 'jobseeker') return;

    try {
      const portfolio = await getPortfolio(user.uid);
      setPortfolioRegistered(!!portfolio);
    } catch (error) {
      console.error('Error checking portfolio registration:', error);
    }
  };

  const loadJobInquiries = async () => {
    if (!user || !userData || userData.role !== 'jobseeker') return;

    try {
      setLoadingInquiries(true);
      const inquiriesQuery = query(
        collection(db, 'jobInquiries'),
        where('jobSeekerId', '==', user.uid),
        orderBy('sentAt', 'desc')
      );
      
      const querySnapshot = await getDocs(inquiriesQuery);
      const inquiries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setJobInquiries(inquiries);
    } catch (error) {
      console.error('Error loading job inquiries:', error);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const loadDashboardData = async () => {
    if (!user || !userData || userData.role !== 'jobseeker') return;

    try {
      setLoadingDashboard(true);
      
      // 관심 기업 정보 로딩
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
      
      // 프로필 완성도 계산
      const completion = calculateProfileCompletion();
      
      // 추천 기업들 로딩 (스킬 기반)
      const allCompanies = await getAllEmployers();
      const recommended = getRecommendedCompanies(allCompanies);
      setRecommendedCompanies(recommended.slice(0, 3));
      
      // 대시보드 통계 업데이트
      setDashboardStats({
        profileCompletion: completion,
        totalFavorites: favoriteIds.length,
        totalInquiries: jobInquiries.length,
        portfolioViews: Math.floor(Math.random() * 50) + 10 // 임시 데이터
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const calculateProfileCompletion = () => {
    if (!formData) return 0;
    
    const fields = ['name', 'phone', 'address', 'speciality', 'skills', 'languages'];
    const completedFields = fields.filter(field => formData[field] && formData[field].trim() !== '');
    
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const getRecommendedCompanies = (companies: any[]) => {
    if (!formData.skills) return companies.slice(0, 3);
    
    const userSkills = formData.skills.toLowerCase().split(',').map((s: string) => s.trim());
    
    return companies
      .filter(company => company.company?.name) // 회사명이 있는 기업만
      .sort((a, b) => {
        // 스킬 매칭 점수 계산 (간단한 버전)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!user || !userData) return;

    try {
      setLoading(true);

      // 기본 사용자 정보 업데이트
      await updateUserProfile(user.uid, {
        name: formData.name
      });

      if (userData.role === 'jobseeker') {
        await updateJobSeekerProfile(user.uid, {
          phone: formData.phone,
          address: formData.address,
          speciality: formData.speciality,
          skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
          languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
          experience: profile?.profile?.experience || [],
          education: profile?.profile?.education || []
        });
      } else if (userData.role === 'employer') {
        await updateEmployerInfo(user.uid, {
          name: formData.companyName,
          industry: formData.industry,
          size: formData.size,
          location: formData.location,
          description: formData.description,
          website: formData.website
        });
      }

      await refreshUserData();
      await loadProfile();
      
      // 포트폴리오가 등록되어 있다면 자동 업데이트
      if (portfolioRegistered && userData.role === 'jobseeker') {
        try {
          await registerPortfolio(user.uid, {
            name: formData.name,
            speciality: formData.speciality || '일반',
            phone: formData.phone,
            address: formData.address,
            skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
            languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
            experience: profile?.profile?.experience || [],
            education: profile?.profile?.education || [],
            description: `${formData.speciality ? formData.speciality + ' 전문가' : ''}${formData.skills ? '. 보유 스킬: ' + formData.skills : ''}`
          });
        } catch (error) {
          console.error('Error updating portfolio:', error);
        }
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioRegister = async () => {
    if (!user || !userData || userData.role !== 'jobseeker') return;

    try {
      setRegisteringPortfolio(true);

      // 먼저 프로필 저장
      await handleSave();

      // 포트폴리오 등록
      await registerPortfolio(user.uid, {
        name: formData.name,
        speciality: formData.speciality || '일반',
        phone: formData.phone,
        address: formData.address,
        skills: formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: profile?.profile?.experience || [],
        education: profile?.profile?.education || [],
        description: `${formData.speciality ? formData.speciality + ' 전문가' : ''}${formData.skills ? '. 보유 스킬: ' + formData.skills : ''}`
      });

      setPortfolioRegistered(true);
      alert('포트폴리오가 성공적으로 등록되었습니다!');
      
      // 포트폴리오 페이지로 이동
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  if (userData?.role === 'employer') {
    // 기업 사용자의 경우 기존 프로필 페이지로 리다이렉트
    router.push('/employer-dashboard');
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  안녕하세요, {userData.name}님! 👋
                </h1>
                <p className="text-indigo-100 text-lg">
                  오늘도 새로운 기회를 찾아보세요
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardStats.totalFavorites}</div>
                  <div className="text-sm text-indigo-200">관심 기업</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardStats.totalInquiries}</div>
                  <div className="text-sm text-indigo-200">채용 제안</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dashboardStats.profileCompletion}%</div>
                  <div className="text-sm text-indigo-200">프로필 완성도</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Completion Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  프로필 완성도
                </h2>
                <span className="text-2xl font-bold text-indigo-600">{dashboardStats.profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardStats.profileCompletion}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {dashboardStats.profileCompletion < 100 ? '프로필을 완성하여 더 많은 기회를 얻으세요!' : '프로필이 완성되었습니다! 🎉'}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>편집</span>
                </button>
              </div>
            </motion.div>

          {/* Profile Content */}
          <div className="p-6">
            {userData.role === 'jobseeker' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이름
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.phone || '미입력'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주소
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.address || '미입력'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전문분야
                  </label>
                  {editing ? (
                    <select
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="SNS마케팅">SNS마케팅</option>
                      <option value="키워드광고">키워드광고</option>
                      <option value="브랜드마케팅">브랜드마케팅</option>
                      <option value="퍼포먼스마케팅">퍼포먼스마케팅</option>
                      <option value="콘텐츠마케팅">콘텐츠마케팅</option>
                      <option value="마케팅기획">마케팅기획</option>
                      <option value="이커머스마케팅">이커머스마케팅</option>
                      <option value="데이터마케팅">데이터마케팅</option>
                      <option value="웹개발">웹개발</option>
                      <option value="앱개발">앱개발</option>
                      <option value="디자인">디자인</option>
                      <option value="기타">기타</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{formData.speciality || '미입력'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보유 스킬 (쉼표로 구분)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="예: JavaScript, React, Node.js"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.skills || '미입력'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용 가능 언어 (쉼표로 구분)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleInputChange}
                      placeholder="예: 한국어, 영어, 일본어"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.languages || '미입력'}</p>
                  )}
                </div>

                {/* 포트폴리오 등록 섹션 */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        포트폴리오 등록
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {portfolioRegistered 
                          ? '포트폴리오가 등록되어 있습니다. 프로필을 수정하면 포트폴리오도 자동 업데이트됩니다.'
                          : '프로필 정보를 포트폴리오 사이트에 등록하여 기업들에게 나를 어필해보세요!'
                        }
                      </p>
                    </div>
                    {!editing && (
                      <div className="flex space-x-3">
                        {portfolioRegistered ? (
                          <button
                            onClick={() => router.push('/portfolios')}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            포트폴리오 보기
                          </button>
                        ) : (
                          <button
                            onClick={handlePortfolioRegister}
                            disabled={registeringPortfolio}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {registeringPortfolio ? '등록 중...' : '포트폴리오 등록하기'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 채용 제안 섹션 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <EnvelopeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      받은 채용 제안 ({jobInquiries.length})
                    </h3>
                    <button
                      onClick={loadJobInquiries}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      새로고침
                    </button>
                  </div>

                  {loadingInquiries ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : jobInquiries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>아직 받은 채용 제안이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobInquiries.map((inquiry) => (
                        <motion.div
                          key={inquiry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {inquiry.companyInfo.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {inquiry.companyInfo.industry} • {inquiry.companyInfo.location}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              inquiry.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              inquiry.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                              inquiry.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {inquiry.status === 'sent' ? '새 제안' :
                               inquiry.status === 'read' ? '읽음' :
                               inquiry.status === 'accepted' ? '수락함' : inquiry.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <BriefcaseIcon className="w-4 h-4 mr-1" />
                              {inquiry.proposedPosition}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                              {inquiry.proposedSalary}
                            </div>
                            <div className="flex items-center text-gray-600 col-span-2">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '날짜 정보 없음'}
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {inquiry.message}
                          </p>

                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => {
                                // 채용 제안 상세 모달 열기 또는 페이지 이동
                                alert('상세보기 기능은 추후 구현 예정입니다.');
                              }}
                              className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              상세보기
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 기업 프로필
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당자 이름
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{userData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      회사명
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.companyName || '미입력'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      업종
                    </label>
                    {editing ? (
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">선택하세요</option>
                        <option value="IT/소프트웨어">IT/소프트웨어</option>
                        <option value="마케팅/광고">마케팅/광고</option>
                        <option value="제조업">제조업</option>
                        <option value="서비스업">서비스업</option>
                        <option value="금융업">금융업</option>
                        <option value="기타">기타</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{formData.industry || '미입력'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      회사 규모
                    </label>
                    {editing ? (
                      <select
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">선택하세요</option>
                        <option value="1-10명">1-10명</option>
                        <option value="11-50명">11-50명</option>
                        <option value="51-100명">51-100명</option>
                        <option value="101-500명">101-500명</option>
                        <option value="500명 이상">500명 이상</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{formData.size || '미입력'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      위치
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.location || '미입력'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      웹사이트
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formData.website || '미입력'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사 소개
                  </label>
                  {editing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.description || '미입력'}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 