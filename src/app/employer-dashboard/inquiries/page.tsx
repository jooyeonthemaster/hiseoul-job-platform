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
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { GlassInput, GlassSelect } from '@/components/ui/GlassField';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name'>('recent');
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

  const getSentTime = (inq: JobInquiry) => inq.sentAt?.toDate?.()?.getTime?.() ?? 0;

  const filteredInquiries = inquiries
    .filter((inq) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        (inq.jobSeekerName || '').toLowerCase().includes(q) ||
        (inq.proposedPosition || '').toLowerCase().includes(q) ||
        (inq.recruiterInfo?.name || '').toLowerCase().includes(q) ||
        (inq.message || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.jobSeekerName || '').localeCompare(b.jobSeekerName || '', 'ko');
      return sortBy === 'recent' ? getSentTime(b) - getSentTime(a) : getSentTime(a) - getSentTime(b);
    });

  const isFiltering = searchTerm.trim().length > 0;

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
    <div className="relative min-h-screen overflow-hidden py-10 md:py-14">
      <AuroraBackground />

      <div className="relative z-10 container-wide">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-8">
            <Link
              href="/employer-dashboard"
              className="inline-flex items-center gap-2 text-ink-500 hover:text-azure-700 transition-colors mb-5 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              대시보드로 돌아가기
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold tracking-wide bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
                  받은 문의 관리
                </span>
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 leading-[1.1]">보낸 채용 제안</h1>
                <p className="text-ink-500 mt-3 text-base md:text-lg leading-relaxed">발송한 채용 제안 목록입니다. 매칭 결과는 관리자를 통해 안내됩니다.</p>
              </div>

              {/* 총 발송 건수 요약 (헤더 우측으로 이동 — 하단 카드 제거로 스크롤 단축) */}
              {inquiries.length > 0 && (
                <div className="shrink-0 inline-flex items-center gap-4 rounded-3xl bg-white/60 backdrop-blur-md border border-white/70 px-6 py-4 shadow-glass-sm">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center text-white shadow-glow">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-ink-900 leading-none">
                      {inquiries.length}
                      <span className="text-base font-semibold text-ink-400 ml-1">건</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-1">총 보낸 제안</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {inquiries.length === 0 ? (
          /* 제안 자체가 없는 빈 상태 */
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
          <>
            {/* 검색·정렬 툴바 */}
            <ScrollReveal delay={0.05}>
              <GlassCard strong className="p-4 sm:p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <div className="relative flex-1 min-w-0">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-azure-400 w-5 h-5 pointer-events-none z-10" />
                    <GlassInput
                      type="text"
                      placeholder="이름, 직무, 담당자, 메시지로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-10"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-ink-400 hover:text-ink-700 hover:bg-azure-50 transition-colors z-10"
                        aria-label="검색어 지우기"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <GlassSelect
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'name')}
                    className="sm:w-48"
                    aria-label="정렬"
                  >
                    <option value="recent">최신 발송순</option>
                    <option value="oldest">오래된 발송순</option>
                    <option value="name">이름순</option>
                  </GlassSelect>
                </div>
                <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2 text-sm text-ink-500">
                  <FunnelIcon className="w-4 h-4 text-azure-500" />
                  {isFiltering ? (
                    <span>
                      <span className="font-semibold text-azure-600">{filteredInquiries.length}건</span> 검색됨 · 전체 {inquiries.length}건
                    </span>
                  ) : (
                    <span>
                      총 <span className="font-semibold text-azure-600">{filteredInquiries.length}건</span>의 채용 제안
                    </span>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>

            {filteredInquiries.length === 0 ? (
              /* 검색 결과 없음 */
              <ScrollReveal delay={0.05}>
                <GlassCard className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-3xl bg-azure-50 border border-azure-100 flex items-center justify-center text-azure-400 shadow-glass-sm">
                    <MagnifyingGlassIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-ink-500 mb-6">다른 검색어를 시도해보세요.</p>
                  <GlassButton onClick={() => setSearchTerm('')} variant="secondary" size="sm">
                    검색 초기화
                  </GlassButton>
                </GlassCard>
              </ScrollReveal>
            ) : (
              /* 카드 그리드 — 한 화면에 여러 건이 들어오도록 3열 그리드 */
              <ScrollRevealStagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredInquiries.map((inquiry) => (
                  <ScrollRevealItem key={inquiry.id}>
                    <GlassCard hover className="group h-full flex flex-col p-6">
                      {/* 헤더 */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-azure-400 to-azure-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shadow-glow">
                            {inquiry.jobSeekerName?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-ink-900 truncate">{inquiry.jobSeekerName}</h3>
                            <p className="text-sm text-ink-500 truncate">{inquiry.proposedPosition || '직무 미정'}</p>
                          </div>
                        </div>
                        <Badge tone="azure" icon={<EnvelopeIcon className="w-3.5 h-3.5" />}>발송됨</Badge>
                      </div>

                      {/* 메타 정보 */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-ink-600">
                          <CurrencyDollarIcon className="w-4 h-4 text-azure-500 shrink-0" />
                          <span className="truncate">제안 급여 · {inquiry.proposedSalary || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ink-600">
                          <CalendarIcon className="w-4 h-4 text-azure-500 shrink-0" />
                          <span className="truncate">발송일 · {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '알 수 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-ink-600">
                          <UserIcon className="w-4 h-4 text-azure-500 shrink-0" />
                          <span className="truncate">담당자 · {inquiry.recruiterInfo?.name || '-'}</span>
                        </div>
                      </div>

                      {/* 메시지 미리보기 */}
                      <div className="glass rounded-2xl p-4 mb-5 flex-1 min-h-[4.5rem]">
                        <p className="text-sm text-ink-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                          {inquiry.message || '발송 메시지가 없습니다.'}
                        </p>
                      </div>

                      {/* 액션 */}
                      <GlassButton
                        href={`/portfolios/${inquiry.jobSeekerId}`}
                        variant="secondary"
                        size="sm"
                        className="w-full mt-auto"
                      >
                        포트폴리오 보기
                      </GlassButton>
                    </GlassCard>
                  </ScrollRevealItem>
                ))}
              </ScrollRevealStagger>
            )}

            {/* 안내 문구 (관리자 중개형) — 큰 카드 대신 슬림한 한 줄로 */}
            <ScrollReveal delay={0.08}>
              <p className="mt-8 text-center text-sm text-ink-400 leading-relaxed">
                면접심사 매칭은 관리자가 진행합니다. 개별 제안의 진행 상황은 관리자를 통해 안내됩니다.
              </p>
            </ScrollReveal>
          </>
        )}
      </div>
    </div>
  );
}
