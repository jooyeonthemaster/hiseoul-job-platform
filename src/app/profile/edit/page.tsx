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
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  updateUserProfile,
  registerPortfolio
} from '@/lib/auth';
import { formatDateForInput } from '@/lib/dateUtils';
import type { ExperienceItem, EducationItem, CertificateItem, AwardItem, SelfIntroduction } from '@/types';
import type { ExternalPortfolioLink } from '@/lib/externalPortfolioLinks';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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
    courseType?: 'domestic' | 'foreign';
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
    externalLinks?: ExternalPortfolioLink[];
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
      currentCourse: '',
      courseType: undefined
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
      externalLinks: [],
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
            currentCourse: profile.currentCourse || '',
            courseType: profile.courseType || undefined
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
            externalLinks: profile.externalLinks || [],
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
        courseType: formData.basicInfo.courseType || '',
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
        externalLinks: formData.media.externalLinks,
        portfolioPdfs: formData.media.portfolioPdfs,
        additionalDocuments: formData.media.additionalDocuments
      };

      // Update jobseeker profile
      await updateJobSeekerProfile(user.uid, profileData);

      // Update portfolio if needed
      await registerPortfolio(user.uid, {
        name: formData.basicInfo.name,
        speciality: formData.basicInfo.speciality || '일반',
        currentCourse: formData.basicInfo.currentCourse || '',
        courseType: formData.basicInfo.courseType || undefined,
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
        selfIntroduction: formData.selfIntroduction,
        mediaContent: formData.media.mediaContent,
        externalLinks: formData.media.externalLinks,
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-azure-50 via-azure-50/60 to-white">
        <AuroraBackground />
        <div className="relative glass-card flex flex-col items-center gap-5 px-12 py-14">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500" />
          <p className="text-ink-500 font-medium">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const activeStep = steps.find((step) => step.id === currentStep);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-azure-50 via-azure-50/50 to-white">
      <AuroraBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto w-full max-w-[1680px] px-4 sm:px-6 lg:px-8 2xl:px-10">
          <div className="flex h-14 items-center justify-between gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="font-medium">프로필로 돌아가기</span>
            </button>
            <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-ink-900">프로필 편집</h1>
            <div className="w-40 hidden sm:block">{/* Spacer */}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 md:py-7 lg:px-8 2xl:px-10">
        <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          <aside className="space-y-4 xl:sticky xl:top-[4.5rem]">
            <ScrollReveal>
              <GlassCard strong className="p-5 md:p-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-semibold text-azure-700 shadow-glass-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-azure-500" />
                  포트폴리오 프로필
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-ink-900">
                  나를 보여주는 <span className="text-gradient-azure">프로필</span>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  단계별 정보를 빠르게 정리하세요. 입력 영역은 넓게, 이동 버튼은 화면 하단에서 바로 사용할 수 있게 배치했습니다.
                </p>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <GlassCard strong className="p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge tone="azure">
                    단계 {currentStep} / {steps.length}
                  </Badge>
                  {activeStep && (
                    <span className="truncate text-sm font-semibold text-ink-700">
                      {activeStep.name}
                    </span>
                  )}
                </div>
                <StepNavigation
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                  variant="rail"
                />
              </GlassCard>
            </ScrollReveal>
          </aside>

          <section className="min-w-0 space-y-4">
            <ScrollReveal delay={0.1}>
              <GlassCard strong className="min-h-[calc(100vh-11rem)] p-5 sm:p-6 lg:p-7">
                {activeStep && (
                  <div className="mb-5 border-b border-ink-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 font-display text-base font-bold text-white shadow-glow">
                        {currentStep}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold tracking-tight text-ink-900 md:text-2xl">
                          {activeStep.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-ink-400">{activeStep.description}</p>
                      </div>
                    </div>
                  </div>
                )}
                {renderStepContent()}
              </GlassCard>
            </ScrollReveal>

            {/* Navigation Buttons */}
            <div className="sticky bottom-4 z-30 flex flex-col items-stretch gap-3 rounded-3xl border border-white/70 bg-white/75 p-3 shadow-glass-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <GlassButton
              variant="secondary"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="sm:min-w-32"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              이전 단계
            </GlassButton>

            <div className="flex items-center justify-end gap-3">
              {/* 단계 표시 */}
              <span className="text-sm text-ink-400 font-medium tabular-nums">
                {currentStep} / {steps.length}
              </span>

              {currentStep === steps.length ? (
                <>
                  <GlassButton
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                  >
                    취소
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" />
                        저장 중...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        저장하기
                      </span>
                    )}
                  </GlassButton>
                </>
              ) : (
                <GlassButton
                  variant="primary"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  className="sm:min-w-36"
                >
                  다음 단계
                  <ArrowRightIcon className="w-4 h-4" />
                </GlassButton>
              )}
            </div>
          </div>
          </section>
        </div>
      </main>
    </div>
  );
}
