'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { updateEmployerInfo, getUserData, getEmployerInfo } from '@/lib/auth';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  UserIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/employer-dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            대시보드로 돌아가기
          </Link>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">기업 정보 수정</h1>
            <span className="text-sm text-gray-600">
              {step} / 3 단계
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            기업 정보가 성공적으로 업데이트되었습니다. 잠시 후 대시보드로 이동합니다...
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기업명 *
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    required
                    value={companyData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(주)하이서울"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표이사명 *
                  </label>
                  <input
                    ref={ceoNameRef}
                    type="text"
                    required
                    value={companyData.ceoName}
                    onChange={(e) => handleInputChange('ceoName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업종 *
                  </label>
                  <select
                    ref={industryRef}
                    required
                    value={companyData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    세부 업종
                  </label>                  <input
                    type="text"
                    value={companyData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 교육서비스업"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기업 규모 *
                  </label>
                  <select
                    ref={sizeRef}
                    required
                    value={companyData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="1-10">1-10명</option>
                    <option value="11-50">11-50명</option>
                    <option value="51-100">51-100명</option>
                    <option value="101-300">101-300명</option>
                    <option value="301-1000">301-1000명</option>
                    <option value="1000+">1000명 이상</option>
                  </select>                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    웹사이트
                  </label>
                  <input
                    type="url"
                    value={companyData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기업 주소 *
                </label>
                <input
                  ref={locationRef}
                  type="text"
                  required
                  value={companyData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="서울시 강남구 테헤란로 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기업 소개 *
                </label>
                <textarea
                  ref={descriptionRef}
                  required
                  rows={4}
                  value={companyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="기업의 비전, 미션, 주요 사업 분야 등을 자유롭게 작성해주세요."
                />
              </div>

              {/* 담당자 정보 섹션 추가 */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">담당자 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당자명 *
                    </label>
                    <input
                      ref={contactNameRef}
                      type="text"
                      required
                      value={companyData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="김담당"
                    />                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당자 직급
                    </label>
                    <input
                      type="text"
                      value={companyData.contactPosition}
                      onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="인사팀 과장"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당자 전화번호 *
                    </label>
                    <input
                      ref={contactPhoneRef}
                      type="tel"
                      required
                      value={companyData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>              </div>
            </div>
          )}

          {/* Step 2: 우리 회사의 매력 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">우리 회사의 매력</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    근무시간
                  </label>
                  <input
                    type="text"
                    value={companyData.companyAttraction.workingHours}
                    onChange={(e) => handleInputChange('companyAttraction.workingHours', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 09:00 ~ 18:00 (탄력근무제)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평균 연봉 수준
                  </label>
                  <input
                    type="text"
                    value={companyData.companyAttraction.averageSalary}                    onChange={(e) => handleInputChange('companyAttraction.averageSalary', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 신입 3,000만원 ~ 4,000만원"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  해당하는 항목을 모두 선택해주세요
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyData.companyAttraction.remoteWork}
                      onChange={(e) => handleInputChange('companyAttraction.remoteWork', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">재택근무 가능</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyData.companyAttraction.growthOpportunity}
                      onChange={(e) => handleInputChange('companyAttraction.growthOpportunity', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />                    <span className="text-gray-700">높은 성장 기회</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyData.companyAttraction.stockOptions}
                      onChange={(e) => handleInputChange('companyAttraction.stockOptions', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">스톡옵션 제공</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyData.companyAttraction.trainingSupport}
                      onChange={(e) => handleInputChange('companyAttraction.trainingSupport', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">교육비 지원</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={companyData.companyAttraction.familyFriendly}
                      onChange={(e) => handleInputChange('companyAttraction.familyFriendly', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">가족친화 기업</span>                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  복리후생
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['건강검진', '상해보험', '퇴직금', '연차휴가', '경조사 지원', '명절 상여금', 
                    '생일 선물', '간식 제공', '회식비 지원', '동호회 지원', '자기계발비', '야근수당'].map((benefit) => (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() => handleBenefitToggle(benefit)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        companyData.companyAttraction.benefits.includes(benefit)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {benefit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기타 매력 포인트                </label>
                <textarea
                  rows={3}
                  value={companyData.companyAttraction.etc}
                  onChange={(e) => handleInputChange('companyAttraction.etc', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="위 항목에 없는 회사의 매력을 자유롭게 작성해주세요."
                />
              </div>
            </div>
          )}

          {/* Step 3: 확인 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">입력 정보 확인</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">기본 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">기업명:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">대표이사:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.ceoName}</span>
                  </div>
                  <div>                    <span className="text-gray-600">업종:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.industry}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">세부 업종:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.businessType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">규모:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">위치:</span>
                    <span className="ml-2 text-gray-900 font-medium">{companyData.location}</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <span className="text-gray-600">기업 소개:</span>
                  <p className="mt-2 text-gray-900">{companyData.description}</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">담당자 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">담당자명:</span>
                      <span className="ml-2 text-gray-900 font-medium">{companyData.contactName}</span>
                    </div>                    <div>
                      <span className="text-gray-600">직급:</span>
                      <span className="ml-2 text-gray-900 font-medium">{companyData.contactPosition}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">전화번호:</span>
                      <span className="ml-2 text-gray-900 font-medium">{companyData.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">회사의 매력</h3>
                <div className="space-y-2 text-sm">
                  {companyData.companyAttraction.workingHours && (
                    <div>
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
                      근무시간: {companyData.companyAttraction.workingHours}
                    </div>
                  )}
                  {companyData.companyAttraction.remoteWork && (
                    <div>
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
                      재택근무 가능
                    </div>
                  )}
                  {companyData.companyAttraction.benefits.length > 0 && (
                    <div>                      <CheckCircleIcon className="w-5 h-5 text-blue-600 inline mr-2" />
                      복리후생: {companyData.companyAttraction.benefits.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
            )}
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  다음
                  <ArrowRightIcon className="w-5 h-5 ml-2" />                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      수정 완료
                      <CheckCircleIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}