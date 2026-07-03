'use client';
import {
  CheckBadgeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Portfolio } from '../types/portfolio.types';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

interface PortfolioProfileProps {
  portfolio: Portfolio;
}

export default function PortfolioProfile({ portfolio }: PortfolioProfileProps) {
  const { userData } = useAuth();
  const hasAdminAccess = userData?.role === 'admin' || userData?.isAdmin === true;

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
              {/* 관리자와 구직자에게만 이메일과 전화번호 표시 (기업 회원에게는 완전 숨김) */}
              {(hasAdminAccess || userData?.role === 'jobseeker') && (
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

        {/* 프로젝트 수 (관리자 중개형: 상대 선택을 시사하는 관심 인재 버튼은 표시하지 않음) */}
        <div className="flex flex-col items-end space-y-4">
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

      {/* 현재 수강 과정 + 내국인/외국인 과정 구분 */}
      {(portfolio.currentCourse || portfolio.courseType) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">수행 중인 과정</span>
            </div>
            {portfolio.courseType && (
              <Badge tone={portfolio.courseType === 'foreign' ? 'coral' : 'azure'}>
                {portfolio.courseType === 'foreign' ? '외국인' : '내국인'}
              </Badge>
            )}
          </div>
          {portfolio.currentCourse && (
            <p className="text-blue-700 mt-1">{portfolio.currentCourse}</p>
          )}
        </div>
      )}
    </div>
  );
}
