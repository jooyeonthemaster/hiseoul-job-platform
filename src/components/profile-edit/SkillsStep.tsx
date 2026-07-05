'use client';

import { useState } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  SparklesIcon,
  LanguageIcon,
  AcademicCapIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { CertificateItem, AwardItem } from '@/types';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Field, GlassInput } from '@/components/ui/GlassField';
import { GlassDatePicker } from '@/components/ui/GlassDatePicker';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const CURRENT_YEAR = new Date().getFullYear();

interface SkillsStepProps {
  data: {
    skills: string[];
    languages: string[];
    certificates: CertificateItem[];
    awards: AwardItem[];
  };
  onChange: (data: any) => void;
}

export default function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      const updated = [...data.skills, newSkill.trim()];
      onChange({ ...data, skills: updated });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updated = data.skills.filter((_, i) => i !== index);
    onChange({ ...data, skills: updated });
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      const updated = [...data.languages, newLanguage.trim()];
      onChange({ ...data, languages: updated });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const updated = data.languages.filter((_, i) => i !== index);
    onChange({ ...data, languages: updated });
  };
  const addCertificate = () => {
    const newCert: CertificateItem = {
      name: '',
      issuer: '',
      issueDate: '',
    };
    const updated = [...(data.certificates || []), newCert];
    onChange({ ...data, certificates: updated });
  };

  const updateCertificate = (index: number, field: keyof CertificateItem, value: any) => {
    const updated = [...(data.certificates || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, certificates: updated });
  };

  const removeCertificate = (index: number) => {
    const updated = data.certificates?.filter((_, i) => i !== index) || [];
    onChange({ ...data, certificates: updated });
  };

  const addAward = () => {
    const newAward: AwardItem = {
      title: '',
      organization: '',
      date: '',
    };
    const updated = [...(data.awards || []), newAward];
    onChange({ ...data, awards: updated });
  };

  const updateAward = (index: number, field: keyof AwardItem, value: any) => {
    const updated = [...(data.awards || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, awards: updated });
  };

  const removeAward = (index: number) => {
    const updated = data.awards?.filter((_, i) => i !== index) || [];
    onChange({ ...data, awards: updated });
  };
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Skills Section */}
      <ScrollReveal>
        <section className="space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
              <SparklesIcon className="h-4 w-4" />
              Skills
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              보유 스킬
            </h3>
            <p className="text-sm leading-relaxed text-ink-500">
              직무와 관련된 기술 스택을 추가해주세요.
            </p>
          </div>

          <GlassCard strong className="overflow-hidden">
            <div className="space-y-4 p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <GlassInput
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="예: JavaScript, React, Node.js"
                  className="flex-1"
                />
                <GlassButton
                  type="button"
                  onClick={handleAddSkill}
                  variant="primary"
                  size="md"
                >
                  <PlusIcon className="h-4 w-4" />
                  추가
                </GlassButton>
              </div>

              {data.skills.length === 0 ? (
                <p className="text-sm text-ink-400">아직 추가된 스킬이 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {data.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 rounded-full border border-azure-200 bg-azure-50 px-3.5 py-1.5 text-sm font-semibold text-azure-700 shadow-glass-sm backdrop-blur-md"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        aria-label="스킬 삭제"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-azure-500 transition-colors duration-200 hover:bg-azure-100 hover:text-azure-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </section>
      </ScrollReveal>

      {/* Languages Section */}
      <ScrollReveal>
        <section className="space-y-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
              <LanguageIcon className="h-4 w-4" />
              Languages
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              사용 가능 언어
            </h3>
            <p className="text-sm leading-relaxed text-ink-500">
              구사 가능한 언어를 추가해주세요.
            </p>
          </div>

          <GlassCard strong className="overflow-hidden">
            <div className="space-y-4 p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <GlassInput
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
                  placeholder="예: 한국어, 영어, 일본어"
                  className="flex-1"
                />
                <GlassButton
                  type="button"
                  onClick={handleAddLanguage}
                  variant="primary"
                  size="md"
                >
                  <PlusIcon className="h-4 w-4" />
                  추가
                </GlassButton>
              </div>

              {data.languages.length === 0 ? (
                <p className="text-sm text-ink-400">아직 추가된 언어가 없습니다.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {data.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 rounded-full border border-mint-400/40 bg-mint-100 px-3.5 py-1.5 text-sm font-semibold text-mint-600 shadow-glass-sm backdrop-blur-md"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        aria-label="언어 삭제"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-mint-500 transition-colors duration-200 hover:bg-mint-100 hover:text-mint-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </section>
      </ScrollReveal>

      {/* Certificates Section */}
      <ScrollReveal>
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                <AcademicCapIcon className="h-4 w-4" />
                Certificates
              </span>
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                자격증
              </h3>
              <p className="text-sm leading-relaxed text-ink-500">
                취득한 자격증을 추가해주세요.
              </p>
            </div>
            <GlassButton
              type="button"
              onClick={addCertificate}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
              자격증 추가
            </GlassButton>
          </div>

          {data.certificates?.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                <AcademicCapIcon className="h-7 w-7" />
              </div>
              <p className="text-ink-500">등록된 자격증이 없습니다.</p>
              <GlassButton
                type="button"
                onClick={addCertificate}
                variant="secondary"
                size="sm"
              >
                <PlusIcon className="h-4 w-4" />
                첫 자격증 추가하기
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-4">
              {data.certificates?.map((cert, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <GlassCard strong hover className="overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <Badge tone="azure">자격증 {index + 1}</Badge>
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          aria-label="자격증 삭제"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-coral-500 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral-100 hover:text-coral-600 hover:shadow-glass"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Field label="자격증명">
                          <GlassInput
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                            placeholder="자격증명"
                          />
                        </Field>

                        <Field label="발급기관">
                          <GlassInput
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertificate(index, 'issuer', e.target.value)}
                            placeholder="발급기관"
                          />
                        </Field>

                        <Field label="발급일">
                          <GlassDatePicker
                            value={cert.issueDate || ''}
                            onChange={(v) => updateCertificate(index, 'issueDate', v)}
                            precision="year-month"
                            fromYear={1970}
                            toYear={CURRENT_YEAR}
                          />
                        </Field>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* Awards Section */}
      <ScrollReveal>
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                <TrophyIcon className="h-4 w-4" />
                Awards
              </span>
              <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                수상 경력
              </h3>
              <p className="text-sm leading-relaxed text-ink-500">
                수상 이력을 추가해주세요.
              </p>
            </div>
            <GlassButton
              type="button"
              onClick={addAward}
              variant="primary"
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
              수상 경력 추가
            </GlassButton>
          </div>

          {data.awards?.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                <TrophyIcon className="h-7 w-7" />
              </div>
              <p className="text-ink-500">등록된 수상 경력이 없습니다.</p>
              <GlassButton
                type="button"
                onClick={addAward}
                variant="secondary"
                size="sm"
              >
                <PlusIcon className="h-4 w-4" />
                첫 수상 경력 추가하기
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-4">
              {data.awards?.map((award, index) => (
                <ScrollReveal key={index} delay={index * 0.05}>
                  <GlassCard strong hover className="overflow-hidden">
                    <div className="p-5 md:p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <Badge tone="honey">수상 {index + 1}</Badge>
                        <button
                          type="button"
                          onClick={() => removeAward(index)}
                          aria-label="수상 경력 삭제"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/60 text-coral-500 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral-100 hover:text-coral-600 hover:shadow-glass"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Field label="수상명">
                          <GlassInput
                            type="text"
                            value={award.title}
                            onChange={(e) => updateAward(index, 'title', e.target.value)}
                            placeholder="수상명"
                          />
                        </Field>

                        <Field label="수여기관">
                          <GlassInput
                            type="text"
                            value={award.organization}
                            onChange={(e) => updateAward(index, 'organization', e.target.value)}
                            placeholder="수여기관"
                          />
                        </Field>

                        <Field label="수상일">
                          <GlassDatePicker
                            value={award.date || ''}
                            onChange={(v) => updateAward(index, 'date', v)}
                            precision="year-month"
                            fromYear={1970}
                            toYear={CURRENT_YEAR}
                          />
                        </Field>
                      </div>
                    </div>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>
    </div>
  );
}
