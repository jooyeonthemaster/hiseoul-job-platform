'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon, BuildingOfficeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, UserGroupIcon, UserIcon, BriefcaseIcon, MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon, PencilIcon, ArrowLeftIcon, ArrowRightIcon, XMarkIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon, ArrowDownTrayIcon, TableCellsIcon, ArrowTopRightOnSquareIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassTextarea, GlassSelect, Field } from '@/components/ui/GlassField';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getAllPortfolios, updateJobSeekerProfile, getJobSeekerProfile, updateUserProfile, registerPortfolio, togglePortfolioVisibility, setPortfolioContactVisibility, toggleEmployerVisibility, getAllEmployers, logOut } from '@/lib/auth';
import { exportJobseekersToExcel, exportEmployersToExcel, exportSelectionsToExcel, exportAllToExcel } from '@/lib/excelExport';
import { DEFAULT_VISIBLE_PROGRAM_IDS, PORTFOLIO_PROGRAMS, splitSpecialities, portfolioMatchesProgram } from '@/lib/programs';
import { getVisiblePortfolioProgramIds, saveVisiblePortfolioProgramIds } from '@/lib/programSettings';
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
      mediaContent: [],
      externalLinks: [],
      portfolioPdfs: [],
      additionalDocuments: []
    }
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [visibleProgramIds, setVisibleProgramIds] = useState<string[]>(DEFAULT_VISIBLE_PROGRAM_IDS);
  const [savingProgramSettings, setSavingProgramSettings] = useState(false);

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

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
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

  // 기업 목록 조회
  useEffect(() => {
    if (!canLoadAdminData) return;

    const fetchEmployers = async () => {
      try {
        setLoading(true);
        
        // 모든 기업 정보 조회 (숨겨진 기업 포함)
        const employersData = await getAllEmployers(true); // 관리자는 숨겨진 기업도 포함
        
        const pending: PendingEmployer[] = [];
        const approved: PendingEmployer[] = [];
        const rejected: PendingEmployer[] = [];

        // 각 기업의 사용자 정보도 함께 조회
        for (const employer of employersData) {
          // 사용자 정보 조회
          const usersRef = collection(db, 'users');
          const userQuery = query(usersRef, where('__name__', '==', employer.userId));
          const userSnapshot = await getDocs(userQuery);
          
          let userInfo = { email: '', name: '' };
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            userInfo = {
              email: userData.email || '',
              name: userData.name || ''
            };
          }

          const employerWithUserInfo: PendingEmployer = {
            id: employer.id,
            userId: employer.userId,
            company: {
              ...(employer.company || {}),
              // 담당자 정보 포함
              contactName: (employer.company as any)?.contactName || userInfo?.name || '',
              contactPosition: (employer.company as any)?.contactPosition || (userInfo as any)?.position || '',
              contactPhone: (employer.company as any)?.contactPhone || '',
              // 기업 매력도 정보 포함
              companyAttraction: (employer.company as any)?.companyAttraction || {}
            },
            approvalStatus: employer.approvalStatus || 'pending',
            createdAt: employer.createdAt,
            userEmail: userInfo.email,
            userName: userInfo.name,
            rejectedReason: (employer as any).rejectedReason,
            canceledReason: (employer as any).canceledReason,
            approvedAt: (employer as any).approvedAt,
            rejectedAt: (employer as any).rejectedAt,
            canceledAt: (employer as any).canceledAt,
            isHidden: employer.isHidden
          };

          // 상태별로 분류
          if (employerWithUserInfo.approvalStatus === 'pending') {
            pending.push(employerWithUserInfo);
          } else if (employerWithUserInfo.approvalStatus === 'approved') {
            approved.push(employerWithUserInfo);
          } else if (employerWithUserInfo.approvalStatus === 'rejected') {
            rejected.push(employerWithUserInfo);
          }
        }

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
  }, [canLoadAdminData]);

  // 채용 제안서 목록 조회
  useEffect(() => {
    if (!canLoadAdminData || selectedTab !== 'inquiries') return;

    const fetchJobInquiries = async () => {
      try {
        setLoading(true);
        
        const inquiriesRef = collection(db, 'jobInquiries');
        const inquiriesSnapshot = await getDocs(inquiriesRef);
        
        const inquiries: JobInquiry[] = [];

        for (const docSnapshot of inquiriesSnapshot.docs) {
          const inquiryData = docSnapshot.data();
          
          // 구직자 정보 조회
          const jobSeekerQuery = query(collection(db, 'users'), where('__name__', '==', inquiryData.jobSeekerId));
          const jobSeekerSnapshot = await getDocs(jobSeekerQuery);
          
          let jobSeekerInfo = { name: '', email: '' };
          if (!jobSeekerSnapshot.empty) {
            const userData = jobSeekerSnapshot.docs[0].data();
            jobSeekerInfo = {
              name: userData.name || '',
              email: userData.email || ''
            };
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
            jobSeekerEmail: jobSeekerInfo.email
          };

          inquiries.push(inquiry);
        }

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
        setLoading(false);
      }
    };

    fetchJobInquiries();
  }, [canLoadAdminData, selectedTab]);

  // 포트폴리오 목록 조회
  useEffect(() => {
    if (!canLoadAdminData || selectedTab !== 'portfolios') return;

    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const [portfolioData, programIds] = await Promise.all([
          getAllPortfolios(true), // 관리자는 숨겨진 포트폴리오도 포함
          getVisiblePortfolioProgramIds(),
        ]);
        setPortfolios(portfolioData as Portfolio[]);
        setVisibleProgramIds(programIds);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [canLoadAdminData, selectedTab]);

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

    setFilteredInquiries(filtered);
  }, [jobInquiries, searchTerm, statusFilter, dateRange]);

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

  // 기업 정보 숨김/표시 토글
  const handleToggleEmployerVisibility = async (employerId: string, currentHidden: boolean) => {
    try {
      await toggleEmployerVisibility(employerId, !currentHidden);
      // 기업 목록 새로고침
      const employersData = await getAllEmployers(true);
      
      const pending: PendingEmployer[] = [];
      const approved: PendingEmployer[] = [];
      const rejected: PendingEmployer[] = [];

      for (const employer of employersData) {
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('__name__', '==', employer.userId));
        const userSnapshot = await getDocs(userQuery);
        
        let userInfo = { email: '', name: '' };
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          userInfo = {
            email: userData.email || '',
            name: userData.name || ''
          };
        }

        const employerWithUserInfo: PendingEmployer = {
          id: employer.id,
          userId: employer.userId,
          company: employer.company || {},
          approvalStatus: employer.approvalStatus || 'pending',
          createdAt: employer.createdAt,
          userEmail: userInfo.email,
          userName: userInfo.name,
          rejectedReason: (employer as any).rejectedReason,
          canceledReason: (employer as any).canceledReason,
          approvedAt: (employer as any).approvedAt,
          rejectedAt: (employer as any).rejectedAt,
          canceledAt: (employer as any).canceledAt,
          isHidden: employer.isHidden
        };

        if (employerWithUserInfo.approvalStatus === 'pending') {
          pending.push(employerWithUserInfo);
        } else if (employerWithUserInfo.approvalStatus === 'approved') {
          approved.push(employerWithUserInfo);
        } else if (employerWithUserInfo.approvalStatus === 'rejected') {
          rejected.push(employerWithUserInfo);
        }
      }

      setPendingEmployers(pending);
      setApprovedEmployers(approved);
      setRejectedEmployers(rejected);
    } catch (error) {
      console.error('기업 숨김 상태 변경 실패:', error);
      alert('기업 숨김 상태 변경에 실패했습니다.');
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

              {/* 검색 바 */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ink-400 z-10" />
                <GlassInput
                  type="text"
                  placeholder="회사명, 구직자명, 제안 직무, 담당자명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11"
                />
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
                </div>
              )}
            </div>

            {/* 제안서 목록 */}
            <div className="grid gap-6">
              {filteredInquiries.length === 0 ? (
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
        {selectedTab !== 'inquiries' && (
          <div className="grid gap-6">
            {getEmployersByTab().map((employer) => (
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
                          {employer.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
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
                      기업 포트폴리오 과정 노출 설정
                    </h4>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    기업담당자가 포트폴리오 버튼을 눌렀을 때 선택할 수 있는 과정을 관리합니다. 체크 해제한 과정은 기업 화면의 과정 선택 카드에서 숨겨집니다.
                  </p>
                </div>
                <GlassButton
                  onClick={handleSaveProgramSettings}
                  disabled={savingProgramSettings}
                  size="sm"
                  className="w-full lg:w-auto"
                >
                  {savingProgramSettings ? '저장 중...' : '노출 설정 저장'}
                </GlassButton>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {PORTFOLIO_PROGRAMS.map((program) => {
                  const visible = visibleProgramIds.includes(program.id);
                  const programCount = portfolios.filter((portfolio) =>
                    portfolioMatchesProgram(portfolio, program.id)
                  ).length;

                  return (
                    <label
                      key={program.id}
                      className={`flex cursor-pointer items-start gap-4 rounded-3xl border p-4 transition-all ${
                        visible
                          ? 'border-azure-200 bg-azure-50/70 shadow-glass-sm'
                          : 'border-white/70 bg-white/55 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => handleToggleProgramVisibility(program.id)}
                        className="mt-1 h-5 w-5 rounded border-azure-200 text-azure-600 focus:ring-azure-400"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink-900">{program.name}</span>
                          <Badge tone={program.courseType === 'foreign' ? 'coral' : 'azure'}>
                            {program.audience}
                          </Badge>
                          <Badge tone="neutral">{programCount}명</Badge>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-500">{program.summary}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </GlassCard>

            {loading ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {portfolios.map((portfolio) => (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="glass-card min-w-0 p-5 transition-shadow duration-300 hover:shadow-glass-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        {portfolio.profileImage ? (
                          <img
                            src={portfolio.profileImage}
                            alt={portfolio.name}
                            className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/70 shadow-glass-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-azure-50 rounded-2xl flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-azure-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-ink-900 truncate">{portfolio.name}</h4>
                            {/* 숨김 상태 표시 */}
                            {portfolio.isHidden && (
                              <Badge tone="neutral" icon={<EyeSlashIcon className="w-3 h-3" />}>
                                숨김
                              </Badge>
                            )}
                            <Badge tone={portfolio.contactInfoVisibleToEmployers ? 'mint' : 'neutral'}>
                              {portfolio.contactInfoVisibleToEmployers ? '연락처 공개' : '연락처 비공개'}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {splitSpecialities(portfolio.speciality).map((speciality) => (
                              <Badge key={speciality} tone="azure">{speciality}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 space-x-1">
                        <a
                          href={`/portfolios/${portfolio.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-azure-600 hover:text-azure-700 hover:bg-azure-50/70 rounded-xl transition-colors"
                          title="상세 페이지 새 창에서 열기"
                          aria-label={`${portfolio.name} 상세 페이지 새 창에서 열기`}
                        >
                          <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </a>
                        {/* 숨김/표시 토글 버튼 */}
                        <button
                          onClick={() => handleTogglePortfolioVisibility(portfolio.id, portfolio.isHidden || false)}
                          className={`p-2 rounded-xl transition-colors ${
                            portfolio.isHidden
                              ? 'text-azure-600 hover:bg-azure-50'
                              : 'text-ink-400 hover:bg-azure-50/60 hover:text-azure-600'
                          }`}
                          title={portfolio.isHidden ? '포트폴리오 표시' : '포트폴리오 숨김'}
                        >
                          {portfolio.isHidden ? (
                            <EyeIcon className="w-5 h-5" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePortfolioContactVisibility(portfolio.id, portfolio.contactInfoVisibleToEmployers || false)}
                          className={`p-2 rounded-xl transition-colors ${
                            portfolio.contactInfoVisibleToEmployers
                              ? 'text-mint-600 hover:bg-mint-50'
                              : 'text-ink-400 hover:bg-azure-50/60 hover:text-azure-600'
                          }`}
                          title={portfolio.contactInfoVisibleToEmployers ? '기업 연락처 공개 차단' : '기업 연락처 공개 승인'}
                          aria-label={portfolio.contactInfoVisibleToEmployers ? '기업 연락처 공개 차단' : '기업 연락처 공개 승인'}
                        >
                          {portfolio.contactInfoVisibleToEmployers ? (
                            <EnvelopeIcon className="w-5 h-5" />
                          ) : (
                            <LockClosedIcon className="w-5 h-5" />
                          )}
                        </button>
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => openPortfolioModal(portfolio)}
                          className="p-2 text-ink-400 hover:text-azure-600 hover:bg-azure-50/60 rounded-xl transition-colors"
                          title="포트폴리오 수정"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-ink-700">전문 분야:</span>
                        <span className="ml-2 text-sm text-ink-900">{splitSpecialities(portfolio.speciality).join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-ink-700">연락처:</span>
                        <span className="ml-2 text-sm text-ink-900">{portfolio.phone}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-ink-700">주소:</span>
                        <span className="ml-2 text-sm text-ink-900">{portfolio.address}</span>
                      </div>
                      {portfolio.currentCourse && (
                        <div>
                          <span className="text-sm font-medium text-ink-700">수행 과정:</span>
                          <span className="ml-2 text-sm text-ink-900">{portfolio.currentCourse}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 min-w-0">
                      <div className="flex min-w-0 flex-wrap gap-1.5 overflow-hidden">
                        {portfolio.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            tone="azure"
                            className="max-w-full whitespace-normal break-words text-left leading-snug"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {portfolio.skills.length > 3 && (
                          <Badge tone="neutral">+{portfolio.skills.length - 3}개</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
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
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-azure-700 shadow-glass-sm transition hover:bg-white"
                      >
                        <PencilIcon className="h-4 w-4" />
                        수정
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
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
      </div>
    </div>
  );
}
