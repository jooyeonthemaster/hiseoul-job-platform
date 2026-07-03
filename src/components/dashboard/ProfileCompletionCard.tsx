'use client';

import { motion } from 'framer-motion';
import { TrophyIcon, PencilIcon } from '@heroicons/react/24/outline';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface ProfileCompletionCardProps {
  completionPercentage: number;
  onEditClick: () => void;
  missingFields?: string[];
}

export default function ProfileCompletionCard({
  completionPercentage,
  onEditClick,
  missingFields = []
}: ProfileCompletionCardProps) {
  return (
    <ScrollReveal y={24}>
      <GlassCard strong className="h-full rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
          {/* 진행 정보 + 진행바 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
                <TrophyIcon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">
                프로필 완성도
              </h2>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-end justify-between gap-4">
                <p className="text-sm font-medium text-ink-500">
                  {completionPercentage < 100
                    ? '프로필을 완성하여 더 많은 기회를 얻으세요!'
                    : '프로필이 완성되었습니다! 🎉'}
                </p>
                <span className="font-display text-3xl font-bold leading-none tracking-tight text-gradient-azure">
                  {completionPercentage}%
                </span>
              </div>

              <div
                className="relative h-3 w-full overflow-hidden rounded-full border border-white/60 bg-azure-50/70 backdrop-blur-sm"
                role="progressbar"
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-azure-400 via-sky-cool-400 to-azure-600 shadow-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {missingFields.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-ink-400">미완성 항목</span>
                  {missingFields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center rounded-full border border-azure-200 bg-azure-50/70 px-3 py-1 text-xs font-semibold text-azure-700"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 편집 액션 */}
          <div className="shrink-0">
            <GlassButton onClick={onEditClick} size="md" className="w-full md:w-auto">
              <PencilIcon className="h-4 w-4" />
              <span>편집</span>
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </ScrollReveal>
  );
}
