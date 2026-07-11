'use client';
import Link from 'next/link';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';

interface PortfolioHeaderProps {
  portfolioName: string;
  portfolioId?: string;
  /** 기업 회원에게만 채용 신청 진입점을 노출한다 (포트폴리오 검토 → 신청 여정 연결) */
  canApply?: boolean;
  /** '포트폴리오 목록' 뒤로가기 목적지 — 기본은 과정 선택, 보통은 해당 과정의 교육생 목록으로 지정 */
  backHref?: string;
}

export default function PortfolioHeader({ portfolioName, portfolioId, canApply = false, backHref = '/portfolios' }: PortfolioHeaderProps) {
  return (
    // 전역 네비(fixed h-16) 아래에 붙어야 하므로 top-16 (top-0 이면 네비에 가려진다)
    <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-16 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          <div className="flex min-w-0 items-center space-x-4">
            <Link
              href={backHref}
              className="flex shrink-0 items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="hidden sm:inline">포트폴리오 목록</span>
            </Link>
            <div className="h-6 w-px shrink-0 bg-gray-300"></div>
            <h1 className="truncate text-xl font-semibold text-gray-900">
              {portfolioName}님의 포트폴리오
            </h1>
          </div>

          {canApply && portfolioId && (
            <GlassButton
              href={`/employer-dashboard/contact/${portfolioId}`}
              size="sm"
              className="shrink-0"
            >
              <EnvelopeIcon className="h-4 w-4" />
              채용 신청
            </GlassButton>
          )}
        </div>
      </div>
    </header>
  );
}
