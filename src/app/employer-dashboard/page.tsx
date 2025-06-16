'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, getEmployerInfo, getAllPortfolios, getEmployerWithApprovalStatus, deleteUserAccount, getFavoriteTalents } from '@/lib/auth';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon,
  CheckBadgeIcon,
  HeartIcon
} from '@heroicons/react/24/solid';
import JobPostingModal from '@/components/JobPostingModal';

interface Portfolio {
  id: string;
  name: string;
  email: string;
  speciality: string;
  skills: string[];
  rating: number;
  experience?: any[];
  verified: boolean;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [favoriteTalents, setFavoriteTalents] = useState<Portfolio[]>([]);
  const [sentProposalsCount, setSentProposalsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'employer') {
          router.push('/');
          return;
        }

        const employerData = await getEmployerWithApprovalStatus(user.uid);
        if (!employerData || !(employerData as any).company?.name) {
          router.push('/employer-setup');
          return;
        }

        setCompanyInfo((employerData as any).company || {});
        setApprovalStatus(employerData.approvalStatus || 'pending');
        setRejectedReason((employerData as any).rejectedReason || null);
        
        // 포트폴리오 목록 가져오기
        const allPortfolios = await getAllPortfolios();
        setPortfolios(allPortfolios);

        // 관심 인재 목록 가져오기
        const favoriteIds = await getFavoriteTalents(user.uid);
        const favoritePortfolios = allPortfolios.filter(portfolio => 
          favoriteIds.includes(portfolio.id)
        );
        setFavoriteTalents(favoritePortfolios);

        // 보낸 제안 수 가져오기
        const sentCount = parseInt(localStorage.getItem(`sentProposals_${user.uid}`) || '0');
        setSentProposalsCount(sentCount);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  // 현재 탭에 따른 포트폴리오 목록
  const currentPortfolios = activeTab === 'all' ? portfolios : favoriteTalents;

