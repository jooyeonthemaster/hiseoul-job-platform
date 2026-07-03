'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Badge } from '@/components/ui/Badge';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

export default function PrivacyPage() {
  const sections = [
    {
      icon: ShieldCheckIcon,
      title: '개인정보 수집 및 이용 목적',
      content: [
        '회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지',
        '구인구직 서비스 제공: 포트폴리오 관리, 채용공고 추천, 매칭 서비스, 지원 및 채용 프로세스 관리',
        '고객 서비스 운영: 고객 문의 처리, 공지사항 전달, 불만처리 등 의사소통 경로 확보',
        '서비스 개선 및 마케팅: 신규 서비스 개발, 이벤트 및 광고성 정보 제공, 서비스 이용 통계 분석'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '수집하는 개인정보 항목',
      content: [
        '필수항목: 이름, 이메일 주소, 연락처, 생년월일, 성별',
        '선택항목: 학력, 경력, 기술 스택, 포트폴리오 정보, 희망 근무지역, 희망 연봉',
        '서비스 이용 과정에서 자동 수집: IP 주소, 쿠키, 방문일시, 서비스 이용 기록, 불량 이용 기록',
        '기업회원 추가 수집 항목: 사업자등록번호, 회사명, 회사주소, 담당자 정보'
      ]
    },
    {
      icon: ClockIcon,
      title: '개인정보의 보유 및 이용기간',
      content: [
        '회원탈퇴 시까지: 회원가입 정보, 서비스 이용 기록',
        '탈퇴 후 1년: 부정 이용 방지를 위한 최소한의 정보 (이메일, IP)',
        '관련 법령에 따른 보존: 전자상거래법, 통신비밀보호법 등에 따른 의무 보존 기간',
        '채용 관련 정보: 채용 프로세스 완료 후 1년간 보관 (분쟁 해결 목적)'
      ]
    },
    {
      icon: UserGroupIcon,
      title: '개인정보의 제3자 제공',
      content: [
        '원칙적으로 개인정보를 외부에 제공하지 않습니다',
        '구직자-기업 간 매칭 시에만 상호 동의 하에 제한적 정보 공유',
        '법령에 의한 요구가 있을 경우에만 관련 기관에 제공',
        '개인정보 처리 위탁 업체: 클라우드 서비스(AWS), 결제대행사 등 (별도 계약으로 보안 관리)'
      ]
    },
    {
      icon: LockClosedIcon,
      title: '개인정보 보호를 위한 기술적/관리적 조치',
      content: [
        '기술적 조치: 암호화 전송(SSL), 데이터베이스 암호화, 접근제한시스템, 백신프로그램 설치',
        '관리적 조치: 개인정보보호책임자 지정, 정기적 직원 교육, 접근권한 최소화',
        '물리적 조치: 전산실 출입통제, 개인정보 보관 장소 잠금장치',
        '정기적 보안 점검 및 취약점 개선'
      ]
    },
    {
      icon: ExclamationTriangleIcon,
      title: '정보주체의 권리와 행사 방법',
      content: [
        '개인정보 열람권: 처리 현황, 처리 목적 등에 대한 열람 요구',
        '정정·삭제권: 잘못된 정보의 수정이나 삭제 요구',
        '처리정지권: 개인정보 처리 중단 요구',
        '손해배상청구권: 개인정보 침해로 인한 손해배상 청구',
        '권리 행사 방법: 서면, 전화, 이메일을 통해 개인정보보호책임자에게 연락'
      ]
    }
  ];

  const reportChannels = [
    { name: '개인정보보호위원회', info: 'privacy.go.kr / 국번없이 182' },
    { name: '개인정보 침해신고센터', info: 'privacy.kisa.or.kr / 국번없이 118' },
    { name: '대검찰청 사이버수사과', info: 'spo.go.kr / (02) 3480-3571' },
    { name: '경찰청 사이버안전국', info: 'cyberbureau.police.go.kr / 국번없이 182' },
  ];

  return (
    <div className="min-h-screen overflow-x-clip">
      {/* ====================== Policy Content ====================== */}
      <section className="relative pt-28 pb-12 lg:pt-32 lg:pb-20 overflow-hidden">
        <AuroraBackground variant="vivid" />
        <div className="relative z-10 container-wide">
          {/* Heading */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-14">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                개인정보처리방침
              </h1>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
                <Badge tone="azure">시행일자: 2024년 1월 1일</Badge>
                <Badge tone="neutral">최종 수정일: 2024년 12월 15일</Badge>
              </div>
            </div>
          </ScrollReveal>

          {/* Introduction */}
          <ScrollReveal>
            <GlassCard strong className="p-8 sm:p-12 lg:p-16 mb-14 lg:mb-20 text-center max-w-4xl mx-auto">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6 text-ink-900 tracking-tight">
                개인정보처리방침 개요
              </h2>
              <p className="text-base sm:text-lg text-ink-500 leading-relaxed">
                면접심사 매칭 플랫폼('https://techventure.co.kr' 이하 '면접심사 매칭 플랫폼')은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고
                개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 수립·공개합니다.
              </p>
            </GlassCard>
          </ScrollReveal>

          {/* Policy Sections */}
          <ScrollRevealStagger className="space-y-8 lg:space-y-10">
            {sections.map((section, index) => (
              <ScrollRevealItem key={index}>
                <GlassCard hover className="p-8 sm:p-10 lg:p-12">
                  <div className="flex items-start gap-5 mb-7">
                    <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow">
                      <section.icon className="w-7 h-7" />
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-display text-sm font-bold text-azure-400 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
                        {section.title}
                      </h3>
                    </div>
                  </div>

                  <ul className="space-y-4 sm:ml-[4.75rem]">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-azure-500 flex-shrink-0" />
                        <span className="text-ink-600 leading-relaxed text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* ====================== Contact & Report ====================== */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <SectionHeading
            eyebrow="문의 및 신고"
            title={
              <>
                개인정보 관련 <span className="text-gradient-azure">연락처</span>
              </>
            }
          />

          <div className="grid lg:grid-cols-2 gap-8 mt-14 max-w-6xl mx-auto">
            {/* Privacy Officer */}
            <ScrollReveal>
              <GlassCard hover className="h-full p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-7">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 text-azure-600 shadow-glass-sm">
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">개인정보보호책임자</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink-700 w-16 shrink-0">성명</span>
                    <span className="text-ink-500">김기홍</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink-700 w-16 shrink-0">직책</span>
                    <span className="text-ink-500">대표</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink-700 w-16 shrink-0">연락처</span>
                    <span className="text-ink-500">010-3721-0204</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink-700 w-16 shrink-0">이메일</span>
                    <a href="mailto:tvs@techventure.co.kr" className="inline-flex items-center gap-1.5 text-azure-600 hover:text-azure-700 transition-colors font-medium">
                      <EnvelopeIcon className="w-4 h-4" />
                      tvs@techventure.co.kr
                    </a>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* External Report */}
            <ScrollReveal delay={0.08}>
              <GlassCard hover className="h-full p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-7">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-azure-50 border border-azure-100 text-azure-600 shadow-glass-sm">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">개인정보 침해 신고</h3>
                </div>
                <div className="space-y-4">
                  {reportChannels.map((channel) => (
                    <div key={channel.name} className="glass rounded-2xl px-5 py-4">
                      <div className="font-semibold text-ink-700">{channel.name}</div>
                      <div className="text-ink-500 text-sm mt-0.5">{channel.info}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ====================== Important Notice ====================== */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="relative z-10 container-wide">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-azure-600 via-azure-500 to-sky-cool-500 p-8 sm:p-12 lg:p-16 text-white shadow-glass-lg max-w-5xl mx-auto">
              <AuroraBackground variant="vivid" className="opacity-30 mix-blend-overlay" />
              <div className="relative">
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-7 text-white tracking-tight">중요 안내사항</h3>
                <div className="space-y-5 text-left max-w-3xl">
                  <p className="flex items-start gap-3 text-white/90 leading-relaxed text-base sm:text-lg">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
                    본 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
                  </p>
                  <p className="flex items-start gap-3 text-white/90 leading-relaxed text-base sm:text-lg">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
                    개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전부터 홈페이지의 '공지사항'을 통하여 고지할 것입니다.
                  </p>
                  <p className="flex items-start gap-3 text-white/90 leading-relaxed text-base sm:text-lg">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
                    이전의 개인정보처리방침은 아래에서 확인하실 수 있습니다.
                  </p>
                </div>
                <div className="mt-10">
                  <GlassButton href="/contact" variant="secondary" size="lg" className="!text-azure-700">
                    <EnvelopeIcon className="w-5 h-5" />
                    개인정보 관련 문의하기
                    <ArrowRightIcon className="w-5 h-5" />
                  </GlassButton>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="mt-10 text-center">
            <GlassButton href="/" variant="outline" size="md">
              <HomeIcon className="w-5 h-5" />
              홈으로 돌아가기
            </GlassButton>
          </ScrollReveal>
        </div>
      </section>

      {/* ====================== Footer ====================== */}
      <footer className="relative mt-10 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-14 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-glass p-1 group-hover:scale-105 transition-transform duration-300">
              <img src="/images/logo.png" alt="면접심사 매칭 플랫폼 Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold">면접심사 매칭 플랫폼</span>
          </Link>
          <p className="text-ink-400">
            &copy; 2025 면접심사 매칭 플랫폼. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
