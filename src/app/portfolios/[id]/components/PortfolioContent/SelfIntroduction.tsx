'use client';

import { DocumentIcon } from '@heroicons/react/24/outline';
import type { SelfIntroduction as SelfIntroductionType } from '../../types/portfolio.types';

interface SelfIntroductionProps {
  selfIntroduction?: SelfIntroductionType;
}

export default function SelfIntroduction({ selfIntroduction }: SelfIntroductionProps) {
  if (!selfIntroduction) return null;

  const legacySections = [
    {
      title: '지원동기',
      content: selfIntroduction.motivation,
      color: 'border-azure-400',
    },
    {
      title: '성격의 장단점',
      content: selfIntroduction.personality,
      color: 'border-sky-cool-400',
    },
    {
      title: '주요 경험 및 성과',
      content: selfIntroduction.experience,
      color: 'border-azure-500',
    },
    {
      title: '입사 후 포부',
      content: selfIntroduction.aspiration,
      color: 'border-azure-600',
    },
  ];

  const customSections = selfIntroduction.useCustomSections && selfIntroduction.sections?.length
    ? [...selfIntroduction.sections]
        .sort((a, b) => a.order - b.order)
        .map((section, index) => ({
          title: section.title,
          content: section.content,
          color: ['border-azure-400', 'border-sky-cool-400', 'border-azure-500', 'border-azure-600'][index % 4],
        }))
    : null;

  const sections = (customSections || legacySections).filter((section) => section.content?.trim());

  if (sections.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-7 xl:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
          <DocumentIcon className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink-900">
          상세 자기소개
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5">
        {sections.map((section, index) => (
          <div
            key={`${section.title}-${index}`}
            className={`rounded-2xl border-l-4 ${section.color} bg-azure-50/50 pl-5 pr-4 py-4`}
          >
            <h3 className="text-lg md:text-xl font-semibold text-ink-900 mb-3 break-words">
              {section.title}
            </h3>
            <p className="text-base md:text-lg text-ink-600 leading-8 whitespace-pre-wrap break-words">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
