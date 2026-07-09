'use client';
import {
  CheckBadgeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { Portfolio } from '../types/portfolio.types';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { splitSpecialities, getPrimarySpeciality } from '@/lib/programs';

interface PortfolioProfileProps {
  portfolio: Portfolio;
  canViewContact?: boolean;
}

export default function PortfolioProfile({ portfolio, canViewContact = false }: PortfolioProfileProps) {
  const { userData } = useAuth();
  const specialities = splitSpecialities(portfolio.speciality);

  return (
    <div className="glass-card p-8">
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
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-azure-400 to-azure-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {portfolio.avatar}
              </div>
            )}
            {portfolio.verified && (
              <div className="absolute -bottom-2 -right-2 bg-azure-600 rounded-full p-2">
                <CheckBadgeIcon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="font-display text-3xl font-bold text-ink-900">{portfolio.name}</h1>
              {portfolio.verified && (
                <CheckBadgeIcon className="h-6 w-6 text-azure-600" />
              )}
            </div>
            {specialities.length > 1 ? (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {specialities.map((speciality) => (
                  <Badge key={speciality} tone="azure">{speciality}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-xl text-azure-600 font-semibold mb-2">
                {getPrimarySpeciality(portfolio.speciality)} 전문가
              </p>
            )}
            {/* 경력 표기: '경력'처럼 의미 없는 단독 라벨은 숨기고, 실제 연차 등 내용이 있을 때만 노출 */}
            {(() => {
              const raw = portfolio.experience ? String(portfolio.experience).trim() : '';
              if (!raw || raw === '경력' || raw === '경력사항') return null;
              const label = raw === '신입' || raw.endsWith('경력') ? raw : `${raw} 경력`;
              return <p className="text-ink-500 mb-3">{label}</p>;
            })()}
            
            {/* 연락처 정보 — 집주소·이메일·전화는 모두 개인정보다.
                관리자·본인(구직자), 또는 관리자가 연락처 열람을 허용한 기업에게만 노출한다. */}
            <div className="flex flex-wrap gap-4 text-sm text-ink-500">
              {canViewContact ? (
                <>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{portfolio.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{portfolio.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{portfolio.phone}</span>
                  </div>
                </>
              ) : userData?.role === 'employer' ? (
                <div className="flex items-center space-x-1 rounded-full border border-ink-100 bg-white/70 px-3 py-1 text-ink-500">
                  <LockClosedIcon className="h-4 w-4" />
                  <span>관리자 승인 전 연락처(주소·이메일·전화) 비공개</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 프로젝트 수 — 0건이면 표시하지 않는다(의미 없는 숫자 노출 방지).
            관리자 중개형: 상대 선택을 시사하는 관심 인재 버튼은 표시하지 않음 */}
        {portfolio.projects > 0 && (
          <div className="flex flex-col items-end space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-azure-600">{portfolio.projects}</div>
              <div className="text-sm text-ink-500">완료 프로젝트</div>
            </div>
          </div>
        )}
      </div>

      {/* 소개 */}
      <div className="mt-6 pt-6 border-t border-ink-100">
        <p className="text-ink-700 leading-relaxed">{portfolio.introduction}</p>
      </div>

      {/* 현재 수강 과정 + 내국인/외국인 과정 구분 */}
      {(portfolio.currentCourse || portfolio.courseType) && (
        <div className="mt-4 p-4 bg-azure-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-azure-600 rounded-full"></div>
              <span className="text-sm font-medium text-azure-800">수행 중인 과정</span>
            </div>
            {portfolio.courseType && (
              <Badge tone={portfolio.courseType === 'foreign' ? 'coral' : 'azure'}>
                {portfolio.courseType === 'foreign' ? '외국인' : '내국인'}
              </Badge>
            )}
          </div>
          {portfolio.currentCourse && (
            <p className="text-azure-700 mt-1">{portfolio.currentCourse}</p>
          )}
        </div>
      )}
    </div>
  );
}
