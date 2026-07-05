'use client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { formatKoreanDate } from '@/lib/dateUtils';

interface JobInquiry {
  id: string;
  jobSeekerId: string;
  employerId: string;
  portfolioId: string;
  proposedPosition: string;
  proposedSalary: string;
  message: string;
  jobCategory: string;
  workingHours: string;
  workType: string;
  benefits: string[];
  companyInfo: {
    name: string;
    ceoName: string;
    industry: string;
    businessType: string;
    location: string;
    description: string;
  };
  recruiterInfo: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  status: 'sent' | 'read' | 'responded' | 'accepted' | 'rejected';
  sentAt: any;
  readAt?: any;
  respondedAt?: any;
  jobSeekerName?: string;
  jobSeekerEmail?: string;
}

interface JobInquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: JobInquiry | null;
  showJobSeekerName?: boolean; // 관리자 페이지에서만 구직자 이름 표시
  onStatusUpdate?: (inquiryId: string, status: string) => void; // 구직자가 상태 변경할 때 사용
}

type BadgeTone = 'azure' | 'mint' | 'honey' | 'coral' | 'neutral';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusInfo = (status: string): { text: string; tone: BadgeTone; icon: string } => {
    switch (status) {
      case 'sent':
        return { text: '새 제안', tone: 'azure', icon: '📧' };
      case 'read':
        return { text: '읽음', tone: 'honey', icon: '👀' };
      case 'responded':
        return { text: '답변함', tone: 'azure', icon: '💬' };
      case 'accepted':
        return { text: '수락함', tone: 'mint', icon: '✅' };
      case 'rejected':
        return { text: '거절함', tone: 'coral', icon: '❌' };
      default:
        return { text: status, tone: 'neutral', icon: '📄' };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <Badge tone={statusInfo.tone} className="px-3.5 py-1.5 text-sm">
      <span className="mr-0.5">{statusInfo.icon}</span>
      {statusInfo.text}
    </Badge>
  );
};

// 글래스 정보 행 — 라벨/값 페어
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <p className="flex flex-wrap items-baseline gap-x-2">
    <span className="font-medium text-ink-500">{label}:</span>
    <span className="text-ink-800">{value}</span>
  </p>
);

// 강조 데이터 카드 — 라벨 위, 값 아래
const FactCard = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value?: string;
  emphasis?: boolean;
}) => (
  <div className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md px-4 py-3 shadow-glass-sm">
    <p className="text-xs font-semibold text-ink-400">{label}</p>
    <p className={emphasis ? 'mt-0.5 text-lg font-semibold text-ink-900' : 'mt-0.5 text-ink-800'}>
      {value}
    </p>
  </div>
);

