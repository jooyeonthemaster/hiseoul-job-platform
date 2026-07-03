'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { updateEmployerInfo, getUserData, getEmployerInfo } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { GlassInput, GlassTextarea, GlassSelect, Field } from '@/components/ui/GlassField';

interface CompanyData {
  name: string;
  ceoName: string;
  industry: string;
  businessType: string;
  size: string;
  location: string;
  website: string;
  description: string;
  contactName: string;
  contactPosition: string;
  contactPhone: string;
  companyAttraction: {
    workingHours: string;
    remoteWork: boolean;
    averageSalary: string;
    benefits: string[];
    growthOpportunity: boolean;
    stockOptions: boolean;
    trainingSupport: boolean;
    familyFriendly: boolean;
    etc: string;
  };
}
export default function CompanyEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  // 필수 필드들에 대한 ref 생성
  const nameRef = useRef<HTMLInputElement>(null);
  const ceoNameRef = useRef<HTMLInputElement>(null);
  const industryRef = useRef<HTMLSelectElement>(null);
  const sizeRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactPhoneRef = useRef<HTMLInputElement>(null);

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    ceoName: '',
    industry: '',
    businessType: '',
    size: '',
    location: '',
    website: '',
    description: '',
    contactName: '',
    contactPosition: '',
    contactPhone: '',
    companyAttraction: {
      workingHours: '09:00 ~ 18:00',
      remoteWork: false,
      averageSalary: '',
      benefits: [],
      growthOpportunity: false,
      stockOptions: false,
      trainingSupport: false,
      familyFriendly: false,
      etc: ''
    }
  });
  // 기존 데이터 불러오기
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'employer') {
          router.push('/');
          return;
        }

        const employerData = await getEmployerInfo(user.uid);
        if (employerData && employerData.company) {
          setCompanyData(prev => ({
            ...prev,
            ...employerData.company,
            // 담당자 정보 매핑
            contactName: employerData.company.contactName || userData.name || '',
            contactPosition: employerData.company.contactPosition || '',
            contactPhone: employerData.company.contactPhone || '',
            companyAttraction: {
              ...prev.companyAttraction,
              ...(employerData.company.companyAttraction || {})
            }
          }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user, router]);
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCompanyData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CompanyData] as any,
          [child]: value
        }
      }));
    } else {
      setCompanyData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBenefitToggle = (benefit: string) => {
    setCompanyData(prev => ({
      ...prev,
      companyAttraction: {
        ...prev.companyAttraction,
        benefits: prev.companyAttraction.benefits.includes(benefit)
          ? prev.companyAttraction.benefits.filter(b => b !== benefit)
          : [...prev.companyAttraction.benefits, benefit]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('로그인이 필요합니다.');

      await updateEmployerInfo(user.uid, companyData);
      setSuccess(true);

      setTimeout(() => {
        router.push('/employer-dashboard');
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      { field: 'name', label: '기업명', ref: nameRef },
      { field: 'ceoName', label: '대표이사명', ref: ceoNameRef },
      { field: 'industry', label: '업종', ref: industryRef },
      { field: 'size', label: '기업 규모', ref: sizeRef },
      { field: 'location', label: '기업 주소', ref: locationRef },
      { field: 'description', label: '기업 소개', ref: descriptionRef },
      { field: 'contactName', label: '담당자명', ref: contactNameRef },
      { field: 'contactPhone', label: '담당자 연락처', ref: contactPhoneRef }
    ];

    const emptyFields = requiredFields.filter(({ field }) => !companyData[field as keyof CompanyData]);

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(({ label }) => label).join(', ');
      setError(`다음 필수 항목을 입력해주세요: ${fieldNames}`);

      // 첫 번째 빈 필드로 스크롤
      const firstEmptyField = emptyFields[0];
      if (firstEmptyField.ref.current) {
        firstEmptyField.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        firstEmptyField.ref.current.focus();
      }

      return false;
    }

    setError('');
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateRequiredFields()) {
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (initialLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 flex items-center justify-center">
        <AuroraBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500" />
          <p className="text-sm text-ink-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: '기본 정보', icon: BuildingOfficeIcon },
    { num: 2, label: '우리 회사의 매력', icon: BriefcaseIcon },
    { num: 3, label: '입력 정보 확인', icon: CheckCircleIcon },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-cool-50/40 py-16 md:py-24">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        <div className="mx-auto max-w-[1100px]">
          {/* Header */}
          <ScrollReveal className="mb-10">
            <Link
              href="/employer-dashboard"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-azure-600 transition-colors mb-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-glass-sm transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-azure-600">
                <ArrowLeftIcon className="w-4 h-4" />
              </span>
              대시보드로 돌아가기
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                  기업정보 관리
                </span>
                <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight text-ink-900">기업 정보 수정</h1>
              </div>
              <Badge tone="azure" className="text-sm px-4 py-1.5">
                {step} / 3 단계
              </Badge>
            </div>

            {/* Step indicator */}
            <div className="mt-8 flex items-center gap-3 sm:gap-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div key={s.num} className="flex flex-1 items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-br from-azure-500 to-azure-600 border-transparent text-white shadow-glow'
                            : isDone
                            ? 'bg-azure-50 border-azure-200 text-azure-600'
                            : 'bg-white/60 backdrop-blur-md border-white/70 text-ink-400'
                        }`}
                      >
                        {isDone ? <CheckCircleIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </span>
                      <span
                        className={`hidden sm:block text-sm font-medium truncate transition-colors duration-300 ${
                          isActive ? 'text-ink-900' : 'text-ink-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="relative h-1 flex-1 rounded-full bg-ink-100 overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-azure-400 to-azure-600"
                          initial={false}
                          animate={{ width: step > s.num ? '100%' : '0%' }}
                          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 flex items-center gap-3 rounded-3xl bg-mint-100 border border-mint-400/40 text-mint-600 px-5 py-4 shadow-glass"
              >
                <CheckCircleIcon className="w-5 h-5 shrink-0" />
                <span className="font-medium">기업 정보가 성공적으로 업데이트되었습니다. 잠시 후 대시보드로 이동합니다...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard strong className="p-6 sm:p-10 lg:p-12 rounded-4xl shadow-glass-lg">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="mb-8 rounded-2xl bg-coral-100 border border-coral-400/40 text-coral-600 px-5 py-4 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: 기본 정보 */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                      <BuildingOfficeIcon className="w-6 h-6" />
                    </span>
                    <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900">기본 정보</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="기업명" required>
                      <GlassInput
                        ref={nameRef}
                        type="text"
                        required
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="(사)기술벤처스타트업협회"
                      />
                    </Field>

                    <Field label="대표이사명" required>
                      <GlassInput
                        ref={ceoNameRef}
                        type="text"
                        required
                        value={companyData.ceoName}
                        onChange={(e) => handleInputChange('ceoName', e.target.value)}
                        placeholder="홍길동"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="업종" required>
                      <GlassSelect
                        ref={industryRef}
                        required
                        value={companyData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        <option value="IT/인터넷">IT/인터넷</option>
                        <option value="제조업">제조업</option>
                        <option value="서비스업">서비스업</option>
                        <option value="금융/은행">금융/은행</option>
                        <option value="교육">교육</option>
                        <option value="의료/제약">의료/제약</option>
                        <option value="건설/부동산">건설/부동산</option>
                        <option value="유통/무역">유통/무역</option>
                        <option value="미디어/광고">미디어/광고</option>
                        <option value="기타">기타</option>
                      </GlassSelect>
                    </Field>

                    <Field label="세부 업종">
                      <GlassInput
                        type="text"
                        value={companyData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        placeholder="예: 교육서비스업"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="기업 규모" required>
                      <GlassSelect
                        ref={sizeRef}
                        required
                        value={companyData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        <option value="1-10">1-10명</option>
                        <option value="11-50">11-50명</option>
                        <option value="51-100">51-100명</option>
                        <option value="101-300">101-300명</option>
                        <option value="301-1000">301-1000명</option>
                        <option value="1000+">1000명 이상</option>
                      </GlassSelect>
                    </Field>

                    <Field label="웹사이트">
                      <GlassInput
                        type="url"
                        value={companyData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.example.com"
                      />
                    </Field>
                  </div>

                  <Field label="기업 주소" required>
                    <GlassInput
                      ref={locationRef}
                      type="text"
                      required
                      value={companyData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="서울시 강남구 테헤란로 123"
                    />
                  </Field>

                  <Field label="기업 소개" required>
                    <GlassTextarea
                      ref={descriptionRef}
                      required
                      rows={4}
                      value={companyData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="기업의 비전, 미션, 주요 사업 분야 등을 자유롭게 작성해주세요."
                    />
                  </Field>

                  {/* 담당자 정보 섹션 추가 */}
                  <div className="border-t border-ink-100 pt-8 mt-2">
                    <div className="flex items-center gap-2.5 mb-6">
                      <UserIcon className="w-5 h-5 text-azure-600" />
                      <h3 className="font-semibold text-lg text-ink-900">담당자 정보</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="담당자명" required>
                        <GlassInput
                          ref={contactNameRef}
                          type="text"
                          required
                          value={companyData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          placeholder="김담당"
                        />
                      </Field>

                      <Field label="담당자 직급">
                        <GlassInput
                          type="text"
                          value={companyData.contactPosition}
                          onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                          placeholder="인사팀 과장"
                        />
                      </Field>

                      <Field label="담당자 전화번호" required>
                        <GlassInput
                          ref={contactPhoneRef}
                          type="tel"
                          required
                          value={companyData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          placeholder="010-1234-5678"
                        />
                      </Field>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: 우리 회사의 매력 */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                      <BriefcaseIcon className="w-6 h-6" />
                    </span>
                    <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900">우리 회사의 매력</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="근무시간">
                      <GlassInput
                        type="text"
                        value={companyData.companyAttraction.workingHours}
                        onChange={(e) => handleInputChange('companyAttraction.workingHours', e.target.value)}
                        placeholder="예: 09:00 ~ 18:00 (탄력근무제)"
                      />
                    </Field>

                    <Field label="평균 연봉 수준">
                      <GlassInput
                        type="text"
                        value={companyData.companyAttraction.averageSalary}
                        onChange={(e) => handleInputChange('companyAttraction.averageSalary', e.target.value)}
                        placeholder="예: 신입 3,000만원 ~ 4,000만원"
                      />
                    </Field>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-ink-700">
                      해당하는 항목을 모두 선택해주세요
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3.5 shadow-glass-sm transition-all duration-300 hover:bg-white/80 hover:border-azure-200">
                        <input
                          type="checkbox"
                          checked={companyData.companyAttraction.remoteWork}
                          onChange={(e) => handleInputChange('companyAttraction.remoteWork', e.target.checked)}
                          className="w-5 h-5 text-azure-600 border-ink-200 rounded-md focus:ring-azure-400/50 accent-azure-600"
                        />
                        <span className="text-ink-700 font-medium">재택근무 가능</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3.5 shadow-glass-sm transition-all duration-300 hover:bg-white/80 hover:border-azure-200">
                        <input
                          type="checkbox"
                          checked={companyData.companyAttraction.growthOpportunity}
                          onChange={(e) => handleInputChange('companyAttraction.growthOpportunity', e.target.checked)}
                          className="w-5 h-5 text-azure-600 border-ink-200 rounded-md focus:ring-azure-400/50 accent-azure-600"
                        />
                        <span className="text-ink-700 font-medium">높은 성장 기회</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3.5 shadow-glass-sm transition-all duration-300 hover:bg-white/80 hover:border-azure-200">
                        <input
                          type="checkbox"
                          checked={companyData.companyAttraction.stockOptions}
                          onChange={(e) => handleInputChange('companyAttraction.stockOptions', e.target.checked)}
                          className="w-5 h-5 text-azure-600 border-ink-200 rounded-md focus:ring-azure-400/50 accent-azure-600"
                        />
                        <span className="text-ink-700 font-medium">스톡옵션 제공</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3.5 shadow-glass-sm transition-all duration-300 hover:bg-white/80 hover:border-azure-200">
                        <input
                          type="checkbox"
                          checked={companyData.companyAttraction.trainingSupport}
                          onChange={(e) => handleInputChange('companyAttraction.trainingSupport', e.target.checked)}
                          className="w-5 h-5 text-azure-600 border-ink-200 rounded-md focus:ring-azure-400/50 accent-azure-600"
                        />
                        <span className="text-ink-700 font-medium">교육비 지원</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 px-4 py-3.5 shadow-glass-sm transition-all duration-300 hover:bg-white/80 hover:border-azure-200">
                        <input
                          type="checkbox"
                          checked={companyData.companyAttraction.familyFriendly}
                          onChange={(e) => handleInputChange('companyAttraction.familyFriendly', e.target.checked)}
                          className="w-5 h-5 text-azure-600 border-ink-200 rounded-md focus:ring-azure-400/50 accent-azure-600"
                        />
                        <span className="text-ink-700 font-medium">가족친화 기업</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-3">
                      복리후생
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['건강검진', '상해보험', '퇴직금', '연차휴가', '경조사 지원', '명절 상여금',
                        '생일 선물', '간식 제공', '회식비 지원', '동호회 지원', '자기계발비', '야근수당'].map((benefit) => {
                        const selected = companyData.companyAttraction.benefits.includes(benefit);
                        return (
                          <motion.button
                            key={benefit}
                            type="button"
                            onClick={() => handleBenefitToggle(benefit)}
                            whileTap={{ scale: 0.96 }}
                            className={`px-4 py-2.5 rounded-2xl border text-sm font-medium transition-all duration-300 ${
                              selected
                                ? 'border-transparent bg-gradient-to-r from-azure-500 to-azure-600 text-white shadow-glow'
                                : 'border-white/70 bg-white/55 backdrop-blur-md text-ink-600 shadow-glass-sm hover:bg-white/80 hover:border-azure-200 hover:text-azure-700'
                            }`}
                          >
                            {benefit}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <Field label="기타 매력 포인트">
                    <GlassTextarea
                      rows={3}
                      value={companyData.companyAttraction.etc}
                      onChange={(e) => handleInputChange('companyAttraction.etc', e.target.value)}
                      placeholder="위 항목에 없는 회사의 매력을 자유롭게 작성해주세요."
                    />
                  </Field>
                </motion.div>
              )}

              {/* Step 3: 확인 */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                      <CheckCircleIcon className="w-6 h-6" />
                    </span>
                    <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900">입력 정보 확인</h2>
                  </div>

                  <div className="rounded-3xl bg-white/55 backdrop-blur-md border border-white/60 shadow-glass p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-2.5">
                      <BuildingOfficeIcon className="w-5 h-5 text-azure-600" />
                      <h3 className="font-semibold text-lg text-ink-900">기본 정보</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div>
                        <span className="text-ink-400">기업명:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.name}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">대표이사:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.ceoName}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">업종:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.industry}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">세부 업종:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.businessType}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">규모:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.size}</span>
                      </div>
                      <div>
                        <span className="text-ink-400">위치:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.location}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-ink-400 text-sm">기업 소개:</span>
                      <p className="mt-2 text-ink-700 leading-relaxed">{companyData.description}</p>
                    </div>

                    <div className="pt-5 border-t border-ink-100">
                      <h4 className="flex items-center gap-2 font-medium text-ink-900 mb-3">
                        <UserIcon className="w-4 h-4 text-azure-600" />
                        담당자 정보
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-ink-400">담당자명:</span>
                          <span className="ml-2 text-ink-900 font-medium">{companyData.contactName}</span>
                        </div>
                        <div>
                          <span className="text-ink-400">직급:</span>
                          <span className="ml-2 text-ink-900 font-medium">{companyData.contactPosition}</span>
                        </div>
                        <div>
                          <span className="text-ink-400">전화번호:</span>
                          <span className="ml-2 text-ink-900 font-medium">{companyData.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-azure-50/70 backdrop-blur-md border border-azure-100 shadow-glass p-6 sm:p-8">
                    <div className="flex items-center gap-2.5 mb-4">
                      <BriefcaseIcon className="w-5 h-5 text-azure-600" />
                      <h3 className="font-semibold text-lg text-ink-900">회사의 매력</h3>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      {companyData.companyAttraction.workingHours && (
                        <div className="flex items-start gap-2 text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-500 shrink-0" />
                          <span>근무시간: {companyData.companyAttraction.workingHours}</span>
                        </div>
                      )}
                      {companyData.companyAttraction.remoteWork && (
                        <div className="flex items-start gap-2 text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-500 shrink-0" />
                          <span>재택근무 가능</span>
                        </div>
                      )}
                      {companyData.companyAttraction.benefits.length > 0 && (
                        <div className="flex items-start gap-2 text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-500 shrink-0" />
                          <span>복리후생: {companyData.companyAttraction.benefits.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-10 pt-8 border-t border-ink-100">
                {step > 1 && (
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    이전
                  </GlassButton>
                )}

                <div className="ml-auto">
                  {step < 3 ? (
                    <GlassButton
                      type="button"
                      variant="primary"
                      onClick={nextStep}
                    >
                      다음
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : (
                    <GlassButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          수정 완료
                          <CheckCircleIcon className="w-5 h-5" />
                        </>
                      )}
                    </GlassButton>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
