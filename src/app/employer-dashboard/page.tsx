'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, getEmployerInfo, getAllPortfolios, getEmployerWithApprovalStatus, deleteUserAccount } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrashIcon,
  HomeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import JobPostingModal from '@/components/JobPostingModal';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  // 필터링된 포트폴리오
  const filteredPortfolios = portfolios.filter(portfolio => {
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-azure-50">
        <AuroraBackground variant="subtle" />
        <div className="relative flex flex-col items-center space-y-5">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500"></div>
          <p className="text-ink-500 font-medium">대시보드를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  const navItemBase =
    'group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300';

  return (
    <div className="relative min-h-screen overflow-hidden bg-azure-50">
      <AuroraBackground variant="subtle" />

      {/* Modern Sidebar Layout */}
      <div className="relative flex">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col">
          <div className="flex min-h-screen flex-1 flex-col glass-strong border-r border-white/60 m-0 rounded-none">
            {/* Company Info Section */}
            <div className="flex flex-1 flex-col overflow-y-auto pt-8 pb-6">
              <div className="flex items-center flex-shrink-0 px-7">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-11 h-11 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-display font-bold text-lg">H</span>
                  </div>
                  <div>
                    <span className="text-lg font-display font-bold tracking-tight text-ink-900">면접심사 매칭 플랫폼</span>
                    <p className="text-xs text-ink-400 mt-0.5">기업 대시보드</p>
                  </div>
                </Link>
              </div>

              {/* Company Profile Card */}
              <div className="mt-8 mx-6">
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-azure-100 to-azure-50 rounded-2xl flex items-center justify-center border border-white/70 shadow-glass-sm">
                      <BuildingOfficeIcon className="w-8 h-8 text-azure-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-ink-900 truncate">
                        {companyInfo?.name}
                      </h3>
                      <p className="text-sm text-ink-500 mt-1">{companyInfo?.industry}</p>
                      <div className="flex items-center mt-3">
                        <Badge tone="mint" icon={<span className="w-2 h-2 bg-mint-500 rounded-full" />}>
                          인증 기업
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="mt-8 flex-1 space-y-1.5 px-6">
                <Link
                  href="/employer-dashboard"
                  className={`${navItemBase} bg-azure-500/10 border border-azure-200 text-azure-700`}
                >
                  <ChartBarIcon className="text-azure-500 mr-4 h-5 w-5" />
                  대시보드
                </Link>

                <Link
                  href="/portfolios"
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <UserGroupIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
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
                  className={`${navItemBase} text-ink-600 hover:text-azure-700 hover:bg-azure-50/70`}
                >
                  <BriefcaseIcon className="text-ink-400 group-hover:text-azure-500 mr-4 h-5 w-5 transition-colors" />
                  기업 설정
                </Link>

                <div className="pt-4 border-t border-ink-100 mt-6">
                  <Link
                    href="/"
                    className={`${navItemBase} text-ink-600 hover:text-ink-900 hover:bg-azure-50/70`}
                  >
                    <HomeIcon className="text-ink-400 group-hover:text-ink-600 mr-4 h-5 w-5 transition-colors" />
                    메인 페이지
                  </Link>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className={`${navItemBase} w-full mt-1.5 text-coral-600 hover:text-coral-700 hover:bg-coral-100/50`}
                  >
                    <TrashIcon className="text-coral-400 group-hover:text-coral-600 mr-4 h-5 w-5 transition-colors" />
                    회원 탈퇴
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Navigation */}
          <header className="glass-nav border-b border-white/50">
            <div className="px-5 sm:px-8 lg:px-12">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center lg:hidden">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-azure-500 to-azure-600 rounded-xl flex items-center justify-center shadow-glow">
                      <span className="text-white font-display font-bold text-sm">H</span>
                    </div>
                    <span className="text-lg font-display font-bold tracking-tight text-ink-900">면접심사 매칭 플랫폼</span>
                  </Link>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                  <button className="relative p-2.5 rounded-2xl text-ink-400 hover:text-azure-600 hover:bg-azure-50/70 transition-all duration-300">
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full ring-2 ring-white"></span>
                  </button>

                  <div className="flex items-center space-x-3 lg:hidden">
                    <div className="w-9 h-9 bg-gradient-to-br from-azure-500 to-azure-600 rounded-xl flex items-center justify-center shadow-glow">
                      <BuildingOfficeIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{companyInfo?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1">
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
              {/* 승인 상태 알림 */}
              {approvalStatus && approvalStatus !== 'approved' && (
                <ScrollReveal className="mb-8">
                  {approvalStatus === 'pending' ? (
                    <div className="glass rounded-3xl p-5 border-honey-400/40">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-honey-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-honey-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-semibold text-ink-900">승인 대기 중</h3>
                          <div className="mt-1.5 text-sm text-ink-500">
                            <p>귀하의 기업 회원가입이 승인 대기 중입니다. 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : approvalStatus === 'rejected' && (
                    <div className="glass rounded-3xl p-5 border-coral-400/40">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-coral-100 flex items-center justify-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-coral-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-semibold text-ink-900">가입 거절됨</h3>
                          <div className="mt-1.5 text-sm text-ink-500">
                            <p>귀하의 기업 회원가입이 거절되었습니다.</p>
                            {rejectedReason && (
                              <p className="mt-1">거절 사유: {rejectedReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollReveal>
              )}

              {/* Welcome Section */}
              <ScrollReveal className="mb-10">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                      Employer Dashboard
                    </span>
                    <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-ink-900 leading-[1.1]">
                      안녕하세요, {companyInfo?.name}!
                    </h1>
                    <p className="mt-4 text-ink-500 text-base md:text-lg leading-relaxed">
                      오늘도 최고의 인재를 찾아보세요.
                    </p>
                  </div>
                  <div className="hidden sm:flex space-x-3">
                    <GlassButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowJobPostingModal(true)}
                    >
                      <DocumentTextIcon className="w-4 h-4" />
                      채용공고 작성
                    </GlassButton>
                    <GlassButton variant="primary" size="sm">
                      <PlusIcon className="w-4 h-4" />
                      새 프로젝트
                    </GlassButton>
                  </div>
                </div>
              </ScrollReveal>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:max-w-sm gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard hover className="p-7">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-500">전체 인재</p>
                        <div className="flex items-center mt-2">
                          <p className="font-display text-4xl font-bold text-ink-900">{portfolios.length}</p>
                          <span className="ml-2 text-sm text-mint-600 flex items-center font-medium">
                            <ArrowUpIcon className="w-4 h-4 mr-0.5" />
                            12%
                          </span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-azure-100 to-azure-50 rounded-2xl flex items-center justify-center border border-white/70 shadow-glass-sm">
                        <UserGroupIcon className="w-7 h-7 text-azure-600" />
                      </div>
                    </div>
                  </GlassCard>
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
              <ScrollReveal className="mb-8">
                <GlassCard className="rounded-4xl">
                  <div className="p-6 md:p-7">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search Bar */}
                      <div className="flex-1">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-400 h-5 w-5 z-10" />
                          <GlassInput
                            type="text"
                            placeholder="이름, 전문분야, 스킬로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12"
                          />
                        </div>
                      </div>

                      {/* Filter Button */}
                      <GlassButton
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        필터
                      </GlassButton>
                    </div>

                    {/* Filters */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-ink-100 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Speciality Filter */}
                            <div>
                              <label className="block text-sm font-medium text-ink-700 mb-3">전문 분야</label>
                              <GlassSelect
                                value={selectedSpeciality}
                                onChange={(e) => setSelectedSpeciality(e.target.value)}
                              >
                                <option value="all">모든 분야</option>
                                {allSpecialities.map(speciality => (
                                  <option key={speciality} value={speciality}>{speciality}</option>
                                ))}
                              </GlassSelect>
                            </div>

                            {/* Skills Filter */}
                            <div>
                              <label className="block text-sm font-medium text-ink-700 mb-3">스킬</label>
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
                                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                                      selectedSkills.includes(skill)
                                        ? 'bg-gradient-to-r from-azure-500 to-azure-600 text-white border-transparent shadow-glow'
                                        : 'bg-white/60 text-ink-600 border-white/70 hover:bg-azure-50/70 hover:text-azure-700'
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
                    </AnimatePresence>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Talent Grid */}
              <ScrollReveal>
                <GlassCard className="rounded-4xl">
                  <div className="p-6 md:p-8">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 text-white text-sm font-medium shadow-glow">
                        <UserGroupIcon className="w-4 h-4" />
                        전체 인재 ({portfolios.length})
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-ink-400">
                        <span>정렬:</span>
                        <GlassSelect className="!w-auto !py-2 text-ink-600">
                          <option>평점 높은순</option>
                          <option>최신순</option>
                          <option>경력순</option>
                        </GlassSelect>
                      </div>
                    </div>

                    {/* Talent List Title */}
                    <div className="mb-7">
                      <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
                        전체 인재 목록 ({filteredPortfolios.length}명)
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredPortfolios.map((portfolio, index) => (
                        <motion.div
                          key={portfolio.id}
                          className="group glass rounded-3xl p-6 cursor-pointer hover:shadow-glass-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -6 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Profile Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl bg-gradient-to-br from-azure-100 to-azure-50 rounded-2xl w-14 h-14 flex items-center justify-center border border-white/70 group-hover:scale-110 transition-transform duration-300">
                                {getAvatarBySpeciality(portfolio.speciality)}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-ink-900 group-hover:text-azure-600 transition-colors">
                                  {portfolio.name}
                                </h3>
                                <p className="text-sm text-ink-500">{portfolio.speciality}</p>
                              </div>
                            </div>
                            {portfolio.verified && (
                              <CheckBadgeIcon className="w-6 h-6 text-mint-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < portfolio.rating ? 'text-honey-500' : 'text-ink-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-ink-700">{portfolio.rating.toFixed(1)}</span>
                          </div>

                          {/* Skills */}
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                              {portfolio.skills.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} tone="azure">
                                  {skill}
                                </Badge>
                              ))}
                              {portfolio.skills.length > 3 && (
                                <Badge tone="neutral">
                                  +{portfolio.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <GlassButton
                              href={`/portfolios/${portfolio.id}`}
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                            >
                              <EyeIcon className="w-4 h-4" />
                              프로필 보기
                            </GlassButton>
                            <GlassButton
                              href={`/employer-dashboard/contact/${portfolio.id}`}
                              variant="primary"
                              size="sm"
                              className="flex-1"
                            >
                              <EnvelopeIcon className="w-4 h-4" />
                              채용 제안
                            </GlassButton>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {filteredPortfolios.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-azure-100 to-azure-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/70 shadow-glass-sm">
                          <UserGroupIcon className="w-10 h-10 text-azure-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-ink-900 mb-2">검색 결과가 없습니다</h3>
                        <p className="text-ink-500">다른 검색 조건을 시도해보세요.</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </ScrollReveal>
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
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative glass-strong rounded-4xl shadow-glass-lg p-7 max-w-md w-full"
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/60 border border-white/70 flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-white/90 transition-all duration-300"
                aria-label="닫기"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-coral-100 rounded-2xl flex items-center justify-center border border-coral-400/40">
                  <ExclamationTriangleIcon className="w-6 h-6 text-coral-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">회원 탈퇴</h3>
                  <p className="text-sm text-ink-500">정말로 탈퇴하시겠습니까?</p>
                </div>
              </div>

              <div className="bg-coral-100/50 border border-coral-400/40 rounded-2xl p-4 mb-6">
                <p className="text-sm text-ink-700">
                  <strong className="text-coral-700">주의:</strong> 회원 탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <ul className="mt-2 text-sm text-ink-500 list-disc list-inside space-y-0.5">
                  <li>기업 정보 및 프로필</li>
                  <li>채용 공고 및 지원 내역</li>
                  <li>모든 활동 기록</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  취소
                </GlassButton>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-glass hover:from-coral-400 hover:to-coral-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/60"
                >
                  {deleteLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white mr-2"></div>
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
      </AnimatePresence>
    </div>
  );
}
