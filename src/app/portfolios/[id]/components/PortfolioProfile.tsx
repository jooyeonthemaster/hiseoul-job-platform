'use client';
import Link from 'next/link';
import { 
  CheckBadgeIcon, 
  BriefcaseIcon, 
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Portfolio } from '../types/portfolio.types';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioProfileProps {
  portfolio: Portfolio;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onFavoriteToggle: () => void;
}

export default function PortfolioProfile({ 
  portfolio, 
  isFavorite, 
  favoriteLoading, 
  onFavoriteToggle 
}: PortfolioProfileProps) {
  const { userData } = useAuth();

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
          {/* 프로필 이미지 또는 아바타 */}
          <div className="relative">
            {portfolio.profileImage ? (
              <img
                src={portfolio.profileImage}
                alt={portfolio.name}
                className="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {portfolio.avatar}
              </div>
            )}
            {portfolio.verified && (
              <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
                <CheckBadgeIcon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
              {portfolio.verified && (
                <CheckBadgeIcon className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <p className="text-xl text-blue-600 font-semibold mb-2">{portfolio.speciality} 전문가</p>
            <p className="text-gray-600 mb-3">{portfolio.experience} 경력</p>
            
            {/* 연락처 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{portfolio.location}</span>
              </div>
              {/* 기업 회원이 아닐 때만 이메일과 전화번호 표시 */}
              {userData?.role !== 'employer' && (
                <>
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{portfolio.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{portfolio.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 관심 인재 버튼 */}
        <div className="flex flex-col items-end space-y-4">
          <button
            onClick={onFavoriteToggle}
            disabled={favoriteLoading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {favoriteLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : isFavorite ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{isFavorite ? '관심 인재 해제' : '관심 인재 등록'}</span>
          </button>

          {/* 프로젝트 수 */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{portfolio.projects}</div>
            <div className="text-sm text-gray-600">완료 프로젝트</div>
          </div>
        </div>
      </div>

      {/* 소개 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-gray-700 leading-relaxed">{portfolio.introduction}</p>
      </div>

      {/* 현재 수강 과정 */}
      {portfolio.currentCourse && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">현재 수강 중</span>
          </div>
          <p className="text-blue-700 mt-1">{portfolio.currentCourse}</p>
        </div>
      )}
    </div>
  );
}