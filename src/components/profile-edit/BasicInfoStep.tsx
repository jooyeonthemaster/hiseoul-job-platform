'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  CameraIcon,
  CheckIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { GlassDatePicker } from '@/components/ui/GlassDatePicker';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/ui/ScrollReveal';
import {
  PORTFOLIO_PROGRAMS,
  SPECIALITY_ICON_MAP,
  SPECIALITY_OPTIONS,
  formatSpecialities,
  getProgramByCourseName,
  splitSpecialities,
  type PortfolioProgram,
} from '@/lib/programs';
import { getAllPrograms } from '@/lib/customPrograms';

const CURRENT_YEAR = new Date().getFullYear();

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
  const [customSpeciality, setCustomSpeciality] = useState('');

  const selectedSpecialities = useMemo(() => splitSpecialities(data.speciality), [data.speciality]);

  // 과정 드롭다운: 정적 과정 + 관리자 커스텀 과정(2025 아카이브 등)
  const [allPrograms, setAllPrograms] = useState<PortfolioProgram[]>(PORTFOLIO_PROGRAMS);
  useEffect(() => {
    getAllPrograms().then(setAllPrograms);
  }, []);

  const selectedProgram = getProgramByCourseName(data.currentCourse, allPrograms);

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateSpecialities = (values: string[]) => {
    onChange({ ...data, speciality: formatSpecialities(values) });
  };

  const toggleSpeciality = (speciality: string) => {
    if (selectedSpecialities.includes(speciality)) {
      updateSpecialities(selectedSpecialities.filter((item) => item !== speciality));
      return;
    }

    updateSpecialities([...selectedSpecialities, speciality]);
  };

  const addCustomSpeciality = () => {
    const next = customSpeciality.trim();
    if (!next) return;

    updateSpecialities([...selectedSpecialities, next]);
    setCustomSpeciality('');
  };

  const handleCourseChange = (programId: string) => {
    const program = allPrograms.find((item) => item.id === programId);
    onChange({
      ...data,
      currentCourse: program?.name || '',
      courseType: program?.courseType,
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기가 5MB를 초과할 수 없습니다.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('JPG, PNG, WebP 형식의 이미지만 업로드할 수 있습니다.');
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
        alert('프로필 이미지가 성공적으로 업로드되었습니다.');
      } else {
        alert(result.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const fieldClasses = 'pl-11';
  const labelClasses = 'block text-sm font-medium text-ink-700 mb-2';
  const iconClasses = 'pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-azure-500/80';

  return (
    <div className="space-y-6">
      <ScrollReveal className="grid gap-5 rounded-3xl border border-white/60 bg-white/45 p-4 shadow-glass-sm backdrop-blur-md lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center lg:p-5">
        <div className="text-center">
          <div className="group relative mx-auto h-20 w-20">
            <div className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-azure-400/30 via-sky-cool-400/20 to-azure-600/30 opacity-70 blur-xl" />
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

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-900/45 opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-azure-400/60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <CameraIcon className="h-6 w-6 text-white" />
              )}
            </button>

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
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-azure-700 transition-colors hover:text-azure-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CameraIcon className="h-4 w-4" />
            {uploading ? '업로드 중...' : data.profileImage ? '이미지 변경' : '프로필 이미지 추가'}
          </button>

          <p className="mt-1 text-xs text-ink-400">JPG, PNG, WebP 형식 (최대 5MB)</p>
        </div>

        <div className="text-center lg:text-left">
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900 md:text-3xl">
            기본 <span className="text-gradient-azure">정보</span>
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500 md:text-base">
            기업이 포트폴리오를 과정별로 확인하고, 전문분야를 기준으로 빠르게 탐색할 수 있도록 실제 강점과 참여 과정을 정확히 입력해주세요.
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
              onChange={(event) => handleChange('name', event.target.value)}
              className={fieldClasses}
              placeholder="성명을 입력해주세요"
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
            <GlassInput type="email" value={data.email} className={`${fieldClasses} cursor-not-allowed bg-white/40`} readOnly />
          </div>
          <p className="mt-1.5 text-xs text-ink-400">이메일은 변경할 수 없습니다</p>
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
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="010-0000-0000"
              className={fieldClasses}
              required
            />
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem>
          <label className={labelClasses}>생년월일</label>
          <GlassDatePicker
            value={data.dateOfBirth || ''}
            onChange={(v) => handleChange('dateOfBirth', v)}
            precision="full-date"
            fromYear={CURRENT_YEAR - 100}
            toYear={CURRENT_YEAR}
          />
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
              onChange={(event) => handleChange('address', event.target.value)}
              placeholder="서울특별시 중구..."
              className={fieldClasses}
              required
            />
          </div>
        </ScrollRevealItem>

        <ScrollRevealItem className="md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>
            전문분야 <span className="text-coral-500">*</span>
          </label>
          <div className="rounded-3xl border border-white/70 bg-white/50 p-4 shadow-glass-sm backdrop-blur-md">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {SPECIALITY_OPTIONS.map((speciality) => {
                const selected = selectedSpecialities.includes(speciality);
                return (
                  <button
                    key={speciality}
                    type="button"
                    onClick={() => toggleSpeciality(speciality)}
                    className={`flex min-h-11 items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition-all ${
                      selected
                        ? 'border-azure-300 bg-azure-50 text-azure-700 shadow-glass-sm'
                        : 'border-white/70 bg-white/65 text-ink-600 hover:border-azure-200 hover:text-azure-700'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden>{SPECIALITY_ICON_MAP[speciality] || '•'}</span>
                      <span className="truncate">{speciality}</span>
                    </span>
                    {selected && <CheckIcon className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <BriefcaseIcon className={iconClasses} />
                <GlassInput
                  value={customSpeciality}
                  onChange={(event) => setCustomSpeciality(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addCustomSpeciality();
                    }
                  }}
                  placeholder="직접 입력 후 추가"
                  className={fieldClasses}
                />
              </div>
              <button
                type="button"
                onClick={addCustomSpeciality}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-azure-400 hover:to-azure-500"
              >
                <PlusIcon className="h-4 w-4" />
                추가
              </button>
            </div>

            {selectedSpecialities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedSpecialities.map((speciality) => (
                  <button
                    key={speciality}
                    type="button"
                    onClick={() => toggleSpeciality(speciality)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-azure-200 bg-azure-50 px-3 py-1 text-xs font-semibold text-azure-700"
                  >
                    {speciality}
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">여러 분야를 선택하거나 직접 입력할 수 있습니다.</p>
        </ScrollRevealItem>

        <ScrollRevealItem className="md:col-span-2 xl:col-span-3">
          <label className={labelClasses}>수행 중인 과정</label>
          <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/50 p-4 shadow-glass-sm backdrop-blur-md lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <AcademicCapIcon className={iconClasses} />
              <GlassSelect
                value={selectedProgram?.id || ''}
                onChange={(event) => handleCourseChange(event.target.value)}
                className={fieldClasses}
              >
                <option value="">수행 중인 과정을 선택하세요</option>
                {allPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </GlassSelect>
            </div>
            <div className="flex items-center rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-sm font-semibold text-ink-700">
              {selectedProgram ? `${selectedProgram.audience} · ${selectedProgram.hours}` : '과정 선택 후 자동 분류'}
            </div>
            {selectedProgram && (
              <div className="lg:col-span-2 rounded-2xl border border-azure-100 bg-azure-50/70 p-4">
                <p className="text-sm font-semibold text-azure-800">{selectedProgram.shortName}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{selectedProgram.summary}</p>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            기업은 이 과정 값을 기준으로 과정별 포트폴리오를 탐색합니다.
          </p>
        </ScrollRevealItem>
      </ScrollRevealStagger>

      <ScrollReveal delay={0.05}>
        <div className="relative overflow-hidden rounded-3xl border border-azure-200/70 bg-azure-50/60 p-4 shadow-glass-sm backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
              <InformationCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink-900">필수 정보 안내</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                <span className="text-coral-500">*</span> 표시는 필수 입력 항목입니다. 전문분야와 과정 정보는 기업 담당자가 교육생을 과정별로 검토할 때 직접 사용됩니다.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
