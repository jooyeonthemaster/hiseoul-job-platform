'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AcademicCapIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { EducationItem } from '@/types';
import { GlassButton } from '@/components/ui/GlassButton';
import { Field, GlassInput, GlassSelect } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface EducationStepProps {
  data: EducationItem[];
  onChange: (data: EducationItem[]) => void;
}

export default function EducationStep({ data, onChange }: EducationStepProps) {
  const [educations, setEducations] = useState<EducationItem[]>(data);

  const addEducation = () => {
    const newEducation: EducationItem = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
    };
    const updated = [...educations, newEducation];
    setEducations(updated);
    onChange(updated);
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    const updated = educations.filter((_, i) => i !== index);
    setEducations(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <ScrollReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow sm:flex">
            <AcademicCapIcon className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">학력 사항</h3>
              {educations.length > 0 && (
                <Badge tone="azure">{educations.length}</Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-ink-500">
              최종 학력부터 시간 역순으로 입력해주세요.
            </p>
          </div>
        </div>
        <GlassButton
          type="button"
          onClick={addEducation}
          variant="primary"
          size="sm"
          className="shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          학력 추가
        </GlassButton>
      </ScrollReveal>

      {educations.length === 0 ? (
        <ScrollReveal
          variant="scaleIn"
          className="glass-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-10 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-500 ring-1 ring-inset ring-azure-100">
            <AcademicCapIcon className="h-7 w-7" />
          </span>
          <p className="text-base font-medium text-ink-500">학력 사항이 없습니다.</p>
          <GlassButton type="button" onClick={addEducation} variant="outline" size="md">
            <PlusIcon className="h-4 w-4" />
            학력 추가하기
          </GlassButton>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {educations.map((edu, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-3xl border border-white/60 bg-white/75 p-5 shadow-glass backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg sm:p-6"
              >
                {/* top rim highlight */}
                <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]" />

                <div className="relative mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 font-display text-sm font-bold text-azure-700 ring-1 ring-inset ring-azure-100">
                      {index + 1}
                    </span>
                    <h4 className="text-base font-semibold text-ink-900">
                      학력 {index + 1}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-all duration-200 hover:bg-coral-100 hover:text-coral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400/50"
                    aria-label="학력 삭제"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="학교명">
                    <GlassInput
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </Field>

                  <Field label="학위">
                    <GlassSelect
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    >
                      <option value="">선택하세요</option>
                      <option value="고등학교">고등학교</option>
                      <option value="전문학사">전문학사</option>
                      <option value="학사">학사</option>
                      <option value="석사">석사</option>
                      <option value="박사">박사</option>
                    </GlassSelect>
                  </Field>

                  <Field label="전공">
                    <GlassInput
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    />
                  </Field>

                  <Field label="학점">
                    <GlassInput
                      type="text"
                      value={edu.grade || ''}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                      placeholder="예: 3.5/4.5"
                    />
                  </Field>

                  <Field label="입학일">
                    <GlassInput
                      type="text"
                      value={edu.startDate || ''}
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                      placeholder="YYYY-MM 형식으로 입력 (예: 2018-03)"
                    />
                  </Field>

                  <Field label="졸업일">
                    <GlassInput
                      type="text"
                      value={edu.endDate || ''}
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                      placeholder="YYYY-MM 형식으로 입력 (예: 2022-02)"
                    />
                  </Field>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
