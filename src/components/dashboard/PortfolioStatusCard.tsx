'use client';

import {
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface PortfolioStatusCardProps {
  isRegistered: boolean;
  views?: number;
  userId?: string;
  onRegisterClick?: () => void;
}

export default function PortfolioStatusCard({
  isRegistered,
  views = 0,
  userId,
  onRegisterClick
}: PortfolioStatusCardProps) {
  const router = useRouter();

  return (
    <ScrollReveal y={24} delay={0.4} className="h-full">
      <GlassCard hover className="flex h-full flex-col p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow ring-1 ring-white/60">
            <DocumentTextIcon className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            포트폴리오 상태
          </h2>
        </div>

        {isRegistered ? (
          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-500">상태</span>
              <Badge tone="mint">등록됨</Badge>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/60 bg-azure-50/50 p-4 shadow-glass-sm backdrop-blur-md">
                <div className="flex items-center text-azure-600 mb-1.5">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium text-ink-500">조회수</span>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-ink-900">{views}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-azure-50/50 p-4 shadow-glass-sm backdrop-blur-md">
                <div className="flex items-center text-azure-600 mb-1.5">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium text-ink-500">관심도</span>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-ink-900">
                  {views > 50 ? '높음' : views > 20 ? '보통' : '낮음'}
                </p>
              </div>
            </div>

            <GlassButton
              variant="primary"
              className="mt-auto w-full"
              onClick={() => router.push(userId ? `/portfolios/${userId}` : '/portfolios')}
            >
              포트폴리오 보기
            </GlassButton>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-5 text-center">
            <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/60 bg-azure-50/60 shadow-glass-sm backdrop-blur-md">
              <DocumentTextIcon className="h-8 w-8 text-azure-400" />
            </span>
            <p className="text-ink-500 leading-relaxed mb-6">
              포트폴리오를 등록하여 기업에게 나를 어필하세요!
            </p>
            <GlassButton
              variant="primary"
              onClick={onRegisterClick}
            >
              포트폴리오 등록하기
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </ScrollReveal>
  );
}
