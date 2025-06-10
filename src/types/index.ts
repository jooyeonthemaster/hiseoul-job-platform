// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'jobseeker' | 'employer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Job Seeker Types
export interface JobSeeker extends User {
  role: 'jobseeker';
  portfolio?: Portfolio;
  profile?: JobSeekerProfile;
}

export interface JobSeekerProfile {
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: string[];
  profileImage?: string;
  speciality?: string;
  
  // 추가 필드들
  certificates?: CertificateItem[];
  awards?: AwardItem[];
  projects?: ProjectItem[];
  introVideo?: string; // YouTube URL
  selfIntroduction?: SelfIntroduction;
  mediaContent?: MediaContent[];
}

export interface CertificateItem {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber?: string;
}

export interface AwardItem {
  title: string;
  organization: string;
  date: Date;
  description?: string;
}

export interface ProjectItem {
  title: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
  links?: string[];
  images?: string[];
}

export interface SelfIntroduction {
  motivation?: string; // 지원동기
  personality?: string; // 성격의 장단점
  experience?: string; // 경험
  aspiration?: string; // 입사 후 포부
}

export interface MediaContent {
  type: 'youtube' | 'image' | 'document';
  url: string;
  title: string;
  description?: string;
  viewCount?: number;
  publishedDate?: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  images: string[];
  documents: string[];
  links: PortfolioLink[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioLink {
  type: 'website' | 'github' | 'linkedin' | 'behance' | 'other';
  url: string;
  title: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
}

// Employer Types
export interface Employer extends User {
  role: 'employer';
  company: CompanyInfo;
}

export interface CompanyInfo {
  // 기본 정보
  name: string;
  ceoName: string;
  industry: string;
  businessType: string; // 업종
  size: string;
  location: string;
  website?: string;
  logo?: string;
  founded?: Date;
  
  // 상세 정보
  description: string;
  
  // 회사의 매력
  companyAttraction?: {
    workingHours?: string; // 유연근무
    remoteWork?: boolean; // 재택근무 가능
    averageSalary?: string; // 평균 연봉
    benefits?: string[]; // 복지
    growthOpportunity?: boolean; // 성장 기회
    stockOptions?: boolean; // 스톡옵션
    trainingSupport?: boolean; // 교육 지원
    familyFriendly?: boolean; // 가족친화 기업
    etc?: string; // 기타
  };
}

// Job Application Types
export interface JobApplication {
  id: string;
  jobSeekerId: string;
  employerId: string;
  jobId?: string;
  portfolioId: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  message: string;
  appliedAt: Date;
  updatedAt: Date;
}

// Job Posting Types
export interface JobPosting {
  id: string;
  employerId: string;
  companyName: string; // 회사명
  title: string;
  jobCategory: string; // 직무내용
  description: string;
  requirements: string[];
  responsibilities: string[];
  
  // 급여 정보 (확장된 타입)
  salary: {
    type: '연봉' | '월급' | '시급' | '기타';
    amount?: string; // 예: "3,000만원 ~ 5,000만원"
    negotiable?: boolean;
  };
  
  // 근무 조건
  location: string; // 근무예정지
  workingHours: string; // 근무시간
  workType: 'fulltime' | 'parttime' | 'contract' | 'intern';
  
  // 복리후생
  benefits: string[];
  
  // 원하는 인재상
  preferredQualifications: string[];
  
  // 채용 담당자 정보
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  
  category: string;
  skills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  
  // 크롤링된 데이터를 위한 추가 필드들
  source?: 'jobkorea' | 'jobplanet' | 'manual';
  externalUrl?: string;
  
  // Gemini AI 분석 결과 필드들
  categoryConfidence?: number; // 카테고리 신뢰도 (0-1)
  salaryInfo?: {
    type: '연봉' | '월급' | '시급' | '기타';
    min?: number;
    max?: number;
    currency: string;
    negotiable: boolean;
  };
  geminiAnalyzed?: boolean; // Gemini로 분석되었는지 여부
  geminiModel?: string; // 사용된 Gemini 모델
  analysisTimestamp?: Date; // 분석 시점
}

// 채용 문의 타입
export interface JobInquiry {
  id: string;
  jobSeekerId: string;
  employerId: string;
  portfolioId: string;
  jobPostingId?: string;
  
  // 채용 제안 내용
  message: string;
  proposedPosition: string;
  proposedSalary?: string;
  
  // 기업 정보 (문의 시점의 스냅샷)
  companyInfo: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    location: string;
    description: string;
    companyAttraction?: any;
  };
  
  // 담당자 정보
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: Date;
  readAt?: Date;
  respondedAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'message' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
} 