'use client';

// ════════════════════════════════════════════════════════════════
//  관리자 중개형(면접심사 매칭) 전환에 따라 이 페이지는 비활성화되었습니다.
//  - 구직자는 "어떤 기업이 나를 선택/제안했는지" 를 화면에서 알 수 없어야 하고(REQ2),
//    응답(수락/거절)·기업 담당자 이메일 회신 흐름도 제공하지 않는다.
//  - 채용 제안 매칭은 관리자가 관리/주선한다.
//  - jobInquiries 레코드 자체는 관리자 열람/엑셀용으로 유지된다(삭제하지 않음).
//  진입 시 프로필로 안내 리다이렉트한다.
// ════════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function JobInquiryDetailPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/profile'), 2600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-azure-aurora flex items-center justify-center px-5">
      <AuroraBackground variant="vivid" />
      <GlassCard strong className="relative z-10 px-10 py-14 text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-4xl bg-azure-50 border border-azure-100 flex items-center justify-center shadow-glass-sm">
          <InformationCircleIcon className="h-10 w-10 text-azure-500" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink-900 mb-3">
          면접심사 매칭은 관리자가 진행합니다
        </h1>
        <p className="text-ink-500 leading-relaxed mb-8">
          매칭 진행 상황과 결과는 운영 관리자를 통해 안내됩니다.
          잠시 후 마이페이지로 이동합니다.
        </p>
        <GlassButton href="/profile" size="md">
          마이페이지로 이동
        </GlassButton>
      </GlassCard>
    </div>
  );
}
