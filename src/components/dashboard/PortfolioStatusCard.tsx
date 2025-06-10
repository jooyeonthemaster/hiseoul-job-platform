'use client';

import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface PortfolioStatusCardProps {
  isRegistered: boolean;
  views?: number;
  userId?: string;
  onRegisterClick?: () => void;
}

export default function PortfolioStatusCard({ 
  isRegistered, 
  views = 0,
  userId,
  onRegisterClick 
}: PortfolioStatusCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
        <DocumentTextIcon className="w-6 h-6 mr-2 text-purple-600" />
        포트폴리오 상태
      </h2>
      {isRegistered ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">상태</span>
            <span className="text-sm font-semibold text-green-600">등록됨</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <EyeIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">조회수</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{views}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-1">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">관심도</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {views > 50 ? '높음' : views > 20 ? '보통' : '낮음'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push(userId ? `/portfolios/${userId}` : '/portfolios')}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            포트폴리오 보기
          </button>
        </div>
      ) : (
        <div className="text-center py-6">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 mb-4">
            포트폴리오를 등록하여 기업에게 나를 어필하세요!
          </p>
          <button
            onClick={onRegisterClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            포트폴리오 등록하기
          </button>
        </div>
      )}
    </motion.div>
  );
}