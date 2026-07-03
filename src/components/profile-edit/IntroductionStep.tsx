'use client';

import { useState } from 'react';
import { SelfIntroduction, SelfIntroductionSection } from '@/types';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassInput, GlassTextarea } from '@/components/ui/GlassField';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

interface IntroductionStepProps {
  data: SelfIntroduction;
  onChange: (data: SelfIntroduction) => void;
}

const DEFAULT_SECTIONS = [
  { title: '지원동기', placeholder: '이 분야를 선택한 이유와 앞으로의 목표를 구체적으로 작성해주세요.', color: 'blue' },
  { title: '성격의 장단점', placeholder: '자신의 성격과 업무에서의 강점, 개선점을 솔직하게 작성해주세요.', color: 'green' },
  { title: '주요 경험 및 성과', placeholder: '이전 경험 중 가장 의미있었던 프로젝트나 성과를 구체적으로 작성해주세요.', color: 'purple' },
  { title: '입사 후 포부', placeholder: '입사 후 이루고 싶은 목표와 회사에 기여할 수 있는 부분을 작성해주세요.', color: 'orange' }
];

const SECTION_COLORS = [
  'blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'yellow'
];

export default function IntroductionStep({ data, onChange }: IntroductionStepProps) {
  const [isCustomMode, setIsCustomMode] = useState(data.useCustomSections || false);

  // 기존 데이터를 새로운 섹션 형태로 변환
  const convertLegacyToSections = (): SelfIntroductionSection[] => {
    const sections: SelfIntroductionSection[] = [];

    if (data.motivation) {
      sections.push({
        id: 'motivation',
        title: '지원동기',
        content: data.motivation,
        order: 0,
        color: 'blue'
      });
    }

    if (data.personality) {
      sections.push({
        id: 'personality',
        title: '성격의 장단점',
        content: data.personality,
        order: 1,
        color: 'green'
      });
    }

    if (data.experience) {
      sections.push({
        id: 'experience',
        title: '주요 경험 및 성과',
        content: data.experience,
        order: 2,
        color: 'purple'
      });
    }

    if (data.aspiration) {
      sections.push({
        id: 'aspiration',
        title: '입사 후 포부',
        content: data.aspiration,
        order: 3,
        color: 'orange'
      });
    }

    return sections;
  };

  // 현재 섹션 데이터 가져오기
  const getCurrentSections = (): SelfIntroductionSection[] => {
    if (isCustomMode && data.sections) {
      return data.sections.sort((a, b) => a.order - b.order);
    }
    return convertLegacyToSections();
  };

  // 기존 모드에서 필드 업데이트
  const handleLegacyChange = (field: keyof SelfIntroduction, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // 커스텀 모드로 전환
  const switchToCustomMode = () => {
    const convertedSections = convertLegacyToSections();

    // 빈 섹션이 있으면 기본 섹션으로 채우기
    if (convertedSections.length === 0) {
      const defaultSections = DEFAULT_SECTIONS.map((section, index) => ({
        id: `section_${Date.now()}_${index}`,
        title: section.title,
        content: '',
        order: index,
        color: section.color
      }));

      onChange({
        ...data,
        sections: defaultSections,
        useCustomSections: true
      });
    } else {
      onChange({
        ...data,
        sections: convertedSections,
        useCustomSections: true
      });
    }

    setIsCustomMode(true);
  };

  // 기존 모드로 전환
  const switchToLegacyMode = () => {
    const sections = getCurrentSections();
    const legacyData: SelfIntroduction = {
      motivation: sections.find(s => s.id === 'motivation' || s.title === '지원동기')?.content || '',
      personality: sections.find(s => s.id === 'personality' || s.title === '성격의 장단점')?.content || '',
      experience: sections.find(s => s.id === 'experience' || s.title === '주요 경험 및 성과')?.content || '',
      aspiration: sections.find(s => s.id === 'aspiration' || s.title === '입사 후 포부')?.content || '',
      useCustomSections: false
    };

    onChange(legacyData);
    setIsCustomMode(false);
  };

  // 새 섹션 추가
  const addSection = () => {
    const currentSections = getCurrentSections();
    const newSection: SelfIntroductionSection = {
      id: `section_${Date.now()}`,
      title: '',
      content: '',
      order: currentSections.length,
      color: SECTION_COLORS[currentSections.length % SECTION_COLORS.length]
    };

    onChange({
      ...data,
      sections: [...currentSections, newSection],
      useCustomSections: true
    });
  };

  // 섹션 업데이트
  const updateSection = (id: string, field: keyof SelfIntroductionSection, value: string | number) => {
    const currentSections = getCurrentSections();
    const updatedSections = currentSections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    );

    onChange({
      ...data,
      sections: updatedSections,
      useCustomSections: true
    });
  };

  // 섹션 삭제
  const removeSection = (id: string) => {
    const currentSections = getCurrentSections();
    const filteredSections = currentSections.filter(section => section.id !== id);

    // 순서 재정렬
    const reorderedSections = filteredSections.map((section, index) => ({
      ...section,
      order: index
    }));

    onChange({
      ...data,
      sections: reorderedSections,
      useCustomSections: true
    });
  };

  // 섹션 순서 변경
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const currentSections = getCurrentSections();
    const sectionIndex = currentSections.findIndex(s => s.id === id);

    if (
      (direction === 'up' && sectionIndex === 0) ||
      (direction === 'down' && sectionIndex === currentSections.length - 1)
    ) {
      return;
    }

    const newSections = [...currentSections];
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;

    // 순서 교체
    [newSections[sectionIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[sectionIndex]];

    // order 값 재설정
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }));

    onChange({
      ...data,
      sections: reorderedSections,
      useCustomSections: true
    });
  };

  // 색상 토큰 → azure 글래스 계열 시각화 (저장되는 color 값은 그대로 유지).
  // 단일 azure 패밀리 안에서 채도/명도만 다르게 하여 무지개를 피한다.
  const getSwatchClass = (color: string) => {
    const swatchMap: { [key: string]: string } = {
      blue: 'bg-azure-500',
      green: 'bg-mint-500',
      purple: 'bg-azure-700',
      orange: 'bg-honey-500',
      red: 'bg-coral-500',
      indigo: 'bg-azure-600',
      pink: 'bg-sky-cool-400',
      yellow: 'bg-azure-300'
    };
    return swatchMap[color] || 'bg-ink-300';
  };

  return (
    <div className="space-y-5">
      <ScrollReveal>
        <div className="flex items-start gap-4">
          <div className="hidden h-10 w-10 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow sm:flex">
            <DocumentTextIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600 mb-2">
              Self Introduction
            </p>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink-900">
              자기소개서
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
              각 항목별로 구체적이고 진솔한 내용을 작성해주세요.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* 모드 전환 패널 */}
      <ScrollReveal delay={0.05}>
        <GlassCard strong className="rounded-3xl p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h4 className="font-semibold text-lg text-ink-900">
                  {isCustomMode ? '사용자 정의 섹션' : '기본 섹션'}
                </h4>
                <Badge tone={isCustomMode ? 'azure' : 'neutral'}>
                  {isCustomMode ? '자유 구성' : '4개 항목'}
                </Badge>
              </div>
              <p className="text-sm text-ink-500 leading-relaxed">
                {isCustomMode
                  ? '소제목과 내용을 자유롭게 구성할 수 있습니다.'
                  : '정해진 4개 섹션으로 구성됩니다.'
                }
              </p>
            </div>
            <GlassButton
              onClick={isCustomMode ? switchToLegacyMode : switchToCustomMode}
              variant="primary"
              size="md"
              className="flex-none"
            >
              <ArrowsRightLeftIcon className="w-4 h-4" />
              <span>{isCustomMode ? '기본 모드로' : '사용자 정의로'}</span>
            </GlassButton>
          </div>
        </GlassCard>
      </ScrollReveal>

      {/* 기존 모드 */}
      {!isCustomMode && (
        <ScrollRevealStagger className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {DEFAULT_SECTIONS.map((section, index) => {
            const fieldMap = ['motivation', 'personality', 'experience', 'aspiration'] as const;
            const field = fieldMap[index];
            const value = data[field] || '';

            return (
              <ScrollRevealItem key={field}>
                <GlassCard className="rounded-3xl p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-azure-50 text-sm font-semibold text-azure-700">
                      {index + 1}
                    </span>
                    <label className="block text-base font-semibold text-ink-900">
                      {section.title}
                    </label>
                  </div>
                  <GlassTextarea
                    value={value}
                    onChange={(e) => handleLegacyChange(field, e.target.value)}
                    rows={4}
                    className="min-h-[128px]"
                    placeholder={section.placeholder}
                  />
                </GlassCard>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealStagger>
      )}

      {/* 커스텀 모드 */}
      {isCustomMode && (
        <ScrollRevealStagger className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {getCurrentSections().map((section, index) => (
            <ScrollRevealItem key={section.id}>
              <GlassCard className="rounded-3xl p-4 md:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                      <DocumentTextIcon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-semibold text-ink-700">섹션 {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-all duration-200 hover:bg-azure-50 hover:text-azure-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-400"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === getCurrentSections().length - 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-all duration-200 hover:bg-azure-50 hover:text-azure-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-400"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-all duration-200 hover:bg-coral-100 hover:text-coral-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 소제목 입력 */}
                <GlassInput
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  placeholder="소제목을 입력하세요 (예: 지원동기, 성격의 장점, 특별한 경험 등)"
                  className="mb-3 font-medium"
                />

                {/* 내용 입력 */}
                <GlassTextarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  rows={4}
                  className="min-h-[128px]"
                  placeholder="내용을 입력하세요"
                />

                {/* 색상 선택 */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-medium text-ink-700">색상</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SECTION_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateSection(section.id, 'color', color)}
                        className={`h-7 w-7 rounded-full transition-all duration-200 ${getSwatchClass(color)} ${
                          section.color === color
                            ? 'ring-2 ring-offset-2 ring-azure-400 ring-offset-white scale-110'
                            : 'ring-1 ring-white/60 hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </ScrollRevealItem>
          ))}

          {/* 섹션 추가 버튼 */}
          <ScrollRevealItem className="xl:col-span-2">
            <button
              onClick={addSection}
              className="group flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-azure-200 bg-white/40 py-4 text-ink-500 backdrop-blur-sm transition-all duration-300 hover:border-azure-400 hover:bg-azure-50/60 hover:text-azure-700 hover:shadow-glass"
            >
              <PlusIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">새 섹션 추가</span>
            </button>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      )}
    </div>
  );
}