export default function JobInquiryDetailModal({
  isOpen,
  onClose,
  inquiry,
  showJobSeekerName = false,
  onStatusUpdate
}: JobInquiryDetailModalProps) {
  const reduce = useReducedMotion();

  if (!isOpen || !inquiry) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(inquiry.id, newStatus);
    }
  };

  const panelMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.96, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 12 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-900/30 backdrop-blur-sm"
        initial={reduce ? undefined : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        <motion.div
          {...panelMotion}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-4xl shadow-glass-lg w-full max-w-[1400px] max-h-[92vh] overflow-hidden flex flex-col"
        >
          {/* 헤더 바 */}
          <div className="relative shrink-0 px-6 sm:px-10 lg:px-14 pt-8 pb-7 border-b border-white/50">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-azure-500 to-azure-600 shadow-glow">
                  <BuildingOfficeIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-600">
                    PROPOSAL
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                    채용 제안서 상세
                  </h2>
                  <p className="mt-1 text-ink-500">
                    {inquiry.companyInfo?.name}
                    {' · '}
                    {showJobSeekerName
                      ? `${inquiry.jobSeekerName}님에게 채용 제안`
                      : '채용 제안서'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-white/70 text-ink-500 shadow-glass-sm transition-all duration-300 hover:bg-white/95 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <StatusBadge status={inquiry.status} />
              <span className="text-sm text-ink-400">
                발송일: {formatKoreanDate(inquiry.sentAt, { withTime: true })}
              </span>
            </div>
          </div>

          {/* 스크롤 본문 */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-10">
            <div className="space-y-8">
              {/* 메인 콘텐츠 - 비대칭 2단 레이아웃 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* 왼쪽 컬럼 */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 회사 정보 */}
                  <div className="glass rounded-3xl p-6 sm:p-7">
                    <h4 className="mb-5 flex items-center gap-2.5 text-xl font-semibold text-ink-900">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                        <BuildingOfficeIcon className="h-5 w-5" />
                      </span>
                      회사 정보
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div className="space-y-3">
                        <InfoRow label="회사명" value={inquiry.companyInfo?.name} />
                        <InfoRow label="대표자" value={inquiry.companyInfo?.ceoName} />
                        <InfoRow label="업종" value={inquiry.companyInfo?.industry} />
                      </div>
                      <div className="space-y-3">
                        <InfoRow label="사업 형태" value={inquiry.companyInfo?.businessType} />
                        <InfoRow label="위치" value={inquiry.companyInfo?.location} />
                      </div>
                    </div>
                    {inquiry.companyInfo?.description && (
                      <div className="mt-5">
                        <p className="mb-2 font-medium text-ink-500">회사 소개:</p>
                        <p className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md p-4 text-ink-800 leading-relaxed shadow-glass-sm">
                          {inquiry.companyInfo.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 담당자 정보 */}
                  <div className="glass rounded-3xl p-6 sm:p-7">
                    <h4 className="mb-5 flex items-center gap-2.5 text-xl font-semibold text-ink-900">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                        <UserIcon className="h-5 w-5" />
                      </span>
                      채용 담당자 정보
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div className="space-y-3">
                        <InfoRow label="담당자명" value={inquiry.recruiterInfo?.name} />
                        <InfoRow label="직위/직책" value={inquiry.recruiterInfo?.position} />
                      </div>
                      <div className="space-y-3">
                        <InfoRow label="연락처" value={inquiry.recruiterInfo?.phone} />
                        <InfoRow label="이메일" value={inquiry.recruiterInfo?.email} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 오른쪽 컬럼 */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 채용 정보 */}
                  <div className="glass rounded-3xl p-6 sm:p-7">
                    <h4 className="mb-5 flex items-center gap-2.5 text-xl font-semibold text-ink-900">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                        <BriefcaseIcon className="h-5 w-5" />
                      </span>
                      채용 정보
                    </h4>
                    <div className="space-y-3">
                      <FactCard label="제안 직무" value={inquiry.proposedPosition} emphasis />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FactCard label="직무 카테고리" value={inquiry.jobCategory} />
                        <FactCard label="근무 형태" value={inquiry.workType} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FactCard label="제안 급여" value={inquiry.proposedSalary} emphasis />
                        <FactCard label="근무 시간" value={inquiry.workingHours} />
                      </div>
                    </div>
                  </div>

                  {/* 복리후생 */}
                  {inquiry.benefits && inquiry.benefits.length > 0 && (
                    <div className="glass rounded-3xl p-6 sm:p-7">
                      <h4 className="mb-5 flex items-center gap-2.5 text-xl font-semibold text-ink-900">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                          <GiftIcon className="h-5 w-5" />
                        </span>
                        복리후생
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {inquiry.benefits.map((benefit, index) => (
                          <Badge key={index} tone="azure" className="px-3.5 py-1.5 text-sm">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 채용 제안 메시지 - 전체 폭 */}
              <div className="glass rounded-3xl p-6 sm:p-7">
                <h4 className="mb-5 flex items-center gap-2.5 text-xl font-semibold text-ink-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-azure-50 text-azure-600">
                    <EnvelopeIcon className="h-5 w-5" />
                  </span>
                  채용 제안 메시지
                </h4>
                <div className="rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md p-6 shadow-glass-sm">
                  <p className="whitespace-pre-wrap leading-relaxed text-ink-800">{inquiry.message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 액션 바 */}
          <div className="shrink-0 border-t border-white/50 bg-white/40 backdrop-blur-md px-6 sm:px-10 lg:px-14 py-5">
            <div className="flex items-center justify-between gap-4">
              {/* 구직자용 액션 버튼 (onStatusUpdate가 있을 때만 표시) */}
              {onStatusUpdate && inquiry.status === 'sent' && (
                <div className="flex gap-3">
                  <GlassButton variant="primary" onClick={() => handleStatusUpdate('accepted')}>
                    제안 수락
                  </GlassButton>
                  <GlassButton
                    variant="outline"
                    onClick={() => handleStatusUpdate('rejected')}
                    className="!border-coral-400/60 !text-coral-600 hover:!bg-coral-100/60"
                  >
                    제안 거절
                  </GlassButton>
                </div>
              )}

              <div className="flex-1"></div>

              <GlassButton variant="secondary" onClick={onClose}>
                닫기
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
