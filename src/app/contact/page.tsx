'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { Field, GlassInput, GlassTextarea, GlassSelect } from '@/components/ui/GlassField';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: '이메일',
      value: 'tvs@techventure.co.kr',
      description: '일반 문의 및 기술 지원',
      link: 'mailto:tvs@techventure.co.kr'
    },
    {
      icon: PhoneIcon,
      title: '전화번호',
      value: '010-3721-0204',
      description: '평일 09:00 ~ 18:00',
      link: 'tel:010-3721-0204'
    },
    {
      icon: MapPinIcon,
      title: '주소',
      value: '서울특별시',
      description: '정확한 주소는 문의 시 안내',
      link: null
    },
    {
      icon: ClockIcon,
      title: '업무시간',
      value: '평일 09:00 ~ 18:00',
      description: '토/일/공휴일 휴무',
      link: null
    }
  ];

  const categories = [
    { value: 'general', label: '일반 문의' },
    { value: 'technical', label: '기술 지원' },
    { value: 'business', label: '사업 제휴' },
    { value: 'complaint', label: '불만/신고' },
    { value: 'suggestion', label: '개선 제안' }
  ];

  return (
    <div className="min-h-screen pt-16 -mt-16 overflow-x-clip">
      {/* Header */}
      <header className="fixed top-0 w-full glass-nav z-50">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-white font-display font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-ink-900">면접심사 매칭 플랫폼</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/companies" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                기업정보
              </Link>
              <Link href="/jobs" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                채용공고
              </Link>
              <Link href="/about" className="px-4 py-2 rounded-xl text-ink-600 hover:text-azure-700 hover:bg-azure-50/70 transition-all duration-200 font-medium">
                소개
              </Link>
              <span className="px-4 py-2 rounded-xl text-azure-700 font-semibold bg-azure-50/70">
                문의
              </span>
            </nav>

            <div className="flex items-center gap-4">
              <GlassButton href="/" size="sm">
                홈으로
              </GlassButton>
            </div>
          </div>
        </div>
      </header>

      {/* Contact Info + Form (editorial asymmetric layout) */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <AuroraBackground />
        <div className="relative z-10 container-wide">
          <ScrollReveal>
            <h1 className="text-2xl md:text-3xl font-bold text-ink-900 mb-10">문의하기</h1>
          </ScrollReveal>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Contact Info cards */}
            <div className="lg:col-span-5">
              <ScrollReveal>
                <SectionHeading
                  align="left"
                  eyebrow="연락처 안내"
                  title={<>다양한 방법으로<br /><span className="text-gradient-azure">연락하세요</span></>}
                />
              </ScrollReveal>

              <ScrollRevealStagger className="grid sm:grid-cols-2 gap-6 mt-10">
                {contactInfo.map((info, index) => (
                  <ScrollRevealItem key={index}>
                    <GlassCard hover className="h-full p-7">
                      <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glow mb-5">
                        <info.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-ink-900">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-azure-600 hover:text-azure-700 font-semibold text-base block mb-2 transition-colors break-all"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-ink-900 font-semibold text-base mb-2">{info.value}</p>
                      )}
                      <p className="text-ink-500 text-sm leading-relaxed">{info.description}</p>
                    </GlassCard>
                  </ScrollRevealItem>
                ))}
              </ScrollRevealStagger>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <ScrollReveal delay={0.1}>
                <GlassCard strong className="p-8 sm:p-10">
                  <div className="mb-8">
                    <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink-900 mb-3">문의 보내기</h2>
                    <p className="text-ink-500 text-base md:text-lg leading-relaxed">아래 폼을 작성해 주시면 빠르게 답변드리겠습니다</p>
                  </div>

                  {isSubmitted && (
                    <div className="mb-8 p-6 rounded-3xl bg-mint-100 border border-mint-400/40 shadow-glass-sm">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-6 h-6 text-mint-600 mr-3 shrink-0" />
                        <p className="text-mint-600 font-semibold">문의가 성공적으로 전송되었습니다!</p>
                      </div>
                      <p className="text-ink-600 mt-2 text-sm">빠른 시일 내에 답변드리겠습니다.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Field label="이름" htmlFor="name" required>
                        <GlassInput
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="홍길동"
                        />
                      </Field>

                      <Field label="이메일" htmlFor="email" required>
                        <GlassInput
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                        />
                      </Field>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Field label="문의 유형" htmlFor="category" required>
                        <GlassSelect
                          id="category"
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                        >
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </GlassSelect>
                      </Field>

                      <Field label="제목" htmlFor="subject" required>
                        <GlassInput
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="문의 제목을 입력해주세요"
                        />
                      </Field>
                    </div>

                    <Field label="메시지" htmlFor="message" required>
                      <GlassTextarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="문의 내용을 자세히 입력해주세요..."
                      />
                    </Field>

                    <div className="pt-2">
                      <GlassButton type="submit" size="lg" className="w-full sm:w-auto">
                        문의 보내기
                        <ArrowRightIcon className="w-5 h-5" />
                      </GlassButton>
                    </div>
                  </form>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-10 bg-ink-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-azure-aurora opacity-25" />
        <div className="relative container-wide py-14 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-azure-500 to-azure-600 rounded-2xl flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-white">면접심사 매칭 플랫폼</span>
          </Link>
          <p className="text-ink-400">
            &copy; 2025 면접심사 매칭 플랫폼. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
