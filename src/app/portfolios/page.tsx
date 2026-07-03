'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon, LockClosedIcon, CheckCircleIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPortfolios, canAccessPortfolio, getEmployerWithApprovalStatus } from '@/lib/auth';
import PortfolioAccessModal from '@/components/PortfolioAccessModal';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/components/ui/motion';

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  email: string;
  speciality: string;
  phone?: string;
  address?: string;
  skills: string[];
  languages: string[];
  experience?: any[];
  education?: any[];
  description: string;
  rating: number;
  projects: number;
  verified: boolean;
  isPublic: boolean;
  profileImage?: string;
  currentCourse?: string;
  courseType?: 'domestic' | 'foreign';
  createdAt?: Date;
  updatedAt?: Date;
}

// 아바타 매핑
const getAvatarBySpeciality = (speciality: string) => {
  const avatarMap: { [key: string]: string } = {
    'SNS마케팅': '👩',
    '키워드광고': '👨',
    '브랜드마케팅': '🎨',
    '퍼포먼스마케팅': '📊',
    '콘텐츠마케팅': '🎬',
    '마케팅기획': '💼',
    '이커머스마케팅': '🛒',
    '데이터마케팅': '🔬',
    '웹개발': '💻',
    '앱개발': '📱',
    '디자인': '🎨',
    '기타': '👤'
  };
  return avatarMap[speciality] || '👤';
};

const specialities = ['전체', 'SNS마케팅', '키워드광고', '브랜드마케팅', '퍼포먼스마케팅', '콘텐츠마케팅', '마케팅기획', '이커머스마케팅', '데이터마케팅', '웹개발', '앱개발', '디자인', '기타'];

const courseTypes = ['전체', '내국인', '외국인'];



