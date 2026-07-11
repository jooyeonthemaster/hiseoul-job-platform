// 포트폴리오 데이터 관리 훅
import { useState, useEffect } from 'react';
import { getPortfolio, getJobSeekerProfile } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Portfolio } from '../types/portfolio.types';
import { portfoliosDetail } from '../constants/portfolio-data';
import { getAvatarBySpeciality, formatFirebaseDate } from '../utils/portfolio.utils';
import { normalizeExternalPortfolioLinks } from '@/lib/externalPortfolioLinks';

export const usePortfolioData = (portfolioId: string, hasAccess: boolean, accessChecked: boolean) => {
  const { user, userData } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = async () => {
      // 권한 체크가 완료될 때까지 대기
      if (!accessChecked) return;
      
      // 권한이 없으면 포트폴리오를 로드하지 않음
      if (!hasAccess) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 샘플 포트폴리오 먼저 확인
        const samplePortfolio = portfoliosDetail.find(p => p.id === portfolioId);
        if (samplePortfolio) {
          setPortfolio(samplePortfolio);
          setLoading(false);
          return;
        }

        // Firebase에서 포트폴리오 가져오기
        try {
          const isOwnPortfolio = user?.uid === portfolioId;
          const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;
          const firebasePortfolio = await getPortfolio(portfolioId, isOwnPortfolio || hasAdminAccess);
          if (firebasePortfolio) {
            // Firebase에서 상세 프로필 정보도 가져오기
            const profileData = await getJobSeekerProfile(portfolioId);
            const profile = profileData?.profile;
            const portfolioRecord = firebasePortfolio as any;
            const selfIntroductionSource = profile?.selfIntroduction || portfolioRecord.selfIntroduction;
            console.log('🖼️ 포트폴리오 상세 - 프로필 데이터:', profile);
            console.log('📁 추가 문서 데이터:', profile?.additionalDocuments);
            console.log('🎥 영상 데이터 확인:', {
              introVideo: profile?.introVideo,
              introVideos: profile?.introVideos
            });
            
            const convertedPortfolio: Portfolio = {
              id: portfolioId,
              name: portfolioRecord.name || '이름 없음',
              speciality: portfolioRecord.speciality || '일반',
              experience: '경력',
              skills: Array.isArray(portfolioRecord.skills) ? portfolioRecord.skills : [],
              languages: Array.isArray(profile?.languages) ? profile.languages : Array.isArray(portfolioRecord.languages) ? portfolioRecord.languages : [],
              description: portfolioRecord.description || '설명이 없습니다.',
              avatar: getAvatarBySpeciality(portfolioRecord.speciality || '일반'),
              projects: portfolioRecord.projects || 0,
              verified: portfolioRecord.verified || false,
              location: portfolioRecord.address || profile?.address || '위치 정보 없음',
              email: portfolioRecord.email || profileData?.email || '이메일 정보 없음',
              phone: portfolioRecord.phone || profile?.phone || '연락처 정보 없음',
              contactInfoVisibleToEmployers: portfolioRecord.contactInfoVisibleToEmployers === true,
              education: '학력 정보 없음',
              introduction: portfolioRecord.description || `안녕하세요, ${portfolioRecord.speciality || '일반'} 전문가 ${portfolioRecord.name || ''}입니다.`,
              achievements: Array.isArray(portfolioRecord.achievements)
                ? portfolioRecord.achievements
                : ['포트폴리오 등록 완료'],
              workHistory: Array.isArray(portfolioRecord.experience)
                ? portfolioRecord.experience.map((exp: any) => {
                    // 경력 시작/종료일은 저장 스키마상 "YYYY-MM" 문자열(레거시는 Date/Timestamp/ISO/자유텍스트).
                    // 기존 period(자유텍스트 "2020.03~2022.05")가 있으면 그대로 보존해 회귀를 방지하고,
                    // 없을 때만 startDate/endDate를 formatFirebaseDate로 변환해 "2020년 3월 - 2022년 5월" 형태를 구성한다.
                    let period = exp.period;
                    if (!period) {
                      const start = exp.startDate ? formatFirebaseDate(exp.startDate) : '';
                      const end = exp.isCurrent
                        ? '현재'
                        : (exp.endDate ? formatFirebaseDate(exp.endDate) : '');
                      period = start && end ? `${start} - ${end}` : (start || end || '');
                    }
                    return {
                      company: exp.company || '',
                      position: exp.position || '',
                      period,
                      description: exp.description || ''
                    };
                  })
                : [{
                    company: '회사명',
                    position: (portfolioRecord.speciality || '일반') + ' 전문가',
                    period: '경력 정보 업데이트 예정',
                    description: '상세 경력 정보를 업데이트해주세요.'
                  }],
              projectDetails: Array.isArray(portfolioRecord.projects)
                ? portfolioRecord.projects.map((project: any) => ({
                    title: project.title || '프로젝트 정보 업데이트 예정',
                    description: project.description || '프로젝트 상세 정보를 업데이트해주세요.',
                    technologies: Array.isArray(project.technologies) ? project.technologies : [],
                    duration: project.duration || '기간 미정',
                    results: Array.isArray(project.results) ? project.results : ['결과 정보 업데이트 예정']
                  }))
                : [{
                    title: '프로젝트 정보 업데이트 예정',
                    description: '프로젝트 상세 정보를 업데이트해주세요.',
                    technologies: [],
                    duration: '기간 미정',
                    results: ['결과 정보 업데이트 예정']
                  }],
              profileImage: profile?.profileImage || portfolioRecord.profileImage,
              currentCourse: profile?.currentCourse || portfolioRecord.currentCourse,
              courseType: profile?.courseType || portfolioRecord.courseType || undefined,
              introVideo: profile?.introVideo || portfolioRecord.introVideo,
              introVideos: profile?.introVideos || portfolioRecord.introVideos || [],
              portfolioVideos: profile?.portfolioVideos || portfolioRecord.portfolioVideos || [],
              selfIntroduction: selfIntroductionSource &&
                Object.keys(selfIntroductionSource).length > 0 &&
                (selfIntroductionSource.motivation ||
                 selfIntroductionSource.personality ||
                 selfIntroductionSource.experience ||
                 selfIntroductionSource.aspiration ||
                 (selfIntroductionSource.useCustomSections && selfIntroductionSource.sections))
                ? {
                    motivation: selfIntroductionSource.motivation,
                    personality: selfIntroductionSource.personality,
                    experience: selfIntroductionSource.experience,
                    aspiration: selfIntroductionSource.aspiration,
                    sections: selfIntroductionSource.sections,
                    useCustomSections: selfIntroductionSource.useCustomSections
                  }
                : undefined,
              mediaContent: Array.isArray(profile?.mediaContent) && profile.mediaContent.length > 0
                ? profile.mediaContent.map((media: any) => ({
                    type: media.type || 'unknown',
                    url: media.url || '',
                    title: media.title || '제목 없음',
                    description: media.description || ''
                  }))
                : Array.isArray(portfolioRecord.mediaContent) && portfolioRecord.mediaContent.length > 0
                  ? portfolioRecord.mediaContent.map((media: any) => ({
                      type: media.type || 'unknown',
                      url: media.url || '',
                      title: media.title || '제목 없음',
                      description: media.description || ''
                    }))
                : [],
              externalLinks: normalizeExternalPortfolioLinks(profile?.externalLinks || portfolioRecord.externalLinks),
              portfolioPdfs: Array.isArray(profile?.portfolioPdfs) && profile.portfolioPdfs.length > 0
                ? profile.portfolioPdfs.map((pdf: any) => ({
                    url: pdf.url || '',
                    fileName: pdf.fileName || '파일명 없음',
                    uploadedAt: pdf.uploadedAt || null
                  }))
                : Array.isArray(portfolioRecord.portfolioPdfs) && portfolioRecord.portfolioPdfs.length > 0
                  ? portfolioRecord.portfolioPdfs.map((pdf: any) => ({
                      url: pdf.url || '',
                      fileName: pdf.fileName || '파일명 없음',
                      uploadedAt: pdf.uploadedAt || null
                    }))
                : [],
              certificates: Array.isArray(profile?.certificates) && profile.certificates.length > 0
                ? profile.certificates.map((cert: any) => ({
                    name: cert.name || '자격증명 없음',
                    issuer: cert.issuer || '발급기관 없음',
                    issueDate: cert.issueDate ? formatFirebaseDate(cert.issueDate) : '발급일 없음'
                  }))
                : [],
              awards: Array.isArray(profile?.awards) && profile.awards.length > 0
                ? profile.awards.map((award: any) => ({
                    title: award.title || '수상명 없음',
                    organization: award.organization || '수여기관 없음',
                    date: award.date ? formatFirebaseDate(award.date) : '수상일 없음',
                    description: award.description || ''
                  }))
                : [],
              detailedEducation: Array.isArray(profile?.education) && profile.education.length > 0
                ? profile.education.map((edu: any) => ({
                    institution: edu.institution || '학교명 없음',
                    degree: edu.degree || '학위 없음',
                    field: edu.field || '전공 없음',
                    startDate: edu.startDate ? formatFirebaseDate(edu.startDate) : '시작일 없음',
                    endDate: edu.endDate ? formatFirebaseDate(edu.endDate) : '',
                    grade: edu.grade || ''
                  }))
                : [],
              additionalDocuments: Array.isArray(profile?.additionalDocuments) && profile.additionalDocuments.length > 0
                ? profile.additionalDocuments.map((doc: any) => ({
                    url: doc.url || '',
                    fileName: doc.fileName || '파일명 없음',
                    fileSize: doc.fileSize || 0,
                    fileType: doc.fileType || 'unknown',
                    downloadUrl: doc.downloadUrl || doc.url || '',
                    publicId: doc.publicId || ''
                  }))
                : Array.isArray(portfolioRecord.additionalDocuments) && portfolioRecord.additionalDocuments.length > 0
                  ? portfolioRecord.additionalDocuments.map((doc: any) => ({
                      url: doc.url || '',
                      fileName: doc.fileName || '파일명 없음',
                      fileSize: doc.fileSize || 0,
                      fileType: doc.fileType || 'unknown',
                      downloadUrl: doc.downloadUrl || doc.url || '',
                      publicId: doc.publicId || ''
                    }))
                : []
            };

            setPortfolio(convertedPortfolio);
          } else {
            console.log('포트폴리오를 찾을 수 없습니다.');
            setPortfolio(null);
          }
        } catch (error) {
          console.error('Firebase 포트폴리오 로딩 오류:', error);
          setPortfolio(null);
        }
      } catch (error) {
        console.error('포트폴리오 로딩 오류:', error);
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [portfolioId, hasAccess, accessChecked, user?.uid, userData?.role, userData?.isAdmin]);

  return { portfolio, loading };
};
