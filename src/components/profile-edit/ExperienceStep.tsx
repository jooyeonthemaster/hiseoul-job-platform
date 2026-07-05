'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { ExperienceItem } from '@/types';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Field, GlassInput, GlassTextarea } from '@/components/ui/GlassField';
import { GlassDatePicker } from '@/components/ui/GlassDatePicker';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const CURRENT_YEAR = new Date().getFullYear();

interface ExperienceStepProps {
  data: ExperienceItem[];
  onChange: (data: ExperienceItem[]) => void;
}

export default function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(data);

  const addExperience = () => {
    const newExperience: ExperienceItem = {
      company: '',
      position: '',
      startDate: '',
      isCurrent: false,
      description: ''
    };
    const updated = [...experiences, newExperience];
    setExperiences(updated);
    onChange(updated);
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    setExperiences(updated);
    onChange(updated);
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
            <BriefcaseIcon className="h-4 w-4" />
            Experience
          </span>
          <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            경력 사항
          </h3>
          <p className="text-sm leading-relaxed text-ink-500">
            이전 근무 경험을 추가해주세요.
          </p>
        </div>
        <GlassButton
          type="button"
          onClick={addExperience}
          variant="primary"
          size="sm"
        >
          <PlusIcon className="h-4 w-4" />
          경력 추가
        </GlassButton>
      </div>

      {experiences.length === 0 ? (
        <ScrollReveal>
          <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
              <BriefcaseIcon className="h-7 w-7" />
            </div>
            <p className="text-ink-500">경력 사항이 없습니다.</p>
            <GlassButton
              type="button"
              onClick={addExperience}
              variant="secondary"
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
              첫 경력 추가하기
            </GlassButton>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
              <GlassCard strong hover className="overflow-hidden">
                <div className="p-5 md:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge tone="azure">경력 {index + 1}</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      aria-label="경력 삭제"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-coral-500 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral-100 hover:text-coral-600 hover:shadow-glass"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="회사명">
                      <GlassInput
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                    </Field>

                    <Field label="직책/직급">
                      <GlassInput
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                    </Field>

                    <Field label="시작일">
                      <GlassDatePicker
                        value={exp.startDate || ''}
                        onChange={(v) => updateExperience(index, 'startDate', v)}
                        precision="year-month"
                        fromYear={1970}
                        toYear={CURRENT_YEAR}
                      />
                    </Field>

                    <Field label="종료일">
                      <GlassDatePicker
                        value={exp.endDate || ''}
                        onChange={(v) => updateExperience(index, 'endDate', v)}
                        precision="year-month"
                        fromYear={1970}
                        toYear={CURRENT_YEAR}
                        disabled={exp.isCurrent}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <label
                        htmlFor={`current-${index}`}
                        className="inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-ink-700 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:bg-white/70"
                      >
                        <input
                          type="checkbox"
                          id={`current-${index}`}
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                          className="h-4 w-4 rounded border-ink-200 text-azure-500 focus:ring-2 focus:ring-azure-400/50"
                        />
                        현재 재직중
                      </label>
                    </div>

                    <Field label="업무 내용" className="md:col-span-2 xl:col-span-4">
                      <GlassTextarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={2}
                        className="min-h-[92px]"
                        placeholder="담당했던 업무와 성과를 구체적으로 작성해주세요."
                      />
                    </Field>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
