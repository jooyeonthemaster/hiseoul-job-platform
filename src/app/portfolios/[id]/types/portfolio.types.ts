// Portfolio 관련 타입 정의
export interface Portfolio {
  id: string;
  name: string;
  speciality: string;
  experience: string;
  skills: string[];
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
  selfIntroduction?: SelfIntroduction;
  mediaContent?: MediaContent[];
  portfolioPdfs?: PortfolioPdf[];
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

export interface SelfIntroduction {
  motivation?: string;
  personality?: string;
  experience?: string;
  aspiration?: string;
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