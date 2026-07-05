'use client';

import { motion } from 'framer-motion';
import { HeartIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';

interface Company {
  companyId: string;
  company?: {
    name: string;
    industry?: string;
    location?: string;
    logo?: string;
  };
}

interface FavoriteCompaniesCardProps {
  companies: Company[];
  loading?: boolean;
}

export default function FavoriteCompaniesCard({ companies, loading = false }: FavoriteCompaniesCardProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-full"
      >
        <GlassCard className="h-full p-5 md:p-6">
          <div className="animate-pulse">
            <div className="h-7 w-40 rounded-full bg-azure-100/70 mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-3xl bg-azure-50/70"></div>
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
      transition={{ delay: 0.2 }}
      className="h-full"
    >
      <GlassCard className="flex h-full flex-col p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-ink-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-100 text-coral-500 shadow-glass-sm">
              <HeartIcon className="w-5 h-5" />
            </span>
            관심 기업
            <Badge tone="azure">{companies.length}</Badge>
          </h2>
          <Link
            href="/companies"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-azure-600 hover:text-azure-700 transition-colors"
          >
            모두 보기
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {companies.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-9 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-azure-100 bg-azure-50 text-azure-300 shadow-glass-sm">
              <HeartIcon className="h-7 w-7" />
            </div>
            <p className="text-ink-500 leading-relaxed">아직 관심 기업이 없습니다.</p>
            <div className="mt-5 flex justify-center">
              <GlassButton variant="outline" size="sm" href="/companies">
                기업 둘러보기
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-3">
            {companies.slice(0, 3).map((company, index) => (
              <motion.div
                key={company.companyId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
              <Link
                href={`/companies/${company.companyId}`}
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-glass-sm transition-all duration-300 hover:bg-white/70 hover:shadow-glass"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {company.company?.logo ? (
                    <img
                      src={company.company.logo}
                      alt={company.company.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/70 shadow-glass-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center shadow-glass-sm shrink-0">
                      <span className="text-white text-lg font-display font-bold">
                        {company.company?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-900 truncate">
                      {company.company?.name || '회사명 없음'}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-ink-500 mt-0.5">
                      {company.company?.industry && (
                        <span className="truncate">{company.company.industry}</span>
                      )}
                      {company.company?.location && (
                        <div className="flex items-center gap-1 shrink-0">
                          <MapPinIcon className="w-3.5 h-3.5 text-azure-500" />
                          <span>{company.company.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-ink-400 shrink-0 transition-all duration-300 group-hover:text-azure-600 group-hover:translate-x-0.5" />
              </Link>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
