'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateEmployerInfo, getUserData, getEmployerInfo } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassInput, GlassTextarea, GlassSelect, Field } from '@/components/ui/GlassField';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

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

export default function EmployerSetupPage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  // 권한 체크 및 기존 정보 불러오기
  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      const userData = await getUserData(user.uid);
      if (!userData || userData.role !== 'employer') {
        router.push('/');
        return;
      }

      // 기존 회사 정보 불러오기
      try {
        const employerInfo = await getEmployerInfo(user.uid);
        if (employerInfo && employerInfo.company) {
          setCompanyData(prev => ({
            ...prev,
            name: employerInfo.company.name || userData.companyName || '',
            ceoName: employerInfo.company.ceoName || '',
            industry: employerInfo.company.industry || '',
            businessType: employerInfo.company.businessType || '',
            size: employerInfo.company.size || '',
            location: employerInfo.company.location || '',
            website: employerInfo.company.website || '',
            description: employerInfo.company.description || '',
            contactName: employerInfo.company.contactName || userData.name || '',
            contactPosition: employerInfo.company.contactPosition || '',
            contactPhone: employerInfo.company.contactPhone || ''
          }));
        } else if (userData.companyName) {
          // employers 컬렉션에 정보가 없지만 users에 회사명이 있는 경우
          setCompanyData(prev => ({
            ...prev,
            name: userData.companyName || '',
            contactName: userData.name || ''
          }));
        }
      } catch (error) {
        console.error('기존 회사 정보 불러오기 실패:', error);
        // 기존 정보 불러오기 실패해도 페이지는 정상 로드
        if (userData.companyName) {
          setCompanyData(prev => ({
            ...prev,
            name: userData.companyName || '',
            contactName: userData.name || ''
          }));
        }
      }
    };

    checkAccessAndLoadData();
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

      // 사용자 데이터 새로고침하여 hasCompletedSetup 상태 업데이트
      await refreshUserData();

      router.push('/employer-dashboard');
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

  const steps = [
    { num: 1, label: '기본 정보', icon: BuildingOfficeIcon },
    { num: 2, label: '회사의 매력', icon: SparklesIcon },
    { num: 3, label: '입력 정보 확인', icon: CheckCircleIcon },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-azure-50 via-white to-azure-100/40 py-16 md:py-24">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        <div className="mx-auto max-w-[1100px]">
          {/* Header */}
          <ScrollReveal>
            <div className="mb-10 text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                기업 온보딩
              </span>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-ink-900 leading-[1.1]">
                  기업 정보 <span className="text-gradient-azure">설정</span>
                </h1>
                <span className="font-display text-sm font-semibold text-ink-400">
                  {step} <span className="text-ink-200">/</span> 3 단계
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Stepper */}
          <ScrollReveal delay={0.06}>
            <div className="mb-10 glass-strong rounded-4xl shadow-glass px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const active = step === s.num;
                  const done = step > s.num;
                  return (
                    <div key={s.num} className="flex flex-1 items-center last:flex-none">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300 ${
                            active
                              ? 'border-transparent bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow'
                              : done
                              ? 'border-azure-200 bg-azure-50 text-azure-600'
                              : 'border-white/70 bg-white/55 text-ink-400'
                          }`}
                          animate={active ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {done ? (
                            <CheckCircleSolidIcon className="h-6 w-6" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </motion.div>
                        <div className="hidden sm:block">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-azure-600">
                            STEP {s.num}
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              active || done ? 'text-ink-900' : 'text-ink-400'
                            }`}
                          >
                            {s.label}
                          </p>
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="mx-3 h-1 flex-1 overflow-hidden rounded-full bg-ink-100 sm:mx-5">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-azure-400 to-azure-600"
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
              {/* Progress Bar */}
              <div className="mt-6 w-full bg-ink-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-azure-400 to-azure-600 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <motion.form
              onSubmit={handleSubmit}
              className="glass-strong rounded-4xl shadow-glass-lg p-6 sm:p-10 lg:p-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-8 flex items-start gap-3 rounded-2xl border border-coral-400/40 bg-coral-100/70 backdrop-blur-md px-5 py-4 text-coral-600 shadow-glass-sm"
                  >
                    <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 1: 기본 정보 */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
                      <BuildingOfficeIcon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">기본 정보</h2>
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
                    <div className="mb-6 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                        <UserIcon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-semibold text-ink-900">담당자 정보</h3>
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
                </div>
              )}
              {/* Step 2: 우리 회사의 매력 */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
                      <SparklesIcon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">우리 회사의 매력</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label={
                        <span className="inline-flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-azure-500" />
                          근무시간
                        </span>
                      }
                    >
                      <GlassInput
                        type="text"
                        value={companyData.companyAttraction.workingHours}
                        onChange={(e) => handleInputChange('companyAttraction.workingHours', e.target.value)}
                        placeholder="예: 09:00 ~ 18:00 (탄력근무제)"
                      />
                    </Field>

                    <Field
                      label={
                        <span className="inline-flex items-center gap-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-azure-500" />
                          평균 연봉 수준
                        </span>
                      }
                    >
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
                      {([
                        { key: 'remoteWork', label: '재택근무 가능' },
                        { key: 'growthOpportunity', label: '높은 성장 기회' },
                        { key: 'stockOptions', label: '스톡옵션 제공' },
                        { key: 'trainingSupport', label: '교육비 지원' },
                        { key: 'familyFriendly', label: '가족친화 기업' },
                      ] as const).map(({ key, label }) => {
                        const checked = companyData.companyAttraction[key] as boolean;
                        return (
                          <motion.label
                            key={key}
                            whileTap={{ scale: 0.98 }}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 transition-all duration-200 ${
                              checked
                                ? 'border-azure-300 bg-azure-50/80 shadow-glass-sm'
                                : 'border-white/70 bg-white/55 hover:bg-white/80'
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200 ${
                                checked
                                  ? 'border-transparent bg-gradient-to-br from-azure-500 to-azure-600 text-white'
                                  : 'border-ink-200 bg-white/70'
                              }`}
                            >
                              {checked && <CheckCircleSolidIcon className="h-5 w-5" />}
                            </span>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => handleInputChange(`companyAttraction.${key}`, e.target.checked)}
                              className="sr-only"
                            />
                            <span className={`text-sm font-medium ${checked ? 'text-azure-700' : 'text-ink-700'}`}>{label}</span>
                          </motion.label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-ink-700">
                      복리후생
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['건강검진', '상해보험', '퇴직금', '연차휴가', '경조사 지원', '명절 상여금',
                        '생일 선물', '간식 제공', '회식비 지원', '동호회 지원', '자기계발비', '야근수당'].map((benefit) => {
                        const selected = companyData.companyAttraction.benefits.includes(benefit);
                        return (
                          <motion.button
                            key={benefit}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBenefitToggle(benefit)}
                            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                              selected
                                ? 'border-transparent bg-gradient-to-r from-azure-500 to-azure-600 text-white shadow-glow'
                                : 'border-white/70 bg-white/55 text-ink-600 hover:border-azure-200 hover:bg-white/80'
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
                </div>
              )}

              {/* Step 3: 확인 */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-azure-50 text-azure-600">
                      <CheckCircleIcon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900">입력 정보 확인</h2>
                  </div>

                  <GlassCard className="p-6 sm:p-8 space-y-5">
                    <h3 className="flex items-center gap-2 font-semibold text-lg text-ink-900">
                      <BuildingOfficeIcon className="h-5 w-5 text-azure-500" />
                      기본 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                      <div>
                        <span className="text-ink-400">웹사이트:</span>
                        <span className="ml-2 text-ink-900 font-medium">{companyData.website || '없음'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ink-100">
                      <span className="text-ink-400 text-sm">기업 소개:</span>
                      <p className="mt-2 text-ink-700 leading-relaxed">{companyData.description}</p>
                    </div>

                    <div className="pt-4 border-t border-ink-100">
                      <h4 className="flex items-center gap-2 font-medium text-ink-900 mb-3">
                        <UserIcon className="h-4 w-4 text-azure-500" />
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
                  </GlassCard>

                  <GlassCard className="relative overflow-hidden p-6 sm:p-8">
                    <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-azure-200/40 blur-3xl" />
                    <h3 className="relative flex items-center gap-2 font-semibold text-lg text-ink-900 mb-4">
                      <SparklesIcon className="h-5 w-5 text-azure-500" />
                      회사의 매력
                    </h3>
                    <div className="relative space-y-3 text-sm">
                      {companyData.companyAttraction.workingHours && (
                        <div className="flex items-center text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-600 inline mr-2 shrink-0" />
                          근무시간: {companyData.companyAttraction.workingHours}
                        </div>
                      )}
                      {companyData.companyAttraction.remoteWork && (
                        <div className="flex items-center text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-600 inline mr-2 shrink-0" />
                          재택근무 가능
                        </div>
                      )}
                      {companyData.companyAttraction.benefits.length > 0 && (
                        <div className="flex items-start text-ink-700">
                          <CheckCircleIcon className="w-5 h-5 text-azure-600 inline mr-2 shrink-0 mt-0.5" />
                          <span>복리후생: {companyData.companyAttraction.benefits.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10 pt-2">
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
                      onClick={nextStep}
                    >
                      다음
                      <ArrowRightIcon className="w-5 h-5" />
                    </GlassButton>
                  ) : (
                    <GlassButton
                      type="submit"
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          저장 중...
                        </>
                      ) : (
                        <>
                          완료
                          <CheckCircleIcon className="w-5 h-5" />
                        </>
                      )}
                    </GlassButton>
                  )}
                </div>
              </div>
            </motion.form>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