export default function PortfoliosPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('전체');
  const [selectedCourseType, setSelectedCourseType] = useState('전체');
  const [sortBy, setSortBy] = useState('projects');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [employerStatus, setEmployerStatus] = useState<any>(null);
  const [accessChecked, setAccessChecked] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // 접근 권한 확인
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setAccessChecked(true);
        // 로그인하지 않은 사용자는 모달 표시
        setShowAccessModal(true);
        return;
      }

      try {
        const access = await canAccessPortfolio(user.uid);
        setHasAccess(access);

        // 기업 회원인 경우 승인 상태 확인
        if (userData?.role === 'employer') {
          const status = await getEmployerWithApprovalStatus(user.uid);
          setEmployerStatus(status);
        }

        // 접근 권한이 없는 경우 모달 표시
        if (!access) {
          setShowAccessModal(true);
          return;
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
        setShowAccessModal(true);
        return;
      } finally {
        setAccessChecked(true);
      }
    };

    if (user !== undefined) {
      checkAccess();
    }
  }, [user, userData, router]);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await getAllPortfolios(false); // 일반 사용자는 숨겨진 포트폴리오 제외
      console.log('🎯 포트폴리오 목록 로드됨:', data);

      // 실제 데이터만 사용
      setPortfolios(data as Portfolio[]);
    } catch (error) {
      console.error('Error loading portfolios:', error);
      // 에러 발생 시 빈 배열로 설정
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const reduceMotion = useReducedMotion();

  const filteredPortfolios = portfolios
    .filter((portfolio: Portfolio) => {
      const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          portfolio.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          portfolio.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpeciality = selectedSpeciality === '전체' || portfolio.speciality === selectedSpeciality;
      const courseTypeValue = selectedCourseType === '내국인' ? 'domestic' : selectedCourseType === '외국인' ? 'foreign' : null;
      const matchesCourseType = selectedCourseType === '전체' || portfolio.courseType === courseTypeValue;
      return matchesSearch && matchesSpeciality && matchesCourseType;
    })
    .sort((a: Portfolio, b: Portfolio) => {
      switch (sortBy) {
        case 'projects':
          return b.projects - a.projects;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        default:
          return 0;
      }
    });

  // 접근 권한 확인 중일 때 로딩 화면 표시
  if (!accessChecked) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-azure-aurora flex items-center justify-center">
        <AuroraBackground />
        <GlassCard strong className="relative z-10 px-10 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-b-azure-500 mx-auto mb-5"></div>
          <p className="text-ink-500">접근 권한을 확인하고 있습니다...</p>
        </GlassCard>
      </div>
    );
  }

  // 접근 권한이 없는 경우 모달과 함께 기본 레이아웃 표시
  if (!hasAccess) {
    return (
      <>
        <div className="relative min-h-screen overflow-hidden bg-azure-aurora flex items-center justify-center px-5">
          <AuroraBackground variant="vivid" />
          <GlassCard strong className="relative z-10 px-10 py-14 text-center max-w-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-4xl bg-azure-50 border border-azure-100 flex items-center justify-center shadow-glass-sm">
              <LockClosedIcon className="h-10 w-10 text-azure-500" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-3">접근 권한이 필요합니다</h1>
            <p className="text-ink-500 leading-relaxed">승인된 기업 회원만 포트폴리오를 열람할 수 있습니다.</p>
          </GlassCard>
        </div>
        <PortfolioAccessModal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          userRole={userData?.role}
          approvalStatus={employerStatus?.approvalStatus}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#F0F8FF_0%,#E7F2FC_42%,#EAF4FF_100%)]">
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-azure-aurora opacity-75" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 w-28 bg-gradient-to-r from-azure-100/70 via-azure-100/25 to-transparent" />
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 w-28 bg-gradient-to-l from-azure-100/70 via-azure-100/25 to-transparent" />
      {/* Header */}
      <div className="glass-nav sticky top-16 z-40 border-b border-white/50">
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-ink-500 hover:text-azure-700 transition-colors font-medium">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>홈으로</span>
              </Link>
              <div className="h-6 w-px bg-ink-200"></div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gradient-azure">
                포트폴리오
              </h1>
            </div>
            <Badge tone="azure" className="px-4 py-1.5">
              총 {filteredPortfolios.length}명의 전문가
            </Badge>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 py-10 lg:py-14">
        <div className="relative z-10">
        {/* 접근 권한 안내 */}
        {user && userData?.role === 'employer' && employerStatus && (
          <ScrollReveal className="mb-7">
            {employerStatus.approvalStatus === 'pending' ? (
              <div className="glass-strong rounded-4xl p-6 border-honey-400/40 shadow-glass">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-honey-100 flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-honey-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900 mb-1">
                      승인 대기 중
                    </h3>
                    <p className="text-ink-500 leading-relaxed">
                      귀하의 기업 회원가입이 승인 대기 중입니다. 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : employerStatus.approvalStatus === 'rejected' ? (
              <div className="glass-strong rounded-4xl p-6 border-coral-400/40 shadow-glass">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-coral-100 flex items-center justify-center">
                    <LockClosedIcon className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900 mb-1">
                      가입 거절됨
                    </h3>
                    <p className="text-ink-500 mb-2 leading-relaxed">
                      귀하의 기업 회원가입이 거절되었습니다.
                    </p>
                    {employerStatus.rejectedReason && (
                      <p className="text-sm text-coral-600">
                        거절 사유: {employerStatus.rejectedReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-strong rounded-3xl p-5 border-mint-400/40 shadow-glass">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-mint-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900 mb-1">
                      정회원 승인 완료
                    </h3>
                    <p className="text-ink-500 leading-relaxed">
                      귀하는 승인된 정회원입니다. 모든 구직자 포트폴리오를 열람하실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollReveal>
        )}

        {/* Search and Filter Section */}
        <ScrollReveal className="mb-8">
          <div className="glass-strong rounded-3xl p-4 sm:p-5 shadow-glass">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-azure-500 pointer-events-none z-10" />
                  <GlassInput
                    type="text"
                    placeholder="이름, 전문분야, 스킬로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3"
                  />
                </div>
              </div>

              {/* Speciality Filter */}
              <div className="flex items-center gap-3">
                <FunnelIcon className="h-5 w-5 text-azure-500 shrink-0" />
                <GlassSelect
                  value={selectedSpeciality}
                  onChange={(e) => setSelectedSpeciality(e.target.value)}
                  className="py-3"
                >
                  {specialities.map(speciality => (
                    <option key={speciality} value={speciality}>{speciality}</option>
                  ))}
                </GlassSelect>
              </div>

              {/* Course Type Filter (내국인/외국인) */}
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="h-5 w-5 text-azure-500 shrink-0" />
                <GlassSelect
                  value={selectedCourseType}
                  onChange={(e) => setSelectedCourseType(e.target.value)}
                  className="py-3"
                >
                  {courseTypes.map(courseType => (
                    <option key={courseType} value={courseType}>{courseType}</option>
                  ))}
                </GlassSelect>
              </div>

              {/* Sort */}
              <div>
                <GlassSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-3"
                >
                  <option value="projects">프로젝트순</option>
                  <option value="recent">최신순</option>
                  <option value="name">이름순</option>
                </GlassSelect>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Portfolio Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-b-azure-500"></div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5"
            variants={reduceMotion ? undefined : staggerContainer()}
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? false : 'show'}
          >
            {filteredPortfolios.map((portfolio: Portfolio) => (
              <motion.div key={portfolio.id} variants={reduceMotion ? undefined : fadeUp} className="h-full">
                <GlassCard hover className="group relative h-full overflow-hidden flex flex-col rounded-3xl">
                {/* Verification Badge - Positioned absolutely */}
                {portfolio.verified && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge tone="mint" className="shadow-glass-sm" icon={
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    }>
                      인증
                    </Badge>
                  </div>
                )}

                {/* Profile Image Header - Gallery Style */}
                <div className="relative h-44 overflow-hidden rounded-t-3xl bg-gradient-to-br from-azure-100 via-sky-cool-200 to-azure-200 sm:h-48 2xl:h-52">
                  {portfolio.profileImage ? (
                    <img
                      src={portfolio.profileImage}
                      alt={`${portfolio.name}의 프로필`}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                        {getAvatarBySpeciality(portfolio.speciality)}
                      </div>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/45 via-ink-900/5 to-transparent"></div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display text-lg font-bold tracking-tight text-white drop-shadow-lg group-hover:text-azure-100 transition-colors">
                      {portfolio.name}
                    </h3>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Speciality Badge */}
                  <div className="mb-3">
                    <span className="inline-flex max-w-full items-center rounded-full bg-gradient-to-r from-azure-500 to-azure-600 px-3 py-1 text-xs font-semibold text-white shadow-glow">
                      {portfolio.speciality}
                    </span>
                  </div>

                {hasAccess ? (
                  <>
                    {/* Description */}
                    <p className="text-sm text-ink-500 mb-4 leading-relaxed line-clamp-2">
                      {portfolio.description || `${portfolio.speciality} 전문가입니다.`}
                    </p>

                    {/* Location and Contact */}
                    {(portfolio.address || (portfolio.phone && (hasAdminAccess || userData?.role === 'jobseeker'))) && (
                      <div className="mb-3 space-y-1.5">
                        {portfolio.address && (
                           <div className="flex items-center text-xs text-ink-400">
                            <svg className="h-4 w-4 mr-2 text-azure-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {portfolio.address}
                          </div>
                        )}
                        {/* 관리자와 구직자에게만 전화번호 표시 (기업 회원에게는 완전 숨김) */}
                        {portfolio.phone && (hasAdminAccess || userData?.role === 'jobseeker') && (
                           <div className="flex items-center text-xs text-ink-400">
                            <svg className="h-4 w-4 mr-2 text-azure-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {portfolio.phone}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Languages */}
                    {portfolio.languages && portfolio.languages.length > 0 && (
                       <div className="mb-3">
                         <h4 className="text-xs font-semibold text-ink-700 mb-2">언어</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {portfolio.languages.slice(0, 3).map((language: string, index: number) => (
                            <Badge key={index} tone="mint">
                              {language}
                            </Badge>
                          ))}
                          {portfolio.languages.length > 3 && (
                            <span className="text-ink-400 text-xs self-center">+{portfolio.languages.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-ink-700 mb-2">주요 스킬</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {portfolio.skills.slice(0, 3).map((skill: string, index: number) => (
                          <span
                            key={index}
                            className="max-w-full rounded-lg border border-azure-100 bg-azure-50 px-2 py-1 text-xs text-azure-700 transition-colors hover:bg-azure-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {portfolio.skills.length > 3 && (
                          <span className="text-ink-400 text-xs self-center">+{portfolio.skills.length - 3}개</span>
                        )}
                      </div>
                    </div>

                    {/* Current Course */}
                    <div className="flex flex-col items-center justify-center mb-4 p-3 glass rounded-2xl mt-auto">
                      <div className="text-center">
                        <div className="text-xs font-bold text-ink-900 mb-1">수행 중인 과정</div>
                        <div className="line-clamp-2 text-xs text-ink-500">
                          {portfolio.currentCourse || '등록된 과정이 없습니다'}
                        </div>
                      </div>
                      {portfolio.courseType && (
                        <Badge
                          tone={portfolio.courseType === 'foreign' ? 'coral' : 'azure'}
                          className="mt-2"
                          icon={<AcademicCapIcon className="h-3.5 w-3.5" />}
                        >
                          {portfolio.courseType === 'foreign' ? '외국인' : '내국인'}
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  /* Limited Access View - Name Only */
                  <div className="flex-1 flex flex-col items-center justify-center py-8 mb-6">
                    <div className="w-16 h-16 mb-4 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center">
                      <LockClosedIcon className="h-9 w-9 text-azure-400" />
                    </div>
                    <p className="text-ink-500 text-center text-sm mb-2">
                      상세 정보는 기업 승인 후 확인 가능합니다
                    </p>
                    <p className="text-ink-400 text-xs">
                      {userData?.role === 'employer' && employerStatus?.approvalStatus === 'pending'
                        ? '승인 대기 중입니다'
                        : '정회원 승인이 필요합니다'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  {hasAccess ? (
                    <GlassButton
                      href={`/portfolios/${portfolio.id}`}
                      className="flex-1 !rounded-xl !px-3 !py-2 !text-sm"
                    >
                      포트폴리오 보기
                    </GlassButton>
                  ) : (
                    <GlassButton
                      disabled
                      variant="secondary"
                      className="flex-1 !rounded-xl !px-3 !py-2 !text-sm !text-ink-400"
                    >
                      <LockClosedIcon className="h-5 w-5" />
                      {userData?.role === 'employer' && employerStatus?.approvalStatus === 'pending'
                        ? '승인 대기 중'
                        : '열람 불가'}
                    </GlassButton>
                  )}
                  {hasAccess && userData?.role === 'employer' ? (
                    <GlassButton
                      href={`/employer-dashboard/contact/${portfolio.id}`}
                      variant="outline"
                      className="!rounded-xl !px-3 !py-2"
                      title="채용 제안서 보내기"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </GlassButton>
                  ) : (
                    <GlassButton
                      disabled
                      variant="secondary"
                      className="!rounded-xl !px-3 !py-2 !text-ink-400"
                      title="기업 승인 후 이용 가능"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </GlassButton>
                  )}
                </div>
                </div>
                </GlassCard>
              </motion.div>
            ))}

            {/* Empty State */}
            {filteredPortfolios.length === 0 && !loading && (
              <div className="col-span-full">
                <GlassCard strong className="text-center py-20 px-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-4xl bg-azure-50 border border-azure-100 flex items-center justify-center shadow-glass-sm">
                    <MagnifyingGlassIcon className="h-10 w-10 text-azure-500" />
                  </div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900 mb-3">검색 결과가 없습니다</h3>
                  <p className="text-ink-500 mb-8">다른 키워드로 검색해보세요.</p>
                  <GlassButton
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpeciality('전체');
                      setSelectedCourseType('전체');
                    }}
                  >
                    전체 보기
                  </GlassButton>
                </GlassCard>
              </div>
            )}
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}
