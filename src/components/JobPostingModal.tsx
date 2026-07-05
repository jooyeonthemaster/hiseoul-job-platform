'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BriefcaseIcon,
  MapPinIcon,
  BanknotesIcon,
  ListBulletIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { Field, GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/GlassField';
import { GlassDatePicker } from '@/components/ui/GlassDatePicker';

const CURRENT_YEAR = new Date().getFullYear();

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function JobPostingModal({ isOpen, onClose, onSubmit }: JobPostingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    jobCategory: '개발',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    workingHours: '09:00 ~ 18:00',
    workType: 'fulltime',
    benefits: [''],
    preferredQualifications: [''],
    skills: [''],
    salary: {
      type: '연봉',
      amount: '',
      negotiable: true
    },
    recruiterInfo: {
      name: '',
      position: '',
      phone: '',
      email: ''
    },
    deadline: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (field: string, subField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field as keyof typeof prev] as any,
        [subField]: value
      }
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) =>
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 빈 문자열 제거
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(item => item.trim() !== ''),
      responsibilities: formData.responsibilities.filter(item => item.trim() !== ''),
      benefits: formData.benefits.filter(item => item.trim() !== ''),
      preferredQualifications: formData.preferredQualifications.filter(item => item.trim() !== ''),
      skills: formData.skills.filter(item => item.trim() !== ''),
      employerId: 'employer-001' // 임시 값
    };

    onSubmit(cleanedData);
    onClose();

    // 폼 초기화
    setFormData({
      title: '',
      jobCategory: '개발',
      description: '',
      requirements: [''],
      responsibilities: [''],
      location: '',
      workingHours: '09:00 ~ 18:00',
      workType: 'fulltime',
      benefits: [''],
      preferredQualifications: [''],
      skills: [''],
      salary: {
        type: '연봉',
        amount: '',
        negotiable: true
      },
      recruiterInfo: {
        name: '',
        position: '',
        phone: '',
        email: ''
      },
      deadline: ''
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-strong rounded-4xl shadow-glass-lg w-full max-w-[1100px] max-h-[92vh] overflow-hidden"
          >
            {/* 상단 azure 글로우 림 */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[60%] -translate-x-1/2 rounded-full bg-azure-300/30 blur-3xl" />

            <form onSubmit={handleSubmit} className="relative flex flex-col h-full max-h-[92vh]">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-7 py-6 sm:px-9 border-b border-white/50">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                    New Posting
                  </p>
                  <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink-900">
                    채용공고 작성
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="닫기"
                  className="shrink-0 p-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-ink-400 hover:text-azure-700 hover:bg-white/90 shadow-glass-sm transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-7 py-7 sm:px-9 space-y-9">
                {/* 기본 정보 */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                      <BriefcaseIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-lg md:text-xl text-ink-900">기본 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="채용 제목" required>
                      <GlassInput
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="예: 시니어 백엔드 개발자"
                      />
                    </Field>

                    <Field label="직무 카테고리" required>
                      <GlassSelect
                        required
                        value={formData.jobCategory}
                        onChange={(e) => handleInputChange('jobCategory', e.target.value)}
                      >
                        <option value="개발">개발</option>
                        <option value="디자인">디자인</option>
                        <option value="데이터">데이터</option>
                        <option value="마케팅/시장조사">마케팅/시장조사</option>
                        <option value="영업/제휴">영업/제휴</option>
                        <option value="기획/경영">기획/경영</option>
                        <option value="인사/총무">인사/총무</option>
                      </GlassSelect>
                    </Field>
                  </div>

                  <Field label="채용 공고 설명" required>
                    <GlassTextarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="resize-none"
                      placeholder="회사 소개와 채용 포지션에 대한 설명을 작성해주세요."
                    />
                  </Field>
                </section>

                {/* 근무 조건 */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                      <MapPinIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-lg md:text-xl text-ink-900">근무 조건</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="근무 지역" required>
                      <GlassInput
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="예: 서울특별시 강남구"
                      />
                    </Field>

                    <Field label="근무 시간">
                      <GlassInput
                        type="text"
                        value={formData.workingHours}
                        onChange={(e) => handleInputChange('workingHours', e.target.value)}
                        placeholder="예: 09:00 ~ 18:00"
                      />
                    </Field>

                    <Field label="고용 형태">
                      <GlassSelect
                        value={formData.workType}
                        onChange={(e) => handleInputChange('workType', e.target.value)}
                      >
                        <option value="fulltime">정규직</option>
                        <option value="parttime">계약직</option>
                        <option value="contract">파트타임</option>
                        <option value="intern">인턴</option>
                      </GlassSelect>
                    </Field>

                    <Field label="지원 마감일">
                      <GlassDatePicker
                        value={formData.deadline}
                        onChange={(v) => handleInputChange('deadline', v)}
                        precision="full-date"
                        fromYear={CURRENT_YEAR}
                        toYear={CURRENT_YEAR + 5}
                      />
                    </Field>
                  </div>
                </section>

                {/* 급여 정보 */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                      <BanknotesIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-lg md:text-xl text-ink-900">급여 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="급여 형태">
                      <GlassSelect
                        value={formData.salary.type}
                        onChange={(e) => handleNestedInputChange('salary', 'type', e.target.value)}
                      >
                        <option value="연봉">연봉</option>
                        <option value="월급">월급</option>
                        <option value="시급">시급</option>
                        <option value="기타">기타</option>
                      </GlassSelect>
                    </Field>

                    <Field label="급여 범위">
                      <GlassInput
                        type="text"
                        value={formData.salary.amount}
                        onChange={(e) => handleNestedInputChange('salary', 'amount', e.target.value)}
                        placeholder="예: 3,000만원 ~ 5,000만원"
                      />
                    </Field>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2.5 mt-6 cursor-pointer rounded-2xl bg-white/55 backdrop-blur-md border border-white/70 px-4 py-3 shadow-glass-sm transition-all duration-200 hover:bg-white/80">
                        <input
                          type="checkbox"
                          checked={formData.salary.negotiable}
                          onChange={(e) => handleNestedInputChange('salary', 'negotiable', e.target.checked)}
                          className="h-4 w-4 rounded border-ink-200 text-azure-500 accent-azure-500 focus:ring-azure-400/50"
                        />
                        <span className="text-sm font-medium text-ink-700">협의 가능</span>
                      </label>
                    </div>
                  </div>
                </section>

                {/* 배열 필드들 */}
                {[
                  { field: 'requirements', label: '지원 자격', placeholder: '예: Java 개발 경험 3년 이상' },
                  { field: 'responsibilities', label: '주요 업무', placeholder: '예: RESTful API 설계 및 개발' },
                  { field: 'benefits', label: '복리후생', placeholder: '예: 4대보험, 연차' },
                  { field: 'preferredQualifications', label: '우대사항', placeholder: '예: AWS 경험자 우대' },
                  { field: 'skills', label: '필요 기술', placeholder: '예: Java, Spring' }
                ].map(({ field, label, placeholder }) => (
                  <section key={field} className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                          <ListBulletIcon className="w-5 h-5" />
                        </span>
                        <h3 className="font-semibold text-lg md:text-xl text-ink-900">{label}</h3>
                      </div>
                      <GlassButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(field)}
                      >
                        <PlusIcon className="w-4 h-4" />
                        추가
                      </GlassButton>
                    </div>

                    <div className="space-y-2.5">
                      {(formData[field as keyof typeof formData] as string[]).map((item, index) => (
                        <div key={index} className="flex items-center gap-2.5">
                          <GlassInput
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
                            className="flex-1"
                            placeholder={placeholder}
                          />
                          {(formData[field as keyof typeof formData] as string[]).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(field, index)}
                              aria-label="삭제"
                              className="shrink-0 p-2.5 rounded-2xl bg-white/55 backdrop-blur-md border border-white/70 text-coral-500 shadow-glass-sm hover:text-coral-600 hover:bg-coral-100/60 transition-all duration-200"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {/* 채용 담당자 정보 */}
                <section className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-azure-50 text-azure-600 border border-azure-100">
                      <UserCircleIcon className="w-5 h-5" />
                    </span>
                    <h3 className="font-semibold text-lg md:text-xl text-ink-900">채용 담당자 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="담당자 이름">
                      <GlassInput
                        type="text"
                        value={formData.recruiterInfo.name}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'name', e.target.value)}
                        placeholder="김채용"
                      />
                    </Field>

                    <Field label="직책">
                      <GlassInput
                        type="text"
                        value={formData.recruiterInfo.position}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'position', e.target.value)}
                        placeholder="인사팀 매니저"
                      />
                    </Field>

                    <Field label="연락처">
                      <GlassInput
                        type="tel"
                        value={formData.recruiterInfo.phone}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'phone', e.target.value)}
                        placeholder="02-1234-5678"
                      />
                    </Field>

                    <Field label="이메일">
                      <GlassInput
                        type="email"
                        value={formData.recruiterInfo.email}
                        onChange={(e) => handleNestedInputChange('recruiterInfo', 'email', e.target.value)}
                        placeholder="hr@company.com"
                      />
                    </Field>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-7 py-5 sm:px-9 border-t border-white/50 bg-white/40 backdrop-blur-md">
                <GlassButton
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  취소
                </GlassButton>
                <GlassButton type="submit" variant="primary">
                  채용공고 등록
                </GlassButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
