'use client';

import { motion } from 'framer-motion';
import { LockClosedIcon, ArrowRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';

interface AccessDeniedProps {
  reason?: 'pending' | 'rejected' | 'unauthorized';
  rejectedReason?: string;
}

export default function PortfolioAccessDenied({ reason = 'unauthorized', rejectedReason }: AccessDeniedProps) {
  const { userData } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-5 sm:px-8 py-20">
      <AuroraBackground variant="vivid" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-azure-50/60 via-white/40 to-[#eef4fc]/80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-xl"
      >
        <GlassCard strong className="p-9 sm:p-12 text-center shadow-glass-lg">
          {/* eyebrow */}
          <div className="mb-7 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 font-semibold text-xs sm:text-sm shadow-glass-sm">
              <span className="w-2 h-2 rounded-full bg-azure-500 animate-pulse" />
              포트폴리오 접근 권한
            </span>
          </div>

          {/* icon */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow ring-1 ring-white/50"
            >
              <LockClosedIcon className="w-11 h-11 text-white" />
            </motion.div>
          </div>

          {reason === 'pending' ? (
            <>
              <div className="mb-4 flex justify-center">
                <Badge tone="honey">승인 대기 중</Badge>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mb-4">승인 대기 중</h2>
              <p className="text-ink-500 leading-relaxed text-base md:text-lg mb-8">
                귀하의 기업 회원가입이 승인 대기 중입니다.
                관리자의 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.
              </p>
            </>
          ) : reason === 'rejected' ? (
            <>
              <div className="mb-4 flex justify-center">
                <Badge tone="coral">접근 불가</Badge>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mb-4">접근 불가</h2>
              <p className="text-ink-500 leading-relaxed text-base md:text-lg mb-4">
                귀하의 기업 회원가입이 거절되었습니다.
              </p>
              {rejectedReason && (
                <div className="glass rounded-2xl border border-coral-500/30 bg-coral-100/40 p-4 mb-6 text-left">
                  <p className="text-sm text-coral-600">
                    <span className="font-semibold text-coral-600">거절 사유:</span> {rejectedReason}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center">
                <Badge tone="azure">권한 없음</Badge>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 mb-4">포트폴리오 열람 권한 없음</h2>
              <p className="text-ink-500 leading-relaxed text-base md:text-lg mb-8">
                이 포트폴리오를 열람하려면 승인된 기업 회원이어야 합니다.
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            {userData?.role === 'employer' ? (
              <GlassButton href="/employer-dashboard" size="lg" className="w-full">
                대시보드로 돌아가기
                <ArrowRightIcon className="w-5 h-5" />
              </GlassButton>
            ) : (
              <>
                <GlassButton href="/portfolios" size="lg" className="w-full">
                  포트폴리오 목록으로
                  <ArrowRightIcon className="w-5 h-5" />
                </GlassButton>
                {!userData && (
                  <GlassButton href="/auth" variant="secondary" size="lg" className="w-full">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    로그인
                  </GlassButton>
                )}
              </>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
