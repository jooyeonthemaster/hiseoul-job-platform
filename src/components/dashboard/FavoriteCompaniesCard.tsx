'use client';

import { motion } from 'framer-motion';
import { HeartIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
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
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <HeartIcon className="w-6 h-6 mr-2 text-red-500" />
          관심 기업 ({companies.length})
        </h2>
        <Link 
          href="/companies"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          모두 보기
          <ArrowRightIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HeartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>아직 관심 기업이 없습니다.</p>
          <Link href="/companies" className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block">
            기업 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.slice(0, 3).map((company, index) => (
            <motion.div
              key={company.companyId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                {company.company?.logo ? (
                  <img 
                    src={company.company.logo} 
                    alt={company.company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-semibold">
                      {company.company?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {company.company?.name || '회사명 없음'}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    {company.company?.industry && (
                      <span>{company.company.industry}</span>
                    )}
                    {company.company?.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                        <span>{company.company.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}