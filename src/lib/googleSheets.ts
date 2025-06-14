// Google Sheets API 통신 모듈
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

interface SheetData {
  action: string;
  payload: any;
}

async function sendData(data: SheetData): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script는 CORS를 지원하지 않음
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // no-cors 모드에서는 response를 읽을 수 없으므로 항상 true 반환
    return true;
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    return false;
  }
}

// 구직자 등록
export async function addJobSeeker(userData: any) {
  return sendData({
    action: 'ADD_JOBSEEKER',
    payload: {
      uid: userData.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      skills: userData.skills || [],
      experience: userData.experience,
      education: userData.education,
      languages: userData.languages || [],
      bio: userData.bio,
      expectedSalary: userData.expectedSalary,
      preferredLocation: userData.preferredLocation,
      profileCompleteness: userData.profileCompleteness || '0%',
      status: 'active',
    },
  });
}
// 기업회원 등록
export async function addEmployer(employerData: any) {
  return sendData({
    action: 'ADD_EMPLOYER',
    payload: {
      uid: employerData.uid,
      companyName: employerData.companyName,
      contactName: employerData.contactName,
      contactEmail: employerData.contactEmail,
      contactPosition: employerData.contactPosition,
      phone: employerData.phone,
      industry: employerData.industry,
      employeeCount: employerData.employeeCount,
      address: employerData.address,
      website: employerData.website,
      description: employerData.description,
      approvalStatus: 'pending',
      approvedAt: '',
      notes: '',
    },
  });
}

// 포트폴리오 등록
export async function addPortfolio(portfolioData: any) {
  return sendData({
    action: 'ADD_PORTFOLIO',
    payload: {
      uid: portfolioData.uid,
      jobSeekerName: portfolioData.jobSeekerName,
      title: portfolioData.title,
      description: portfolioData.description,
      technologies: portfolioData.technologies || [],
      projectUrl: portfolioData.projectUrl,
      githubUrl: portfolioData.githubUrl,
      viewCount: portfolioData.viewCount || 0,
      likeCount: portfolioData.likeCount || 0,
      isPublic: portfolioData.isPublic !== false,
    },
  });
}
// 채용제안 등록
export async function addJobInquiry(inquiryData: any) {
  return sendData({
    action: 'ADD_JOB_INQUIRY',
    payload: {
      companyName: inquiryData.companyName,
      jobSeekerName: inquiryData.jobSeekerName,
      proposedPosition: inquiryData.proposedPosition,
      jobCategory: inquiryData.jobCategory,
      message: inquiryData.message,
      proposedSalary: inquiryData.proposedSalary,
      workingHours: inquiryData.workingHours,
      workType: inquiryData.workType,
      benefits: inquiryData.benefits,
      recruiterName: inquiryData.recruiterName,
      recruiterPosition: inquiryData.recruiterPosition,
      recruiterPhone: inquiryData.recruiterPhone,
      recruiterEmail: inquiryData.recruiterEmail,
      companyCeoName: inquiryData.companyInfo?.ceoName,
      companyIndustry: inquiryData.companyInfo?.industry,
      companyBusinessType: inquiryData.companyInfo?.businessType,
      companyLocation: inquiryData.companyInfo?.location,
      companyDescription: inquiryData.companyInfo?.description,
      status: inquiryData.status || 'pending',
      respondedAt: '',
      notes: '',
    },
  });
}

// 승인요청 등록
export async function addApprovalRequest(requestData: any) {
  return sendData({
    action: 'ADD_APPROVAL_REQUEST',
    payload: {
      requestType: '기업승인',
      companyName: requestData.companyName,
      contactName: requestData.contactName,
      contactEmail: requestData.contactEmail,
      contactPosition: requestData.contactPosition,
      phone: requestData.phone,
      businessNumber: requestData.businessNumber,
      attachments: requestData.attachments || '',
      status: 'pending',
      processedAt: '',
      processedBy: '',
      rejectionReason: '',
    },
  });
}
// 승인상태 업데이트
export async function updateApprovalStatus(
  email: string,
  status: 'approved' | 'rejected',
  processedBy: string,
  rejectionReason?: string
) {
  return sendData({
    action: 'UPDATE_APPROVAL_STATUS',
    payload: {
      email,
      status: status === 'approved' ? '승인' : '거절',
      processedBy,
      rejectionReason: rejectionReason || '',
    },
  });
}