  // 필터링된 포트폴리오
  const filteredPortfolios = currentPortfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpeciality = selectedSpeciality === 'all' || portfolio.speciality === selectedSpeciality;
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => portfolio.skills.includes(skill));
    
    return matchesSearch && matchesSpeciality && matchesSkills;
  });

  // 모든 전문 분야 추출
  const allSpecialities = Array.from(new Set(portfolios.map(p => p.speciality)));
  
  // 모든 스킬 추출
  const allSkills = Array.from(new Set(portfolios.flatMap(p => p.skills)));

  const getAvatarBySpeciality = (speciality: string) => {
    const avatars: { [key: string]: string } = {
      '퍼포먼스 마케팅': '📊',
      '콘텐츠 마케팅': '✍️',
      'SNS 마케팅': '📱',
      '브랜드 마케팅': '🎨',
      '데이터 분석': '📈',
      '그로스 해킹': '🚀',
      '마케팅 전략': '🎯',
      '디지털 마케팅': '💻'
    };
    return avatars[speciality] || '👤';
  };

  const handleJobPostingSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/job-postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('채용공고 생성 성공:', result);
        // 성공 알림을 표시하거나 페이지를 새로고침할 수 있습니다
        alert('채용공고가 성공적으로 등록되었습니다!');
      } else {
        const error = await response.json();
        console.error('채용공고 생성 실패:', error);
        alert('채용공고 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    try {
      await deleteUserAccount(user.uid);
      alert('회원 탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (error: any) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴에 실패했습니다: ' + error.message);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">대시보드를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Sidebar Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-72 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-slate-200">
            {/* Company Info Section */}
            <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-4">
              <div className="flex items-center flex-shrink-0 px-6">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-900">테크벤처 잡 매칭</span>
                    <p className="text-xs text-slate-500 mt-0.5">기업 대시보드</p>
                  </div>
                </Link>
              </div>
              
              {/* Company Profile Card */}
              <div className="mt-8 mx-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border border-slate-300">
                      <BuildingOfficeIcon className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 truncate">
                        {companyInfo?.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{companyInfo?.industry}</p>
                      <div className="flex items-center mt-3 space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                          인증 기업
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-8 flex-1 space-y-2 px-6">
                <Link 
                  href="/employer-dashboard"
                  className="bg-blue-50 border-blue-200 text-blue-700 group flex items-center px-4 py-3 text-sm font-medium rounded-xl border"
                >
                  <ChartBarIcon className="text-blue-500 mr-4 h-5 w-5" />
                  대시보드
                </Link>
                
                <Link 
                  href="/portfolios"
                  className="text-slate-700 hover:text-blue-700 hover:bg-blue-50 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <UserGroupIcon className="text-slate-400 group-hover:text-blue-500 mr-4 h-5 w-5" />
                  인재 검색
                </Link>
                
                {/* 채용 관리 - 아직 구현되지 않음 */}
                {/* <Link 
                  href="/employer-dashboard/inquiries"
                  className="text-slate-700 hover:text-blue-700 hover:bg-blue-50 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <EnvelopeIcon className="text-slate-400 group-hover:text-blue-500 mr-4 h-5 w-5" />
                  채용 관리
                </Link> */}
                
                <Link 
                  href="/employer-setup"
                  className="text-slate-700 hover:text-blue-700 hover:bg-blue-50 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                >
                  <BriefcaseIcon className="text-slate-400 group-hover:text-blue-500 mr-4 h-5 w-5" />
                  기업 설정
                </Link>
                
                <div className="pt-4 border-t border-slate-200 mt-6">
                  <Link 
                    href="/"
                    className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  >
                    <svg className="text-slate-400 group-hover:text-slate-600 mr-4 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    메인 페이지
                  </Link>
                  
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  >
                    <TrashIcon className="text-red-400 group-hover:text-red-600 mr-4 h-5 w-5" />
                    회원 탈퇴
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Top Navigation */}
          <header className="bg-white border-b border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center lg:hidden">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">H</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">테크벤처 잡 매칭</span>
                  </Link>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  <div className="flex items-center space-x-3 lg:hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{companyInfo?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* 승인 상태 알림 */}
              {approvalStatus && approvalStatus !== 'approved' && (
                <div className="mb-6">
                  {approvalStatus === 'pending' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">승인 대기 중</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>귀하의 기업 회원가입이 승인 대기 중입니다. 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : approvalStatus === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0016 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">가입 거절됨</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>귀하의 기업 회원가입이 거절되었습니다.</p>
                            {rejectedReason && (
                              <p className="mt-1">거절 사유: {rejectedReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Welcome Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                      안녕하세요, {companyInfo?.name}!
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                      오늘도 최고의 인재를 찾아보세요.
                    </p>
                  </div>
                  <div className="hidden sm:flex space-x-3">
                    <button 
                      onClick={() => setShowJobPostingModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      채용공고 작성
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      새 프로젝트
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <motion.div 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">전체 인재</p>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-slate-900">{portfolios.length}</p>
                        <span className="ml-2 text-sm text-green-600 flex items-center">
                          <ArrowUpIcon className="w-4 h-4 mr-1" />
                          12%
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">관심 인재</p>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-slate-900">{favoriteTalents.length}</p>
                        <span className="ml-2 text-sm text-red-600 flex items-center">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          저장됨
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </motion.div>

                {/* 채용 공고 통계 - 아직 구현되지 않음 */}
                {/* <motion.div 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">채용 공고</p>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-slate-900">0</p>
                        <span className="ml-2 text-sm text-slate-500">활성</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </motion.div> */}

                <motion.div 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">보낸 제안</p>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-slate-900">{sentProposalsCount}</p>
                        <span className="ml-2 text-sm text-indigo-600 flex items-center">
                          <EnvelopeIcon className="w-4 h-4 mr-1" />
                          전송됨
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <EnvelopeIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </motion.div>

                {/* 응답률 통계 - 아직 구현되지 않음 */}
                {/* <motion.div 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">응답률</p>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-slate-900">-</p>
                        <span className="ml-2 text-sm text-slate-500">대기중</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </motion.div> */}
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input
                          type="text"
                          placeholder="이름, 전문분야, 스킬로 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>
                    
                    {/* Filter Button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                      필터
                    </button>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Speciality Filter */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-3">전문 분야</label>
                          <select
                            value={selectedSpeciality}
                            onChange={(e) => setSelectedSpeciality(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                          >
                            <option value="all">모든 분야</option>
                            {allSpecialities.map(speciality => (
                              <option key={speciality} value={speciality}>{speciality}</option>
                            ))}
                          </select>
                        </div>

                        {/* Skills Filter */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-3">스킬</label>
                          <div className="flex flex-wrap gap-2">
                            {allSkills.slice(0, 8).map(skill => (
                              <button
                                key={skill}
                                onClick={() => {
                                  if (selectedSkills.includes(skill)) {
                                    setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                  } else {
                                    setSelectedSkills([...selectedSkills, skill]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  selectedSkills.includes(skill)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Talent Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6">
                  {/* Tab Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-1 bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === 'all'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UserGroupIcon className="w-4 h-4 mr-2 inline" />
                        전체 인재 ({portfolios.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === 'favorites'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <HeartIcon className="w-4 h-4 mr-2 inline text-red-500" />
                        관심 인재 ({favoriteTalents.length})
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>정렬:</span>
                      <select className="border border-slate-300 rounded-lg px-3 py-1 text-slate-700">
                        <option>평점 높은순</option>
                        <option>최신순</option>
                        <option>경력순</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Tab Title */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeTab === 'all' ? '전체 인재 목록' : '관심 인재 목록'} ({filteredPortfolios.length}명)
                    </h2>
                    {activeTab === 'favorites' && (
                      <p className="text-sm text-slate-600 mt-1">
                        저장한 관심 인재들을 확인하고 관리하세요.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPortfolios.map((portfolio, index) => (
                      <motion.div
                        key={portfolio.id}
                        className="group bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Profile Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {getAvatarBySpeciality(portfolio.speciality)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {portfolio.name}
                              </h3>
                              <p className="text-sm text-slate-600">{portfolio.speciality}</p>
                            </div>
                          </div>
                          {portfolio.verified && (
                            <CheckBadgeIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${
                                  i < portfolio.rating ? 'text-yellow-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{portfolio.rating.toFixed(1)}</span>
                        </div>

                        {/* Skills */}
                        <div className="mb-6">
                          <div className="flex flex-wrap gap-2">
                            {portfolio.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                            {portfolio.skills.length > 3 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                                +{portfolio.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <Link 
                            href={`/portfolios/${portfolio.id}`}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            프로필 보기
                          </Link>
                          <Link 
                            href={`/employer-dashboard/contact/${portfolio.id}`}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                            채용 제안
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredPortfolios.length === 0 && (
                    <div className="text-center py-12">
                      {activeTab === 'favorites' ? (
                        <div>
                          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HeartIcon className="w-10 h-10 text-red-400" />
                          </div>
                          <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {searchTerm || selectedSpeciality !== 'all' || selectedSkills.length > 0 
                              ? '검색 조건에 맞는 관심 인재가 없습니다' 
                              : '아직 관심 인재가 없습니다'
                            }
                          </h3>
                          <p className="text-slate-600 mb-4">
                            {searchTerm || selectedSpeciality !== 'all' || selectedSkills.length > 0 
                              ? '다른 검색 조건을 시도해보세요.' 
                              : '인재 프로필에서 하트 버튼을 눌러 관심 인재로 저장해보세요.'
                            }
                          </p>
                          {(!searchTerm && selectedSpeciality === 'all' && selectedSkills.length === 0) && (
                            <button
                              onClick={() => setActiveTab('all')}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <UserGroupIcon className="w-4 h-4 mr-2" />
                              전체 인재 보기
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          <UserGroupIcon className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">검색 결과가 없습니다</h3>
                          <p className="text-slate-600">다른 검색 조건을 시도해보세요.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        onSubmit={handleJobPostingSubmit}
      />

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">회원 탈퇴</h3>
                <p className="text-sm text-gray-600">정말로 탈퇴하시겠습니까?</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>주의:</strong> 회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                <li>기업 정보 및 프로필</li>
                <li>채용 공고 및 지원 내역</li>
                <li>모든 활동 기록</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    탈퇴 중...
                  </div>
                ) : (
                  '탈퇴하기'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}