'use client';

import { motion } from 'framer-motion';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface RecommendedCompany {
  id: string;
  company?: {
    name: string;
    industry?: string;
    location?: string;
    size?: string;
    description?: string;
  };
}

interface RecommendedCompaniesCardProps {
  companies: RecommendedCompany[];
  loading?: boolean;
}

export default function RecommendedCompaniesCard({
  companies,
  loading = false
}: RecommendedCompaniesCardProps) {  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative glass-card h-full p-5 md:p-6"
      >
        <div className="animate-pulse">
          <div className="h-7 rounded-2xl bg-azure-100/70 w-44 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-3xl bg-azure-50/80" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative glass-card h-full p-5 md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure-400 to-azure-600 text-white shadow-glow">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-azure-600">
              For You
            </span>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">
              추천 기업
            </h2>
          </div>
        </div>        <Link
          href="/companies"
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-sm font-semibold text-azure-700 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:bg-white/90 hover:text-azure-600 hover:shadow-glass"
        >
          더 많은 추천 보기
          <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="py-9 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-azure-50 text-azure-300 shadow-glass-sm">
            <BuildingOfficeIcon className="h-8 w-8" />
          </span>
          <p className="text-ink-700 font-medium">추천할 기업이 없습니다.</p>
          <p className="text-sm mt-2 text-ink-400 leading-relaxed">프로필을 완성하면 더 정확한 추천을 받을 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative cursor-pointer rounded-2xl border border-white/60 bg-white/55 p-4 shadow-glass-sm backdrop-blur-md transition-all duration-300 hover:bg-white/80 hover:shadow-glass"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base md:text-lg text-ink-900 transition-colors group-hover:text-azure-700 truncate">
                    {company.company?.name || '회사명 없음'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {company.company?.industry && (
                      <Badge tone="azure">{company.company.industry}</Badge>
                    )}
                    {company.company?.size && (
                      <Badge tone="neutral">{company.company.size}</Badge>
                    )}
                  </div>
                  {company.company?.description && (
                    <p className="text-sm text-ink-500 mt-3 leading-relaxed line-clamp-2">
                      {company.company.description}
                    </p>
                  )}
                </div>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-azure-50 text-azure-400 transition-all duration-300 group-hover:bg-azure-500 group-hover:text-white group-hover:shadow-glow">
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
