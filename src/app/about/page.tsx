'use client';

import Link from 'next/link';
import {
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import {
  ScrollReveal,
  ScrollRevealStagger,
  ScrollRevealItem,
} from '@/components/ui/ScrollReveal';

export default function AboutPage() {
  const values = [
    {
      icon: HeartIcon,
      title: '진정성',
      description: '구직자와 기업 모두에게 진정으로 도움이 되는 서비스를 제공합니다.'
    },
    {
      icon: LightBulbIcon,
      title: '혁신',
      description: 'AI 기술과 포트폴리오 기반 매칭으로 채용 시장에 혁신을 가져옵니다.'
    },
    {
      icon: ShieldCheckIcon,
      title: '신뢰',
      description: '서울시 민간기업 참여형 매력일자리 사업으로 참여 기업과 투명한 채용 프로세스를 보장합니다.'
    }
  ];

  const team = [
    {
      name: '김기홍',
      position: '대표 / 전 HBA 사무국장',
      description: '채용 및 인사 전문 경험을 바탕으로 면접심사 매칭 플랫폼을 설립했습니다.',
      email: 'tvs@techventure.co.kr'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Page sub-header — glass, sits below the global navigation */}
      <header className="sticky top-16 z-40 glass-nav">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-display font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-ink-900 tracking-tight">면접심사 매칭 플랫폼</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/companies"
                className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium"
              >
                기업정보
              </Link>
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium"
              >
                채용공고
              </Link>
              <span className="px-4 py-2 rounded-xl text-azure-700 font-semibold bg-azure-50/70">
                소개
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <GlassButton href="/" size="sm">
                홈으로
              </GlassButton>
            </div>
          </div>
        </div>
      </header>

      {/* Page heading */}
      <section className="relative pt-12 pb-4 lg:pt-16 overflow-hidden">
        <div className="relative z-10 container-wide">
          <ScrollReveal>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink-900">
              회사 소개
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative pt-8 pb-20 md:pb-28 overflow-hidden">
        <div className="relative z-10 container-wide">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            {/* Mission */}
            <ScrollReveal className="lg:col-span-7">
              <GlassCard className="h-full p-9 md:p-12">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                  Mission
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-7 text-ink-900 tracking-tight">
                  우리의 <span className="text-gradient-azure">미션</span>
                </h2>
                <p className="text-base md:text-lg text-ink-500 leading-relaxed mb-8">
                  면접심사 매칭 플랫폼은 서울시의 우수한 중소기업들이 필요로 하는 인재와
                  실력 있는 구직자들을 효과적으로 연결하여,
                  모두가 성장할 수 있는 채용 생태계를 구축하는 것을 목표로 합니다.
                </p>
                <div className="space-y-3">
                  {[
                    '포트폴리오 기반의 실력 중심 채용 문화 조성',
                    '서울시 중소기업의 인재 확보 지원',
                    '구직자의 역량 개발 및 취업 기회 확대',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 glass rounded-2xl px-5 py-4">
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-azure-500 shrink-0" />
                      <p className="text-ink-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Vision */}
            <ScrollReveal delay={0.1} className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-4xl bg-gradient-to-br from-azure-600 via-azure-500 to-sky-cool-500 p-9 md:p-12 text-white shadow-glass-lg">
                <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
                <div className="relative">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    Vision
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-7 text-white tracking-tight">
                    우리의 비전
                  </h2>
                  <p className="text-base md:text-lg text-white/90 leading-relaxed">
                    2030년까지 서울시 최고의 중소기업 전문 구인구직 플랫폼이 되어,
                    연간 10,000건 이상의 성공적인 매칭을 달성하고,
                    서울시 중소기업의 채용 성공률을 획기적으로 향상시키는 것입니다.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <SectionHeading
            title="핵심 가치"
            subtitle="면접심사 매칭 플랫폼이 추구하는 가치와 원칙입니다"
          />

          <ScrollRevealStagger className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-14">
            {values.map((value, index) => (
              <ScrollRevealItem key={index}>
                <GlassCard hover className="h-full p-9 text-center">
                  <div className="w-20 h-20 mx-auto mb-7 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow">
                    <value.icon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-ink-900 text-center">{value.title}</h3>
                  <p className="text-ink-500 leading-relaxed text-center">{value.description}</p>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <SectionHeading
            title="팀 소개"
            subtitle="면접심사 매칭 플랫폼을 이끌어가는 전문가를 만나보세요"
          />

          <div className="flex justify-center mt-14">
            {team.map((member, index) => (
              <ScrollReveal key={index} className="w-full max-w-md">
                <GlassCard hover strong className="p-9 md:p-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-azure-500 to-azure-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <span className="text-white font-display font-bold text-3xl">{member.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-ink-900 text-center">{member.name}</h3>
                  <div className="flex justify-center mb-5">
                    <Badge tone="azure">{member.position}</Badge>
                  </div>
                  <p className="text-ink-500 leading-relaxed mb-7 text-center">{member.description}</p>
                  <div className="flex justify-center">
                    <GlassButton href={`mailto:${member.email}`}>
                      <EnvelopeIcon className="w-5 h-5" />
                      문의하기
                    </GlassButton>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-10 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-display font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight">면접심사 매칭 플랫폼</span>
          </Link>
          <p className="text-ink-300">
            &copy; 2025 면접심사 매칭 플랫폼. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
