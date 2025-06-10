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
  const { user } = useAuth();
  const portfolioId = params.id as string;

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
  }, [user, portfolioId, router]);
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

      // Firestore에 저장
      await addDoc(collection(db, 'jobInquiries'), inquiryData);

      // 이메일 발송
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: portfolio.email,
          cc: 'jooyeon74397430@gmail.com',
          subject: `[HiSeoul] ${companyInfo.name}에서 채용 제안이 도착했습니다`,
          type: 'inquiry',
          jobSeekerName: portfolio.name,
          companyName: companyInfo.name,
          position: form.proposedPosition,
          salary: form.proposedSalary,
          message: form.message,
          recruiterInfo: {
            name: form.recruiterName,
            position: form.recruiterPosition,
            phone: form.recruiterPhone,
            email: form.recruiterEmail
          },
          companyInfo: companyInfo
        })
      });

      const emailResult = await emailResponse.json();
      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
      }

      setSuccess(true);
      
      // 3초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/employer-dashboard');
      }, 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">채용 제안이 발송되었습니다!</h2>
          <p className="text-gray-600 mb-4">
            {portfolio.name}님에게 채용 제안이 전송되었습니다.
          </p>
          <p className="text-sm text-gray-500">
            잠시 후 대시보드로 이동합니다...
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">채용 제안하기</h1>
          <div className="flex items-center text-gray-600">
            <UserIcon className="w-5 h-5 mr-2" />
            <span>{portfolio.name}</span>
            <span className="mx-2">•</span>
            <span>{portfolio.speciality}</span>
          </div>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 기업 정보 표시 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              기업 정보
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">기업명:</span>
                <span className="ml-2 text-gray-900 font-medium">{companyInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-600">대표:</span>
                <span className="ml-2 text-gray-900 font-medium">{companyInfo.ceoName}</span>
              </div>
              <div>
                <span className="text-gray-600">업종:</span>
                <span className="ml-2 text-gray-900 font-medium">{companyInfo.industry}</span>
              </div>
              <div>
                <span className="text-gray-600">위치:</span>
                <span className="ml-2 text-gray-900 font-medium">{companyInfo.location}</span>
              </div>
            </div>
          </div>

          {/* 채용 정보 */}
          <div className="space-y-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              채용 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제안 직무 *
                </label>
                <input
                  type="text"
                  required
                  value={form.proposedPosition}
                  onChange={(e) => setForm({...form, proposedPosition: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 디지털 마케터"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직무 내용 *
                </label>
                <input
                  type="text"
                  required
                  value={form.jobCategory}
                  onChange={(e) => setForm({...form, jobCategory: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 온라인 마케팅 전략 수립 및 실행"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제안 급여 *
                </label>
                <input
                  type="text"
                  required
                  value={form.proposedSalary}
                  onChange={(e) => setForm({...form, proposedSalary: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 연봉 3,000만원 ~ 4,000만원"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  근무 형태 *
                </label>
                <select
                  required
                  value={form.workType}
                  onChange={(e) => setForm({...form, workType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fulltime">정규직</option>
                  <option value="parttime">계약직</option>
                  <option value="contract">파트타임</option>
                  <option value="intern">인턴</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                근무 시간
              </label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({...form, workingHours: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 09:00 ~ 18:00 (탄력근무제)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                복리후생
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['4대보험', '퇴직금', '인센티브', '상여금', '건강검진', 
                  '교육비 지원', '경조사 지원', '야근수당', '재택근무', 
                  '탄력근무', '연차휴가', '리프레시 휴가'].map((benefit) => (
                  <button
                    key={benefit}
                    type="button"
                    onClick={() => handleBenefitToggle(benefit)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-colors ${
                      form.benefits.includes(benefit)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {benefit}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 채용 담당자 정보 */}
          <div className="space-y-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
              <PhoneIcon className="w-5 h-5 mr-2" />
              채용 담당자 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자명 *
                </label>
                <input
                  type="text"
                  required
                  value={form.recruiterName}
                  onChange={(e) => setForm({...form, recruiterName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직위/직책 *
                </label>
                <input
                  type="text"
                  required
                  value={form.recruiterPosition}
                  onChange={(e) => setForm({...form, recruiterPosition: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="인사팀장"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  required
                  value={form.recruiterPhone}
                  onChange={(e) => setForm({...form, recruiterPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  value={form.recruiterEmail}
                  onChange={(e) => setForm({...form, recruiterEmail: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="hr@company.com"
                />
              </div>
            </div>
          </div>

          {/* 메시지 */}
          <div className="space-y-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              채용 제안 메시지
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {portfolio.name}님께 전달할 메시지 *
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`안녕하세요 ${portfolio.name}님,

${companyInfo.name}에서 ${portfolio.name}님의 포트폴리오를 보고 깊은 인상을 받아 채용 제안을 드립니다.

${portfolio.name}님의 경험과 역량이 저희 회사에서 큰 역할을 할 수 있을 것이라 확신합니다.

자세한 내용은 아래와 같습니다...`}
              />
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">안내:</span> 채용 제안이 발송되면 구직자의 이메일로 전송되며, 
              동시에 관리자(jooyeon74397430@gmail.com)에게도 사본이 발송됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  발송 중...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  채용 제안 발송
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}