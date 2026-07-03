// 포트폴리오 데이터 관리 훅
import { useState, useEffect } from 'react';
import { getPortfolio, getJobSeekerProfile } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Portfolio } from '../types/portfolio.types';
import { portfoliosDetail } from '../constants/portfolio-data';
import { getAvatarBySpeciality, formatFirebaseDate } from '../utils/portfolio.utils';

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
            console.log('🖼️ 포트폴리오 상세 - 프로필 데이터:', profile);
            console.log('📁 추가 문서 데이터:', profile?.additionalDocuments);
            console.log('🎥 영상 데이터 확인:', {
              introVideo: profile?.introVideo,
              introVideos: profile?.introVideos
            });
            
            const convertedPortfolio: Portfolio = {
              id: portfolioId,
              name: (firebasePortfolio as any).name || '이름 없음',
              speciality: (firebasePortfolio as any).speciality || '일반',
              experience: '경력',
              skills: Array.isArray((firebasePortfolio as any).skills) ? (firebasePortfolio as any).skills : [],
              languages: Array.isArray(profile?.languages) ? profile.languages : [],
              description: (firebasePortfolio as any).description || '설명이 없습니다.',
              avatar: getAvatarBySpeciality((firebasePortfolio as any).speciality || '일반'),
              projects: (firebasePortfolio as any).projects || 0,
              verified: (firebasePortfolio as any).verified || false,
              location: (firebasePortfolio as any).address || '위치 정보 없음',
              email: (firebasePortfolio as any).email || '이메일 정보 없음',
              phone: (firebasePortfolio as any).phone || '연락처 정보 없음',
              education: '학력 정보 없음',
              introduction: (firebasePortfolio as any).description || `안녕하세요, ${(firebasePortfolio as any).speciality || '일반'} 전문가 ${(firebasePortfolio as any).name || ''}입니다.`,
              achievements: Array.isArray((firebasePortfolio as any).achievements) 
                ? (firebasePortfolio as any).achievements 
                : ['포트폴리오 등록 완료'],
              workHistory: Array.isArray((firebasePortfolio as any).experience) 
                ? (firebasePortfolio as any).experience 
                : [{
                    company: '회사명',
                    position: ((firebasePortfolio as any).speciality || '일반') + ' 전문가',
                    period: '경력 정보 업데이트 예정',
                    description: '상세 경력 정보를 업데이트해주세요.'
                  }],
              projectDetails: Array.isArray((firebasePortfolio as any).projects) 
                ? (firebasePortfolio as any).projects.map((project: any) => ({
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
              profileImage: profile?.profileImage,
              currentCourse: profile?.currentCourse,
              courseType: profile?.courseType || (firebasePortfolio as any).courseType || undefined,
              introVideo: profile?.introVideo,
              introVideos: profile?.introVideos || [],
              selfIntroduction: profile?.selfIntroduction && 
                Object.keys(profile.selfIntroduction).length > 0 &&
                (profile.selfIntroduction.motivation || 
                 profile.selfIntroduction.personality || 
                 profile.selfIntroduction.experience || 
                 profile.selfIntroduction.aspiration ||
                 (profile.selfIntroduction.useCustomSections && profile.selfIntroduction.sections))
                ? {
                    motivation: profile.selfIntroduction.motivation,
                    personality: profile.selfIntroduction.personality,
                    experience: profile.selfIntroduction.experience,
                    aspiration: profile.selfIntroduction.aspiration,
                    sections: profile.selfIntroduction.sections,
                    useCustomSections: profile.selfIntroduction.useCustomSections
                  }
                : undefined,
              mediaContent: Array.isArray(profile?.mediaContent) && profile.mediaContent.length > 0
                ? profile.mediaContent.map((media: any) => ({
                    type: media.type || 'unknown',
                    url: media.url || '',
                    title: media.title || '제목 없음',
                    description: media.description || ''
                  }))
                : [],
              portfolioPdfs: Array.isArray(profile?.portfolioPdfs) && profile.portfolioPdfs.length > 0
                ? profile.portfolioPdfs.map((pdf: any) => ({
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
