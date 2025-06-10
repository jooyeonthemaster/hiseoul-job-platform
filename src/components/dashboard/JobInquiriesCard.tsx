'use client';

import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

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
    const statusStyles = {
      sent: 'bg-blue-100 text-blue-700',
      read: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };

    const statusText = {
      sent: '새 제안',
      read: '읽음',
      accepted: '수락함',
      rejected: '거절함'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
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
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <EnvelopeIcon className="w-6 h-6 mr-2 text-indigo-600" />
          받은 채용 제안 ({inquiries.length})
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            새로고침
          </button>
        )}
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>아직 받은 채용 제안이 없습니다.</p>
          <p className="text-sm mt-2">포트폴리오를 등록하면 기업의 관심을 받을 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.slice(0, 3).map((inquiry, index) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {inquiry.companyInfo.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {inquiry.companyInfo.industry && `${inquiry.companyInfo.industry} • `}
                    {inquiry.companyInfo.location}
                  </p>
                </div>
                {getStatusBadge(inquiry.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <BriefcaseIcon className="w-4 h-4 mr-1" />
                  {inquiry.proposedPosition}
                </div>
                {inquiry.proposedSalary && (
                  <div className="flex items-center text-gray-600">
                    <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                    {inquiry.proposedSalary}
                  </div>
                )}
                <div className="flex items-center text-gray-600 col-span-2">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {inquiry.sentAt?.toDate?.()?.toLocaleDateString('ko-KR') || '날짜 정보 없음'}
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {inquiry.message}
              </p>

              <div className="flex justify-end">
                <button 
                  onClick={() => onDetailClick?.(inquiry)}
                  className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  상세보기
                </button>
              </div>
            </motion.div>
          ))}
          
          {inquiries.length > 3 && (
            <div className="text-center pt-2">
              <a href="/inquiries" className="text-sm text-indigo-600 hover:text-indigo-700">
                모든 제안 보기 →
              </a>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}