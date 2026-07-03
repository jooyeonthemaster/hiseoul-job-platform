'use client';

import { useState, useRef } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, BriefcaseIcon, CameraIcon, AcademicCapIcon, InformationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';

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
    courseType?: 'domestic' | 'foreign';
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

  // 글래스 필드 공용 스타일 — 아이콘 좌측 여백 확보
  const fieldClasses = "pl-11";
  const labelClasses = "block text-sm font-medium text-ink-700 mb-2";
  const iconClasses = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-azure-500/80";

  return (
    <div className="space-y-6">
      {/* 인트로: 프로필 이미지 + 헤딩 */}
      <ScrollReveal className="grid gap-5 rounded-3xl border border-white/60 bg-white/45 p-4 shadow-glass-sm backdrop-blur-md lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center lg:p-5">
        {/* 프로필 이미지 업로드 섹션 */}
        <div className="text-center">
          <div className="relative mx-auto h-20 w-20 group">
            {/* 은은한 azure 글로우 후광 */}
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-azure-400/30 via-sky-cool-400/20 to-azure-600/30 blur-xl opacity-70" />
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt="프로필 이미지"
                className="relative h-20 w-20 rounded-full border-4 border-white/80 object-cover shadow-glass-lg"
              />
            ) : (
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-azure-500 via-sky-cool-400 to-azure-600 shadow-glass-lg ring-4 ring-white/70">
                <UserIcon className="h-9 w-9 text-white" />
              </div>
            )}

            {/* 업로드 버튼 오버레이 */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center bg-ink-900/45 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:cursor-not-allowed focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-azure-400/60"
            >
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
              ) : (
                <CameraIcon className="h-6 w-6 text-white" />
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
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-700 transition-colors hover:text-azure-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon className="w-4 h-4" />
            {uploading ? '업로드 중...' : data.profileImage ? '이미지 변경' : '프로필 이미지 추가'}
          </button>

          <p className="mt-1 text-xs text-ink-400">
            JPG, PNG, WebP 형식 (최대 5MB)
          </p>
        </div>

        <div className="text-center lg:text-left">
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
            기본 <span className="text-gradient-azure">정보</span>
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500 md:text-base">
            프로필의 기본이 되는 정보를 입력해주세요. 정확한 정보를 입력할수록 더 좋은 기회를 얻을 수 있습니다.
          </p>
        </div>
      </ScrollReveal>

      <ScrollRevealStagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ScrollRevealItem>
          <label className={labelClasses}>
            이름 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <UserIcon className={iconClasses} />
            <GlassInput
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={fieldClasses}
              placeholder="실명을 입력해주세요"
              required
            />
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>
            이메일 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <EnvelopeIcon className={iconClasses} />
            <GlassInput
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`${fieldClasses} bg-white/40 cursor-not-allowed`}
              readOnly
            />
          </div>
          <p className="text-xs text-ink-400 mt-1.5">이메일은 변경할 수 없습니다</p>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>
            전화번호 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <PhoneIcon className={iconClasses} />
            <GlassInput
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="010-0000-0000"
              className={fieldClasses}
              required
            />
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>
            생년월일
          </label>
          <div className="relative">
            <CalendarIcon className={iconClasses} />
            <GlassInput
              type="text"
              value={data.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              placeholder="YYYY-MM-DD 형식으로 입력 (예: 1995-08-15)"
              className={fieldClasses}
            />
          </div>
          <p className="text-xs text-ink-400 mt-1.5">YYYY-MM-DD 형식으로 입력해주세요</p>
        </ScrollRevealItem>

        <ScrollRevealItem className="md:col-span-2 xl:col-span-2">
          <label className={labelClasses}>
            주소 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <MapPinIcon className={iconClasses} />
            <GlassInput
              type="text"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="서울특별시 강남구 ..."
              className={fieldClasses}
              required
            />
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>
            전문분야 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <BriefcaseIcon className={iconClasses} />
            <GlassSelect
              value={data.speciality}
              onChange={(e) => handleChange('speciality', e.target.value)}
              className={fieldClasses}
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
            </GlassSelect>
            {/* 드롭다운 화살표 */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5 text-azure-500/80" />
            </div>
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem className="md:col-span-2 xl:col-span-2">
          <label className={labelClasses}>
            수행 중인 과정
          </label>
          <div className="relative">
            <AcademicCapIcon className={iconClasses} />
            <GlassInput
              type="text"
              value={data.currentCourse || ''}
              onChange={(e) => handleChange('currentCourse', e.target.value)}
              placeholder="예: 영상콘텐츠 마케터 양성과정 3기, 외국인 유학생 AI 마케터 인턴과정"
              className={fieldClasses}
            />
          </div>
          <p className="text-xs text-ink-400 mt-1.5">
            현재 참여 중인 교육과정이나 프로그램이 있다면 입력해주세요
          </p>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>
            과정 구분 (내국인/외국인)
          </label>
          <div className="relative">
            <AcademicCapIcon className={iconClasses} />
            <GlassSelect
              value={data.courseType || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  courseType: (e.target.value as 'domestic' | 'foreign' | '') || undefined,
                })
              }
              className={fieldClasses}
            >
              <option value="">선택 안 함</option>
              <option value="domestic">내국인</option>
              <option value="foreign">외국인</option>
            </GlassSelect>
            {/* 드롭다운 화살표 */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
              <ChevronDownIcon className="w-5 h-5 text-azure-500/80" />
            </div>
          </div>
          <p className="text-xs text-ink-400 mt-1.5">
            과정 구분(내국인/외국인)을 선택해주세요
          </p>
        </ScrollRevealItem>
      </ScrollRevealStagger>

      {/* 필수 필드 안내 */}
      <ScrollReveal delay={0.05}>
        <div className="relative overflow-hidden rounded-3xl border border-azure-200/70 bg-azure-50/60 p-4 shadow-glass-sm backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
              <InformationCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-900">필수 정보 안내</h4>
              <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">
                <span className="text-coral-500">*</span> 표시된 항목들은 필수 입력 사항입니다.
                정확한 정보를 입력해주시면 더 나은 매칭 기회를 제공받을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
