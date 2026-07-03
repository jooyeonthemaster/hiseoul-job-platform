'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

interface JobInquiry {
  id: string;
  jobSeekerId: string;
  jobSeekerName?: string;
  proposedPosition: string;
  proposedSalary: string;
  message: string;
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: any;
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
}

export default function InquiriesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<JobInquiry[]>([]);
  // 관리자 중개형: 구직자의 응답(읽음/수락/거절) 상태는 기업에게 노출하지 않는다.
  // 기업 본인이 '보낸 제안 목록'만 표시한다.

  useEffect(() => {
    const loadInquiries = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        const userData = await getUserData(user.uid);
        if (!userData || userData.role !== 'employer') {
          router.push('/');
          return;
        }

        // 채용 문의 목록 가져오기
        const inquiriesQuery = query(
          collection(db, 'jobInquiries'),
          where('employerId', '==', user.uid),
          orderBy('sentAt', 'desc')
        );

        const querySnapshot = await getDocs(inquiriesQuery);
        const inquiriesData: JobInquiry[] = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();

          // 구직자 정보 가져오기 (공개 포트폴리오만 — 보안 규칙상 비공개분은 본인만 읽기 가능)
          const jobSeekerDoc = await getDocs(
            query(
              collection(db, 'portfolios'),
              where('userId', '==', data.jobSeekerId),
              where('isPublic', '==', true)
            )
          );

          let jobSeekerName = '알 수 없음';
          if (!jobSeekerDoc.empty) {
            jobSeekerName = jobSeekerDoc.docs[0].data().name || '알 수 없음';
          }

          inquiriesData.push({
            id: doc.id,
            ...data,
            jobSeekerName,
            sentAt: data.sentAt
          } as JobInquiry);
        }

        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Error loading inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, [user, router]);

  const filteredInquiries = inquiries;

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AuroraBackground />
        <div className="relative glass-strong rounded-4xl shadow-glass-lg px-10 py-12 flex flex-col items-center gap-5">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-azure-100 border-t-azure-500"></div>
          <p className="text-ink-500 font-medium">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden py-12 md:py-16">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-10">
            <Link
              href="/employer-dashboard"
              className="inline-flex items-center gap-2 text-ink-500 hover:text-azure-700 transition-colors mb-6 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              대시보드로 돌아가기
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
              받은 문의 관리
            </span>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 leading-[1.1]">보낸 채용 제안</h1>
            <p className="text-ink-500 mt-4 text-base md:text-lg leading-relaxed">발송한 채용 제안 목록입니다. 매칭 결과는 관리자를 통해 안내됩니다.</p>
          </div>
        </ScrollReveal>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <GlassCard strong className="p-14 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-500 shadow-glass-sm">
                <EnvelopeIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-ink-900 mb-3">보낸 채용 제안이 없습니다</h3>
              <p className="text-ink-500 mb-8 leading-relaxed">
                아직 발송한 채용 제안이 없습니다.
              </p>
              <GlassButton href="/employer-dashboard" size="md">
                인재 검색하러 가기
              </GlassButton>
            </GlassCard>
          </ScrollReveal>
        ) : (
          <ScrollRevealStagger className="space-y-5">
            {filteredInquiries.map((inquiry) => (
              <ScrollRevealItem key={inquiry.id}>
                <GlassCard hover className="p-7 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-azure-400 to-azure-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shadow-glow">
                        {inquiry.jobSeekerName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-ink-900 flex items-center gap-2">
                          <UserIcon className="w-5 h-5 text-azure-500" />
                          {inquiry.jobSeekerName}
                        </h3>
                        <p className="text-sm text-ink-500 mt-1">
                          {inquiry.proposedPosition}
                        </p>
                      </div>
                    </div>
                    <Badge tone="azure" icon={<EnvelopeIcon className="w-4 h-4" />}>발송됨</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
                    <div className="flex items-center gap-2 rounded-2xl bg-azure-50/50 border border-azure-100/70 px-4 py-3 text-ink-600">
                      <CurrencyDollarIcon className="w-4 h-4 text-azure-500 shrink-0" />
                      <span>제안 급여: {inquiry.proposedSalary}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-azure-50/50 border border-azure-100/70 px-4 py-3 text-ink-600">
                      <CalendarIcon className="w-4 h-4 text-azure-500 shrink-0" />
                      <span>발송일: {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '알 수 없음'}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-azure-50/50 border border-azure-100/70 px-4 py-3 text-ink-600">
                      <UserIcon className="w-4 h-4 text-azure-500 shrink-0" />
                      <span>담당자: {inquiry.recruiterInfo.name}</span>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5 mb-6">
                    <h4 className="text-sm font-medium text-ink-700 mb-2">발송 메시지</h4>
                    <p className="text-sm text-ink-500 whitespace-pre-wrap leading-relaxed">
                      {inquiry.message.length > 150
                        ? inquiry.message.substring(0, 150) + '...'
                        : inquiry.message}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-1">
                    <div className="text-sm text-ink-400">
                      담당자 연락처: {inquiry.recruiterInfo.phone} • {inquiry.recruiterInfo.email}
                    </div>
                    <div className="flex gap-2.5 shrink-0">
                      <GlassButton
                        href={`/portfolios/${inquiry.jobSeekerId}`}
                        variant="secondary"
                        size="sm"
                      >
                        포트폴리오 보기
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        )}

        {/* Stats Summary — 관리자 중개형: 응답/수락 등 상호 정보는 제외, 본인 발송 건수만 */}
        <ScrollReveal delay={0.08}>
          <GlassCard strong className="mt-12 p-7 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold text-ink-900 mb-6">채용 제안 현황</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl bg-azure-50/40 border border-azure-100/60 px-4 py-5 text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-ink-900">{inquiries.length}</div>
                <div className="text-sm text-ink-500 mt-1">보낸 제안</div>
              </div>
            </div>
            <p className="text-sm text-ink-400 mt-5 leading-relaxed">
              면접심사 매칭은 관리자가 진행합니다. 개별 제안의 진행 상황은 관리자를 통해 안내됩니다.
            </p>
          </GlassCard>
        </ScrollReveal>
      </div>
    </div>
  );
}
