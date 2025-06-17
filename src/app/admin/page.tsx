'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon, BuildingOfficeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, UserGroupIcon, UserIcon, BriefcaseIcon, MagnifyingGlassIcon, FunnelIcon, CalendarDaysIcon, PencilIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getAllPortfolios, updateJobSeekerProfile, getJobSeekerProfile, updateUserProfile, registerPortfolio, togglePortfolioVisibility, toggleEmployerVisibility, getAllEmployers } from '@/lib/auth';
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
  experience?: ExperienceItem[];
  education?: EducationItem[];
  certificates?: CertificateItem[];
  awards?: AwardItem[];
  selfIntroduction?: SelfIntroduction;
  introVideo?: string;
  mediaContent?: any[];
  portfolioPdfs?: Array<{
    url: string;
    fileName: string;
    uploadedAt: Date;
  }>;
  dateOfBirth?: Date;
  isHidden?: boolean; // 숨김 상태 추가
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
    mediaContent: any[];
    portfolioPdfs?: Array<{
      url: string;
      fileName: string;
      uploadedAt: Date;
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
  // 인증 관련 상태
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
      currentCourse: ''
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
      portfolioPdfs: []
    }
  });
  const [savingProfile, setSavingProfile] = useState(false);

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

  // 보안 강화: 매번 인증 필요 (페이지 새로고침/재방문 시 재인증)
  useEffect(() => {
    // 항상 인증되지 않은 상태로 시작
    setIsAuthenticated(false);
    setLoading(false);
  }, []);

  // 비밀번호 인증 처리
  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      
      if (password === adminPassword) {
        // localStorage 사용하지 않고 상태만으로 관리 (보안 강화)
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
    setIsAuthenticated(false);
    setPassword('');
  };

  // 기업 목록 조회
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  // 채용 제안서 목록 조회
  useEffect(() => {
    if (!isAuthenticated || selectedTab !== 'inquiries') return;

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
  }, [isAuthenticated, selectedTab]);

  // 포트폴리오 목록 조회
  useEffect(() => {
    if (!isAuthenticated || selectedTab !== 'portfolios') return;

    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const portfolioData = await getAllPortfolios(true); // 관리자는 숨겨진 포트폴리오도 포함
        setPortfolios(portfolioData as Portfolio[]);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, [isAuthenticated, selectedTab]);

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
            currentCourse: profile.currentCourse || portfolio.currentCourse || ''
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
            mediaContent: profile.mediaContent || portfolio.mediaContent || [],
            portfolioPdfs: profile.portfolioPdfs || portfolio.portfolioPdfs || []
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
            currentCourse: portfolio.currentCourse || ''
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
            mediaContent: portfolio.mediaContent || [],
            portfolioPdfs: portfolio.portfolioPdfs || []
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
        currentCourse: ''
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
        portfolioPdfs: []
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
        dateOfBirth: profileFormData.basicInfo.dateOfBirth ? new Date(profileFormData.basicInfo.dateOfBirth) : null,
        speciality: profileFormData.basicInfo.speciality || '',
        profileImage: profileFormData.basicInfo.profileImage || '',
        currentCourse: profileFormData.basicInfo.currentCourse || '',
        experience: profileFormData.experience,
        education: profileFormData.education,
        skills: profileFormData.skills.skills,
        languages: profileFormData.skills.languages,
        certificates: profileFormData.skills.certificates,
        awards: profileFormData.skills.awards,
        selfIntroduction: profileFormData.selfIntroduction,
        introVideo: profileFormData.media.introVideo,
        mediaContent: profileFormData.media.mediaContent,
        portfolioPdfs: profileFormData.media.portfolioPdfs
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
        
        // 새로 추가된 필드들
        certificates: profileFormData.skills.certificates,
        awards: profileFormData.skills.awards,
        introVideo: profileFormData.media.introVideo,
        selfIntroduction: {
          motivation: profileFormData.selfIntroduction.motivation || '',
          personality: profileFormData.selfIntroduction.personality || '',
          experience: profileFormData.selfIntroduction.experience || '',
          aspiration: profileFormData.selfIntroduction.aspiration || ''
        },
        mediaContent: profileFormData.media.mediaContent
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
    const statusConfig = {
      sent: { color: 'bg-blue-100 text-blue-700', text: '발송됨' },
      read: { color: 'bg-yellow-100 text-yellow-700', text: '읽음' },
      responded: { color: 'bg-purple-100 text-purple-700', text: '응답함' },
      accepted: { color: 'bg-green-100 text-green-700', text: '수락됨' },
      rejected: { color: 'bg-red-100 text-red-700', text: '거절됨' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <LockClosedIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              관리자 인증
            </h2>
            <p className="text-gray-600">
              관리자 대시보드에 접근하려면 비밀번호를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleAuthentication} className="mt-8 space-y-6">
            <div>
              <label htmlFor="admin-password" className="sr-only">
                관리자 비밀번호
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="relative block w-full px-3 py-3 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="관리자 비밀번호"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {authError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">
                  {authError}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isAuthenticating}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    인증 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>테크벤처 잡 매칭 관리자 대시보드</p>
            <p className="mt-1">무단 접근을 금지합니다</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 메인 관리자 대시보드
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">기업 회원 관리</h1>
              <p className="text-gray-600">기업 회원가입 승인 및 관리</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그아웃
            </button>
          </div>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                승인 대기 ({pendingEmployers.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('approved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'approved'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                승인 완료 ({approvedEmployers.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'rejected'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <XCircleIcon className="w-5 h-5 mr-2" />
                거절됨 ({rejectedEmployers.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('inquiries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'inquiries'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                채용 제안서 ({jobInquiries.length})
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('portfolios')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'portfolios'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <PencilIcon className="w-5 h-5 mr-2" />
                포트폴리오 ({portfolios.length})
              </div>
            </button>
          </nav>
        </div>

        {/* 채용 제안서 목록 */}
        {selectedTab === 'inquiries' && (
          <div className="space-y-6">
            {/* 검색 및 필터 UI */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  채용 제안서 관리 ({filteredInquiries.length}개 / 총 {jobInquiries.length}개)
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-2 rounded-lg border transition ${
                      showFilters 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    필터
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                  >
                    초기화
                  </button>
                </div>
              </div>

              {/* 검색 바 */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="회사명, 구직자명, 제안 직무, 담당자명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 필터 옵션 */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* 상태 필터 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">전체</option>
                      <option value="sent">발송됨</option>
                      <option value="read">읽음</option>
                      <option value="responded">응답함</option>
                      <option value="accepted">수락됨</option>
                      <option value="rejected">거절됨</option>
                    </select>
                  </div>

                  {/* 시작 날짜 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 종료 날짜 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 제안서 목록 */}
            <div className="grid gap-6">
              {filteredInquiries.length === 0 ? (
                <div className="text-center py-12">
                  {jobInquiries.length === 0 ? (
                    <>
                      <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">채용 제안서가 없습니다</h3>
                      <p className="mt-1 text-sm text-gray-500">아직 기업에서 보낸 채용 제안서가 없습니다.</p>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
                      <p className="mt-1 text-sm text-gray-500">검색 조건을 변경하거나 필터를 초기화해보세요.</p>
                    </>
                  )}
                </div>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {inquiry.companyInfo?.name || '회사명 미확인'}
                            </h3>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-lg font-medium text-blue-600">
                              {inquiry.jobSeekerName || '구직자명 미확인'}
                            </span>
                          </div>
                          <StatusBadge status={inquiry.status} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">제안 직무:</span> {inquiry.proposedPosition}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">직무 카테고리:</span> {inquiry.jobCategory}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">제안 급여:</span> {inquiry.proposedSalary}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">근무 형태:</span> {inquiry.workType}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">근무 시간:</span> {inquiry.workingHours}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">담당자:</span> {inquiry.recruiterInfo?.name} ({inquiry.recruiterInfo?.position})
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">담당자 연락처:</span> {inquiry.recruiterInfo?.phone}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">발송일:</span> {formatDate(inquiry.sentAt)}
                            </p>
                          </div>
                        </div>
                        
                        {inquiry.benefits && inquiry.benefits.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">복리후생</p>
                            <div className="flex flex-wrap gap-2">
                              {inquiry.benefits.map((benefit, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">채용 제안 메시지 (미리보기)</p>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {inquiry.message.length > 150 
                              ? `${inquiry.message.substring(0, 150)}...` 
                              : inquiry.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <button
                          onClick={() => openInquiryModal(inquiry)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          상세 보기
                        </button>
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
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <BuildingOfficeIcon className="w-6 h-6 text-gray-400 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employer.company.name || '회사명 미입력'}
                      </h3>
                      {/* 상태 배지 추가 */}
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employer.approvalStatus === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : employer.approvalStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employer.approvalStatus === 'approved' ? '승인됨' : 
                         employer.approvalStatus === 'rejected' ? '거절됨' : '대기중'}
                      </span>
                      {/* 숨김 상태 표시 */}
                      {employer.isHidden && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeSlashIcon className="w-3 h-3 mr-1" />
                          숨김
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">담당자:</span> {employer.userName}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">이메일:</span> {employer.userEmail}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">대표자:</span> {employer.company.ceoName || '-'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">업종:</span> {employer.company.industry || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">규모:</span> {employer.company.size || '-'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">위치:</span> {employer.company.location || '-'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">웹사이트:</span> {employer.company.website || '-'}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">가입일:</span>{' '}
                          {employer.createdAt?.toDate?.()?.toLocaleDateString() || '-'}
                        </p>
                      </div>
                    </div>
                    
                    {employer.company.description && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">회사 소개</p>
                        <p className="text-sm text-gray-600">{employer.company.description}</p>
                      </div>
                    )}
                    
                    {/* 승인 정보 표시 */}
                    {employer.approvalStatus === 'approved' && employer.approvedAt && (
                      <div className="mt-4 p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium text-green-800">승인 정보</p>
                        <p className="text-sm text-green-600">
                          승인일: {employer.approvedAt?.toDate?.()?.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {/* 거절 사유 표시 */}
                    {employer.approvalStatus === 'rejected' && employer.rejectedReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded">
                        <p className="text-sm font-medium text-red-800">거절 사유</p>
                        <p className="text-sm text-red-600">{employer.rejectedReason}</p>
                        {employer.rejectedAt && (
                          <p className="text-sm text-red-500 mt-1">
                            거절일: {employer.rejectedAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 승인 취소 사유 표시 */}
                    {employer.approvalStatus === 'rejected' && employer.canceledReason && (
                      <div className="mt-4 p-3 bg-orange-50 rounded">
                        <p className="text-sm font-medium text-orange-800">승인 취소 사유</p>
                        <p className="text-sm text-orange-600">{employer.canceledReason}</p>
                        {employer.canceledAt && (
                          <p className="text-sm text-orange-500 mt-1">
                            취소일: {employer.canceledAt?.toDate?.()?.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 액션 버튼들 */}
                  <div className="ml-6">
                    <div className="flex flex-col space-y-2">
                      {/* 숨김/표시 토글 버튼 */}
                      <button
                        onClick={() => handleToggleEmployerVisibility(employer.id, employer.isHidden || false)}
                        className={`px-4 py-2 rounded hover:opacity-80 transition flex items-center text-sm ${
                          employer.isHidden 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-600 text-white'
                        }`}
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
                      </button>
                      
                      {/* 승인 대기 상태 */}
                      {employer.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(employer.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => setSelectedEmployerId(employer.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            거절
                          </button>
                        </>
                      )}

                      {/* 승인 완료 상태 */}
                      {employer.approvalStatus === 'approved' && (
                        <button
                          onClick={() => setSelectedCancelEmployerId(employer.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                        >
                          승인 취소
                        </button>
                      )}

                      {/* 거절됨 상태 */}
                      {employer.approvalStatus === 'rejected' && (
                        <button
                          onClick={() => handleReapprove(employer.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          재승인
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 거절 사유 입력 모달 */}
                {selectedEmployerId === employer.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 사유
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      placeholder="거절 사유를 입력해주세요..."
                    />
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleReject(employer.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        거절 확인
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployerId(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 승인 취소 사유 입력 모달 */}
                {selectedCancelEmployerId === employer.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      승인 취소 사유
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      placeholder="승인 취소 사유를 입력해주세요..."
                    />
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleCancelApproval(employer.id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm"
                      >
                        승인 취소
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCancelEmployerId(null);
                          setCancelReason('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm"
                      >
                        취소
                      </button>
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
              <h3 className="text-lg font-medium text-gray-900">
                포트폴리오 관리 ({portfolios.length}개)
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">포트폴리오를 불러오는 중...</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">포트폴리오가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">등록된 포트폴리오가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {portfolio.profileImage ? (
                          <img
                            src={portfolio.profileImage}
                            alt={portfolio.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{portfolio.name}</h4>
                            {/* 숨김 상태 표시 */}
                            {portfolio.isHidden && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <EyeSlashIcon className="w-3 h-3 mr-1" />
                                숨김
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{portfolio.speciality}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {/* 숨김/표시 토글 버튼 */}
                        <button
                          onClick={() => handleTogglePortfolioVisibility(portfolio.id, portfolio.isHidden || false)}
                          className={`p-2 rounded-lg transition-colors ${
                            portfolio.isHidden 
                              ? 'text-blue-600 hover:bg-blue-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={portfolio.isHidden ? '포트폴리오 표시' : '포트폴리오 숨김'}
                        >
                          {portfolio.isHidden ? (
                            <EyeIcon className="w-5 h-5" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => openPortfolioModal(portfolio)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="포트폴리오 수정"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">전문 분야:</span>
                        <span className="ml-2 text-sm text-gray-900">{portfolio.speciality}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">연락처:</span>
                        <span className="ml-2 text-sm text-gray-900">{portfolio.phone}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">주소:</span>
                        <span className="ml-2 text-sm text-gray-900">{portfolio.address}</span>
                      </div>
                      {portfolio.currentCourse && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">수행 과정:</span>
                          <span className="ml-2 text-sm text-gray-900">{portfolio.currentCourse}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {portfolio.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {portfolio.skills.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{portfolio.skills.length - 3}개
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        포트폴리오 정보
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 포트폴리오 수정 모달 */}
        {showPortfolioModal && selectedPortfolio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">포트폴리오 수정</h2>
                    <p className="text-indigo-100 text-sm">{selectedPortfolio.name}님의 프로필</p>
                  </div>
                  <button
                    onClick={closePortfolioModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 스텝 네비게이션 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <StepNavigation
                  steps={profileEditSteps}
                  currentStep={currentProfileStep}
                  onStepClick={setCurrentProfileStep}
                />
              </div>

              {/* 스텝 콘텐츠 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {renderProfileStepContent()}
              </div>

              {/* 모달 푸터 */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentProfileStep(Math.max(1, currentProfileStep - 1))}
                    disabled={currentProfileStep === 1}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    이전 단계
                  </button>

                  <div className="flex items-center space-x-3">
                    {/* 단계 표시 */}
                    <span className="text-sm text-gray-500 font-medium">
                      {currentProfileStep} / {profileEditSteps.length}
                    </span>
                    
                    {currentProfileStep === profileEditSteps.length ? (
                      <>
                        <button
                          onClick={closePortfolioModal}
                          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleProfileSave}
                          disabled={savingProfile}
                          className="px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {savingProfile ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              저장 중...
                            </div>
                          ) : (
                            '수정 완료'
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setCurrentProfileStep(Math.min(profileEditSteps.length, currentProfileStep + 1))}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all"
                      >
                        다음 단계
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 채용 제안서 상세 모달 */}
        {showInquiryModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">채용 제안서 상세</h2>
                  <button
                    onClick={closeInquiryModal}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <XCircleIcon className="w-8 h-8" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* 기본 정보 - 상단 헤더 */}
                  <div className="border-b pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {selectedInquiry.companyInfo?.name}
                          </h3>
                          <p className="text-lg text-gray-600">
                            {selectedInquiry.jobSeekerName}님에게 채용 제안
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={selectedInquiry.status} />
                        <p className="text-sm text-gray-500 mt-2">
                          발송일: {formatDate(selectedInquiry.sentAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 메인 콘텐츠 - 2단 레이아웃 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 왼쪽 컬럼 */}
                    <div className="space-y-6">
                      {/* 회사 정보 */}
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
                          회사 정보
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">회사명:</span> <span className="text-gray-900">{selectedInquiry.companyInfo?.name}</span></p>
                            <p><span className="font-medium text-gray-700">대표자:</span> <span className="text-gray-900">{selectedInquiry.companyInfo?.ceoName}</span></p>
                            <p><span className="font-medium text-gray-700">업종:</span> <span className="text-gray-900">{selectedInquiry.companyInfo?.industry}</span></p>
                          </div>
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">사업 형태:</span> <span className="text-gray-900">{selectedInquiry.companyInfo?.businessType}</span></p>
                            <p><span className="font-medium text-gray-700">위치:</span> <span className="text-gray-900">{selectedInquiry.companyInfo?.location}</span></p>
                          </div>
                        </div>
                        {selectedInquiry.companyInfo?.description && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2">회사 소개:</p>
                            <p className="text-gray-900 bg-white p-3 rounded border">{selectedInquiry.companyInfo.description}</p>
                          </div>
                        )}
                      </div>

                      {/* 담당자 정보 */}
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                          채용 담당자 정보
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">담당자명:</span> <span className="text-gray-900">{selectedInquiry.recruiterInfo?.name}</span></p>
                            <p><span className="font-medium text-gray-700">직위/직책:</span> <span className="text-gray-900">{selectedInquiry.recruiterInfo?.position}</span></p>
                          </div>
                          <div className="space-y-2">
                            <p><span className="font-medium text-gray-700">연락처:</span> <span className="text-gray-900">{selectedInquiry.recruiterInfo?.phone}</span></p>
                            <p><span className="font-medium text-gray-700">이메일:</span> <span className="text-gray-900">{selectedInquiry.recruiterInfo?.email}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 오른쪽 컬럼 */}
                    <div className="space-y-6">
                      {/* 채용 정보 */}
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <BriefcaseIcon className="w-6 h-6 mr-2 text-green-600" />
                          채용 정보
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded border">
                            <p className="font-medium text-gray-700 mb-1">제안 직무</p>
                            <p className="text-lg text-gray-900 font-semibold">{selectedInquiry.proposedPosition}</p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-700 text-sm">직무 카테고리</p>
                              <p className="text-gray-900">{selectedInquiry.jobCategory}</p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-700 text-sm">근무 형태</p>
                              <p className="text-gray-900">{selectedInquiry.workType}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-700 text-sm">제안 급여</p>
                              <p className="text-gray-900 font-semibold">{selectedInquiry.proposedSalary}</p>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-700 text-sm">근무 시간</p>
                              <p className="text-gray-900">{selectedInquiry.workingHours}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 복리후생 */}
                      {selectedInquiry.benefits && selectedInquiry.benefits.length > 0 && (
                        <div className="bg-purple-50 p-6 rounded-lg">
                          <h4 className="text-xl font-semibold text-gray-900 mb-4">복리후생</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {selectedInquiry.benefits.map((benefit, index) => (
                              <div key={index} className="bg-white p-3 rounded border text-center">
                                <span className="text-sm font-medium text-purple-800">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 채용 제안 메시지 - 전체 폭 */}
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <EnvelopeIcon className="w-6 h-6 mr-2 text-yellow-600" />
                      채용 제안 메시지
                    </h4>
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={closeInquiryModal}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}