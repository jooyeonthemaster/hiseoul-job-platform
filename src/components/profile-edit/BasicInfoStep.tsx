'use client';

import { useState } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface BasicInfoStepProps {
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth?: string;
    speciality: string;
  };
  onChange: (data: any) => void;
}

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const inputClasses = "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">기본 정보</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          프로필의 기본이 되는 정보를 입력해주세요. 정확한 정보를 입력할수록 더 좋은 기회를 얻을 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>
            이름 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className={iconClasses} />
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              placeholder="실명을 입력해주세요"
              required
            />
          </div>
        </div>
        
        <div>
          <label className={labelClasses}>
            이메일 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className={iconClasses} />
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`${inputClasses} bg-gray-50 cursor-not-allowed`}
              readOnly
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
        </div>

        <div>
          <label className={labelClasses}>
            전화번호 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className={iconClasses} />
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="010-0000-0000"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>
            생년월일
          </label>
          <div className="relative">
            <CalendarIcon className={iconClasses} />
            <input
              type="date"
              value={data.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <label className={labelClasses}>
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPinIcon className={iconClasses} />
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="서울특별시 강남구 ..."
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>
            전문분야 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BriefcaseIcon className={iconClasses} />
            <select
              value={data.speciality}
              onChange={(e) => handleChange('speciality', e.target.value)}
              className={`${inputClasses} appearance-none`}
              required
            >
              <option value="">전문분야를 선택하세요</option>
              <option value="SNS마케팅">📱 SNS마케팅</option>
              <option value="키워드광고">🎯 키워드광고</option>
              <option value="브랜드마케팅">🎨 브랜드마케팅</option>
              <option value="퍼포먼스마케팅">📊 퍼포먼스마케팅</option>
              <option value="콘텐츠마케팅">✍️ 콘텐츠마케팅</option>
              <option value="마케팅기획">💡 마케팅기획</option>
              <option value="이커머스마케팅">🛒 이커머스마케팅</option>
              <option value="데이터마케팅">📈 데이터마케팅</option>
              <option value="웹개발">💻 웹개발</option>
              <option value="앱개발">📱 앱개발</option>
              <option value="디자인">🎨 디자인</option>
              <option value="기타">👤 기타</option>
            </select>
            {/* 드롭다운 화살표 */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 필수 필드 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">필수 정보 안내</h4>
            <p className="mt-1 text-sm text-blue-700">
              <span className="text-red-500">*</span> 표시된 항목들은 필수 입력 사항입니다. 
              정확한 정보를 입력해주시면 더 나은 매칭 기회를 제공받을 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}