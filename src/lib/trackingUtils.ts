// 모든 Google Sheets 추적을 한 곳에서 관리하는 유틸리티
import { GoogleSheetsService } from '@/lib/googleSheets';
import { 
  JobPosting, 
  JobApplication, 
  Portfolio, 
  User,
  JobInquiry,
  Notification 
} from '@/types';

// 채용공고 생성 및 추적
export const trackJobPostingCreation = async (
  jobData: Partial<JobPosting>,
  employerData: any
) => {
  try {
    // 채용공고 기록
    await GoogleSheetsService.addJobPosting({
      ...jobData,
      companyName: employerData.company.name,
      employerId: employerData.id,
      isImportant: jobData.salary?.amount && 
        parseInt(jobData.salary.amount.replace(/[^0-9]/g, '')) > 100000000,
    });

    // 알림 기록
    await GoogleSheetsService.addNotification({
      userId: 'admin',
      userType: 'admin',
      notificationType: 'new_job_posting',
      title: `새 채용공고: ${jobData.title}`,
      message: `${employerData.company.name}에서 새로운 포지션을 등록했습니다.`,
      actionUrl: `/jobs/${jobData.id}`,
      channel: 'email',
    });

    console.log('Job posting tracked successfully');
  } catch (error) {
    console.error('Failed to track job posting:', error);
  }
};

// 지원 프로세스 전체 추적
export const trackApplicationProcess = async (
  applicationData: Partial<JobApplication>,
  jobData: JobPosting,
  applicantData: User
) => {
  try {
    // 지원 기록
    await GoogleSheetsService.addJobApplication({
      ...applicationData,
      jobTitle: jobData.title,
      employerName: jobData.companyName,
      jobSeekerName: applicantData.name,
    });

    // 조회 기록 (지원 전 채용공고 확인)
    await GoogleSheetsService.logView({
      viewerId: applicantData.id,
      viewerType: 'jobseeker',
      targetType: 'job',
      targetId: jobData.id,
      targetTitle: jobData.title,
      page: `/jobs/${jobData.id}`,
      duration: 0,
      device: 'web',
    });

    // 기업에게 알림
    await GoogleSheetsService.addNotification({
      userId: jobData.employerId,
      userType: 'employer',
      notificationType: 'new_application',
      title: '새로운 지원자가 있습니다',
      message: `${applicantData.name}님이 ${jobData.title} 포지션에 지원했습니다.`,
      actionUrl: `/applications/${applicationData.id}`,
      channel: 'web',
    });

    // 지원자에게 알림
    await GoogleSheetsService.addNotification({
      userId: applicantData.id,
      userType: 'jobseeker',  
      notificationType: 'application_submitted',
      title: '지원이 완료되었습니다',
      message: `${jobData.companyName}의 ${jobData.title} 포지션에 성공적으로 지원했습니다.`,
      actionUrl: `/my-applications`,
      channel: 'web',
    });
  } catch (error) {
    console.error('Failed to track application process:', error);
  }
};

// 포트폴리오 활동 추적
export const trackPortfolioActivity = async (
  portfolio: Portfolio,
  activityType: 'create' | 'update' | 'view' | 'like',
  userData?: User
) => {
  try {
    switch (activityType) {
      case 'create':
      case 'update':
        await GoogleSheetsService.addPortfolio({
          ...portfolio,
          jobSeekerName: userData?.name || 'Unknown',
        });
        break;
        
      case 'view':
        await GoogleSheetsService.logView({
          viewerId: userData?.id || 'anonymous',
          viewerType: userData?.role || 'guest',
          targetType: 'portfolio',
          targetId: portfolio.id,
          targetTitle: portfolio.title,
          page: `/portfolios/${portfolio.id}`,
          device: 'web',
        });
        break;
        
      case 'like':
        await GoogleSheetsService.addFavorite({
          userId: userData?.id || '',
          userType: userData?.role || 'guest',
          targetType: 'portfolio',
          targetId: portfolio.id,
          targetName: portfolio.title,
          category: 'portfolio',
          notificationEnabled: true,
        });
        break;
    }
  } catch (error) {
    console.error('Failed to track portfolio activity:', error);
  }
};

// 검색 활동 추적
export const trackSearchActivity = async (
  searchParams: {
    query: string;
    type: 'job' | 'portfolio' | 'company';
    filters?: any;
    results: any[];
  },
  userData?: User
) => {
  try {
    await GoogleSheetsService.logSearch({
      userId: userData?.id || 'anonymous',
      userType: userData?.role || 'guest',
      searchType: searchParams.type,
      query: searchParams.query,
      categoryFilter: searchParams.filters?.category || '',
      locationFilter: searchParams.filters?.location || '',
      salaryFilter: searchParams.filters?.salary || '',
      skillFilters: searchParams.filters?.skills || [],
      resultCount: searchParams.results.length,
    });
  } catch (error) {
    console.error('Failed to track search:', error);
  }
};

// 메시지 전송 추적
export const trackMessageSent = async (
  messageData: {
    senderId: string;
    senderName: string;
    senderType: string;
    receiverId: string;
    receiverName: string;
    receiverType: string;
    title: string;
    content: string;
    relatedId?: string;
    messageType?: string;
  }
) => {
  try {
    // 메시지 기록
    await GoogleSheetsService.addMessage(messageData);
    
    // 수신자에게 알림
    await GoogleSheetsService.addNotification({
      userId: messageData.receiverId,
      userType: messageData.receiverType,
      notificationType: 'new_message',
      title: `새 메시지: ${messageData.title}`,
      message: `${messageData.senderName}님으로부터 메시지가 도착했습니다.`,
      actionUrl: `/messages`,
      channel: 'web',
    });
  } catch (error) {
    console.error('Failed to track message:', error);
  }
};

// 프로필 수정 추적
export const trackProfileUpdate = async (
  userId: string,
  userType: 'jobseeker' | 'employer',
  updates: Record<string, { old: any; new: any }>
) => {
  try {
    for (const [field, values] of Object.entries(updates)) {
      await GoogleSheetsService.logProfileChange({
        userId,
        userType,
        fieldName: field,
        oldValue: JSON.stringify(values.old),
        newValue: JSON.stringify(values.new),
        reason: 'user_update',
        device: navigator.userAgent,
      });
    }
  } catch (error) {
    console.error('Failed to track profile update:', error);
  }
};

// 자격증/수상/프로젝트 추가 추적
export const trackCredentialAddition = async (
  type: 'certificate' | 'award' | 'project',
  data: any,
  userData: User
) => {
  try {
    const baseData = {
      jobSeekerId: userData.id,
      jobSeekerName: userData.name,
    };
    
    switch (type) {
      case 'certificate':
        await GoogleSheetsService.addCertificate({
          ...baseData,
          ...data,
        });
        break;
        
      case 'award':
        await GoogleSheetsService.addAward({
          ...baseData,
          ...data,
        });
        break;
        
      case 'project':
        await GoogleSheetsService.addProject({
          ...baseData,
          ...data,
        });
        break;
    }
  } catch (error) {
    console.error(`Failed to track ${type} addition:`, error);
  }
};
