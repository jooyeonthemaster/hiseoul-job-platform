'use client';

import { useState, useRef } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, BriefcaseIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface BasicInfoStepProps {
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth?: string;
    speciality: string;
    profileImage?: string;
    currentCourse?: string;
  };
  onChange: (data: any) => void;
}

export default function BasicInfoStep({ data, onChange }: BasicInfoStepProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기가 5MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        handleChange('profileImage', result.imageUrl);
        alert('프로필 이미지가 성공적으로 업로드되었습니다!');
      } else {
        alert(result.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const inputClasses = "w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-2";
  const iconClasses = "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400";

  return (
    <div className="space-y-8">
      <div className="text-center">
        {/* 프로필 이미지 업로드 섹션 */}
        <div className="mb-6">
          <div className="relative mx-auto w-24 h-24 group">
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt="프로필 이미지"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
            )}
            
            {/* 업로드 버튼 오버레이 */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <CameraIcon className="w-6 h-6 text-white" />
              )}
            </button>
            
            {/* 파일 입력 (숨김) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '업로드 중...' : data.profileImage ? '이미지 변경' : '프로필 이미지 추가'}
          </button>
          
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG, WebP 형식 (최대 5MB)
          </p>
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
              type="text"
              value={data.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              placeholder="YYYY-MM-DD 형식으로 입력 (예: 1995-08-15)"
              className={inputClasses}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
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

        <div className="md:col-span-2">
          <label className={labelClasses}>
            수행 중인 과정
          </label>
          <div className="relative">
            <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <input
              type="text"
              value={data.currentCourse || ''}
              onChange={(e) => handleChange('currentCourse', e.target.value)}
              placeholder="예: 영상콘텐츠 마케터 양성과정 3기, 외국인 유학생 AI 마케터 인턴과정"
              className={inputClasses}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            현재 참여 중인 교육과정이나 프로그램이 있다면 입력해주세요
          </p>
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