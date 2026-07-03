'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, getEmployerInfo, getPortfolio } from '@/lib/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { handleJobInquiryCreate } from '@/lib/googleSheetsIntegration';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface InquiryForm {
  proposedPosition: string;
  proposedSalary: string;
  jobCategory: string;
  workingHours: string;
  workType: string;
  benefits: string[];
  message: string;
  recruiterName: string;
  recruiterPosition: string;
  recruiterPhone: string;
  recruiterEmail: string;
}

export default function ContactJobSeeker() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const portfolioId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  const [form, setForm] = useState<InquiryForm>({
    proposedPosition: '',
    proposedSalary: '',
    jobCategory: '',
    workingHours: '09:00 ~ 18:00',
    workType: 'fulltime',
    benefits: [],
    message: '',
    recruiterName: '',
    recruiterPosition: '',
    recruiterPhone: '',
    recruiterEmail: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

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

        // 기업 정보 가져오기
        const employerData = await getEmployerInfo(user.uid);
        if (!employerData || !employerData.company?.name) {
          router.push('/employer-setup');
          return;
        }
        setCompanyInfo(employerData.company);

        // 포트폴리오 정보 가져오기
        const portfolioData = await getPortfolio(portfolioId);
        if (!portfolioData) {
          router.push('/employer-dashboard');
          return;
        }
        setPortfolio(portfolioData);

        // 기본 담당자 정보 설정
        setForm(prev => ({
          ...prev,
          recruiterEmail: userData.email
        }));
      } catch (error) {
        console.error('Error loading data:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, portfolioId, router]);
  const handleBenefitToggle = (benefit: string) => {
    setForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      if (!user) throw new Error('로그인이 필요합니다.');
      if (!portfolio || !companyInfo) {
        throw new Error('채용 제안에 필요한 정보를 아직 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.');
      }

      // 채용 문의 데이터 생성
      const inquiryData = {
        jobSeekerId: portfolioId,
        employerId: user.uid,
        portfolioId: portfolioId,

        // 제안 내용
        proposedPosition: form.proposedPosition,
        proposedSalary: form.proposedSalary,
        message: form.message,

        // 근무 조건
        jobCategory: form.jobCategory,
        workingHours: form.workingHours,
        workType: form.workType,
        benefits: form.benefits,

        // 기업 정보 스냅샷
        companyInfo: {
          name: companyInfo.name,
          ceoName: companyInfo.ceoName,
          industry: companyInfo.industry,
          businessType: companyInfo.businessType,
          location: companyInfo.location,
          description: companyInfo.description,
          companyAttraction: companyInfo.companyAttraction
        },

        // 담당자 정보
        recruiterInfo: {
          name: form.recruiterName,
          position: form.recruiterPosition,
          phone: form.recruiterPhone,
          email: form.recruiterEmail
        },

        status: 'sent',
        sentAt: serverTimestamp()
      };

      console.log('📋 채용 제안 데이터 생성 완료');

      // Firestore에 저장
      const docRef = await addDoc(collection(db, 'jobInquiries'), inquiryData);
      console.log('✅ Firestore에 저장 완료:', docRef.id);

      // Google Sheets에 저장
      try {
        console.log('📊 Google Sheets에 저장 시작...');
        await handleJobInquiryCreate({
          companyName: companyInfo.name,
          jobSeekerName: portfolio.name,
          proposedPosition: form.proposedPosition,
          jobCategory: form.jobCategory,
          message: form.message,
          proposedSalary: form.proposedSalary,
          workingHours: form.workingHours,
          workType: form.workType,
          benefits: form.benefits,
          recruiterName: form.recruiterName,
          recruiterPosition: form.recruiterPosition,
          recruiterPhone: form.recruiterPhone,
          recruiterEmail: form.recruiterEmail,
          companyInfo: {
            ceoName: companyInfo.ceoName,
            industry: companyInfo.industry,
            businessType: companyInfo.businessType,
            location: companyInfo.location,
            description: companyInfo.description
          },
          status: 'pending'
        });
        console.log('✅ Google Sheets에 저장 완료');
      } catch (sheetsError) {
        console.error('❌ Google Sheets 저장 실패:', sheetsError);
        // Google Sheets 실패는 전체 프로세스를 중단하지 않음
      }

      // REQ2 (완전 관리자 중개형): 제안 전송 시 구직자에게 가는 알림/이메일 발송을 중단한다.
      // 구직자가 '특정 기업이 나를 선택/제안했다'는 사실을 화면·알림·이메일로 알 수 없어야 하며,
      // 매칭 결과는 관리자만 열람한다. 이 send-email 호출은 to: portfolio.email(구직자)로
      // 채용 제안 사실을 직접 통지하므로 전면 비활성화한다.
      // 단, 위의 jobInquiries Firestore 기록과 Google Sheets 로깅은 관리자 감독/엑셀용으로 유지한다.
      //
      // const emailResponse = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     to: portfolio.email,
      //     cc: 'nadr.jooyeon@gmail.com, tvs@techventure.co.kr',
      //     subject: `[면접심사 매칭 플랫폼] ${companyInfo.name}에서 채용 제안이 도착했습니다`,
      //     type: 'inquiry',
      //     jobSeekerName: portfolio.name,
      //     companyName: companyInfo.name,
      //     proposedPosition: form.proposedPosition,
      //     jobCategory: form.jobCategory,
      //     proposedSalary: form.proposedSalary,
      //     workType: form.workType,
      //     workingHours: form.workingHours,
      //     benefits: form.benefits,
      //     message: form.message,
      //     recruiterName: form.recruiterName,
      //     recruiterPosition: form.recruiterPosition,
      //     recruiterPhone: form.recruiterPhone,
      //     recruiterEmail: form.recruiterEmail,
      //     companyInfo: companyInfo
      //   })
      // });
      //
      // const emailResult = await emailResponse.json();
      // if (!emailResult.success) {
      //   console.error('❌ 이메일 발송 실패:', emailResult.error);
      // } else {
      //   console.log('✅ 이메일 발송 완료:', emailResult);
      // }

      // 보낸 제안 수 증가
      const currentCount = parseInt(localStorage.getItem(`sentProposals_${user.uid}`) || '0');
      localStorage.setItem(`sentProposals_${user.uid}`, (currentCount + 1).toString());

      setSuccess(true);

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/employer-dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('❌ 채용 제안 전송 실패:', error);
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  const portfolioName = portfolio?.name || '지원자';
  const companyName = companyInfo?.name || '기업';

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AuroraBackground />
        <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-azure-200 border-t-azure-500" />
      </div>
    );
  }

  if (!portfolio || !companyInfo) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-5">
        <AuroraBackground />
        <GlassCard strong className="relative w-full max-w-md p-8 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            채용 제안 정보를 불러올 수 없습니다
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            로그인 상태 또는 포트폴리오 정보를 확인한 뒤 다시 시도해주세요.
          </p>
          <GlassButton
            type="button"
            variant="primary"
            size="md"
            className="mt-6 w-full"
            onClick={() => router.push('/employer-dashboard')}
          >
            대시보드로 돌아가기
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-5">
        <AuroraBackground variant="vivid" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <GlassCard strong className="p-10 text-center">
            <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-mint-100 to-azure-50 shadow-glass">
              <CheckCircleIcon className="w-12 h-12 text-mint-500" />
            </span>
            <h2 className="font-display font-bold tracking-tight text-2xl md:text-3xl text-ink-900 mb-3">
              채용 제안이 발송되었습니다!
            </h2>
            <p className="text-ink-500 leading-relaxed mb-5">
              {portfolio.name}님에게 채용 제안이 전송되었습니다.
            </p>
            <p className="text-sm text-ink-400">
              잠시 후 대시보드로 이동합니다...
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen overflow-x-clip py-6 md:py-8 lg:py-10">
      <AuroraBackground />

      <div className="relative mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Header */}
        <ScrollReveal>
          <GlassCard className="mb-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-azure-700 shadow-glass-sm backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                  채용 제안
                </span>
                <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
                  채용 제안하기
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-ink-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-50 text-azure-600">
                      <UserIcon className="w-5 h-5" />
                    </span>
                    <span className="font-medium text-ink-700">{portfolio.name}</span>
                  </span>
                  {portfolio.speciality && (
                    <Badge tone="azure">{portfolio.speciality}</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:flex sm:items-center">
                <div className="rounded-2xl border border-white/70 bg-white/55 px-4 py-3 shadow-glass-sm">
                  <div className="text-xs font-semibold text-ink-400">기업</div>
                  <div className="mt-1 max-w-[12rem] truncate font-bold text-ink-900">{companyInfo.name}</div>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/55 px-4 py-3 shadow-glass-sm">
                  <div className="text-xs font-semibold text-ink-400">전문분야</div>
                  <div className="mt-1 max-w-[12rem] truncate font-bold text-ink-900">{portfolio.speciality || '-'}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start"
        >
          {/* 좌측: 요약 정보 */}
          <div className="space-y-5 xl:sticky xl:top-24">
            <GlassCard strong className="p-5 md:p-6">
              <h3 className="mb-4 flex items-center gap-2.5 text-lg font-semibold text-ink-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </span>
                기업 정보
              </h3>
              <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-azure-50/50 px-4 py-3">
                  <span className="text-ink-400 text-xs font-medium">기업명</span>
                  <span className="truncate text-ink-900 font-semibold">{companyInfo.name}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-azure-50/50 px-4 py-3">
                  <span className="text-ink-400 text-xs font-medium">대표</span>
                  <span className="truncate text-ink-900 font-semibold">{companyInfo.ceoName || '-'}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-azure-50/50 px-4 py-3">
                  <span className="text-ink-400 text-xs font-medium">업종</span>
                  <span className="truncate text-ink-900 font-semibold">{companyInfo.industry || '-'}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-azure-50/50 px-4 py-3">
                  <span className="text-ink-400 text-xs font-medium">위치</span>
                  <span className="truncate text-ink-900 font-semibold">{companyInfo.location || '-'}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 md:p-6">
              <h3 className="mb-4 flex items-center gap-2.5 text-lg font-semibold text-ink-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                  <UserIcon className="w-5 h-5" />
                </span>
                제안 대상
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-ink-900">{portfolio.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {portfolio.speciality && <Badge tone="azure">{portfolio.speciality}</Badge>}
                    {portfolio.currentCourse && <Badge tone="mint">{portfolio.currentCourse}</Badge>}
                  </div>
                </div>
                <div className="grid gap-2 border-t border-ink-100 pt-4 text-sm text-ink-500">
                  {portfolio.email && (
                    <div className="flex min-w-0 items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 flex-shrink-0 text-azure-500" />
                      <span className="truncate">{portfolio.email}</span>
                    </div>
                  )}
                  {portfolio.phone && (
                    <div className="flex min-w-0 items-center gap-2">
                      <PhoneIcon className="h-4 w-4 flex-shrink-0 text-azure-500" />
                      <span className="truncate">{portfolio.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* 우측: 입력 폼 */}
          <div className="grid gap-5 xl:grid-cols-2">
            {error && (
              <div className="rounded-2xl border border-coral-400/40 bg-coral-100/70 px-5 py-4 text-coral-600 shadow-glass-sm backdrop-blur-md xl:col-span-2">
                {error}
              </div>
            )}

            {/* 채용 정보 */}
            <GlassCard className="p-5 md:p-6 xl:col-span-2">
              <div className="space-y-5">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-ink-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                    <BriefcaseIcon className="w-5 h-5" />
                  </span>
                  채용 정보
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      제안 직무 *
                    </label>
                    <GlassInput
                      type="text"
                      required
                      value={form.proposedPosition}
                      onChange={(e) => setForm({...form, proposedPosition: e.target.value})}
                      placeholder="예: 디지털 마케터"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      직무 내용 *
                    </label>
                    <GlassInput
                      type="text"
                      required
                      value={form.jobCategory}
                      onChange={(e) => setForm({...form, jobCategory: e.target.value})}
                      placeholder="예: 온라인 마케팅 전략 수립 및 실행"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      제안 급여 *
                    </label>
                    <GlassInput
                      type="text"
                      required
                      value={form.proposedSalary}
                      onChange={(e) => setForm({...form, proposedSalary: e.target.value})}
                      placeholder="예: 연봉 3,000만원 ~ 4,000만원"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      근무 형태 *
                    </label>
                    <GlassSelect
                      required
                      value={form.workType}
                      onChange={(e) => setForm({...form, workType: e.target.value})}
                    >
                      <option value="fulltime">정규직</option>
                      <option value="parttime">계약직</option>
                      <option value="contract">파트타임</option>
                      <option value="intern">인턴</option>
                    </GlassSelect>
                  </div>

                  <div className="md:col-span-2 2xl:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    근무 시간
                  </label>
                  <GlassInput
                    type="text"
                    value={form.workingHours}
                    onChange={(e) => setForm({...form, workingHours: e.target.value})}
                    placeholder="예: 09:00 ~ 18:00 (탄력근무제)"
                  />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    복리후생
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                    {['4대보험', '퇴직금', '인센티브', '상여금', '건강검진',
                      '교육비 지원', '경조사 지원', '야근수당', '재택근무',
                      '탄력근무', '연차휴가', '리프레시 휴가'].map((benefit) => (
                      <motion.button
                        key={benefit}
                        type="button"
                        onClick={() => handleBenefitToggle(benefit)}
                        whileTap={{ scale: 0.96 }}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                          form.benefits.includes(benefit)
                            ? 'border-azure-400 bg-azure-50 text-azure-700 shadow-glass-sm'
                            : 'border-white/70 bg-white/55 backdrop-blur-md text-ink-600 hover:bg-white/80 hover:text-azure-700'
                        }`}
                      >
                        {benefit}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 채용 담당자 정보 */}
            <GlassCard className="h-full p-5 md:p-6">
              <div className="space-y-5">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-ink-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                    <PhoneIcon className="w-5 h-5" />
                  </span>
                  채용 담당자 정보
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      담당자명 *
                    </label>
                    <GlassInput
                      type="text"
                      required
                      value={form.recruiterName}
                      onChange={(e) => setForm({...form, recruiterName: e.target.value})}
                      placeholder="홍길동"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      직위/직책 *
                    </label>
                    <GlassInput
                      type="text"
                      required
                      value={form.recruiterPosition}
                      onChange={(e) => setForm({...form, recruiterPosition: e.target.value})}
                      placeholder="인사팀장"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      연락처 *
                    </label>
                    <GlassInput
                      type="tel"
                      required
                      value={form.recruiterPhone}
                      onChange={(e) => setForm({...form, recruiterPhone: e.target.value})}
                      placeholder="010-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      이메일 *
                    </label>
                    <GlassInput
                      type="email"
                      required
                      value={form.recruiterEmail}
                      onChange={(e) => setForm({...form, recruiterEmail: e.target.value})}
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* 메시지 */}
            <GlassCard className="h-full p-5 md:p-6">
              <div className="flex h-full flex-col space-y-5">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-ink-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-500 text-white shadow-glow">
                    <DocumentTextIcon className="w-5 h-5" />
                  </span>
                  채용 제안 메시지
                </h3>

                <div className="flex min-h-0 flex-1 flex-col">
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    {portfolio.name}님께 전달할 메시지 *
                  </label>
                  <GlassTextarea
                    required
                    rows={10}
                    className="min-h-[16rem] flex-1"
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder={`안녕하세요 ${portfolio.name}님,

${companyInfo.name}에서 ${portfolio.name}님의 포트폴리오를 보고 깊은 인상을 받아 채용 제안을 드립니다.

${portfolio.name}님의 경험과 역량이 저희 회사에서 큰 역할을 할 수 있을 것이라 확신합니다.

자세한 내용은 아래와 같습니다...`}
                  />
                </div>
              </div>
            </GlassCard>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-glass backdrop-blur-xl xl:col-span-2">
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => router.back()}
              >
                취소
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/40 border-t-white" />
                    발송 중...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5" />
                    채용 제안 발송
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
