'use client';

import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  BuildingOfficeIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
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
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <SparklesIcon className="w-6 h-6 mr-2 text-yellow-500" />
          추천 기업
        </h2>        <Link 
          href="/companies"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          더 많은 추천 보기
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>추천할 기업이 없습니다.</p>
          <p className="text-sm mt-2">프로필을 완성하면 더 정확한 추천을 받을 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {company.company?.name || '회사명 없음'}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {company.company?.industry && <span>{company.company.industry}</span>}
                    {company.company?.size && <span> • {company.company.size}</span>}
                  </div>
                  {company.company?.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {company.company.description}
                    </p>
                  )}
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors ml-4 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}