// 로그인 기록
export async function logLogin(loginData: any) {
  return sendData({
    action: 'LOG_LOGIN',
    payload: {
      uid: loginData.uid,
      email: loginData.email,
      userType: loginData.userType,
      ipAddress: loginData.ipAddress || '',
      browser: loginData.browser || '',
      device: loginData.device || '',
      location: loginData.location || '',
    },
  });
}
// 채용공고 등록
export async function addJobPosting(jobData: any) {
  return sendData({
    action: 'ADD_JOB_POSTING',
    payload: {
      id: jobData.id,
      employerId: jobData.employerId,
      companyName: jobData.companyName,
      title: jobData.title,
      jobCategory: jobData.jobCategory,
      description: jobData.description,
      salaryType: jobData.salary?.type,
      salaryAmount: jobData.salary?.amount,
      salaryNegotiable: jobData.salary?.negotiable,
      location: jobData.location,
      workingHours: jobData.workingHours,
      workType: jobData.workType,
      requirements: jobData.requirements || [],
      preferredQualifications: jobData.preferredQualifications || [],
      benefits: jobData.benefits || [],
      skills: jobData.skills || [],
      deadline: jobData.deadline,
      isActive: jobData.isActive,
      viewCount: jobData.viewCount || 0,
      applicationCount: jobData.applicationCount || 0,
      recruiterName: jobData.recruiterInfo?.name,
      recruiterPhone: jobData.recruiterInfo?.phone,
      isImportant: jobData.isImportant || false,
    },
  });
}
// 지원내역 등록
export async function addJobApplication(applicationData: any) {
  return sendData({
    action: 'ADD_JOB_APPLICATION',
    payload: {
      id: applicationData.id,
      jobSeekerId: applicationData.jobSeekerId,
      jobSeekerName: applicationData.jobSeekerName,
      employerId: applicationData.employerId,
      employerName: applicationData.employerName,
      jobId: applicationData.jobId,
      jobTitle: applicationData.jobTitle,
      portfolioId: applicationData.portfolioId,
      message: applicationData.message,
      status: applicationData.status,
      interviewDate: applicationData.interviewDate,
      result: applicationData.result,
      feedback: applicationData.feedback,
      processedAt: applicationData.processedAt,
    },
  });
}

// 조회 기록
export async function logView(viewData: any) {
  return sendData({
    action: 'LOG_VIEW',
    payload: {
      viewerId: viewData.viewerId,
      viewerType: viewData.viewerType,
      targetType: viewData.targetType,
      targetId: viewData.targetId,
      targetTitle: viewData.targetTitle,
      page: viewData.page,
      duration: viewData.duration,
      device: viewData.device,
      referrer: viewData.referrer,
    },
  });
}
// 검색 기록
export async function logSearch(searchData: any) {
  return sendData({
    action: 'LOG_SEARCH',
    payload: {
      userId: searchData.userId,
      userType: searchData.userType,
      searchType: searchData.searchType,
      query: searchData.query,
      categoryFilter: searchData.categoryFilter,
      locationFilter: searchData.locationFilter,
      salaryFilter: searchData.salaryFilter,
      skillFilters: searchData.skillFilters || [],
      resultCount: searchData.resultCount,
      clickedId: searchData.clickedId,
      clickedRank: searchData.clickedRank,
    },
  });
}

// 즐겨찾기 추가
export async function addFavorite(favoriteData: any) {
  return sendData({
    action: 'ADD_FAVORITE',
    payload: {
      userId: favoriteData.userId,
      userType: favoriteData.userType,
      targetType: favoriteData.targetType,
      targetId: favoriteData.targetId,
      targetName: favoriteData.targetName,
      category: favoriteData.category,
      memo: favoriteData.memo,
      notificationEnabled: favoriteData.notificationEnabled,
      deletedAt: favoriteData.deletedAt,
    },
  });
}
// 메시지 기록
export async function addMessage(messageData: any) {
  return sendData({
    action: 'ADD_MESSAGE',
    payload: {
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderType: messageData.senderType,
      receiverId: messageData.receiverId,
      receiverName: messageData.receiverName,
      receiverType: messageData.receiverType,
      title: messageData.title,
      content: messageData.content,
      isRead: messageData.isRead,
      readAt: messageData.readAt,
      attachments: messageData.attachments,
      relatedId: messageData.relatedId,
      messageType: messageData.messageType,
    },
  });
}

