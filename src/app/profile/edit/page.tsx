'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  StepNavigation,
  BasicInfoStep,
  ExperienceStep,
  EducationStep,
  SkillsStep,
  IntroductionStep,
  MediaStep
} from '@/components/profile-edit';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  updateUserProfile,
  registerPortfolio
} from '@/lib/auth';
import { formatDateForInput, createSafeDate } from '@/lib/dateUtils';
import type { ExperienceItem, EducationItem, CertificateItem, AwardItem, SelfIntroduction } from '@/types';

const steps = [
  { id: 1, name: '기본 정보', description: '이름, 연락처 등' },
  { id: 2, name: '경력 사항', description: '이전 근무 경험' },
  { id: 3, name: '학력 사항', description: '교육 이력' },
  { id: 4, name: '스킬 & 자격증', description: '보유 기술과 자격' },
  { id: 5, name: '자기소개', description: '자기소개서 작성' },
  { id: 6, name: '미디어', description: '영상 및 포트폴리오' }
];

interface FormData {
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
    introVideos?: Array<{
      url: string;
      title?: string;
      addedAt: Date;
    }>;
    mediaContent: any[];
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

export default function ProfileEditPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
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
    // Experience
    experience: [],
    // Education
    education: [],
    // Skills & Certificates
    skills: {
      skills: [],
      languages: [],
      certificates: [],
      awards: []
    },
    // Self Introduction
    selfIntroduction: {
      motivation: '',
      personality: '',
      experience: '',
      aspiration: ''
    },
    // Media
    media: {
      introVideo: '',
      introVideos: [],
      mediaContent: [],
      portfolioPdfs: []
    }
  });

  useEffect(() => {
    if (!user || !userData) {
      router.push('/auth');
      return;
    }

    if (userData.role !== 'jobseeker') {
      router.push('/profile');
      return;
    }

    loadProfileData();
  }, [user, userData]);
  const loadProfileData = async () => {
    if (!user || !userData) return;

    try {
      setLoading(true);
      const profileData = await getJobSeekerProfile(user.uid);
      console.log('Loaded profile data from Firebase:', profileData); // 디버깅을 위한 로그
      
      if (profileData?.profile) {
        const profile = profileData.profile;
        console.log('Profile content:', profile); // 프로필 내용 확인
        
        // experience 배열의 날짜 데이터 확인
        if (profile.experience) {
          console.log('Experience dates:', profile.experience.map((exp: any) => ({
            startDate: exp.startDate,
            endDate: exp.endDate,
            startDateType: typeof exp.startDate,
            endDateType: typeof exp.endDate
          })));
        }
        
        // 공통 유틸리티 함수 사용
        
        setFormData({
          basicInfo: {
            name: userData.name,
            email: userData.email,
            phone: profile.phone || '',
            address: profile.address || '',
            dateOfBirth: formatDateForInput(profile.dateOfBirth),
            speciality: profile.speciality || '',
            profileImage: profile.profileImage || '',
            currentCourse: profile.currentCourse || ''
          },
          experience: (profile.experience || []).map((exp: any) => ({
            ...exp,
            startDate: exp.startDate || null,
            endDate: exp.endDate || null
          })),
          education: (profile.education || []).map((edu: any) => ({
            ...edu,
            startDate: edu.startDate || null,
            endDate: edu.endDate || null
          })),
          skills: {
            skills: profile.skills || [],
            languages: profile.languages || [],
            certificates: (profile.certificates || []).map((cert: any) => ({
              ...cert,
              issueDate: cert.issueDate || null
            })),
            awards: (profile.awards || []).map((award: any) => ({
              ...award,
              date: award.date || null
            }))
          },
          selfIntroduction: profile.selfIntroduction || {
            motivation: '',
            personality: '',
            experience: '',
            aspiration: ''
          },
          media: {
            introVideo: profile.introVideo || '',
            introVideos: profile.introVideos || [],
            mediaContent: profile.mediaContent || [],
            portfolioPdfs: profile.portfolioPdfs || [],
            additionalDocuments: profile.additionalDocuments || []
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  const handleSave = async () => {
    if (!user || !userData) return;

    try {
      setSaving(true);

      // Update user profile
      await updateUserProfile(user.uid, {
        name: formData.basicInfo.name
      });

      // 날짜 처리 헬퍼 함수 - 문자열 그대로 저장
      const processDateForSave = (dateValue: any) => {
        console.log('Processing date for save:', dateValue, 'Type:', typeof dateValue);
        
        if (!dateValue) return '';
        
        // 문자열인 경우 그대로 반환
        if (typeof dateValue === 'string') {
          return dateValue;
        }
        
        // Date 객체인 경우 문자열로 변환
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }
        
        // Firebase Timestamp인 경우
        if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
          const date = new Date(dateValue.seconds * 1000);
          return date.toISOString().split('T')[0];
        }
        
        return String(dateValue);
      };

      // experience와 education 배열의 날짜들도 처리
      const processedExperience = formData.experience.map(exp => {
        console.log('Processing experience:', exp);
        return {
          ...exp,
          startDate: processDateForSave(exp.startDate),
          endDate: processDateForSave(exp.endDate)
        };
      });

      const processedEducation = formData.education.map(edu => {
        console.log('Processing education:', edu);
        return {
          ...edu,
          startDate: processDateForSave(edu.startDate),
          endDate: processDateForSave(edu.endDate)
        };
      });

      // certificates와 awards 배열의 날짜들도 처리
      const processedCertificates = formData.skills.certificates.map(cert => {
        console.log('Processing certificate:', cert);
        return {
          ...cert,
          issueDate: processDateForSave(cert.issueDate)
        };
      });

      const processedAwards = formData.skills.awards.map(award => {
        console.log('Processing award:', award);
        return {
          ...award,
          date: processDateForSave(award.date)
        };
      });

      // Prepare profile data
      const profileData = {
        phone: formData.basicInfo.phone || '',
        address: formData.basicInfo.address || '',
        dateOfBirth: processDateForSave(formData.basicInfo.dateOfBirth || ''),
        speciality: formData.basicInfo.speciality || '',
        profileImage: formData.basicInfo.profileImage || '',
        currentCourse: formData.basicInfo.currentCourse || '',
        experience: processedExperience,
        education: processedEducation,
        skills: formData.skills.skills,
        languages: formData.skills.languages,
        certificates: processedCertificates,
        awards: processedAwards,
        selfIntroduction: formData.selfIntroduction,
        introVideo: formData.media.introVideo,
        introVideos: formData.media.introVideos,
        mediaContent: formData.media.mediaContent,
        portfolioPdfs: formData.media.portfolioPdfs,
        additionalDocuments: formData.media.additionalDocuments
      };

      // Update jobseeker profile
      await updateJobSeekerProfile(user.uid, profileData);

      // Update portfolio if needed
      await registerPortfolio(user.uid, {
        name: formData.basicInfo.name,
        speciality: formData.basicInfo.speciality || '일반',
        phone: formData.basicInfo.phone,
        address: formData.basicInfo.address,
        skills: formData.skills.skills,
        languages: formData.skills.languages,
        experience: processedExperience,
        education: processedEducation,
        description: formData.selfIntroduction.motivation || `${formData.basicInfo.speciality || '일반'} 전문가입니다.`,
        
        // 새로 추가된 필드들
        certificates: processedCertificates,
        awards: processedAwards,
        introVideo: formData.media.introVideo,
        introVideos: formData.media.introVideos,
        selfIntroduction: {
          motivation: formData.selfIntroduction.motivation || '',
          personality: formData.selfIntroduction.personality || '',
          experience: formData.selfIntroduction.experience || '',
          aspiration: formData.selfIntroduction.aspiration || ''
        },
        mediaContent: formData.media.mediaContent,
        portfolioPdfs: formData.media.portfolioPdfs,
        additionalDocuments: formData.media.additionalDocuments
      });

      alert('프로필이 성공적으로 저장되었습니다!');
      router.push('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onChange={(data) => setFormData({ ...formData, basicInfo: data })}
          />
        );
      case 2:
        return (
          <ExperienceStep
            data={formData.experience}
            onChange={(data) => setFormData({ ...formData, experience: data })}
          />
        );
      case 3:
        return (
          <EducationStep
            data={formData.education}
            onChange={(data) => setFormData({ ...formData, education: data })}
          />
        );
      case 4:
        return (
          <SkillsStep
            data={formData.skills}
            onChange={(data) => setFormData({ ...formData, skills: data })}
          />
        );
      case 5:
        return (
          <IntroductionStep
            data={formData.selfIntroduction}
            onChange={(data) => setFormData({ ...formData, selfIntroduction: data })}
          />
        );
      case 6:
        return (
          <MediaStep
            data={formData.media}
            onChange={(data) => setFormData({ ...formData, media: data })}
          />
        );
      default:
        return null;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">프로필로 돌아가기</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">프로필 편집</h1>
            <div className="w-40">{/* Spacer */}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Navigation */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            이전 단계
          </button>

          <div className="flex items-center space-x-3">
            {/* 단계 표시 */}
            <span className="text-sm text-gray-500 font-medium">
              {currentStep} / {steps.length}
            </span>
            
            {currentStep === steps.length ? (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </div>
                  ) : (
                    '저장하기'
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg"
              >
                다음 단계
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}