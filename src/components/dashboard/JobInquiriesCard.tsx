'use client';

import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { ScrollRevealStagger, ScrollRevealItem } from '@/components/ui/ScrollReveal';

interface JobInquiry {
  id: string;
  companyInfo: {
    name: string;
    industry?: string;
    location?: string;
  };
  proposedPosition: string;
  proposedSalary?: string;
  message: string;
  status: 'sent' | 'read' | 'accepted' | 'rejected';
  sentAt?: any;
}

interface JobInquiriesCardProps {
  inquiries: JobInquiry[];
  loading?: boolean;
  onRefresh?: () => void;
  onDetailClick?: (inquiry: JobInquiry) => void;
}

export default function JobInquiriesCard({
  inquiries,
  loading = false,
  onRefresh,
  onDetailClick
}: JobInquiriesCardProps) {  const getStatusBadge = (status: string) => {
    const statusTone = {
      sent: 'azure',
      read: 'honey',
      accepted: 'mint',
      rejected: 'coral'
    } as const;

    const statusText = {
      sent: '새 제안',
      read: '읽음',
      accepted: '수락함',
      rejected: '거절함'
    };

    return (
      <Badge tone={statusTone[status as keyof typeof statusTone] || 'neutral'}>
        {statusText[status as keyof typeof statusText] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-azure-100/70 rounded-full w-44 mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-white/40 rounded-3xl border border-white/50"></div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-7">
          <h2 className="font-display font-semibold text-xl md:text-2xl tracking-tight text-ink-900 flex items-center">
            <span className="inline-flex items-center justify-center w-10 h-10 mr-3 rounded-2xl bg-gradient-to-br from-azure-500 to-azure-600 text-white shadow-glow shrink-0">
              <EnvelopeIcon className="w-5 h-5" />
            </span>
            받은 채용 제안
            <span className="ml-2 text-azure-600 font-display">({inquiries.length})</span>
          </h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm font-medium text-azure-600 hover:text-azure-700 transition-colors duration-300 shrink-0"
            >
              새로고침
            </button>
          )}
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <span className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-3xl bg-azure-50 border border-azure-100 text-azure-400">
              <EnvelopeIcon className="w-8 h-8" />
            </span>
            <p className="text-ink-700 font-medium">아직 받은 채용 제안이 없습니다.</p>
            <p className="text-sm mt-2 text-ink-500">포트폴리오를 등록하면 기업의 관심을 받을 수 있습니다.</p>
          </div>
        ) : (
          <ScrollRevealStagger className="space-y-4">
            {inquiries.slice(0, 3).map((inquiry) => (
              <ScrollRevealItem key={inquiry.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="glass-faint rounded-3xl border border-white/60 p-5 transition-colors duration-300 hover:border-azure-200 hover:bg-white/55"
                >
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-ink-900 truncate">
                        {inquiry.companyInfo.name}
                      </h4>
                      <p className="text-sm text-ink-500 mt-0.5">
                        {inquiry.companyInfo.industry && `${inquiry.companyInfo.industry} • `}
                        {inquiry.companyInfo.location}
                      </p>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center text-ink-600">
                      <BriefcaseIcon className="w-4 h-4 mr-1.5 text-azure-500 shrink-0" />
                      <span className="truncate">{inquiry.proposedPosition}</span>
                    </div>
                    {inquiry.proposedSalary && (
                      <div className="flex items-center text-ink-600">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-azure-500 shrink-0" />
                        <span className="truncate">{inquiry.proposedSalary}</span>
                      </div>
                    )}
                    <div className="flex items-center text-ink-600 col-span-2">
                      <CalendarIcon className="w-4 h-4 mr-1.5 text-azure-500 shrink-0" />
                      {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '날짜 정보 없음'}
                    </div>
                  </div>

                  <p className="text-sm text-ink-700 mb-4 line-clamp-2 leading-relaxed">
                    {inquiry.message}
                  </p>

                  <div className="flex justify-end">
                    <GlassButton
                      size="sm"
                      onClick={() => onDetailClick?.(inquiry)}
                    >
                      상세보기
                    </GlassButton>
                  </div>
                </motion.div>
              </ScrollRevealItem>
            ))}

            {inquiries.length > 3 && (
              <div className="text-center pt-2">
                <a
                  href="/inquiries"
                  className="inline-flex items-center gap-1 text-sm font-medium text-azure-600 hover:text-azure-700 transition-colors duration-300"
                >
                  모든 제안 보기 →
                </a>
              </div>
            )}
          </ScrollRevealStagger>
        )}
      </GlassCard>
    </motion.div>
  );
}
