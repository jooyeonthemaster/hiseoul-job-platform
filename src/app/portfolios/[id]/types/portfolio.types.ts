// Portfolio 관련 타입 정의
export interface VideoLink {
  url: string;
  title?: string;
  addedAt: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  speciality: string;
  experience: string;
  skills: string[];
  languages: string[];
  description: string;
  avatar: string;
  projects: number;
  verified: boolean;
  location: string;
  email: string;
  phone: string;
  education: string;
  introduction: string;
  achievements: string[];
  workHistory: WorkHistory[];
  projectDetails: ProjectDetail[];
  profileImage?: string;
  currentCourse?: string;
  introVideo?: string;
  introVideos?: VideoLink[];
  selfIntroduction?: SelfIntroduction;
  mediaContent?: MediaContent[];
  portfolioPdfs?: PortfolioPdf[];
  additionalDocuments?: AdditionalDocument[];
  certificates?: Certificate[];
  awards?: Award[];
  detailedEducation?: DetailedEducation[];
}

export interface WorkHistory {
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface ProjectDetail {
  title: string;
  description: string;
  technologies: string[];
  duration: string;
  results: string[];
}

export interface SelfIntroductionSection {
  id: string;
  title: string;
  content: string;
  order: number;
  color?: string;
}

export interface SelfIntroduction {
  motivation?: string;
  personality?: string;
  experience?: string;
  aspiration?: string;
  sections?: SelfIntroductionSection[];
  useCustomSections?: boolean;
}

export interface MediaContent {
  type: string;
  url: string;
  title: string;
  description?: string;
}

export interface PortfolioPdf {
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export interface AdditionalDocument {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface Award {
  title: string;
  organization: string;
  date: string;
  description?: string;
}

export interface DetailedEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface PortfolioAccessState {
  hasAccess: boolean;
  accessChecked: boolean;
  showAccessModal: boolean;
  employerStatus: any;
}

export interface FavoriteTalentState {
  isFavorite: boolean;
  favoriteLoading: boolean;
}