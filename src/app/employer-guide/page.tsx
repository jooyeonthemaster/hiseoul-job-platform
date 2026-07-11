'use client';

import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowLongRightIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  EnvelopeIcon,
  HomeIcon,
  PlayCircleIcon,
  PrinterIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

// ─────────────────────────────────────────────────────────────
//  기업 담당자 이용 안내 (메뉴얼)
//   회원가입 → 가입승인 → 포트폴리오 확인 → 채용신청
//  브라우저 인쇄로 PDF 저장·배포가 가능하도록 print 스타일을 함께 제공한다.
// ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: UserPlusIcon,
    step: 'STEP 01',
    title: '회원가입',
    summary: '기업 회원으로 가입합니다.',
    details: [
      "상단 우측 '회원가입'에서 기업 회원으로 가입합니다.",
      '기업명·담당자 이름·연락처·이메일 등 기본 정보를 입력합니다.',
      '가입 직후에는 승인 대기 상태이며, 승인 전에는 교육생 포트폴리오 열람이 제한됩니다.',
    ],
    cta: { label: '회원가입 하러 가기', href: '/auth?mode=signup' },
  },
  {
    icon: CheckBadgeIcon,
    step: 'STEP 02',
    title: '가입 승인',
    summary: '관리자 승인 후 열람 권한이 부여됩니다.',
    details: [
      '관리자가 기업 정보를 확인한 뒤 가입을 승인합니다.',
      '승인이 완료되면 과정별 교육생 포트폴리오 열람 권한이 부여됩니다.',
      '승인 상태는 대시보드와 상단 프로필 메뉴의 배지(승인 대기 / 승인 완료)에서 확인할 수 있습니다.',
    ],
    cta: { label: '내 대시보드에서 상태 확인', href: '/employer-dashboard' },
  },
  {
    icon: DocumentMagnifyingGlassIcon,
    step: 'STEP 03',
    title: '포트폴리오 확인',
    summary: '과정 → 교육생 → 개인 포트폴리오 순으로 열람합니다.',
    details: [
      "상단 '포트폴리오' 메뉴에서 확인할 과정을 선택합니다.",
      '과정 소개와 전체 소개 영상을 확인한 뒤 교육생 목록으로 이동합니다.',
      '개인 포트폴리오에서 자기소개 영상, 포트폴리오 문서(PDF), 포트폴리오·기타영상, 자기소개서, 보유 스킬을 확인합니다.',
    ],
    cta: { label: '과정별 포트폴리오 보기', href: '/portfolios' },
  },
  {
    icon: EnvelopeIcon,
    step: 'STEP 04',
    title: '채용 신청',
    summary: '마음에 드는 교육생에게 채용 신청서를 제출합니다.',
    details: [
      "교육생 카드 또는 포트폴리오 상단의 '채용 신청' 버튼으로 신청서를 작성합니다.",
      '제출한 채용 신청서는 대시보드의 「보낸 채용 신청서」에서 다시 확인할 수 있습니다.',
      '이후 매칭데이(대면 면접) 일정은 대시보드 안내를 확인해 주세요.',
    ],
    cta: { label: '보낸 채용 신청서 보기', href: '/employer-dashboard/inquiries' },
  },
] as const;

const TIPS = [
  {
    icon: PlayCircleIcon,
    title: '영상부터 확인하세요',
    description:
      '과정 소개 영상과 교육생 자기소개 영상을 먼저 보면 짧은 시간에 후보를 좁힐 수 있습니다.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: '포트폴리오 문서·영상 함께 검토',
    description:
      'PDF 포트폴리오와 포트폴리오·기타영상을 함께 보면 실무 역량을 더 정확히 판단할 수 있습니다.',
  },
  {
    icon: EnvelopeIcon,
    title: '채용 신청은 자유롭게',
    description:
      '여러 교육생에게 채용 신청서를 보낼 수 있습니다. 관심 있는 인재를 놓치지 마세요.',
  },
] as const;

