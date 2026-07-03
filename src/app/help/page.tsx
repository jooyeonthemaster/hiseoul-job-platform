'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'employer'>('jobseeker');

  const jobseekerSteps = [
    {
      icon: UserIcon,
      title: '1. 회원가입 및 프로필 작성',
      description: '기본 정보와 경력 사항을 입력하여 프로필을 완성하세요.',
      details: [
        '이메일 또는 소셜 로그인으로 간편 가입',
        '개인정보, 학력, 경력 사항 입력',
        '관심 분야 및 희망 직무 설정'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '2. 포트폴리오 작성',
      description: '실무 경험과 프로젝트를 포트폴리오로 정리하여 업로드하세요.',
      details: [
        '프로젝트별 상세 설명 및 성과 기록',
        '사용 기술 스택 및 툴 명시',
        '이미지, 링크 등 증빙 자료 첨부',
        'AI 기반 포트폴리오 최적화 제안 활용'
      ]
    },
    {
      icon: MagnifyingGlassIcon,
      title: '3. 채용공고 탐색',
      description: '맞춤형 채용공고를 확인하고 관심 기업을 팔로우하세요.',
      details: [
        '포트폴리오 기반 맞춤 공고 추천',
        '기업별 상세 정보 및 문화 확인',
        '급여, 복리후생, 근무환경 비교',
        '관심 기업 북마크 및 알림 설정'
      ]
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: '4. 지원 및 소통',
      description: '원클릭 지원으로 간편하게 지원하고 실시간으로 소통하세요.',
      details: [
        '포트폴리오 자동 연동으로 원클릭 지원',
        '지원 현황 실시간 확인',
        '기업과의 직접 메시징',
        '면접 일정 자동 관리'
      ]
    }
  ];

  const employerSteps = [
    {
      icon: BuildingOfficeIcon,
      title: '1. 기업 등록 및 참여',
      description: '면접심사 매칭 플랫폼에 기업 정보를 등록하고 참여하세요.',
      details: [
        '사업자 등록증 및 관련 서류 제출',
        '서울시 민간기업 참여형 절차 진행',
        '기업 소개, 문화, 복리후생 정보 입력',
        '전담 컨설턴트 배정 및 상담'
      ]
    },
    {
      icon: MagnifyingGlassIcon,
      title: '2. 인재 탐색 및 검색',
      description: '포트폴리오 기반으로 우수한 인재를 발굴하세요.',
      details: [
        '스킬별, 경력별 인재 검색',
        '포트폴리오 상세 검토',
        'AI 기반 매칭 점수 확인',
        '인재 프로필 북마크 및 관리'
      ]
    },
    {
      icon: DocumentTextIcon,
      title: '3. 채용공고 작성',
      description: '매력적인 채용공고를 작성하여 우수한 지원자를 유치하세요.',
      details: [
        '직무별 맞춤 공고 템플릿 제공',
        '급여, 복리후생 정보 상세 입력',
        '근무환경 및 성장 기회 어필',
        '포지션별 필수/우대 스킬 명시'
      ]
    },
    {
      icon: CheckCircleIcon,
      title: '4. 채용 관리',
      description: '효율적인 채용 프로세스로 최적의 인재를 선별하세요.',
      details: [
        '지원자 포트폴리오 일괄 검토',
        '단계별 채용 프로세스 관리',
        '면접 일정 자동 스케줄링',
        '채용 결과 자동 통지'
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-16 -mt-16 overflow-x-clip">
      {/* Header */}
      <header className="fixed top-0 w-full glass-nav z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-display font-bold text-lg">H</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">면접심사 매칭 플랫폼</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/portfolios" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                포트폴리오
              </Link>
              <Link href="/companies" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                기업정보
              </Link>
              <Link href="/jobs" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                채용공고
              </Link>
              <Link href="/about" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                소개
              </Link>
              <span className="px-4 py-2 rounded-xl text-azure-700 bg-azure-50/70 font-semibold">
                도움말
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

      {/* Tab Navigation */}
      <section className="relative pt-28 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight text-center mb-10 lg:mb-12">
            도움말
          </h1>
          <div className="flex justify-center mb-14 lg:mb-16">
            <div className="relative glass-strong rounded-3xl p-2 flex gap-1">
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`relative px-7 sm:px-10 py-4 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-300 ${
                  activeTab === 'jobseeker'
                    ? 'text-white'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {activeTab === 'jobseeker' && (
                  <motion.span
                    layoutId="helpTabPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  구직자 가이드
                </span>
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`relative px-7 sm:px-10 py-4 rounded-2xl font-semibold text-sm sm:text-base transition-colors duration-300 ${
                  activeTab === 'employer'
                    ? 'text-white'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {activeTab === 'employer' && (
                  <motion.span
                    layoutId="helpTabPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-azure-500 to-azure-600 shadow-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5" />
                  기업 가이드
                </span>
              </button>
            </div>
          </div>

          {/* Guide Content */}
          <ScrollRevealStagger className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {(activeTab === 'jobseeker' ? jobseekerSteps : employerSteps).map((step, index) => (
              <ScrollRevealItem key={index}>
                <GlassCard hover className="h-full p-8 lg:p-10">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center flex-shrink-0 shadow-glow">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-3 text-ink-900 tracking-tight">{step.title}</h3>
                      <p className="text-ink-500 leading-relaxed mb-5">{step.description}</p>
                      <ul className="space-y-2.5">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2.5">
                            <CheckCircleIcon className="w-4 h-4 text-azure-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-ink-500 leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="container-wide">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-azure-700 via-azure-600 to-sky-cool-600 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-glass-lg">
              <AuroraBackground variant="vivid" className="opacity-40 mix-blend-overlay" />
              <div className="relative max-w-3xl mx-auto">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">추가 도움이 필요하신가요?</h2>
                <p className="text-base sm:text-lg md:text-xl text-azure-50 mb-10 leading-relaxed">
                  더 자세한 문의사항이 있으시면 언제든 연락주세요
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlassButton href="/contact" variant="secondary" size="lg" className="!text-azure-700">
                    문의하기
                    <ArrowRightIcon className="w-5 h-5" />
                  </GlassButton>
                  <GlassButton href="/faq" variant="outline" size="lg" className="!border-white/70 !text-white hover:!bg-white/15">
                    FAQ 보기
                  </GlassButton>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-display font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">면접심사 매칭 플랫폼</span>
          </Link>
          <p className="text-ink-400">
            &copy; 2025 면접심사 매칭 플랫폼. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
