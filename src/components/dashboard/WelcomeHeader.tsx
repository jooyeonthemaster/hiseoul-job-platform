'use client';

import { motion } from 'framer-motion';

interface DashboardStats {
  totalFavorites: number;
  totalInquiries: number;
  profileCompletion: number;
}

interface WelcomeHeaderProps {
  userName: string;
  stats: DashboardStats;
}

export default function WelcomeHeader({ userName, stats }: WelcomeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              안녕하세요, {userName}님! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              오늘도 새로운 기회를 찾아보세요
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
              <div className="text-sm text-indigo-200">관심 기업</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalInquiries}</div>
              <div className="text-sm text-indigo-200">채용 제안</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.profileCompletion}%</div>
              <div className="text-sm text-indigo-200">프로필 완성도</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}