export default function EmployerGuidePage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-azure-mist print:bg-white">
      {/* 인쇄 시 색상·레이아웃 보정 */}
      <style>{`
        @media print {
          @page { margin: 14mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-card {
            box-shadow: none !important;
            border: 1px solid #dbe4ef !important;
            background: #fff !important;
            break-inside: avoid;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Top bar (인쇄 제외) */}
      <header className="no-print fixed top-0 z-50 w-full glass-nav">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/employer-dashboard"
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-medium text-ink-600 transition-colors hover:bg-azure-50/70 hover:text-azure-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="hidden sm:inline">대시보드</span>
            </Link>
            <span aria-hidden className="h-6 w-px bg-ink-200" />
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
              기업 담당자 이용 안내
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <GlassButton onClick={handlePrint} size="sm" variant="secondary">
              <PrinterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">인쇄 / PDF 저장</span>
            </GlassButton>
            <GlassButton href="/" size="sm" variant="ghost" className="hidden sm:inline-flex">
              <HomeIcon className="h-4 w-4" />
              홈
            </GlassButton>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 print:pt-8">
        <AuroraBackground className="no-print" />

        {/* Hero */}
        <ScrollReveal>
          <div className="relative z-10 text-center">
            <Badge tone="azure" icon={<CheckBadgeIcon className="h-4 w-4" />} className="mx-auto">
              기업 담당자 이용 안내
            </Badge>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 md:text-4xl">
              회원가입부터 채용 신청까지, <span className="text-gradient-azure">4단계</span>로 끝
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-500 md:text-lg">
              교육생 포트폴리오를 열람하고 채용 신청서를 제출하는 전체 과정을 순서대로 안내합니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 4-step flow strip */}
        <ScrollReveal>
          <div className="relative z-10 mt-10">
            <GlassCard strong className="print-card p-5 md:p-7">
              <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-2">
                {STEPS.map((s, index) => (
                  <div key={s.step} className="contents">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/65 p-4 shadow-glass-sm">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 font-display text-base font-bold text-white shadow-glow">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-azure-600">{s.step}</div>
                        <div className="truncate text-sm font-bold text-ink-900">{s.title}</div>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="hidden items-center justify-center text-azure-300 lg:flex">
                        <ArrowLongRightIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* Detailed step cards */}
        <ScrollRevealStagger className="relative z-10 mt-8 grid gap-6 md:grid-cols-2">
          {STEPS.map((s, index) => (
            <ScrollRevealItem key={s.step}>
              <GlassCard hover className="print-card flex h-full flex-col p-7 md:p-8">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 shadow-glow">
                      <s.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white font-display text-sm font-bold text-azure-700 shadow-glass-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-azure-600">{s.step}</div>
                    <h3 className="mt-0.5 font-display text-xl font-bold tracking-tight text-ink-900">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.summary}</p>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {s.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2.5">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-azure-500" />
                      <span className="text-sm leading-relaxed text-ink-600">{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <GlassButton href={s.cta.href} variant="secondary" size="sm" className="no-print">
                    {s.cta.label}
                    <ArrowRightIcon className="h-4 w-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>

        {/* Tips */}
        <ScrollReveal>
          <div className="relative z-10 mt-8">
            <GlassCard className="print-card p-7 md:p-8">
              <h3 className="font-display text-xl font-bold tracking-tight text-ink-900 md:text-2xl">
                검토를 더 빠르게 — 실무 팁
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {TIPS.map((tip) => (
                  <div key={tip.title} className="flex gap-4 rounded-2xl border border-white/70 bg-white/65 p-5 shadow-glass-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-azure-600">
                      <tip.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-ink-900">{tip.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-ink-500">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* CTA (인쇄 제외) */}
        <ScrollReveal>
          <div className="no-print relative z-10 mt-8 overflow-hidden rounded-4xl bg-gradient-to-br from-azure-700 via-azure-600 to-sky-cool-600 px-6 py-12 text-center shadow-glass-lg sm:px-12">
            <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
            <div className="relative mx-auto max-w-2xl">
              <h3 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                지금 바로 교육생 포트폴리오를 확인해보세요
              </h3>
              <p className="mt-3 text-base leading-relaxed text-azure-50">
                승인이 완료된 기업은 과정별 교육생 포트폴리오를 열람하고 채용 신청서를 제출할 수 있습니다.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <GlassButton href="/portfolios" variant="secondary" size="lg" className="!text-azure-700">
                  과정별 포트폴리오 보기
                  <ArrowRightIcon className="h-5 w-5" />
                </GlassButton>
                <GlassButton href="/contact" variant="outline" size="lg" className="!border-white/70 !text-white hover:!bg-white/15">
                  문의하기
                </GlassButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
