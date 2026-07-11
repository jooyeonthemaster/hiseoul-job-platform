'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, getDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon, BuildingOfficeIcon, LockClosedIcon, LockOpenIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, UserGroupIcon, UserIcon, BriefcaseIcon, MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon, PencilIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon, ArrowDownTrayIcon, TableCellsIcon, ArrowTopRightOnSquareIcon, AcademicCapIcon, PlusIcon, TrashIcon, PlayCircleIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassTextarea, GlassSelect, Field } from '@/components/ui/GlassField';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getAllPortfolios, updateJobSeekerProfile, getJobSeekerProfile, updateUserProfile, registerPortfolio, togglePortfolioVisibility, setPortfolioContactVisibility, toggleEmployerVisibility, setEmployerJobSeekerVisibility, setEmployerContactAccess, getAllEmployers, logOut } from '@/lib/auth';
import { exportJobseekersToExcel, exportEmployersToExcel, exportSelectionsToExcel, exportAllToExcel } from '@/lib/excelExport';
import { DEFAULT_VISIBLE_PROGRAM_IDS, PORTFOLIO_PROGRAMS, splitSpecialities, portfolioMatchesProgram, getProgramForPortfolio, type PortfolioProgram, type ProgramCourseType } from '@/lib/programs';
import { getVisiblePortfolioProgramIds, saveVisiblePortfolioProgramIds } from '@/lib/programSettings';
import {
  buildProgramId,
  createCustomProgram,
  deleteCustomProgram,
  getAllPrograms,
  invalidateProgramsCache,
  updateCustomProgram,
  type CustomProgramInput,
} from '@/lib/customPrograms';
import { normalizeYouTubeInput } from '@/lib/youtube';
import {
  StepNavigation,
  BasicInfoStep,
  ExperienceStep,
  EducationStep,
  SkillsStep,
  IntroductionStep,
  MediaStep
} from '@/components/profile-edit';
import type { ExperienceItem, EducationItem, CertificateItem, AwardItem, SelfIntroduction } from '@/types';
import type { VideoLink } from '@/app/portfolios/[id]/types/portfolio.types';
import type { ExternalPortfolioLink } from '@/lib/externalPortfolioLinks';
import ProfileImageManager from '@/components/admin/ProfileImageManager';
import JobInquiryDetailModal from '@/components/JobInquiryDetailModal';
import { useAuth } from '@/contexts/AuthContext';

interface PendingEmployer {
  id: string;
  userId: string;
  company: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    size: string;
    location: string;
    website?: string;
    description: string;
    // 담당자 상세 정보 추가
    contactName?: string;
    contactPosition?: string;
    contactPhone?: string;
    // 기업 매력도 정보 추가
    companyAttraction?: {
      workingHours?: string;
      remoteWork?: boolean;
      averageSalary?: string;
      benefits?: string[];
      growthOpportunity?: boolean;
      stockOptions?: boolean;
      trainingSupport?: boolean;
      familyFriendly?: boolean;
      etc?: string;
    };
  };
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  userEmail?: string;
  userName?: string;
  rejectedReason?: string;
  canceledReason?: string;
  approvedAt?: any;
  rejectedAt?: any;
  canceledAt?: any;
  isHidden?: boolean; // 숨김 상태 추가
  // 기업별 과정 열람 권한 (undefined = 전체 허용 레거시, [] = 전면 차단)
  allowedProgramIds?: string[];
  // 구직자에게 기업정보 공개 여부 (undefined/false = 비공개, true = 공개)
  visibleToJobSeekers?: boolean;
  // 이 기업에 구직자 연락처(주소·이메일·전화) 열람 권한 부여 여부 (undefined/false = 비공개)
  canViewApplicantContacts?: boolean;
}

interface JobInquiry {
  id: string;
  jobSeekerId: string;
  employerId: string;
  portfolioId: string;
  proposedPosition: string;
  proposedSalary: string;
  message: string;
  jobCategory: string;
  workingHours: string;
  workType: string;
  benefits: string[];
  companyInfo: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    location: string;
    description: string;
  };
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: any;
  readAt?: any;
  respondedAt?: any;
  jobSeekerName?: string;
  jobSeekerEmail?: string;
  // 매칭데이(7/22) 참석 여부 — 구버전 제안서에는 없을 수 있음
  matchingDayAttendance?: 'attend' | 'unavailable';
}

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  speciality: string;
  phone: string;
  address: string;
  skills: string[];
  languages: string[];
  description: string;
  profileImage?: string;
  currentCourse?: string;
  courseType?: 'domestic' | 'foreign';
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certificates?: CertificateItem[];
  awards?: AwardItem[];
  selfIntroduction?: SelfIntroduction;
  introVideo?: string;
  introVideos?: VideoLink[];
  portfolioVideos?: VideoLink[];
  mediaContent?: any[];
  externalLinks?: ExternalPortfolioLink[];
  portfolioPdfs?: Array<{
    url: string;
    fileName: string;
    uploadedAt: Date;
  }>;
  additionalDocuments?: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloadUrl: string;
    publicId: string;
  }>;
  dateOfBirth?: Date;
  isHidden?: boolean; // 숨김 상태 추가
  contactInfoVisibleToEmployers?: boolean;
}

// 프로필 수정을 위한 FormData 인터페이스
interface ProfileFormData {
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    speciality: string;
    profileImage?: string;
    currentCourse?: string;
    courseType?: 'domestic' | 'foreign';
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: {
    skills: string[];
    languages: string[];
    certificates: CertificateItem[];
    awards: AwardItem[];
  };
  selfIntroduction: SelfIntroduction;
  media: {
    introVideo: string;
    introVideos?: VideoLink[];
    portfolioVideos?: VideoLink[];
    mediaContent: any[];
    externalLinks?: ExternalPortfolioLink[];
    portfolioPdfs?: Array<{
      url: string;
      fileName: string;
      uploadedAt: Date;
    }>;
    additionalDocuments?: Array<{
      url: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      downloadUrl: string;
      publicId: string;
    }>;
  };
}

