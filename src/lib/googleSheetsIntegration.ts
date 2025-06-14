// 회원가입 시 Google Sheets 연동 예제
import { GoogleSheetsService } from '@/lib/googleSheets';

// 구직자 회원가입 완료 시 호출하는 함수
export async function handleJobSeekerSignupComplete(userData: any) {
  try {
    // Firebase에 저장
    // ... 기존 Firebase 저장 로직 ...
    
    // Google Sheets에도 기록
    await GoogleSheetsService.addJobSeeker({
      uid: userData.uid,
      name: userData.displayName,
      email: userData.email,
      phone: userData.phone || '',
      skills: userData.skills || [],
      experience: userData.experience || '',
      education: userData.education || '',
      languages: userData.languages || ['Korean'],
      bio: userData.bio || '',
      expectedSalary: userData.expectedSalary || '',
      preferredLocation: userData.preferredLocation || 'Seoul',
      profileCompleteness: calculateProfileCompleteness(userData),
      status: 'active',
    });
    
    console.log('Successfully recorded to Google Sheets');
  } catch (error) {
    console.error('Failed to record to Google Sheets:', error);
    // Google Sheets 오류는 사용자 경험을 방해하지 않도록 조용히 처리
  }
}
// 기업 회원가입 완료 시 호출하는 함수
export async function handleEmployerSignupComplete(employerData: any) {
  try {
    // Google Sheets에 기록
    await GoogleSheetsService.addEmployer({
      uid: employerData.uid,
      companyName: employerData.companyName,
      contactName: employerData.contactName,
      contactEmail: employerData.email,
      contactPosition: employerData.position,
      phone: employerData.phone || '',
      industry: employerData.industry || '',
      employeeCount: employerData.employeeCount || '',
      address: employerData.address || '',
      website: employerData.website || '',
      description: employerData.description || '',
      approvalStatus: 'pending',
    });
    
    // 승인 요청도 자동으로 추가
    await GoogleSheetsService.addApprovalRequest({
      companyName: employerData.companyName,
      contactName: employerData.contactName,
      contactEmail: employerData.email,
      contactPosition: employerData.position,
      phone: employerData.phone || '',
      businessNumber: employerData.businessNumber || '',
      attachments: employerData.businessLicense || '',
    });
    
  } catch (error) {
    console.error('Failed to record employer to Google Sheets:', error);
  }
}

// 포트폴리오 생성 시 호출하는 함수
export async function handlePortfolioCreate(portfolioData: any, jobSeekerName: string) {
  try {
    await GoogleSheetsService.addPortfolio({
      uid: portfolioData.id,
      jobSeekerName: jobSeekerName,
      title: portfolioData.title,
      description: portfolioData.description,
      technologies: portfolioData.technologies,
      projectUrl: portfolioData.projectUrl,
      githubUrl: portfolioData.githubUrl,
      viewCount: 0,
      likeCount: 0,
      isPublic: portfolioData.isPublic,
    });
  } catch (error) {
    console.error('Failed to record portfolio to Google Sheets:', error);
  }
}
// 채용 제안 전송 시 호출하는 함수
export async function handleJobInquiryCreate(inquiryData: any) {
  try {
    await GoogleSheetsService.addJobInquiry({
      companyName: inquiryData.companyName,
      jobSeekerName: inquiryData.jobSeekerName,
      proposedPosition: inquiryData.proposedPosition || inquiryData.title,
      jobCategory: inquiryData.jobCategory,
      message: inquiryData.message,
      proposedSalary: inquiryData.proposedSalary || inquiryData.salaryOffer,
      workingHours: inquiryData.workingHours,
      workType: inquiryData.workType || inquiryData.employmentType,
      benefits: Array.isArray(inquiryData.benefits) ? inquiryData.benefits.join(', ') : '',
      recruiterName: inquiryData.recruiterInfo?.name || '',
      recruiterPosition: inquiryData.recruiterInfo?.position || '',
      recruiterPhone: inquiryData.recruiterInfo?.phone || '',
      recruiterEmail: inquiryData.recruiterInfo?.email || '',
      companyInfo: {
        ceoName: inquiryData.companyInfo?.ceoName || '',
        industry: inquiryData.companyInfo?.industry || '',
        businessType: inquiryData.companyInfo?.businessType || '',
        location: inquiryData.companyInfo?.location || '',
        description: inquiryData.companyInfo?.description || ''
      },
      status: inquiryData.status || 'pending',
    });
  } catch (error) {
    console.error('Failed to record job inquiry to Google Sheets:', error);
  }
}

// 프로필 완성도 계산 함수
function calculateProfileCompleteness(userData: any): string {
  let completedFields = 0;
  const totalFields = 10; // 총 필수 필드 수
  
  if (userData.name) completedFields++;
  if (userData.email) completedFields++;
  if (userData.phone) completedFields++;
  if (userData.skills && userData.skills.length > 0) completedFields++;
  if (userData.experience) completedFields++;
  if (userData.education) completedFields++;
  if (userData.languages && userData.languages.length > 0) completedFields++;
  if (userData.bio) completedFields++;
  if (userData.expectedSalary) completedFields++;
  if (userData.preferredLocation) completedFields++;
  
  const percentage = Math.round((completedFields / totalFields) * 100);
  return `${percentage}%`;
}
