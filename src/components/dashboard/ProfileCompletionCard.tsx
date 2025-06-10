'use client';

import { motion } from 'framer-motion';
import { TrophyIcon, PencilIcon } from '@heroicons/react/24/outline';

interface ProfileCompletionCardProps {
  completionPercentage: number;
  onEditClick: () => void;
  missingFields?: string[];
}

export default function ProfileCompletionCard({ 
  completionPercentage, 
  onEditClick,
  missingFields = []
}: ProfileCompletionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <TrophyIcon className="w-6 h-6 mr-2 text-yellow-500" />
          프로필 완성도
        </h2>
        <span className="text-2xl font-bold text-indigo-600">{completionPercentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            {completionPercentage < 100 ? '프로필을 완성하여 더 많은 기회를 얻으세요!' : '프로필이 완성되었습니다! 🎉'}
          </p>
          {missingFields.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              미완성 항목: {missingFields.join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={onEditClick}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <PencilIcon className="w-4 h-4" />
          <span>편집</span>
        </button>
      </div>
    </motion.div>
  );
}