// 알림 기록
export async function addNotification(notificationData: any) {
  return sendData({
    action: 'ADD_NOTIFICATION',
    payload: {
      userId: notificationData.userId,
      userType: notificationData.userType,
      notificationType: notificationData.notificationType,
      title: notificationData.title,
      message: notificationData.message,
      isRead: notificationData.isRead,
      readAt: notificationData.readAt,
      actionUrl: notificationData.actionUrl,
      channel: notificationData.channel,
    },
  });
}
// 프로필 변경 기록
export async function logProfileChange(changeData: any) {
  return sendData({
    action: 'LOG_PROFILE_CHANGE',
    payload: {
      userId: changeData.userId,
      userType: changeData.userType,
      fieldName: changeData.fieldName,
      oldValue: changeData.oldValue,
      newValue: changeData.newValue,
      reason: changeData.reason,
      ipAddress: changeData.ipAddress,
      device: changeData.device,
    },
  });
}

// 자격증 추가
export async function addCertificate(certificateData: any) {
  return sendData({
    action: 'ADD_CERTIFICATE',
    payload: {
      jobSeekerId: certificateData.jobSeekerId,
      jobSeekerName: certificateData.jobSeekerName,
      name: certificateData.name,
      issuer: certificateData.issuer,
      issueDate: certificateData.issueDate,
      expiryDate: certificateData.expiryDate,
      certificateNumber: certificateData.certificateNumber,
      verified: certificateData.verified,
      notes: certificateData.notes,
    },
  });
}
// 수상경력 추가
export async function addAward(awardData: any) {
  return sendData({
    action: 'ADD_AWARD',
    payload: {
      jobSeekerId: awardData.jobSeekerId,
      jobSeekerName: awardData.jobSeekerName,
      title: awardData.title,
      organization: awardData.organization,
      date: awardData.date,
      description: awardData.description,
      prize: awardData.prize,
      evidence: awardData.evidence,
      isPublic: awardData.isPublic,
    },
  });
}

// 프로젝트 추가
export async function addProject(projectData: any) {
  return sendData({
    action: 'ADD_PROJECT',
    payload: {
      jobSeekerId: projectData.jobSeekerId,
      jobSeekerName: projectData.jobSeekerName,
      title: projectData.title,
      role: projectData.role,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      description: projectData.description,
      skills: projectData.skills || [],
      achievements: projectData.achievements,
      teamSize: projectData.teamSize,
      links: projectData.links || [],
      isPublic: projectData.isPublic,
    },
  });
}

// 기업 정보 업데이트
export async function updateEmployer(employerData: any) {
  return sendData({
    action: 'UPDATE_EMPLOYER',
    payload: {
      uid: employerData.uid,
      companyName: employerData.companyName,
      contactName: employerData.contactName,
      email: employerData.email || employerData.contactEmail, // email로 통일
      phone: employerData.phone,
      industry: employerData.industry,
      employeeCount: employerData.employeeCount,
      address: employerData.address,
      website: employerData.website,
      description: employerData.description,
    },
  });
}

// 기업 삭제
export async function deleteEmployer(employerData: any) {
  return sendData({
    action: 'DELETE_EMPLOYER',
    payload: {
      uid: employerData.uid,
      email: employerData.email,
      companyName: employerData.companyName,
    },
  });
}

// GoogleSheetsService 객체로 내보내기 (하위 호환성)
export const GoogleSheetsService = {
  addJobSeeker,
  addEmployer,
  addPortfolio,
  addJobInquiry,
  addApprovalRequest,
  updateApprovalStatus,
  logLogin,
  addJobPosting,
  addJobApplication,
  logView,
  logSearch,
  addFavorite,
  addMessage,
  addNotification,
  logProfileChange,
  addCertificate,
  addAward,
  addProject,
  updateEmployer,
  deleteEmployer,
};