const profileEditSteps = [
  { id: 1, name: '기본 정보', description: '이름, 연락처 등' },
  { id: 2, name: '경력 사항', description: '이전 근무 경험' },
  { id: 3, name: '학력 사항', description: '교육 이력' },
  { id: 4, name: '스킬 & 자격증', description: '보유 기술과 자격' },
  { id: 5, name: '자기소개', description: '자기소개서 작성' },
  { id: 6, name: '미디어', description: '영상 및 포트폴리오' }
];

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;

  // 인증 관련 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 기존 상태들
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [approvedEmployers, setApprovedEmployers] = useState<PendingEmployer[]>([]);
  const [rejectedEmployers, setRejectedEmployers] = useState<PendingEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'rejected' | 'inquiries' | 'portfolios'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [selectedCancelEmployerId, setSelectedCancelEmployerId] = useState<string | null>(null);
  const [expandedEmployers, setExpandedEmployers] = useState<Set<string>>(new Set());

  // 기업 상세 정보 펼치기/접기 토글
  const toggleEmployerDetails = (employerId: string) => {
    setExpandedEmployers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employerId)) {
        newSet.delete(employerId);
      } else {
        newSet.add(employerId);
      }
      return newSet;
    });
  };

  // 채용 제안서 관련 상태
  const [jobInquiries, setJobInquiries] = useState<JobInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<JobInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<JobInquiry | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  // 탭 카운트를 즉시 채우기 위해 제안서/포트폴리오도 진입 시 바로 로드한다 (탭별 독립 로딩 플래그)
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [portfoliosLoading, setPortfoliosLoading] = useState(true);

  // 포트폴리오 관련 상태
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [currentProfileStep, setCurrentProfileStep] = useState(1);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    basicInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      speciality: '',
      profileImage: '',
      currentCourse: '',
      courseType: undefined
    },
    experience: [],
    education: [],
    skills: {
      skills: [],
      languages: [],
      certificates: [],
      awards: []
    },
    selfIntroduction: {
      motivation: '',
      personality: '',
      experience: '',
      aspiration: ''
    },
    media: {
      introVideo: '',
      introVideos: [],
      portfolioVideos: [],
      mediaContent: [],
      externalLinks: [],
      portfolioPdfs: [],
      additionalDocuments: []
    }
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [visibleProgramIds, setVisibleProgramIds] = useState<string[]>(DEFAULT_VISIBLE_PROGRAM_IDS);
  const [savingProgramSettings, setSavingProgramSettings] = useState(false);

  // 과정 목록(정적+커스텀) — 기업별 열람 권한·과정 관리에서 공용 사용
  const [allPrograms, setAllPrograms] = useState<PortfolioProgram[]>(PORTFOLIO_PROGRAMS);
  // 기업별 과정 열람 권한 편집 초안: employerId → 허용 과정 id 배열
  const [programDrafts, setProgramDrafts] = useState<Record<string, string[]>>({});
  const [savingEmployerPrograms, setSavingEmployerPrograms] = useState<string | null>(null);
  // 매칭기간 일괄 조치 확인 모달: null | 'blockAll' | 'allowAll'
  const [bulkProgramAction, setBulkProgramAction] = useState<'blockAll' | 'allowAll' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  // 구직자 공개(기업정보 노출) 상태 저장 중인 기업 id / 일괄 처리 플래그
  const [savingJobSeekerVisibility, setSavingJobSeekerVisibility] = useState<string | null>(null);
  const [savingContactAccess, setSavingContactAccess] = useState<string | null>(null);
  const [bulkVisibilityProcessing, setBulkVisibilityProcessing] = useState(false);
  // 커스텀 과정 추가/수정 모달
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState({
    name: '',
    shortName: '',
    courseType: 'foreign' as ProgramCourseType,
    audience: '',
    hours: '',
    summary: '',
    overview: '',
    talentNote: '',
    youtubeInput: '',
    introVideoInput: '',
    aliasesText: '',
    tagsText: '',
    archived: false,
  });
  const [savingProgram, setSavingProgram] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<PortfolioProgram | null>(null);

  // 엑셀 내보내기 상태 (진행 중인 항목 키: 'jobseekers' | 'employers' | 'selections' | 'all')
  const [exporting, setExporting] = useState<string | null>(null);

  // 엑셀 내보내기 핸들러
  const handleExport = async (
    type: 'jobseekers' | 'employers' | 'selections' | 'all'
  ) => {
    if (exporting) return; // 중복 실행 방지
    try {
      setExporting(type);
      switch (type) {
        case 'jobseekers':
          await exportJobseekersToExcel();
          break;
        case 'employers':
          await exportEmployersToExcel();
          break;
        case 'selections':
          await exportSelectionsToExcel();
          break;
        case 'all':
          await exportAllToExcel();
          break;
      }
    } catch (error) {
      console.error('엑셀 내보내기 실패:', error);
      alert('엑셀 파일을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setExporting(null);
    }
  };

  // 필터링/검색 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  // 과정별 필터 — 제안서는 '대상 교육생이 소속된 과정' 기준, 포트폴리오는 본인 과정 기준
  const [inquiryProgramFilter, setInquiryProgramFilter] = useState<string>('all');
  const [inquiryCompanyFilter, setInquiryCompanyFilter] = useState<string>('all');
  const [inquiryAttendanceFilter, setInquiryAttendanceFilter] = useState<string>('all');
  const [inquirySort, setInquirySort] = useState<'recent' | 'oldest'>('recent');
  const [portfolioProgramFilter, setPortfolioProgramFilter] = useState<string>('all');
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState('');
  const [portfolioContactFilter, setPortfolioContactFilter] = useState<string>('all');
  const [portfolioHiddenFilter, setPortfolioHiddenFilter] = useState<string>('all');
  const [portfolioSort, setPortfolioSort] = useState<'recent' | 'name'>('recent');

  // 기업 탭 필터 (승인 대기/완료/거절 공용)
  const [employerSearch, setEmployerSearch] = useState('');
  const [employerIndustryFilter, setEmployerIndustryFilter] = useState<string>('all');
  const [employerAccessFilter, setEmployerAccessFilter] = useState<string>('all'); // all | full | partial | blocked
  const [employerProgramFilter, setEmployerProgramFilter] = useState<string>('all');
  const [employerHiddenFilter, setEmployerHiddenFilter] = useState<string>('all'); // all | visible | hidden
  const [employerDateRange, setEmployerDateRange] = useState({ start: '', end: '' });
  const [employerSort, setEmployerSort] = useState<'recent' | 'oldest' | 'name'>('recent');
  const [showEmployerFilters, setShowEmployerFilters] = useState(false);

  // Firestore Timestamp 와 JS Date 가 혼재하는 필드 안전 변환
  const toDateSafe = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value.toDate === 'function') return value.toDate();
    return null;
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setInquiryProgramFilter('all');
    setInquiryCompanyFilter('all');
    setInquiryAttendanceFilter('all');
    setInquirySort('recent');
  };

  const resetEmployerFilters = () => {
    setEmployerSearch('');
    setEmployerIndustryFilter('all');
    setEmployerAccessFilter('all');
    setEmployerProgramFilter('all');
    setEmployerHiddenFilter('all');
    setEmployerDateRange({ start: '', end: '' });
    setEmployerSort('recent');
  };

  const activeEmployerFilterCount =
    (employerIndustryFilter !== 'all' ? 1 : 0) +
    (employerAccessFilter !== 'all' ? 1 : 0) +
    (employerProgramFilter !== 'all' ? 1 : 0) +
    (employerHiddenFilter !== 'all' ? 1 : 0) +
    (employerDateRange.start ? 1 : 0) +
    (employerDateRange.end ? 1 : 0);

  // 열람 권한 분류: 필드 없음/전체 = full, 일부 = partial, 빈 배열 = blocked
  const getEmployerAccessCategory = (employer: PendingEmployer): 'full' | 'partial' | 'blocked' => {
    if (!Array.isArray(employer.allowedProgramIds)) return 'full';
    const validIds = allPrograms.map((program) => program.id);
    const allowed = employer.allowedProgramIds.filter((id) => validIds.includes(id));
    if (allowed.length === 0) return 'blocked';
    if (allowed.length >= validIds.length) return 'full';
    return 'partial';
  };

  // 업종 옵션 (전체 기업 기준, 많은 순)
  const employerIndustryOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    [...pendingEmployers, ...approvedEmployers, ...rejectedEmployers].forEach((employer) => {
      const industry = employer.company?.industry?.trim();
      if (industry) counts[industry] = (counts[industry] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [pendingEmployers, approvedEmployers, rejectedEmployers]);

  // 현재 탭의 기업 목록에 검색·필터·정렬 적용
  const displayedEmployers = useMemo(() => {
    const source =
      selectedTab === 'pending'
        ? pendingEmployers
        : selectedTab === 'approved'
        ? approvedEmployers
        : selectedTab === 'rejected'
        ? rejectedEmployers
        : [];

    const term = employerSearch.trim().toLowerCase();
    const filtered = source.filter((employer) => {
      if (term) {
        const haystack = [
          employer.company?.name,
          employer.userName,
          employer.userEmail,
          employer.company?.ceoName,
          employer.company?.industry,
          employer.company?.location,
          employer.company?.contactName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (employerIndustryFilter !== 'all' && employer.company?.industry?.trim() !== employerIndustryFilter) {
        return false;
      }
      if (employerAccessFilter !== 'all' && getEmployerAccessCategory(employer) !== employerAccessFilter) {
        return false;
      }
      if (employerProgramFilter !== 'all') {
        // 특정 과정을 열람할 수 있는 기업만 (필드 없음 = 전체 허용이므로 통과)
        if (
          Array.isArray(employer.allowedProgramIds) &&
          !employer.allowedProgramIds.includes(employerProgramFilter)
        ) {
          return false;
        }
      }
      if (employerHiddenFilter === 'visible' && employer.isHidden) return false;
      if (employerHiddenFilter === 'hidden' && !employer.isHidden) return false;

      const joined = toDateSafe(employer.createdAt);
      if (employerDateRange.start) {
        if (!joined || joined < new Date(employerDateRange.start)) return false;
      }
      if (employerDateRange.end) {
        const end = new Date(employerDateRange.end);
        end.setHours(23, 59, 59, 999);
        if (!joined || joined > end) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (employerSort === 'name') {
        return (a.company?.name || '').localeCompare(b.company?.name || '', 'ko');
      }
      const aTime = toDateSafe(a.createdAt)?.getTime() || 0;
      const bTime = toDateSafe(b.createdAt)?.getTime() || 0;
      return employerSort === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  }, [
    selectedTab,
    pendingEmployers,
    approvedEmployers,
    rejectedEmployers,
    employerSearch,
    employerIndustryFilter,
    employerAccessFilter,
    employerProgramFilter,
    employerHiddenFilter,
    employerDateRange,
    employerSort,
    allPrograms,
  ]);

  // 제안서 기업(회사명) 옵션 (건수 많은 순)
  const inquiryCompanyOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    jobInquiries.forEach((inquiry) => {
      const name = inquiry.companyInfo?.name?.trim();
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobInquiries]);

  // 교육생(포트폴리오) → 소속 과정 id 매핑. 과정을 알 수 없으면 'none'(과정 미지정).
  const portfolioProgramById = useMemo(() => {
    const map: Record<string, string> = {};
    portfolios.forEach((portfolio) => {
      const program = getProgramForPortfolio(portfolio as any, allPrograms);
      map[portfolio.id] = program ? program.id : 'none';
    });
    return map;
  }, [portfolios, allPrograms]);

  // 제안서 과정 필터 옵션에 표시할 건수 (전체 제안서 기준)
  const inquiryProgramCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobInquiries.forEach((inquiry) => {
      const key = portfolioProgramById[inquiry.jobSeekerId] || 'none';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [jobInquiries, portfolioProgramById]);

  // 포트폴리오 탭: 과정·연락처 공개·표시 상태·검색어 필터 + 정렬 적용 목록
  const displayedPortfolios = useMemo(() => {
    const term = portfolioSearchTerm.trim().toLowerCase();
    const filtered = portfolios.filter((portfolio) => {
      const programKey = portfolioProgramById[portfolio.id] || 'none';
      if (portfolioProgramFilter !== 'all' && programKey !== portfolioProgramFilter) return false;
      if (portfolioContactFilter === 'visible' && !portfolio.contactInfoVisibleToEmployers) return false;
      if (portfolioContactFilter === 'masked' && portfolio.contactInfoVisibleToEmployers) return false;
      if (portfolioHiddenFilter === 'visible' && portfolio.isHidden) return false;
      if (portfolioHiddenFilter === 'hidden' && !portfolio.isHidden) return false;
      if (!term) return true;
      return [portfolio.name, portfolio.speciality, ...(portfolio.skills || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
    return [...filtered].sort((a, b) => {
      if (portfolioSort === 'name') return (a.name || '').localeCompare(b.name || '', 'ko');
      const aTime = toDateSafe((a as any).createdAt)?.getTime() || 0;
      const bTime = toDateSafe((b as any).createdAt)?.getTime() || 0;
      return bTime - aTime;
    });
  }, [
    portfolios,
    portfolioProgramFilter,
    portfolioProgramById,
    portfolioSearchTerm,
    portfolioContactFilter,
    portfolioHiddenFilter,
    portfolioSort,
  ]);

  const activePortfolioFilterCount =
    (portfolioProgramFilter !== 'all' ? 1 : 0) +
    (portfolioContactFilter !== 'all' ? 1 : 0) +
    (portfolioHiddenFilter !== 'all' ? 1 : 0) +
    (portfolioSearchTerm.trim() ? 1 : 0);

  const resetPortfolioFilters = () => {
    setPortfolioProgramFilter('all');
    setPortfolioSearchTerm('');
    setPortfolioContactFilter('all');
    setPortfolioHiddenFilter('all');
    setPortfolioSort('recent');
  };

  // 페이지 로드시 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        if (authLoading) return;

        if (!user || !hasAdminAccess) {
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_auth_time');
          setIsAuthenticated(false);
          return;
        }

        const isAuth = sessionStorage.getItem('admin_authenticated');
        const authTime = sessionStorage.getItem('admin_auth_time');
        
        if (isAuth === 'true' && authTime) {
          // 인증 시간이 24시간 이내인 경우만 유효
          const timeDiff = Date.now() - parseInt(authTime);
          const isWithin24Hours = timeDiff < 24 * 60 * 60 * 1000; // 24시간
          
          if (isWithin24Hours) {
            setIsAuthenticated(true);
          } else {
            // 24시간 초과시 인증 해제
            sessionStorage.removeItem('admin_authenticated');
            sessionStorage.removeItem('admin_auth_time');
          }
        }
      } catch (error) {
        console.error('인증 상태 확인 중 오류:', error);
      } finally {
        if (!authLoading) {
          setIsInitializing(false);
        }
      }
    };

    checkAuthStatus();
  }, [authLoading, user, hasAdminAccess]);

  // 비밀번호 인증 처리
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      if (!user || !hasAdminAccess) {
        setAuthError('Firebase 관리자 권한이 있는 계정으로 먼저 로그인해주세요.');
        return;
      }

      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      if (password === adminPassword) {
        // sessionStorage에 인증 상태 저장 (탭 세션 동안 유지)
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_auth_time', Date.now().toString());
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('잘못된 관리자 비밀번호입니다.');
        setPassword('');
      }
    } catch (error) {
      setAuthError('인증 중 오류가 발생했습니다.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_auth_time');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleAccountSwitch = async () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_auth_time');

    try {
      await logOut();
    } catch (error) {
      console.error('계정 전환 로그아웃 실패:', error);
    } finally {
      window.location.href = '/auth';
    }
  };

  const canLoadAdminData = isAuthenticated && hasAdminAccess;

  // 과정 목록(정적+커스텀) + 노출 설정 — 기업별 열람 권한 UI 에서도 쓰므로 탭과 무관하게 로드
  useEffect(() => {
    if (!canLoadAdminData) return;
    (async () => {
      try {
        const [programs, ids] = await Promise.all([getAllPrograms(), getVisiblePortfolioProgramIds()]);
        setAllPrograms(programs);
        setVisibleProgramIds(ids);
      } catch (error) {
        console.error('과정 목록 로드 실패:', error);
      }
    })();
  }, [canLoadAdminData]);

  // 기업 목록 로드 — 사용자 정보 조회를 병렬화해 탭 카운트가 빠르게 채워지도록 한다.
  // (기존: 기업마다 순차 대기 → 48개 기업 기준 수 초간 카운트가 0으로 표시되던 원인)
  const buildEmployerLists = async () => {
    const employersData = await getAllEmployers(true); // 관리자는 숨겨진 기업도 포함

    const withUserInfo: PendingEmployer[] = await Promise.all(
      employersData.map(async (employer: any) => {
        let userInfo = { email: '', name: '' };
        try {
          const userDoc = await getDoc(doc(db, 'users', employer.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInfo = { email: userData.email || '', name: userData.name || '' };
          }
        } catch {
          // 사용자 문서가 없거나 조회 실패해도 기업 카드 자체는 표시한다
        }

        return {
          id: employer.id,
          userId: employer.userId,
          company: {
            ...(employer.company || {}),
            contactName: employer.company?.contactName || userInfo.name || '',
            contactPosition: employer.company?.contactPosition || '',
            contactPhone: employer.company?.contactPhone || '',
            companyAttraction: employer.company?.companyAttraction || {},
          },
          approvalStatus: employer.approvalStatus || 'pending',
          createdAt: employer.createdAt,
          userEmail: userInfo.email,
          userName: userInfo.name,
          rejectedReason: employer.rejectedReason,
          canceledReason: employer.canceledReason,
          approvedAt: employer.approvedAt,
          rejectedAt: employer.rejectedAt,
          canceledAt: employer.canceledAt,
          isHidden: employer.isHidden,
          allowedProgramIds: employer.allowedProgramIds,
          visibleToJobSeekers: employer.visibleToJobSeekers,
          canViewApplicantContacts: employer.canViewApplicantContacts,
        } as PendingEmployer;
      }),
    );

    return {
      pending: withUserInfo.filter((item) => item.approvalStatus === 'pending'),
      approved: withUserInfo.filter((item) => item.approvalStatus === 'approved'),
      rejected: withUserInfo.filter((item) => item.approvalStatus === 'rejected'),
    };
  };

  // 기업 목록 조회
  useEffect(() => {
    if (!canLoadAdminData) return;

    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const { pending, approved, rejected } = await buildEmployerLists();
        setPendingEmployers(pending);
        setApprovedEmployers(approved);
        setRejectedEmployers(rejected);
      } catch (error) {
        console.error('Error fetching employers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadAdminData]);

  // 채용 제안서 목록 조회 — 탭 카운트가 첫 화면부터 정확하도록 진입 즉시 로드 + 구직자 조회 병렬화
  useEffect(() => {
    if (!canLoadAdminData) return;

    const fetchJobInquiries = async () => {
      try {
        setInquiriesLoading(true);

        const inquiriesRef = collection(db, 'jobInquiries');
        const inquiriesSnapshot = await getDocs(inquiriesRef);

        const inquiries: JobInquiry[] = await Promise.all(
          inquiriesSnapshot.docs.map(async (docSnapshot) => {
          const inquiryData = docSnapshot.data();

          // 구직자 정보 조회
          let jobSeekerInfo = { name: '', email: '' };
          try {
            const jobSeekerDoc = await getDoc(doc(db, 'users', inquiryData.jobSeekerId));
            if (jobSeekerDoc.exists()) {
              const userData = jobSeekerDoc.data();
              jobSeekerInfo = {
                name: userData.name || '',
                email: userData.email || ''
              };
            }
          } catch {
            // 사용자 문서 조회 실패 시 기본값 유지
          }

          const inquiry: JobInquiry = {
            id: docSnapshot.id,
            jobSeekerId: inquiryData.jobSeekerId || '',
            employerId: inquiryData.employerId || '',
            portfolioId: inquiryData.portfolioId || '',
            proposedPosition: inquiryData.proposedPosition || '',
            proposedSalary: inquiryData.proposedSalary || '',
            message: inquiryData.message || '',
            jobCategory: inquiryData.jobCategory || '',
            workingHours: inquiryData.workingHours || '',
            workType: inquiryData.workType || '',
            benefits: inquiryData.benefits || [],
            companyInfo: inquiryData.companyInfo || {
              name: '',
              ceoName: '',
              industry: '',
              businessType: '',
              location: '',
              description: ''
            },
            recruiterInfo: inquiryData.recruiterInfo || {
              name: '',
              position: '',
              phone: '',
              email: ''
            },
            status: inquiryData.status || 'sent',
            sentAt: inquiryData.sentAt,
            readAt: inquiryData.readAt,
            respondedAt: inquiryData.respondedAt,
            jobSeekerName: jobSeekerInfo.name,
            jobSeekerEmail: jobSeekerInfo.email,
            matchingDayAttendance: inquiryData.matchingDayAttendance
          };

          return inquiry;
          }),
        );

        // 최신순으로 정렬
        inquiries.sort((a, b) => {
          const aDate = a.sentAt?.toDate?.() || new Date(0);
          const bDate = b.sentAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });

        setJobInquiries(inquiries);
        setFilteredInquiries(inquiries);
      } catch (error) {
        console.error('Error fetching job inquiries:', error);
      } finally {
        setInquiriesLoading(false);
      }
    };

    fetchJobInquiries();
  }, [canLoadAdminData]);

  // 포트폴리오 목록 조회 — 탭 카운트가 첫 화면부터 정확하도록 진입 즉시 로드
  useEffect(() => {
    if (!canLoadAdminData) return;

    const fetchPortfolios = async () => {
      try {
        setPortfoliosLoading(true);
        const portfolioData = await getAllPortfolios(true); // 관리자는 숨겨진 포트폴리오도 포함
        setPortfolios(portfolioData as Portfolio[]);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setPortfoliosLoading(false);
      }
    };

    fetchPortfolios();
  }, [canLoadAdminData]);

  // 필터링 로직
  useEffect(() => {
    let filtered = [...jobInquiries];

    // 텍스트 검색
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inquiry =>
        inquiry.companyInfo?.name?.toLowerCase().includes(term) ||
        inquiry.jobSeekerName?.toLowerCase().includes(term) ||
        inquiry.proposedPosition?.toLowerCase().includes(term) ||
        inquiry.jobCategory?.toLowerCase().includes(term) ||
        inquiry.recruiterInfo?.name?.toLowerCase().includes(term)
      );
    }

    // 상태별 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // 과정별 필터 — 제안 대상 교육생이 소속된 과정 기준
    if (inquiryProgramFilter !== 'all') {
      filtered = filtered.filter(
        (inquiry) => (portfolioProgramById[inquiry.jobSeekerId] || 'none') === inquiryProgramFilter,
      );
    }

    // 기업(회사명) 필터
    if (inquiryCompanyFilter !== 'all') {
      filtered = filtered.filter((inquiry) => inquiry.companyInfo?.name?.trim() === inquiryCompanyFilter);
    }

    // 매칭데이 참석 여부 필터 ('unknown' = 구버전 제안서로 미기재)
    if (inquiryAttendanceFilter !== 'all') {
      filtered = filtered.filter((inquiry) =>
        inquiryAttendanceFilter === 'unknown'
          ? !inquiry.matchingDayAttendance
          : inquiry.matchingDayAttendance === inquiryAttendanceFilter,
      );
    }

    // 날짜 범위 필터
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(inquiry => {
        const inquiryDate = inquiry.sentAt?.toDate?.() || new Date(inquiry.sentAt);
        return inquiryDate >= startDate;
      });
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // 해당 날짜 끝까지
      filtered = filtered.filter(inquiry => {
        const inquiryDate = inquiry.sentAt?.toDate?.() || new Date(inquiry.sentAt);
        return inquiryDate <= endDate;
      });
    }

    // 정렬 (기본 최신순 — 목록 자체가 최신순 로드이므로 오래된순만 뒤집는다)
    if (inquirySort === 'oldest') {
      filtered = [...filtered].reverse();
    }

    setFilteredInquiries(filtered);
  }, [
    jobInquiries,
    searchTerm,
    statusFilter,
    dateRange,
    inquiryProgramFilter,
    portfolioProgramById,
    inquiryCompanyFilter,
    inquiryAttendanceFilter,
    inquirySort,
  ]);

  // 기업 승인 처리
  const handleApprove = async (employerId: string) => {
    try {
      await updateDoc(doc(db, 'employers', employerId), {
        approvalStatus: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: 'admin'
      });
      
      // 목록 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error approving employer:', error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  // 기업 거절 처리
  const handleReject = async (employerId: string) => {
    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      await updateDoc(doc(db, 'employers', employerId), {
        approvalStatus: 'rejected',
        rejectedReason: rejectReason,
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin'
      });
      
      setRejectReason('');
      setSelectedEmployerId(null);
      
      // 목록 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting employer:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  // 승인 취소 처리
  const handleCancelApproval = async (employerId: string) => {
    if (!cancelReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    try {
      await updateDoc(doc(db, 'employers', employerId), {
        approvalStatus: 'rejected',
        canceledReason: cancelReason,
        canceledAt: serverTimestamp(),
        canceledBy: 'admin'
      });
      
      setCancelReason('');
      setSelectedCancelEmployerId(null);
      
      // 목록 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error canceling approval:', error);
      alert('승인 취소 처리 중 오류가 발생했습니다.');
    }
  };

  // 재승인 처리
  const handleReapprove = async (employerId: string) => {
    try {
      await updateDoc(doc(db, 'employers', employerId), {
        approvalStatus: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: 'admin',
        rejectedReason: null,
        canceledReason: null
      });
      
      // 목록 새로고침
      window.location.reload();
    } catch (error) {
      console.error('Error re-approving employer:', error);
      alert('재승인 처리 중 오류가 발생했습니다.');
    }
  };

  const getEmployersByTab = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingEmployers;
      case 'approved':
        return approvedEmployers;
      case 'rejected':
        return rejectedEmployers;
      default:
        return [];
    }
  };

  // 채용 제안서 상세 보기
  const openInquiryModal = (inquiry: JobInquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setSelectedInquiry(null);
    setShowInquiryModal(false);
  };

  // 포트폴리오 수정 모달 열기
  const openPortfolioModal = async (portfolio: Portfolio) => {
    try {
      setSelectedPortfolio(portfolio);
      
      // 전체 프로필 데이터 로드
      const fullProfileData = await getJobSeekerProfile(portfolio.userId);
      
      if (fullProfileData?.profile) {
        const profile = fullProfileData.profile;
        
        // 안전한 날짜 처리 함수
        const formatDateForInput = (dateValue: any) => {
          if (!dateValue) return '';
          
          try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.warn('Invalid date value:', dateValue);
            return '';
          }
        };
        
        setProfileFormData({
          basicInfo: {
            name: portfolio.name,
            email: fullProfileData.email || '',
            phone: profile.phone || portfolio.phone || '',
            address: profile.address || portfolio.address || '',
            dateOfBirth: formatDateForInput(profile.dateOfBirth || portfolio.dateOfBirth),
            speciality: profile.speciality || portfolio.speciality || '',
            profileImage: profile.profileImage || portfolio.profileImage || '',
            currentCourse: profile.currentCourse || portfolio.currentCourse || '',
            courseType: (profile as any).courseType || portfolio.courseType || undefined
          },
          experience: profile.experience || portfolio.experience || [],
          education: profile.education || portfolio.education || [],
          skills: {
            skills: profile.skills || portfolio.skills || [],
            languages: profile.languages || portfolio.languages || [],
            certificates: profile.certificates || portfolio.certificates || [],
            awards: profile.awards || portfolio.awards || []
          },
          selfIntroduction: profile.selfIntroduction || portfolio.selfIntroduction || {
            motivation: '',
            personality: '',
            experience: '',
            aspiration: ''
          },
          media: {
            introVideo: profile.introVideo || portfolio.introVideo || '',
            introVideos: profile.introVideos || portfolio.introVideos || [],
            portfolioVideos: profile.portfolioVideos || portfolio.portfolioVideos || [],
            mediaContent: profile.mediaContent || portfolio.mediaContent || [],
            externalLinks: profile.externalLinks || portfolio.externalLinks || [],
            portfolioPdfs: profile.portfolioPdfs || portfolio.portfolioPdfs || [],
            additionalDocuments: profile.additionalDocuments || (portfolio as any).additionalDocuments || []
          }
        });
      } else {
        // 기본 포트폴리오 데이터만 사용
        setProfileFormData({
          basicInfo: {
            name: portfolio.name,
            email: '',
            phone: portfolio.phone || '',
            address: portfolio.address || '',
            dateOfBirth: portfolio.dateOfBirth ? new Date(portfolio.dateOfBirth).toISOString().split('T')[0] : '',
            speciality: portfolio.speciality || '',
            profileImage: portfolio.profileImage || '',
            currentCourse: portfolio.currentCourse || '',
            courseType: portfolio.courseType || undefined
          },
          experience: portfolio.experience || [],
          education: portfolio.education || [],
          skills: {
            skills: portfolio.skills || [],
            languages: portfolio.languages || [],
            certificates: portfolio.certificates || [],
            awards: portfolio.awards || []
          },
          selfIntroduction: portfolio.selfIntroduction || {
            motivation: '',
            personality: '',
            experience: '',
            aspiration: ''
          },
          media: {
            introVideo: portfolio.introVideo || '',
            introVideos: portfolio.introVideos || [],
            portfolioVideos: portfolio.portfolioVideos || [],
            mediaContent: portfolio.mediaContent || [],
            externalLinks: portfolio.externalLinks || [],
            portfolioPdfs: portfolio.portfolioPdfs || [],
            additionalDocuments: (portfolio as any).additionalDocuments || []
          }
        });
      }
      
      setCurrentProfileStep(1);
      setShowPortfolioModal(true);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      alert('포트폴리오 데이터를 불러오는데 실패했습니다.');
    }
  };

  const closePortfolioModal = () => {
    setSelectedPortfolio(null);
    setShowPortfolioModal(false);
    setCurrentProfileStep(1);
    setProfileFormData({
      basicInfo: {
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        speciality: '',
        profileImage: '',
        currentCourse: '',
        courseType: undefined
      },
      experience: [],
      education: [],
      skills: {
        skills: [],
        languages: [],
        certificates: [],
        awards: []
      },
      selfIntroduction: {
        motivation: '',
        personality: '',
        experience: '',
        aspiration: ''
      },
      media: {
        introVideo: '',
        introVideos: [],
        portfolioVideos: [],
        mediaContent: [],
        externalLinks: [],
        portfolioPdfs: [],
        additionalDocuments: []
      }
    });
  };

  // 포트폴리오 숨김/표시 토글
  const handleTogglePortfolioVisibility = async (portfolioId: string, currentHidden: boolean) => {
    try {
      await togglePortfolioVisibility(portfolioId, !currentHidden);
      // 포트폴리오 목록 새로고침
      const portfolioData = await getAllPortfolios(true);
      setPortfolios(portfolioData as Portfolio[]);
    } catch (error) {
      console.error('포트폴리오 숨김 상태 변경 실패:', error);
      alert('포트폴리오 숨김 상태 변경에 실패했습니다.');
    }
  };

  const handleTogglePortfolioContactVisibility = async (portfolioId: string, currentVisible: boolean) => {
    try {
      await setPortfolioContactVisibility(portfolioId, !currentVisible, user?.uid);
      const portfolioData = await getAllPortfolios(true);
      setPortfolios(portfolioData as Portfolio[]);
    } catch (error) {
      console.error('포트폴리오 연락처 공개 상태 변경 실패:', error);
      alert('연락처 공개 상태 변경에 실패했습니다.');
    }
  };

  const handleToggleProgramVisibility = (programId: string) => {
    setVisibleProgramIds((prev) => {
      if (prev.includes(programId)) {
        return prev.filter((id) => id !== programId);
      }
      return [...prev, programId];
    });
  };

  const handleSaveProgramSettings = async () => {
    try {
      setSavingProgramSettings(true);
      await saveVisiblePortfolioProgramIds(visibleProgramIds);
      alert('기업에게 노출할 포트폴리오 과정 설정이 저장되었습니다.');
    } catch (error) {
      console.error('포트폴리오 과정 노출 설정 저장 실패:', error);
      alert('과정 노출 설정 저장에 실패했습니다.');
    } finally {
      setSavingProgramSettings(false);
    }
  };

  // ══════════════ 기업별 과정 열람 권한 ══════════════
  const allProgramIds = allPrograms.map((program) => program.id);

  // 저장된 권한(필드 없음 = 전체 허용)을 편집용 배열로 해석
  const resolveEmployerAllowedIds = (employer: PendingEmployer) =>
    Array.isArray(employer.allowedProgramIds)
      ? employer.allowedProgramIds.filter((id) => allProgramIds.includes(id))
      : allProgramIds;

  const getEmployerProgramDraft = (employer: PendingEmployer) =>
    programDrafts[employer.id] ?? resolveEmployerAllowedIds(employer);

  const isEmployerProgramDraftDirty = (employer: PendingEmployer) => {
    const draft = programDrafts[employer.id];
    if (!draft) return false;
    const saved = resolveEmployerAllowedIds(employer);
    return draft.length !== saved.length || draft.some((id) => !saved.includes(id));
  };

  const toggleEmployerProgram = (employer: PendingEmployer, programId: string) => {
    setProgramDrafts((prev) => {
      const current = prev[employer.id] ?? resolveEmployerAllowedIds(employer);
      const next = current.includes(programId)
        ? current.filter((id) => id !== programId)
        : [...current, programId];
      return { ...prev, [employer.id]: next };
    });
  };

  const setEmployerProgramDraft = (employer: PendingEmployer, ids: string[]) => {
    setProgramDrafts((prev) => ({ ...prev, [employer.id]: ids }));
  };

  const applyEmployerProgramsLocally = (employerId: string, ids: string[]) => {
    const patch = (list: PendingEmployer[]) =>
      list.map((item) => (item.id === employerId ? { ...item, allowedProgramIds: ids } : item));
    setApprovedEmployers((prev) => patch(prev));
    setPendingEmployers((prev) => patch(prev));
    setRejectedEmployers((prev) => patch(prev));
  };

  const saveEmployerPrograms = async (employer: PendingEmployer) => {
    const draft = getEmployerProgramDraft(employer);
    try {
      setSavingEmployerPrograms(employer.id);
      await updateDoc(doc(db, 'employers', employer.id), {
        allowedProgramIds: draft,
        allowedProgramsUpdatedAt: serverTimestamp(),
      });
      applyEmployerProgramsLocally(employer.id, draft);
      setProgramDrafts((prev) => {
        const next = { ...prev };
        delete next[employer.id];
        return next;
      });
    } catch (error) {
      console.error('기업 과정 열람 권한 저장 실패:', error);
      alert('열람 권한 저장에 실패했습니다.');
    } finally {
      setSavingEmployerPrograms(null);
    }
  };

  // 매칭기간 종료/재개용 일괄 조치 — 승인 완료 기업 전체에 적용
  const applyBulkProgramAction = async () => {
    if (!bulkProgramAction) return;
    const targetIds = bulkProgramAction === 'blockAll' ? [] : allProgramIds;
    try {
      setBulkProcessing(true);
      await Promise.all(
        approvedEmployers.map((employer) =>
          updateDoc(doc(db, 'employers', employer.id), {
            allowedProgramIds: targetIds,
            allowedProgramsUpdatedAt: serverTimestamp(),
          }),
        ),
      );
      setApprovedEmployers((prev) => prev.map((item) => ({ ...item, allowedProgramIds: targetIds })));
      setProgramDrafts({});
      setBulkProgramAction(null);
      alert(
        bulkProgramAction === 'blockAll'
          ? `승인 기업 ${approvedEmployers.length}곳의 포트폴리오 열람을 전면 차단했습니다.`
          : `승인 기업 ${approvedEmployers.length}곳에 모든 과정 열람을 허용했습니다.`,
      );
    } catch (error) {
      console.error('일괄 조치 실패:', error);
      alert('일괄 조치 중 오류가 발생했습니다. 목록을 새로고침해 상태를 확인해주세요.');
    } finally {
      setBulkProcessing(false);
    }
  };

  // ══════════════ 커스텀 과정 관리 (추가/수정/삭제) ══════════════
  const resetProgramForm = () => {
    setProgramForm({
      name: '',
      shortName: '',
      courseType: 'foreign',
      audience: '',
      hours: '',
      summary: '',
      overview: '',
      talentNote: '',
      youtubeInput: '',
      introVideoInput: '',
      aliasesText: '',
      tagsText: '',
      archived: false,
    });
  };

  const openCreateProgramModal = () => {
    resetProgramForm();
    setEditingProgramId(null);
    setProgramModalOpen(true);
  };

  const openEditProgramModal = (program: PortfolioProgram) => {
    setProgramForm({
      name: program.name,
      shortName: program.shortName,
      courseType: program.courseType,
      audience: program.audience,
      hours: program.hours,
      summary: program.summary,
      overview: program.overview || '',
      talentNote: program.talentNote || '',
      youtubeInput: program.youtubeId || '',
      introVideoInput: program.introVideoId || '',
      aliasesText: (program.aliases || []).join('\n'),
      tagsText: (program.tags || []).join(', '),
      archived: program.archived === true,
    });
    setEditingProgramId(program.id);
    setProgramModalOpen(true);
  };

  const reloadPrograms = async () => {
    invalidateProgramsCache();
    setAllPrograms(await getAllPrograms());
  };

  const handleSaveProgram = async () => {
    const { name, audience, hours, summary } = programForm;
    if (!name.trim() || !audience.trim() || !hours.trim() || !summary.trim()) {
      alert('과정명, 대상, 기간 표기, 요약은 필수 입력입니다.');
      return;
    }
    const youtubeId = normalizeYouTubeInput(programForm.youtubeInput);
    if (youtubeId === null) {
      alert('과정 소개 영상의 YouTube 주소를 해석할 수 없습니다. 전체 URL 또는 11자리 영상 ID를 입력해주세요.');
      return;
    }
    const introVideoId = normalizeYouTubeInput(programForm.introVideoInput);
    if (introVideoId === null) {
      alert('교육생 전체 자기소개 영상의 YouTube 주소를 해석할 수 없습니다. 전체 URL 또는 11자리 영상 ID를 입력해주세요.');
      return;
    }

    const input: CustomProgramInput = {
      name: programForm.name,
      shortName: programForm.shortName || programForm.name,
      courseType: programForm.courseType,
      audience: programForm.audience,
      hours: programForm.hours,
      summary: programForm.summary,
      overview: programForm.overview,
      talentNote: programForm.talentNote,
      youtubeId,
      introVideoId,
      aliases: programForm.aliasesText.split(/[\n,]/),
      tags: programForm.tagsText.split(','),
      archived: programForm.archived,
    };

    try {
      setSavingProgram(true);
      if (editingProgramId) {
        await updateCustomProgram(editingProgramId, input);
      } else {
        let programId = buildProgramId(input.name);
        while (allProgramIds.includes(programId)) programId = `${programId}-1`;
        await createCustomProgram(programId, input);
        // 새 과정은 즉시 노출 목록에 포함해 기업 화면에서 바로 선택 가능하게 한다
        const nextVisible = [...visibleProgramIds, programId];
        setVisibleProgramIds(nextVisible);
        await saveVisiblePortfolioProgramIds(nextVisible);
      }
      await reloadPrograms();
      setProgramModalOpen(false);
      setEditingProgramId(null);
      resetProgramForm();
    } catch (error) {
      console.error('과정 저장 실패:', error);
      alert('과정 저장에 실패했습니다.');
    } finally {
      setSavingProgram(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!deletingProgram) return;
    try {
      setSavingProgram(true);
      await deleteCustomProgram(deletingProgram.id);
      const nextVisible = visibleProgramIds.filter((id) => id !== deletingProgram.id);
      setVisibleProgramIds(nextVisible);
      await saveVisiblePortfolioProgramIds(nextVisible);
      await reloadPrograms();
      setDeletingProgram(null);
    } catch (error) {
      console.error('과정 삭제 실패:', error);
      alert('과정 삭제에 실패했습니다.');
    } finally {
      setSavingProgram(false);
    }
  };

  // 기업 정보 숨김/표시 토글
  const handleToggleEmployerVisibility = async (employerId: string, currentHidden: boolean) => {
    try {
      await toggleEmployerVisibility(employerId, !currentHidden);
      // 기업 목록 새로고침 (allowedProgramIds 등 전체 필드 유지)
      const { pending, approved, rejected } = await buildEmployerLists();
      setPendingEmployers(pending);
      setApprovedEmployers(approved);
      setRejectedEmployers(rejected);
    } catch (error) {
      console.error('기업 숨김 상태 변경 실패:', error);
      alert('기업 숨김 상태 변경에 실패했습니다.');
    }
  };

  // 구직자 공개(기업정보 노출) 토글 — true 인 기업만 /companies 에서 구직자·비로그인에게 노출된다
  const handleToggleJobSeekerVisibility = async (employerId: string, currentVisible: boolean) => {
    try {
      setSavingJobSeekerVisibility(employerId);
      await setEmployerJobSeekerVisibility(employerId, !currentVisible);
      const { pending, approved, rejected } = await buildEmployerLists();
      setPendingEmployers(pending);
      setApprovedEmployers(approved);
      setRejectedEmployers(rejected);
    } catch (error) {
      console.error('구직자 공개 상태 변경 실패:', error);
      alert('구직자 공개 상태 변경에 실패했습니다.');
    } finally {
      setSavingJobSeekerVisibility(null);
    }
  };

  // 연락처 열람 권한 토글 — true 인 기업만 구직자 주소·이메일·전화를 볼 수 있다 (기본 전면 비공개)
  const handleToggleEmployerContactAccess = async (employerId: string, currentCanView: boolean) => {
    try {
      setSavingContactAccess(employerId);
      await setEmployerContactAccess(employerId, !currentCanView);
      const { pending, approved, rejected } = await buildEmployerLists();
      setPendingEmployers(pending);
      setApprovedEmployers(approved);
      setRejectedEmployers(rejected);
    } catch (error) {
      console.error('연락처 열람 권한 변경 실패:', error);
      alert('연락처 열람 권한 변경에 실패했습니다.');
    } finally {
      setSavingContactAccess(null);
    }
  };

  // 구직자 공개 일괄 조치 — 승인 완료 기업 전체에 적용(예: 이번 과정 기업만 일괄 공개)
  const applyBulkJobSeekerVisibility = async (visible: boolean) => {
    const count = approvedEmployers.length;
    if (count === 0) return;
    const ok = window.confirm(
      visible
        ? `승인 완료 기업 ${count}곳을 모두 구직자에게 공개하시겠습니까?`
        : `승인 완료 기업 ${count}곳을 모두 구직자에게 비공개로 전환하시겠습니까?`,
    );
    if (!ok) return;
    try {
      setBulkVisibilityProcessing(true);
      await Promise.all(approvedEmployers.map((employer) => setEmployerJobSeekerVisibility(employer.id, visible)));
      const { pending, approved, rejected } = await buildEmployerLists();
      setPendingEmployers(pending);
      setApprovedEmployers(approved);
      setRejectedEmployers(rejected);
      alert(visible ? `${count}곳을 구직자에게 공개했습니다.` : `${count}곳을 구직자에게 비공개로 전환했습니다.`);
    } catch (error) {
      console.error('구직자 공개 일괄 조치 실패:', error);
      alert('일괄 조치 중 오류가 발생했습니다. 목록을 새로고침해 상태를 확인해주세요.');
    } finally {
      setBulkVisibilityProcessing(false);
    }
  };

  // 포트폴리오 업데이트
  const handleProfileSave = async () => {
    if (!selectedPortfolio) return;

    try {
      setSavingProfile(true);

      // Update user profile
      await updateUserProfile(selectedPortfolio.userId, {
        name: profileFormData.basicInfo.name
      });

      // Prepare profile data
      const profileData = {
        phone: profileFormData.basicInfo.phone || '',
        address: profileFormData.basicInfo.address || '',
        dateOfBirth: profileFormData.basicInfo.dateOfBirth || null,
        speciality: profileFormData.basicInfo.speciality || '',
        profileImage: profileFormData.basicInfo.profileImage || '',
        currentCourse: profileFormData.basicInfo.currentCourse || '',
        courseType: profileFormData.basicInfo.courseType || null,
        experience: profileFormData.experience,
        education: profileFormData.education,
        skills: profileFormData.skills.skills,
        languages: profileFormData.skills.languages,
        certificates: profileFormData.skills.certificates,
        awards: profileFormData.skills.awards,
        selfIntroduction: profileFormData.selfIntroduction,
        introVideo: profileFormData.media.introVideo,
        introVideos: profileFormData.media.introVideos,
        portfolioVideos: profileFormData.media.portfolioVideos,
        mediaContent: profileFormData.media.mediaContent,
        externalLinks: profileFormData.media.externalLinks,
        portfolioPdfs: profileFormData.media.portfolioPdfs,
        additionalDocuments: profileFormData.media.additionalDocuments
      };

      // Update jobseeker profile
      await updateJobSeekerProfile(selectedPortfolio.userId, profileData);

      // Update portfolio
      await registerPortfolio(selectedPortfolio.userId, {
        name: profileFormData.basicInfo.name,
        speciality: profileFormData.basicInfo.speciality || '일반',
        phone: profileFormData.basicInfo.phone,
        address: profileFormData.basicInfo.address,
        skills: profileFormData.skills.skills,
        languages: profileFormData.skills.languages,
        experience: profileFormData.experience,
        education: profileFormData.education,
        description: profileFormData.selfIntroduction.motivation || `${profileFormData.basicInfo.speciality || '일반'} 전문가입니다.`,
        currentCourse: profileFormData.basicInfo.currentCourse || '',
        courseType: profileFormData.basicInfo.courseType || undefined,

        // 새로 추가된 필드들
        certificates: profileFormData.skills.certificates,
        awards: profileFormData.skills.awards,
        introVideo: profileFormData.media.introVideo,
        introVideos: profileFormData.media.introVideos,
        portfolioVideos: profileFormData.media.portfolioVideos,
        selfIntroduction: profileFormData.selfIntroduction,
        mediaContent: profileFormData.media.mediaContent,
        externalLinks: profileFormData.media.externalLinks,
        portfolioPdfs: profileFormData.media.portfolioPdfs,
        additionalDocuments: profileFormData.media.additionalDocuments
      });

      alert('프로필이 성공적으로 수정되었습니다!');
      closePortfolioModal();
      
      // 포트폴리오 목록 새로고침
      const portfolioData = await getAllPortfolios();
      setPortfolios(portfolioData as Portfolio[]);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingProfile(false);
    }
  };

  // 프로필 수정 스텝 렌더링
  const renderProfileStepContent = () => {
    switch (currentProfileStep) {
      case 1:
        return (
          <BasicInfoStep
            data={profileFormData.basicInfo}
            onChange={(data) => setProfileFormData({ ...profileFormData, basicInfo: data })}
          />
        );
      case 2:
        return (
          <ExperienceStep
            data={profileFormData.experience}
            onChange={(data) => setProfileFormData({ ...profileFormData, experience: data })}
          />
        );
      case 3:
        return (
          <EducationStep
            data={profileFormData.education}
            onChange={(data) => setProfileFormData({ ...profileFormData, education: data })}
          />
        );
      case 4:
        return (
          <SkillsStep
            data={profileFormData.skills}
            onChange={(data) => setProfileFormData({ ...profileFormData, skills: data })}
          />
        );
      case 5:
        return (
          <IntroductionStep
            data={profileFormData.selfIntroduction}
            onChange={(data) => setProfileFormData({ ...profileFormData, selfIntroduction: data })}
          />
        );
      case 6:
        return (
          <MediaStep
            data={profileFormData.media}
            onChange={(data) => setProfileFormData({ ...profileFormData, media: data })}
          />
        );
      default:
        return null;
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 상태 뱃지 컴포넌트
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { tone: 'azure' | 'mint' | 'honey' | 'coral' | 'neutral'; text: string }> = {
      sent: { tone: 'azure', text: '발송됨' },
      read: { tone: 'honey', text: '읽음' },
      responded: { tone: 'neutral', text: '응답함' },
      accepted: { tone: 'mint', text: '수락됨' },
      rejected: { tone: 'coral', text: '거절됨' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent;

    return (
      <Badge tone={config.tone}>{config.text}</Badge>
    );
  };

  // 초기화 중일 때 로딩 화면 표시
  if (isInitializing || authLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 flex items-center justify-center">
        <AuroraBackground />
        <div className="relative z-10 text-center glass-card px-12 py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500 mx-auto"></div>
          <p className="mt-5 text-ink-500 font-medium">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 flex items-center justify-center py-12 px-5 sm:px-8">
        <AuroraBackground variant="vivid" />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="glass-strong rounded-4xl shadow-glass-lg p-8 sm:p-10 space-y-7 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-coral-400 to-coral-600 rounded-3xl flex items-center justify-center shadow-glow">
              <LockClosedIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-3xl tracking-tight text-ink-900 mb-3">
                관리자 권한이 필요합니다
              </h2>
              <p className="text-ink-500 leading-relaxed">
                현재 로그인된 계정에는 관리자 권한이 없습니다. 관리자 계정으로 다시 로그인한 뒤 관리자 비밀번호를 입력해주세요.
              </p>
            </div>
            <GlassButton onClick={handleAccountSwitch} className="w-full">
              로그아웃 후 관리자 계정으로 로그인
            </GlassButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 flex items-center justify-center py-12 px-5 sm:px-8">
        <AuroraBackground variant="vivid" />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="glass-strong rounded-4xl shadow-glass-lg p-8 sm:p-10 space-y-8">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-azure-500 to-azure-600 rounded-3xl flex items-center justify-center mb-6 shadow-glow">
                <LockClosedIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-display font-bold text-3xl tracking-tight text-ink-900 mb-2">
                관리자 인증
              </h2>
              <p className="text-ink-500 leading-relaxed">
                관리자 대시보드에 접근하려면 비밀번호를 입력해주세요
              </p>
            </div>

            <form onSubmit={handleAuthentication} className="mt-8 space-y-6">
              <div>
                <label htmlFor="admin-password" className="sr-only">
                  관리자 비밀번호
                </label>
                <div className="relative">
                  <GlassInput
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12"
                    placeholder="관리자 비밀번호"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-ink-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-ink-400 hover:text-azure-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-ink-400 hover:text-azure-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="rounded-2xl bg-coral-100/70 border border-coral-400/30 p-4">
                  <div className="text-sm text-coral-600 font-medium">
                    {authError}
                  </div>
                </div>
              )}

              <div>
                <GlassButton
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white mr-2"></div>
                      인증 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </GlassButton>
              </div>
            </form>

            <div className="text-center text-sm text-ink-400">
              <p>면접심사 매칭 플랫폼 관리자 대시보드</p>
              <p className="mt-1">무단 접근을 금지합니다</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 flex items-center justify-center">
        <AuroraBackground />
        <div className="relative z-10 text-center glass-card px-12 py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500 mx-auto"></div>
          <p className="mt-5 text-ink-500 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 메인 관리자 대시보드
  return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 py-10 lg:py-16">
        <AuroraBackground />
      {/* 주의: 이 래퍼에 z-10 을 주면 스택 컨텍스트가 생겨 내부의 fixed 모달이
          전역 네비(z-50) 아래에 갇힌다. Aurora 는 DOM 순서만으로 뒤에 깔리므로 z 불필요. */}
      <div className="relative mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <ScrollReveal className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                Admin Console
              </span>
              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-ink-900 mb-3">기업 회원 관리</h1>
              <p className="text-ink-500 text-base md:text-lg leading-relaxed">기업 회원가입 승인 및 관리</p>
            </div>
            <GlassButton
              onClick={handleLogout}
              variant="secondary"
              size="sm"
            >
              로그아웃
            </GlassButton>
          </div>
        </ScrollReveal>

        {/* 데이터 내보내기 (엑셀) */}
        <div className="glass-card p-6 md:p-7 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                <TableCellsIcon className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-semibold text-lg text-ink-900">데이터 내보내기</h3>
                <p className="text-sm text-ink-500 mt-0.5">구직자·기업·선택 기록을 엑셀(.xlsx) 파일로 다운로드합니다.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <GlassButton
                onClick={() => handleExport('jobseekers')}
                disabled={exporting !== null}
                variant="secondary"
                size="sm"
              >
                {exporting === 'jobseekers' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
                )}
                구직자 정보 (엑셀)
              </GlassButton>
              <GlassButton
                onClick={() => handleExport('employers')}
                disabled={exporting !== null}
                variant="secondary"
                size="sm"
              >
                {exporting === 'employers' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
                )}
                기업 정보 (엑셀)
              </GlassButton>
              <GlassButton
                onClick={() => handleExport('selections')}
                disabled={exporting !== null}
                variant="secondary"
                size="sm"
              >
                {exporting === 'selections' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
                )}
                선택 기록 (엑셀)
              </GlassButton>
              <GlassButton
                onClick={() => handleExport('all')}
                disabled={exporting !== null}
                size="sm"
              >
                {exporting === 'all' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
                )}
                전체 통합 (엑셀)
              </GlassButton>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8 glass rounded-3xl p-2 flex flex-wrap gap-1 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`relative py-2.5 px-4 rounded-2xl font-medium text-sm transition-colors duration-300 ${
              selectedTab === 'pending'
                ? 'text-white'
                : 'text-ink-500 hover:text-azure-700 hover:bg-azure-50/60'
            }`}
          >
            {selectedTab === 'pending' && (
              <motion.span layoutId="adminActiveTab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              승인 대기 ({pendingEmployers.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`relative py-2.5 px-4 rounded-2xl font-medium text-sm transition-colors duration-300 ${
              selectedTab === 'approved'
                ? 'text-white'
                : 'text-ink-500 hover:text-azure-700 hover:bg-azure-50/60'
            }`}
          >
            {selectedTab === 'approved' && (
              <motion.span layoutId="adminActiveTab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              승인 완료 ({approvedEmployers.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`relative py-2.5 px-4 rounded-2xl font-medium text-sm transition-colors duration-300 ${
              selectedTab === 'rejected'
                ? 'text-white'
                : 'text-ink-500 hover:text-azure-700 hover:bg-azure-50/60'
            }`}
          >
            {selectedTab === 'rejected' && (
              <motion.span layoutId="adminActiveTab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <div className="flex items-center">
              <XCircleIcon className="w-5 h-5 mr-2" />
              거절됨 ({rejectedEmployers.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('inquiries')}
            className={`relative py-2.5 px-4 rounded-2xl font-medium text-sm transition-colors duration-300 ${
              selectedTab === 'inquiries'
                ? 'text-white'
                : 'text-ink-500 hover:text-azure-700 hover:bg-azure-50/60'
            }`}
          >
            {selectedTab === 'inquiries' && (
              <motion.span layoutId="adminActiveTab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-2" />
              채용 제안서 ({jobInquiries.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab('portfolios')}
            className={`relative py-2.5 px-4 rounded-2xl font-medium text-sm transition-colors duration-300 ${
              selectedTab === 'portfolios'
                ? 'text-white'
                : 'text-ink-500 hover:text-azure-700 hover:bg-azure-50/60'
            }`}
          >
            {selectedTab === 'portfolios' && (
              <motion.span layoutId="adminActiveTab" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <div className="flex items-center">
              <PencilIcon className="w-5 h-5 mr-2" />
              포트폴리오 ({portfolios.length})
            </div>
          </button>
        </div>

        {/* 채용 제안서 목록 */}
        {selectedTab === 'inquiries' && (
          <div className="space-y-6">
            {/* 검색 및 필터 UI */}
            <div className="glass-card p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
                <h3 className="font-semibold text-xl text-ink-900">
                  채용 제안서 관리 ({filteredInquiries.length}개 / 총 {jobInquiries.length}개)
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-2 rounded-2xl border transition-all duration-300 font-medium text-sm ${
                      showFilters
                        ? 'bg-azure-50 border-azure-200 text-azure-700'
                        : 'bg-white/70 backdrop-blur-md border-white/70 text-ink-600 hover:bg-white/90 shadow-glass-sm'
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    필터
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm font-medium text-ink-500 hover:text-azure-700 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>

              {/* 검색 바 + 과정 필터 (과정 필터는 핵심 기능이라 접힘 없이 상시 노출) */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400 z-10" />
                  <GlassInput
                    type="text"
                    placeholder="회사명, 구직자명, 제안 직무, 담당자명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11"
                  />
                </div>
                <div className="flex items-center gap-2.5 sm:shrink-0">
                  <AcademicCapIcon className="h-5 w-5 shrink-0 text-azure-500" />
                  <GlassSelect
                    value={inquiryProgramFilter}
                    onChange={(e) => setInquiryProgramFilter(e.target.value)}
                    className="sm:w-72"
                    aria-label="교육생 소속 과정으로 필터"
                  >
                    <option value="all">전체 과정 ({jobInquiries.length})</option>
                    {allPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.shortName} ({inquiryProgramCounts[program.id] || 0})
                      </option>
                    ))}
                    {(inquiryProgramCounts['none'] || 0) > 0 && (
                      <option value="none">과정 미지정 ({inquiryProgramCounts['none']})</option>
                    )}
                  </GlassSelect>
                </div>
              </div>

              {/* 필터 옵션 */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-azure-50/50 border border-white/60 rounded-3xl">
                  {/* 상태 필터 */}
                  <Field label="상태">
                    <GlassSelect
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">전체</option>
                      <option value="sent">발송됨</option>
                      <option value="read">읽음</option>
                      <option value="responded">응답함</option>
                      <option value="accepted">수락됨</option>
                      <option value="rejected">거절됨</option>
                    </GlassSelect>
                  </Field>

                  {/* 기업 필터 */}
                  <Field label="신청 기업">
                    <GlassSelect
                      value={inquiryCompanyFilter}
                      onChange={(e) => setInquiryCompanyFilter(e.target.value)}
                    >
                      <option value="all">전체 기업 ({jobInquiries.length})</option>
                      {inquiryCompanyOptions.map(([name, count]) => (
                        <option key={name} value={name}>
                          {name} ({count})
                        </option>
                      ))}
                    </GlassSelect>
                  </Field>

                  {/* 매칭데이 참석 여부 */}
                  <Field label="매칭데이(7/22) 참석">
                    <GlassSelect
                      value={inquiryAttendanceFilter}
                      onChange={(e) => setInquiryAttendanceFilter(e.target.value)}
                    >
                      <option value="all">전체</option>
                      <option value="attend">참석 가능</option>
                      <option value="unavailable">참석 불가</option>
                      <option value="unknown">미기재 (구버전 신청서)</option>
                    </GlassSelect>
                  </Field>

                  {/* 시작 날짜 */}
                  <Field label="시작 날짜">
                    <GlassInput
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </Field>

                  {/* 종료 날짜 */}
                  <Field label="종료 날짜">
                    <GlassInput
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </Field>

                  {/* 정렬 */}
                  <Field label="정렬">
                    <GlassSelect
                      value={inquirySort}
                      onChange={(e) => setInquirySort(e.target.value as 'recent' | 'oldest')}
                    >
                      <option value="recent">최신 발송순</option>
                      <option value="oldest">오래된 발송순</option>
                    </GlassSelect>
                  </Field>
                </div>
              )}
            </div>

            {/* 제안서 목록 */}
            <div className="grid gap-6">
              {inquiriesLoading ? (
                <div className="glass-card text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azure-200 border-t-azure-500"></div>
                  <p className="mt-3 text-ink-500 font-medium">채용 제안서를 불러오는 중...</p>
                </div>
              ) : filteredInquiries.length === 0 ? (
                <div className="glass-card text-center py-16">
                  {jobInquiries.length === 0 ? (
                    <>
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-azure-50 flex items-center justify-center">
                        <EnvelopeIcon className="h-8 w-8 text-azure-500" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink-900">채용 제안서가 없습니다</h3>
                      <p className="mt-1 text-sm text-ink-500">아직 기업에서 보낸 채용 제안서가 없습니다.</p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-azure-50 flex items-center justify-center">
                        <MagnifyingGlassIcon className="h-8 w-8 text-azure-500" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-ink-900">검색 결과가 없습니다</h3>
                      <p className="mt-1 text-sm text-ink-500">검색 조건을 변경하거나 필터를 초기화해보세요.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 md:p-8 transition-shadow duration-300 hover:shadow-glass-lg"
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-ink-900">
                              {inquiry.companyInfo?.name || '회사명 미확인'}
                            </h3>
                            <span className="text-ink-300">→</span>
                            <span className="text-lg font-medium text-azure-600">
                              {inquiry.jobSeekerName || '구직자명 미확인'}
                            </span>
                          </div>
                          <StatusBadge status={inquiry.status} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-5">
                          <div className="space-y-2">
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">제안 직무:</span> {inquiry.proposedPosition}
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">직무 카테고리:</span> {inquiry.jobCategory}
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">제안 급여:</span> {inquiry.proposedSalary}
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">근무 형태:</span> {inquiry.workType}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">근무 시간:</span> {inquiry.workingHours}
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">담당자:</span> {inquiry.recruiterInfo?.name} ({inquiry.recruiterInfo?.position})
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">담당자 연락처:</span> {inquiry.recruiterInfo?.phone}
                            </p>
                            <p className="text-ink-500">
                              <span className="font-medium text-ink-700">발송일:</span> {formatDate(inquiry.sentAt)}
                            </p>
                          </div>
                        </div>

                        {inquiry.benefits && inquiry.benefits.length > 0 && (
                          <div className="mb-5">
                            <p className="text-sm font-medium text-ink-700 mb-2">복리후생</p>
                            <div className="flex flex-wrap gap-2">
                              {inquiry.benefits.map((benefit, index) => (
                                <Badge key={index} tone="azure">{benefit}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-2">
                          <p className="text-sm font-medium text-ink-700 mb-2">채용 제안 메시지 (미리보기)</p>
                          <p className="text-sm text-ink-500 leading-relaxed line-clamp-3">
                            {inquiry.message.length > 150
                              ? `${inquiry.message.substring(0, 150)}...`
                              : inquiry.message}
                          </p>
                        </div>
                      </div>

                      <div className="lg:ml-6 shrink-0">
                        <GlassButton
                          onClick={() => openInquiryModal(inquiry)}
                          size="sm"
                        >
                          상세 보기
                        </GlassButton>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 기업 목록 */}
        {/* 매칭기간 일괄 관리 — 승인 완료 탭 상단 */}
        {selectedTab === 'approved' && approvedEmployers.length > 0 && (
          <div className="glass-card p-6 md:p-7 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                  <AcademicCapIcon className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-lg text-ink-900">매칭기간 열람 일괄 관리</h3>
                  <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">
                    매칭기간이 끝나면 전면 차단으로 교육생 개인정보 열람을 막고, 다음 매칭 시작 시 다시 허용하세요.
                    기업별 세부 권한은 아래 각 기업 카드에서 조정할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <GlassButton
                  onClick={() => setBulkProgramAction('blockAll')}
                  variant="secondary"
                  size="sm"
                  className="!text-coral-600"
                >
                  <LockClosedIcon className="w-4 h-4 mr-1.5" />
                  전체 기업 열람 차단
                </GlassButton>
                <GlassButton onClick={() => setBulkProgramAction('allowAll')} variant="secondary" size="sm">
                  <LockOpenIcon className="w-4 h-4 mr-1.5" />
                  전체 기업 모든 과정 허용
                </GlassButton>
              </div>
            </div>
          </div>
        )}

        {/* 구직자 공개 일괄 관리 — 승인 완료 탭 상단 */}
        {selectedTab === 'approved' && approvedEmployers.length > 0 && (
          <div className="glass-card p-6 md:p-7 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                  <BuildingOfficeIcon className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-lg text-ink-900">기업정보 구직자 공개 관리</h3>
                  <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">
                    <span className="font-semibold text-azure-700">‘구직자 공개’로 켠 기업만</span> 구직자에게 노출되며, 그중에서도 아래
                    <span className="font-semibold text-azure-700"> ‘포트폴리오 열람 권한’에 체크한 과정</span>의 구직자에게만 표시됩니다
                    (권한이 비어 있으면 전체 과정 구직자에게 노출). 지난 과정 기업은 공개를 끄거나 과정을 지정하면 현재 구직자에게서 자연스럽게 숨겨집니다.
                    <span className="font-semibold text-ink-600"> 기본값은 비공개.</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <GlassButton
                  onClick={() => applyBulkJobSeekerVisibility(false)}
                  variant="secondary"
                  size="sm"
                  disabled={bulkVisibilityProcessing}
                  className="!text-coral-600"
                >
                  <EyeSlashIcon className="w-4 h-4 mr-1.5" />
                  전체 비공개
                </GlassButton>
                <GlassButton
                  onClick={() => applyBulkJobSeekerVisibility(true)}
                  variant="secondary"
                  size="sm"
                  disabled={bulkVisibilityProcessing}
                >
                  <EyeIcon className="w-4 h-4 mr-1.5" />
                  전체 공개
                </GlassButton>
              </div>
            </div>
          </div>
        )}

        {/* 기업 검색·필터 툴바 (승인 대기/완료/거절 공용) */}
        {['pending', 'approved', 'rejected'].includes(selectedTab) && (
          <div className="glass-card p-5 md:p-6 mb-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 z-10 w-5 h-5 -translate-y-1/2 text-ink-400" />
                <GlassInput
                  type="text"
                  placeholder="회사명, 담당자, 이메일, 대표자, 업종, 지역으로 검색..."
                  value={employerSearch}
                  onChange={(e) => setEmployerSearch(e.target.value)}
                  className="pl-11"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5 lg:shrink-0">
                <GlassSelect
                  value={employerSort}
                  onChange={(e) => setEmployerSort(e.target.value as 'recent' | 'oldest' | 'name')}
                  className="sm:w-44"
                  aria-label="정렬"
                >
                  <option value="recent">최신 가입순</option>
                  <option value="oldest">오래된 가입순</option>
                  <option value="name">회사명순</option>
                </GlassSelect>
                <button
                  onClick={() => setShowEmployerFilters(!showEmployerFilters)}
                  className={`relative inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    showEmployerFilters || activeEmployerFilterCount > 0
                      ? 'border-azure-300 bg-azure-500/10 text-azure-700 shadow-glass-sm'
                      : 'border-white/70 bg-white/60 text-ink-500 hover:border-azure-200 hover:text-azure-700'
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  상세 필터
                  {activeEmployerFilterCount > 0 && (
                    <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-azure-500 px-1.5 text-[11px] font-bold text-white">
                      {activeEmployerFilterCount}
                    </span>
                  )}
                </button>
                {(activeEmployerFilterCount > 0 || employerSearch.trim()) && (
                  <button
                    onClick={resetEmployerFilters}
                    className="px-3 py-2 text-sm font-medium text-ink-500 hover:text-azure-700 transition-colors"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            {showEmployerFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-3xl border border-white/60 bg-azure-50/50 p-5 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="업종">
                  <GlassSelect
                    value={employerIndustryFilter}
                    onChange={(e) => setEmployerIndustryFilter(e.target.value)}
                  >
                    <option value="all">전체 업종</option>
                    {employerIndustryOptions.map(([industry, count]) => (
                      <option key={industry} value={industry}>
                        {industry} ({count})
                      </option>
                    ))}
                  </GlassSelect>
                </Field>

                <Field label="포트폴리오 열람 권한">
                  <GlassSelect
                    value={employerAccessFilter}
                    onChange={(e) => setEmployerAccessFilter(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="full">전체 과정 허용</option>
                    <option value="partial">일부 과정만 허용</option>
                    <option value="blocked">전면 차단</option>
                  </GlassSelect>
                </Field>

                <Field label="특정 과정 열람 가능 기업">
                  <GlassSelect
                    value={employerProgramFilter}
                    onChange={(e) => setEmployerProgramFilter(e.target.value)}
                  >
                    <option value="all">전체 과정</option>
                    {allPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.shortName}
                      </option>
                    ))}
                  </GlassSelect>
                </Field>

                <Field label="표시 상태">
                  <GlassSelect
                    value={employerHiddenFilter}
                    onChange={(e) => setEmployerHiddenFilter(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="visible">표시 중</option>
                    <option value="hidden">숨김</option>
                  </GlassSelect>
                </Field>

                <Field label="가입일 시작">
                  <GlassInput
                    type="date"
                    value={employerDateRange.start}
                    onChange={(e) => setEmployerDateRange({ ...employerDateRange, start: e.target.value })}
                  />
                </Field>

                <Field label="가입일 종료">
                  <GlassInput
                    type="date"
                    value={employerDateRange.end}
                    onChange={(e) => setEmployerDateRange({ ...employerDateRange, end: e.target.value })}
                  />
                </Field>
              </div>
            )}

            <p className="mt-4 text-sm text-ink-500">
              <span className="font-semibold text-ink-700">{displayedEmployers.length}개</span> 표시
              <span className="text-ink-300"> / 총 {getEmployersByTab().length}개</span>
            </p>
          </div>
        )}

        {selectedTab !== 'inquiries' && (
          <div className="grid gap-6">
            {['pending', 'approved', 'rejected'].includes(selectedTab) &&
              displayedEmployers.length === 0 &&
              getEmployersByTab().length > 0 && (
                <div className="glass-card text-center py-16">
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-azure-50 flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-8 w-8 text-azure-500" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink-900">조건에 맞는 기업이 없습니다</h3>
                  <p className="mt-1 text-sm text-ink-500">검색어나 필터를 조정해보세요.</p>
                  <button
                    onClick={resetEmployerFilters}
                    className="mt-4 text-sm font-semibold text-azure-600 transition-colors hover:text-azure-700"
                  >
                    필터 초기화
                  </button>
                </div>
              )}
            {displayedEmployers.map((employer) => (
              <motion.div
                key={employer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 md:p-8"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-azure-50 text-azure-500 mr-1">
                          <BuildingOfficeIcon className="w-6 h-6" />
                        </span>
                        <h3 className="text-xl font-semibold text-ink-900">
                          {employer.company.name || '회사명 미입력'}
                        </h3>
                        {/* 상태 배지 추가 */}
                        <Badge tone={
                          employer.approvalStatus === 'approved'
                            ? 'mint'
                            : employer.approvalStatus === 'rejected'
                            ? 'coral'
                            : 'honey'
                        }>
                          {employer.approvalStatus === 'approved' ? '승인됨' :
                           employer.approvalStatus === 'rejected' ? '거절됨' : '대기중'}
                        </Badge>
                        {/* 숨김 상태 표시 */}
                        {employer.isHidden && (
                          <Badge tone="neutral" icon={<EyeSlashIcon className="w-3 h-3" />}>
                            숨김
                          </Badge>
                        )}
                        {/* 구직자 공개 상태 표시 (승인 완료 기업만 의미 있음) */}
                        {employer.approvalStatus === 'approved' && (
                          employer.visibleToJobSeekers ? (
                            <Badge tone="mint" icon={<EyeIcon className="w-3 h-3" />}>
                              구직자 공개
                            </Badge>
                          ) : (
                            <Badge tone="coral" icon={<EyeSlashIcon className="w-3 h-3" />}>
                              구직자 비공개
                            </Badge>
                          )
                        )}
                      </div>

                      {/* 상세 정보 펼치기/접기 버튼 */}
                      <button
                        onClick={() => toggleEmployerDetails(employer.id)}
                        className="text-sm font-medium text-azure-600 hover:text-azure-700 flex items-center transition-colors"
                      >
                        {expandedEmployers.has(employer.id) ? (
                          <>
                            <span>간단히 보기</span>
                            <ChevronUpIcon className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            <span>상세 보기</span>
                            <ChevronDownIcon className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="space-y-2">
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">담당자:</span> {employer.userName}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">이메일:</span> {employer.userEmail}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">대표자:</span> {employer.company.ceoName || '-'}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">업종:</span> {employer.company.industry || '-'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">규모:</span> {employer.company.size || '-'}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">위치:</span> {employer.company.location || '-'}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">웹사이트:</span> {employer.company.website || '-'}
                        </p>
                        <p className="text-ink-500">
                          <span className="font-medium text-ink-700">가입일:</span>{' '}
                          {/* getAllEmployers 가 이미 Date 로 변환해 넘기므로 Timestamp/Date 모두 처리 */}
                          {toDateSafe(employer.createdAt)?.toLocaleDateString() || '-'}
                        </p>
                      </div>
                    </div>

                    {employer.company.description && (
                      <div className="mt-5">
                        <p className="text-sm font-medium text-ink-700 mb-1">회사 소개</p>
                        <p className="text-sm text-ink-500 leading-relaxed">{employer.company.description}</p>
                      </div>
                    )}
                    
                    {/* 상세 정보 영역 - 펼쳐졌을 때만 표시 */}
                    {expandedEmployers.has(employer.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 border-t border-ink-100 pt-5"
                      >
                        <h4 className="text-base font-semibold text-ink-900 mb-4">상세 정보</h4>

                        {/* 담당자 상세 정보 */}
                        <div className="mb-6">
                          <h5 className="text-sm font-medium text-ink-700 mb-2">담당자 정보</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm bg-white/50 border border-white/60 p-4 rounded-2xl">
                            <div className="space-y-2">
                              <p className="text-ink-500">
                                <span className="font-medium text-ink-700">담당자명:</span> {employer.company.contactName || employer.userName || '-'}
                              </p>
                              <p className="text-ink-500">
                                <span className="font-medium text-ink-700">직위:</span> {employer.company.contactPosition || '-'}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-ink-500">
                                <span className="font-medium text-ink-700">연락처:</span> {employer.company.contactPhone || '-'}
                              </p>
                              <p className="text-ink-500">
                                <span className="font-medium text-ink-700">이메일:</span> {employer.userEmail || '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 기업 매력도 정보 */}
                        {employer.company.companyAttraction && Object.keys(employer.company.companyAttraction).length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-sm font-medium text-ink-700 mb-2">기업 매력도 정보</h5>
                            <div className="bg-azure-50/60 border border-white/60 p-5 rounded-2xl">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div className="space-y-2">
                                  {employer.company.companyAttraction.workingHours && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">근무시간:</span> {employer.company.companyAttraction.workingHours}
                                    </p>
                                  )}
                                  {employer.company.companyAttraction.remoteWork !== undefined && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">재택근무:</span> {employer.company.companyAttraction.remoteWork ? '가능' : '불가능'}
                                    </p>
                                  )}
                                  {employer.company.companyAttraction.averageSalary && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">평균 연봉:</span> {employer.company.companyAttraction.averageSalary}
                                    </p>
                                  )}
                                  {employer.company.companyAttraction.growthOpportunity !== undefined && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">성장 기회:</span> {employer.company.companyAttraction.growthOpportunity ? '우수' : '보통'}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {employer.company.companyAttraction.stockOptions !== undefined && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">스톡옵션:</span> {employer.company.companyAttraction.stockOptions ? '제공' : '미제공'}
                                    </p>
                                  )}
                                  {employer.company.companyAttraction.trainingSupport !== undefined && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">교육 지원:</span> {employer.company.companyAttraction.trainingSupport ? '지원' : '미지원'}
                                    </p>
                                  )}
                                  {employer.company.companyAttraction.familyFriendly !== undefined && (
                                    <p className="text-ink-500">
                                      <span className="font-medium text-ink-700">가족친화 기업:</span> {employer.company.companyAttraction.familyFriendly ? '해당' : '해당 없음'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* 복리후생 */}
                              {employer.company.companyAttraction.benefits && employer.company.companyAttraction.benefits.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-ink-700 mb-1">복리후생</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {employer.company.companyAttraction.benefits.map((benefit, index) => (
                                      <Badge key={index} tone="azure">{benefit}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 기타 사항 */}
                              {employer.company.companyAttraction.etc && (
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-ink-700 mb-1">기타 사항</p>
                                  <p className="text-sm text-ink-500 leading-relaxed">{employer.company.companyAttraction.etc}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* 승인 정보 표시 */}
                    {employer.approvalStatus === 'approved' && employer.approvedAt && (
                      <div className="mt-4 p-4 bg-mint-100/60 border border-mint-400/30 rounded-2xl">
                        <p className="text-sm font-semibold text-mint-600">승인 정보</p>
                        <p className="text-sm text-mint-600/90 mt-0.5">
                          승인일: {employer.approvedAt?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* 거절 사유 표시 */}
                    {employer.approvalStatus === 'rejected' && employer.rejectedReason && (
                      <div className="mt-4 p-4 bg-coral-100/60 border border-coral-400/30 rounded-2xl">
                        <p className="text-sm font-semibold text-coral-600">거절 사유</p>
                        <p className="text-sm text-coral-600/90 mt-0.5">{employer.rejectedReason}</p>
                        {employer.rejectedAt && (
                          <p className="text-sm text-coral-500/80 mt-1">
                            거절일: {employer.rejectedAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 승인 취소 사유 표시 */}
                    {employer.approvalStatus === 'rejected' && employer.canceledReason && (
                      <div className="mt-4 p-4 bg-honey-100/60 border border-honey-400/30 rounded-2xl">
                        <p className="text-sm font-semibold text-honey-600">승인 취소 사유</p>
                        <p className="text-sm text-honey-600/90 mt-0.5">{employer.canceledReason}</p>
                        {employer.canceledAt && (
                          <p className="text-sm text-honey-500/80 mt-1">
                            취소일: {employer.canceledAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="lg:ml-6 shrink-0 w-full lg:w-auto">
                    <div className="flex flex-col space-y-2">
                      {/* 숨김/표시 토글 버튼 */}
                      <GlassButton
                        onClick={() => handleToggleEmployerVisibility(employer.id, employer.isHidden || false)}
                        variant={employer.isHidden ? 'primary' : 'secondary'}
                        size="sm"
                      >
                        {employer.isHidden ? (
                          <>
                            <EyeIcon className="w-4 h-4 mr-1" />
                            표시
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="w-4 h-4 mr-1" />
                            숨김
                          </>
                        )}
                      </GlassButton>

                      {/* 구직자 공개 토글 (승인 완료 기업만) — 구직자·비로그인 방문자에게 기업정보 노출 여부 */}
                      {employer.approvalStatus === 'approved' && (
                        <GlassButton
                          onClick={() => handleToggleJobSeekerVisibility(employer.id, employer.visibleToJobSeekers || false)}
                          variant={employer.visibleToJobSeekers ? 'secondary' : 'primary'}
                          size="sm"
                          disabled={savingJobSeekerVisibility === employer.id}
                        >
                          {savingJobSeekerVisibility === employer.id ? (
                            '저장 중...'
                          ) : employer.visibleToJobSeekers ? (
                            <>
                              <EyeSlashIcon className="w-4 h-4 mr-1" />
                              구직자 비공개로
                            </>
                          ) : (
                            <>
                              <EyeIcon className="w-4 h-4 mr-1" />
                              구직자 공개
                            </>
                          )}
                        </GlassButton>
                      )}

                      {/* 연락처 열람 권한 토글 (승인 완료 기업만) — 이 기업이 구직자 주소·이메일·전화를 볼 수 있는지.
                          기본은 전면 비공개, 관리자가 허용한 기업만 열람 가능. */}
                      {employer.approvalStatus === 'approved' && (
                        <GlassButton
                          onClick={() => handleToggleEmployerContactAccess(employer.id, employer.canViewApplicantContacts || false)}
                          variant={employer.canViewApplicantContacts ? 'secondary' : 'primary'}
                          size="sm"
                          disabled={savingContactAccess === employer.id}
                        >
                          {savingContactAccess === employer.id ? (
                            '저장 중...'
                          ) : employer.canViewApplicantContacts ? (
                            <>
                              <LockClosedIcon className="w-4 h-4 mr-1" />
                              연락처 열람 차단
                            </>
                          ) : (
                            <>
                              <EnvelopeIcon className="w-4 h-4 mr-1" />
                              연락처 열람 허용
                            </>
                          )}
                        </GlassButton>
                      )}

                      {/* 승인 대기 상태 */}
                      {employer.approvalStatus === 'pending' && (
                        <>
                          <GlassButton
                            onClick={() => handleApprove(employer.id)}
                            size="sm"
                            className="!bg-gradient-to-r !from-mint-500 !to-mint-500 hover:!from-mint-500 hover:!to-mint-500 !text-white"
                          >
                            승인
                          </GlassButton>
                          <GlassButton
                            onClick={() => setSelectedEmployerId(employer.id)}
                            size="sm"
                            className="!bg-gradient-to-r !from-coral-500 !to-coral-500 hover:!from-coral-500 hover:!to-coral-500 !text-white"
                          >
                            거절
                          </GlassButton>
                        </>
                      )}

                      {/* 승인 완료 상태 */}
                      {employer.approvalStatus === 'approved' && (
                        <GlassButton
                          onClick={() => setSelectedCancelEmployerId(employer.id)}
                          size="sm"
                          className="!bg-gradient-to-r !from-honey-500 !to-honey-500 hover:!from-honey-500 hover:!to-honey-500 !text-white"
                        >
                          승인 취소
                        </GlassButton>
                      )}

                      {/* 거절됨 상태 */}
                      {employer.approvalStatus === 'rejected' && (
                        <GlassButton
                          onClick={() => handleReapprove(employer.id)}
                          size="sm"
                        >
                          재승인
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </div>

                {/* 기업별 과정 열람 권한 — 체크한 과정의 교육생만 열람 가능. 전부 해제 = 전면 차단(매칭기간 종료) */}
                {employer.approvalStatus === 'approved' && (() => {
                  const draft = getEmployerProgramDraft(employer);
                  const dirty = isEmployerProgramDraftDirty(employer);
                  const saving = savingEmployerPrograms === employer.id;
                  return (
                    <div className="mt-6 border-t border-ink-100 pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-azure-50 text-azure-500">
                            <AcademicCapIcon className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold text-ink-900">포트폴리오 열람 권한 · 구직자 노출 과정</h4>
                            <p className="mt-0.5 text-xs text-ink-400">체크한 과정의 교육생 포트폴리오를 열람하고, ‘구직자 공개’ 시 해당 과정 구직자에게만 이 기업이 노출됩니다</p>
                          </div>
                          <Badge
                            tone={draft.length === 0 ? 'coral' : draft.length === allProgramIds.length ? 'mint' : 'azure'}
                          >
                            {draft.length === 0
                              ? '전면 차단'
                              : draft.length === allProgramIds.length
                              ? '전체 허용'
                              : `${draft.length}개 과정 허용`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEmployerProgramDraft(employer, allProgramIds)}
                            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-azure-50 hover:text-azure-700"
                          >
                            전체 허용
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmployerProgramDraft(employer, [])}
                            className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink-500 transition hover:bg-coral-100/60 hover:text-coral-600"
                          >
                            전체 차단
                          </button>
                          {dirty && (
                            <GlassButton onClick={() => saveEmployerPrograms(employer)} disabled={saving} size="sm">
                              {saving ? '저장 중...' : '권한 저장'}
                            </GlassButton>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {allPrograms.map((program) => {
                          const checked = draft.includes(program.id);
                          return (
                            <button
                              key={program.id}
                              type="button"
                              onClick={() => toggleEmployerProgram(employer, program.id)}
                              className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                                checked
                                  ? 'border-azure-300 bg-azure-500/10 text-azure-700 shadow-glass-sm'
                                  : 'border-ink-100 bg-white/60 text-ink-400 hover:border-azure-200 hover:text-ink-600'
                              }`}
                            >
                              {checked ? (
                                <CheckCircleIcon className="h-4 w-4 text-azure-500" />
                              ) : (
                                <XCircleIcon className="h-4 w-4 text-ink-300" />
                              )}
                              {program.shortName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 거절 사유 입력 모달 */}
                {selectedEmployerId === employer.id && (
                  <div className="mt-5 p-5 bg-azure-50/50 border border-white/60 rounded-3xl">
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      거절 사유
                    </label>
                    <GlassTextarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="거절 사유를 입력해주세요..."
                    />
                    <div className="mt-3 flex space-x-2">
                      <GlassButton
                        onClick={() => handleReject(employer.id)}
                        size="sm"
                        className="!bg-gradient-to-r !from-coral-500 !to-coral-500 hover:!from-coral-500 hover:!to-coral-500 !text-white"
                      >
                        거절 확인
                      </GlassButton>
                      <GlassButton
                        onClick={() => {
                          setSelectedEmployerId(null);
                          setRejectReason('');
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        취소
                      </GlassButton>
                    </div>
                  </div>
                )}

                {/* 승인 취소 사유 입력 모달 */}
                {selectedCancelEmployerId === employer.id && (
                  <div className="mt-5 p-5 bg-azure-50/50 border border-white/60 rounded-3xl">
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      승인 취소 사유
                    </label>
                    <GlassTextarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      placeholder="승인 취소 사유를 입력해주세요..."
                    />
                    <div className="mt-3 flex space-x-2">
                      <GlassButton
                        onClick={() => handleCancelApproval(employer.id)}
                        size="sm"
                        className="!bg-gradient-to-r !from-honey-500 !to-honey-500 hover:!from-honey-500 hover:!to-honey-500 !text-white"
                      >
                        승인 취소
                      </GlassButton>
                      <GlassButton
                        onClick={() => {
                          setSelectedCancelEmployerId(null);
                          setCancelReason('');
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        취소
                      </GlassButton>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* 포트폴리오 관리 탭 */}
        {selectedTab === 'portfolios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-ink-900">
                포트폴리오 관리 ({portfolios.length}개)
              </h3>
            </div>

            <GlassCard className="p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-azure-500" />
                    <h4 className="font-display text-lg font-bold tracking-tight text-ink-900">
                      과정 관리
                    </h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    기업 화면에 노출할 과정을 체크로 관리하고, 연도별 과정(예: 2025 수료 과정)을 직접 추가할 수 있습니다.
                    체크 해제한 과정은 기업 화면의 과정 선택 카드에서 숨겨집니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:shrink-0">
                  <GlassButton onClick={openCreateProgramModal} variant="secondary" size="sm">
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    새 과정 추가
                  </GlassButton>
                  <GlassButton
                    onClick={handleSaveProgramSettings}
                    disabled={savingProgramSettings}
                    size="sm"
                  >
                    {savingProgramSettings ? '저장 중...' : '노출 설정 저장'}
                  </GlassButton>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {allPrograms.map((program) => {
                  const visible = visibleProgramIds.includes(program.id);
                  const programCount = portfolios.filter((portfolio) =>
                    portfolioMatchesProgram(portfolio, program.id, allPrograms)
                  ).length;

                  return (
                    <div
                      key={program.id}
                      className={`flex items-start gap-4 rounded-3xl border p-4 transition-all ${
                        visible
                          ? 'border-azure-200 bg-azure-50/70 shadow-glass-sm'
                          : 'border-white/70 bg-white/55 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => handleToggleProgramVisibility(program.id)}
                        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-azure-200 text-azure-600 focus:ring-azure-400"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink-900">{program.name}</span>
                          <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
                            {program.audience}
                          </Badge>
                          <Badge tone="neutral">{programCount}명</Badge>
                          {program.isCustom && <Badge tone="honey">관리자 추가</Badge>}
                          {program.archived && <Badge tone="neutral">상단 탭 분리</Badge>}
                          {(program.introVideoId || program.youtubeId) && (
                            <Badge tone="mint" icon={<PlayCircleIcon className="w-3.5 h-3.5" />}>
                              영상
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500">{program.summary}</p>
                        {program.isCustom && (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProgramModal(program)}
                              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-azure-600 transition hover:bg-azure-100/70"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProgram(program)}
                              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-coral-500 transition hover:bg-coral-100/60"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {portfoliosLoading ? (
              <div className="glass-card text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-azure-200 border-t-azure-500"></div>
                <p className="mt-3 text-ink-500 font-medium">포트폴리오를 불러오는 중...</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="glass-card text-center py-16">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-azure-50 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-azure-500" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-900">포트폴리오가 없습니다</h3>
                <p className="mt-1 text-sm text-ink-500">등록된 포트폴리오가 없습니다.</p>
              </div>
            ) : (
              <>
                {/* 과정별·검색 필터 — 과정을 선택하면 해당 과정 교육생의 포트폴리오만 표시 */}
                <div className="glass-card p-4 md:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 z-10 w-5 h-5 -translate-y-1/2 text-ink-400" />
                      <GlassInput
                        type="text"
                        placeholder="이름, 전문분야, 스킬로 검색..."
                        value={portfolioSearchTerm}
                        onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 sm:shrink-0">
                      <AcademicCapIcon className="h-5 w-5 shrink-0 text-azure-500" />
                      <GlassSelect
                        value={portfolioProgramFilter}
                        onChange={(e) => setPortfolioProgramFilter(e.target.value)}
                        className="sm:w-72"
                        aria-label="과정으로 필터"
                      >
                        <option value="all">전체 과정 ({portfolios.length})</option>
                        {allPrograms.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.shortName} (
                            {portfolios.filter((p) => (portfolioProgramById[p.id] || 'none') === program.id).length})
                          </option>
                        ))}
                        {portfolios.some((p) => (portfolioProgramById[p.id] || 'none') === 'none') && (
                          <option value="none">
                            과정 미지정 (
                            {portfolios.filter((p) => (portfolioProgramById[p.id] || 'none') === 'none').length})
                          </option>
                        )}
                      </GlassSelect>
                    </div>
                    <Badge tone="azure" className="hidden self-center px-3.5 py-1.5 sm:inline-flex">
                      {displayedPortfolios.length}명 표시
                    </Badge>
                  </div>

                  {/* 2행: 상태·정렬 필터 */}
                  <div className="mt-3 flex flex-wrap items-center gap-2.5">
                    <GlassSelect
                      value={portfolioContactFilter}
                      onChange={(e) => setPortfolioContactFilter(e.target.value)}
                      className="w-auto sm:w-44"
                      aria-label="연락처 공개 상태"
                    >
                      <option value="all">연락처: 전체</option>
                      <option value="visible">연락처 공개 중</option>
                      <option value="masked">연락처 비공개</option>
                    </GlassSelect>
                    <GlassSelect
                      value={portfolioHiddenFilter}
                      onChange={(e) => setPortfolioHiddenFilter(e.target.value)}
                      className="w-auto sm:w-40"
                      aria-label="표시 상태"
                    >
                      <option value="all">표시: 전체</option>
                      <option value="visible">표시 중</option>
                      <option value="hidden">숨김</option>
                    </GlassSelect>
                    <GlassSelect
                      value={portfolioSort}
                      onChange={(e) => setPortfolioSort(e.target.value as 'recent' | 'name')}
                      className="w-auto sm:w-36"
                      aria-label="정렬"
                    >
                      <option value="recent">최신 등록순</option>
                      <option value="name">이름순</option>
                    </GlassSelect>
                    {activePortfolioFilterCount > 0 && (
                      <button
                        onClick={resetPortfolioFilters}
                        className="px-3 py-2 text-sm font-medium text-ink-500 hover:text-azure-700 transition-colors"
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                {displayedPortfolios.length === 0 ? (
                  <div className="glass-card text-center py-16">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-azure-50 flex items-center justify-center">
                      <MagnifyingGlassIcon className="h-8 w-8 text-azure-500" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-ink-900">조건에 맞는 포트폴리오가 없습니다</h3>
                    <p className="mt-1 text-sm text-ink-500">과정 필터나 검색어를 조정해보세요.</p>
                    <button
                      onClick={() => {
                        setPortfolioProgramFilter('all');
                        setPortfolioSearchTerm('');
                      }}
                      className="mt-4 text-sm font-semibold text-azure-600 transition-colors hover:text-azure-700"
                    >
                      필터 초기화
                    </button>
                  </div>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {displayedPortfolios.map((portfolio) => {
                  const specialities = splitSpecialities(portfolio.speciality);
                  const program = getProgramForPortfolio(portfolio as any, allPrograms);
                  return (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="glass-card flex h-full min-w-0 flex-col p-5 transition-shadow duration-300 hover:shadow-glass-lg"
                  >
                    {/* 헤더: 아바타 + 이름 + 과정 (상태 배지는 이름 옆 한 줄) */}
                    <div className="flex items-start gap-3">
                      {portfolio.profileImage ? (
                        <img
                          src={portfolio.profileImage}
                          alt={portfolio.name}
                          className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-white/70 shadow-glass-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-azure-50">
                          <UserIcon className="h-6 w-6 text-azure-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="truncate font-semibold text-ink-900">{portfolio.name}</h4>
                          {portfolio.isHidden && (
                            <Badge tone="neutral" icon={<EyeSlashIcon className="h-3 w-3" />}>
                              숨김
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                          <AcademicCapIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{program?.shortName || portfolio.currentCourse || '과정 미지정'}</span>
                        </p>
                      </div>
                    </div>

                    {/* 전문분야 */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {specialities.length > 0 ? (
                        <>
                          {specialities.slice(0, 3).map((speciality) => (
                            <Badge key={speciality} tone="azure" className="max-w-[11rem] truncate">
                              {speciality}
                            </Badge>
                          ))}
                          {specialities.length > 3 && <Badge tone="neutral">+{specialities.length - 3}</Badge>}
                        </>
                      ) : (
                        <Badge tone="neutral">전문분야 미입력</Badge>
                      )}
                    </div>

                    {/* 연락처·주소 — 값이 없어도 행을 유지해 카드 정렬이 흔들리지 않게 한다 */}
                    <div className="mt-4 space-y-1.5 rounded-2xl border border-white/70 bg-white/55 p-3.5 text-sm">
                      <div className="flex items-center gap-2 text-ink-600">
                        <PhoneIcon className="h-4 w-4 shrink-0 text-azure-500" />
                        <span className="truncate">{portfolio.phone || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink-600">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-azure-500" />
                        <span className="truncate">{portfolio.address || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink-600">
                        <BriefcaseIcon className="h-4 w-4 shrink-0 text-azure-500" />
                        <span className="min-w-0 truncate">
                          {(portfolio.skills || []).length > 0
                            ? `${portfolio.skills.slice(0, 3).join(', ')}${portfolio.skills.length > 3 ? ` 외 ${portfolio.skills.length - 3}개` : ''}`
                            : '스킬 미입력'}
                        </span>
                      </div>
                    </div>

                    {/* 관리 토글 — 아이콘 대신 상태가 읽히는 명시적 컨트롤 */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          handleTogglePortfolioContactVisibility(
                            portfolio.id,
                            portfolio.contactInfoVisibleToEmployers || false,
                          )
                        }
                        className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all ${
                          portfolio.contactInfoVisibleToEmployers
                            ? 'border-mint-400/50 bg-mint-100/70 text-mint-600 hover:bg-mint-100'
                            : 'border-ink-100 bg-white/60 text-ink-500 hover:border-azure-200 hover:text-azure-700'
                        }`}
                        title={portfolio.contactInfoVisibleToEmployers ? '클릭 시 연락처 공개 차단' : '클릭 시 연락처 공개 승인'}
                      >
                        {portfolio.contactInfoVisibleToEmployers ? (
                          <EnvelopeIcon className="h-4 w-4" />
                        ) : (
                          <LockClosedIcon className="h-4 w-4" />
                        )}
                        {portfolio.contactInfoVisibleToEmployers ? '연락처 공개 중' : '연락처 비공개'}
                      </button>
                      <button
                        onClick={() => handleTogglePortfolioVisibility(portfolio.id, portfolio.isHidden || false)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold transition-all ${
                          portfolio.isHidden
                            ? 'border-honey-400/50 bg-honey-100/70 text-honey-600 hover:bg-honey-100'
                            : 'border-ink-100 bg-white/60 text-ink-500 hover:border-azure-200 hover:text-azure-700'
                        }`}
                        title={portfolio.isHidden ? '클릭 시 목록에 표시' : '클릭 시 목록에서 숨김'}
                      >
                        {portfolio.isHidden ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        {portfolio.isHidden ? '숨김 상태' : '표시 중'}
                      </button>
                    </div>

                    {/* 하단 고정 액션 — mt-auto 로 카드 높이가 달라도 항상 바닥에 정렬 */}
                    <div className="mt-auto pt-3.5">
                      <div className="flex items-center gap-2 border-t border-ink-100 pt-3.5">
                        <a
                          href={`/portfolios/${portfolio.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 px-3 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:from-azure-400 hover:to-azure-500"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          상세 새 창
                        </a>
                        <button
                          onClick={() => openPortfolioModal(portfolio)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3.5 py-2 text-sm font-semibold text-azure-700 shadow-glass-sm transition hover:bg-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                          수정
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 포트폴리오 수정 모달 */}
        <AnimatePresence>
          {showPortfolioModal && selectedPortfolio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong rounded-4xl shadow-glass-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
              >
                {/* 모달 헤더 */}
                <div className="bg-gradient-to-r from-azure-500 via-sky-cool-400 to-azure-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-tight">포트폴리오 수정</h2>
                      <p className="text-white/80 text-sm mt-0.5">{selectedPortfolio.name}님의 프로필</p>
                    </div>
                    <button
                      onClick={closePortfolioModal}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* 스텝 네비게이션 */}
                <div className="px-6 py-4 border-b border-ink-100 bg-white/40">
                  <StepNavigation
                    steps={profileEditSteps}
                    currentStep={currentProfileStep}
                    onStepClick={setCurrentProfileStep}
                  />
                </div>

                {/* 스텝 콘텐츠 */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* 프로필 이미지 관리 섹션 - 모든 스텝에서 표시 */}
                  <div className="mb-6">
                    <ProfileImageManager
                      currentImageUrl={profileFormData.basicInfo.profileImage}
                      userId={selectedPortfolio?.userId || ''}
                      userName={selectedPortfolio?.name || ''}
                      onImageUpdate={(imageUrl) => {
                        setProfileFormData(prev => ({
                          ...prev,
                          basicInfo: {
                            ...prev.basicInfo,
                            profileImage: imageUrl
                          }
                        }));
                      }}
                    />
                  </div>

                  {renderProfileStepContent()}
                </div>

                {/* 모달 푸터 */}
                <div className="px-6 py-4 border-t border-ink-100 bg-white/40">
                  <div className="flex justify-between items-center">
                    <GlassButton
                      onClick={() => setCurrentProfileStep(Math.max(1, currentProfileStep - 1))}
                      disabled={currentProfileStep === 1}
                      variant="secondary"
                      size="sm"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      이전 단계
                    </GlassButton>

                    <div className="flex items-center space-x-3">
                      {/* 단계 표시 */}
                      <span className="text-sm text-ink-500 font-medium">
                        {currentProfileStep} / {profileEditSteps.length}
                      </span>

                      {currentProfileStep === profileEditSteps.length ? (
                        <>
                          <GlassButton
                            onClick={closePortfolioModal}
                            variant="secondary"
                            size="sm"
                          >
                            취소
                          </GlassButton>
                          <GlassButton
                            onClick={handleProfileSave}
                            disabled={savingProfile}
                            size="sm"
                          >
                            {savingProfile ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white mr-2"></div>
                                저장 중...
                              </div>
                            ) : (
                              '수정 완료'
                            )}
                          </GlassButton>
                        </>
                      ) : (
                        <GlassButton
                          onClick={() => setCurrentProfileStep(Math.min(profileEditSteps.length, currentProfileStep + 1))}
                          size="sm"
                        >
                          다음 단계
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </GlassButton>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 채용 제안서 상세 모달 */}
        {showInquiryModal && selectedInquiry && (
          <JobInquiryDetailModal
            isOpen={showInquiryModal}
            inquiry={selectedInquiry}
            onClose={closeInquiryModal}
            showJobSeekerName={true}
          />
        )}

        {/* 커스텀 과정 추가/수정 모달 */}
        <AnimatePresence>
          {programModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
              onClick={() => !savingProgram && setProgramModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong rounded-4xl shadow-glass-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-azure-500 via-sky-cool-400 to-azure-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-tight">
                        {editingProgramId ? '과정 수정' : '새 과정 추가'}
                      </h2>
                      <p className="text-white/80 text-sm mt-0.5">
                        {editingProgramId ? '커스텀 과정 정보를 수정합니다' : '연도별 과정 등을 직접 추가합니다'}
                      </p>
                    </div>
                    <button
                      onClick={() => !savingProgram && setProgramModalOpen(false)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">
                      과정명 <span className="text-coral-500">*</span>
                    </label>
                    <GlassInput
                      value={programForm.name}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 2025 외국인 유학생 AI 마케팅 역량강화 및 인턴십 연계과정"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">짧은 이름</label>
                      <GlassInput
                        value={programForm.shortName}
                        onChange={(e) => setProgramForm((prev) => ({ ...prev, shortName: e.target.value }))}
                        placeholder="목록·칩에 표시 (미입력 시 과정명)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">과정 구분</label>
                      <GlassSelect
                        value={programForm.courseType}
                        onChange={(e) =>
                          setProgramForm((prev) => ({ ...prev, courseType: e.target.value as ProgramCourseType }))
                        }
                      >
                        <option value="domestic">내국인 과정</option>
                        <option value="foreign">외국인 과정</option>
                      </GlassSelect>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">
                        대상 <span className="text-coral-500">*</span>
                      </label>
                      <GlassInput
                        value={programForm.audience}
                        onChange={(e) => setProgramForm((prev) => ({ ...prev, audience: e.target.value }))}
                        placeholder="예: 외국인 유학생"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">
                        기간·시간 표기 <span className="text-coral-500">*</span>
                      </label>
                      <GlassInput
                        value={programForm.hours}
                        onChange={(e) => setProgramForm((prev) => ({ ...prev, hours: e.target.value }))}
                        placeholder="예: 155시간 또는 2025년 수료"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">
                      요약 <span className="text-coral-500">*</span>
                    </label>
                    <GlassTextarea
                      value={programForm.summary}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={2}
                      placeholder="과정 선택 카드에 표시되는 한두 문장 요약"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">상세 소개</label>
                    <GlassTextarea
                      value={programForm.overview}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, overview: e.target.value }))}
                      rows={3}
                      placeholder="과정 소개 화면에 표시되는 상세 설명 (선택)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">교육생 특징</label>
                    <GlassTextarea
                      value={programForm.talentNote}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, talentNote: e.target.value }))}
                      rows={2}
                      placeholder="어떤 교육생인지 한두 문장 (선택)"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">과정 소개 영상</label>
                      <GlassInput
                        value={programForm.youtubeInput}
                        onChange={(e) => setProgramForm((prev) => ({ ...prev, youtubeInput: e.target.value }))}
                        placeholder="YouTube URL 또는 영상 ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 mb-2">교육생 전체 자기소개 영상</label>
                      <GlassInput
                        value={programForm.introVideoInput}
                        onChange={(e) => setProgramForm((prev) => ({ ...prev, introVideoInput: e.target.value }))}
                        placeholder="인재 목록 상단에 표시 (선택)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">과정명 별칭</label>
                    <GlassTextarea
                      value={programForm.aliasesText}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, aliasesText: e.target.value }))}
                      rows={3}
                      placeholder={'교육생 프로필의 과정명 표기가 다양할 때 줄바꿈으로 구분해 입력\n예: 외국인 유학생 AI 마케터 인턴과정'}
                    />
                    <p className="mt-1.5 text-xs text-ink-400">
                      교육생 프로필의 과정명이 별칭과 일치하면 이 과정으로 분류됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">태그</label>
                    <GlassInput
                      value={programForm.tagsText}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, tagsText: e.target.value }))}
                      placeholder="쉼표로 구분 (예: 서울시 매력일자리, 2025년 수료)"
                    />
                  </div>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-3xl border p-4 transition-all ${
                      programForm.archived
                        ? 'border-honey-400/50 bg-honey-100/50 shadow-glass-sm'
                        : 'border-white/70 bg-white/55'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={programForm.archived}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, archived: e.target.checked }))}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-azure-200 text-azure-600 focus:ring-azure-400"
                    />
                    <div>
                      <span className="text-sm font-semibold text-ink-900">연도별 아카이브 과정 (상단 탭 분리)</span>
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">
                        체크하면 메인 과정 선택 카드·기업 대시보드에는 표시하지 않고, 상단 네비게이션에 별도 탭으로
                        노출합니다. 열람 권한 관리에는 일반 과정과 동일하게 포함됩니다.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="px-6 py-4 border-t border-ink-100 bg-white/40 flex justify-end gap-2">
                  <GlassButton
                    onClick={() => setProgramModalOpen(false)}
                    variant="secondary"
                    size="sm"
                    disabled={savingProgram}
                  >
                    취소
                  </GlassButton>
                  <GlassButton onClick={handleSaveProgram} disabled={savingProgram} size="sm">
                    {savingProgram ? '저장 중...' : editingProgramId ? '수정 완료' : '과정 추가'}
                  </GlassButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 커스텀 과정 삭제 확인 모달 */}
        <AnimatePresence>
          {deletingProgram && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
              onClick={() => !savingProgram && setDeletingProgram(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong rounded-4xl shadow-glass-lg w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-coral-400/40 bg-coral-100">
                  <TrashIcon className="h-8 w-8 text-coral-500" />
                </div>
                <h3 className="text-center font-display text-xl font-bold tracking-tight text-ink-900">
                  과정을 삭제할까요?
                </h3>
                <p className="mt-3 text-center text-sm leading-relaxed text-ink-500">
                  <strong className="text-ink-700">{deletingProgram.name}</strong> 과정을 삭제합니다.
                  {portfolios.filter((p) => portfolioMatchesProgram(p, deletingProgram.id, allPrograms)).length > 0 && (
                    <span className="mt-2 block text-coral-500">
                      이 과정에 분류된 교육생{' '}
                      {portfolios.filter((p) => portfolioMatchesProgram(p, deletingProgram.id, allPrograms)).length}명이
                      과정 목록에서 보이지 않게 됩니다.
                    </span>
                  )}
                </p>
                <div className="mt-6 flex gap-2">
                  <GlassButton
                    onClick={() => setDeletingProgram(null)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={savingProgram}
                  >
                    취소
                  </GlassButton>
                  <GlassButton
                    onClick={handleDeleteProgram}
                    size="sm"
                    className="flex-1 !bg-gradient-to-r !from-coral-500 !to-coral-500 hover:!from-coral-400 hover:!to-coral-500 !text-white"
                    disabled={savingProgram}
                  >
                    {savingProgram ? '삭제 중...' : '삭제'}
                  </GlassButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 매칭기간 일괄 조치 확인 모달 */}
        <AnimatePresence>
          {bulkProgramAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
              onClick={() => !bulkProcessing && setBulkProgramAction(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong rounded-4xl shadow-glass-lg w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border ${
                    bulkProgramAction === 'blockAll'
                      ? 'border-coral-400/40 bg-coral-100'
                      : 'border-mint-400/40 bg-mint-100'
                  }`}
                >
                  {bulkProgramAction === 'blockAll' ? (
                    <LockClosedIcon className="h-8 w-8 text-coral-500" />
                  ) : (
                    <LockOpenIcon className="h-8 w-8 text-mint-600" />
                  )}
                </div>
                <h3 className="text-center font-display text-xl font-bold tracking-tight text-ink-900">
                  {bulkProgramAction === 'blockAll' ? '전체 기업 열람을 차단할까요?' : '전체 기업에 모든 과정을 허용할까요?'}
                </h3>
                <p className="mt-3 text-center text-sm leading-relaxed text-ink-500">
                  {bulkProgramAction === 'blockAll' ? (
                    <>
                      승인 완료 기업 <strong className="text-ink-700">{approvedEmployers.length}곳</strong>의 포트폴리오
                      열람을 전면 차단합니다. 기업 화면에서 모든 과정과 교육생 정보가 숨겨지며, 관리자가 다시 허용할
                      때까지 유지됩니다.
                    </>
                  ) : (
                    <>
                      승인 완료 기업 <strong className="text-ink-700">{approvedEmployers.length}곳</strong>에 현재 등록된
                      모든 과정({allProgramIds.length}개)의 열람을 허용합니다.
                    </>
                  )}
                </p>
                <div className="mt-6 flex gap-2">
                  <GlassButton
                    onClick={() => setBulkProgramAction(null)}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    disabled={bulkProcessing}
                  >
                    취소
                  </GlassButton>
                  <GlassButton
                    onClick={applyBulkProgramAction}
                    size="sm"
                    className={`flex-1 ${
                      bulkProgramAction === 'blockAll'
                        ? '!bg-gradient-to-r !from-coral-500 !to-coral-500 hover:!from-coral-400 hover:!to-coral-500 !text-white'
                        : ''
                    }`}
                    disabled={bulkProcessing}
                  >
                    {bulkProcessing ? '적용 중...' : bulkProgramAction === 'blockAll' ? '전면 차단' : '전체 허용'}
                  </GlassButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
