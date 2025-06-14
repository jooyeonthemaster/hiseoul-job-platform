'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface PortfolioAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  approvalStatus?: string;
}

export default function PortfolioAccessModal({ 
  isOpen, 
  onClose, 
  userRole,
  approvalStatus 
}: PortfolioAccessModalProps) {
  const router = useRouter();

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    router.push('/auth');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const getModalContent = () => {
    if (!userRole) {
      // 로그인하지 않은 사용자
      return {
        icon: ShieldExclamationIcon,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
        title: '로그인이 필요합니다',
        description: '포트폴리오를 열람하시려면 먼저 로그인해주세요.',
        details: [
          '승인된 기업 회원만 구직자 포트폴리오를 열람할 수 있습니다',
          '기업 회원가입 후 승인 절차를 거쳐주세요'
        ],
        buttonText: '로그인하기'
      };
    } else if (userRole === 'jobseeker') {
      // 구직자
      return {
        icon: BuildingOfficeIcon,
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-100',
        title: '기업 회원 전용 서비스',
        description: '포트폴리오 열람은 승인된 기업 회원만 이용할 수 있습니다.',
        details: [
          '현재 구직자 계정으로 로그인되어 있습니다',
          '기업 회원으로 가입하시면 포트폴리오를 열람하실 수 있습니다'
        ],
        buttonText: '기업 회원가입하기'
      };
    } else if (userRole === 'employer') {
      if (approvalStatus === 'pending') {
        // 승인 대기 중인 기업
        return {
          icon: CheckCircleIcon,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          title: '승인 대기 중',
          description: '기업 회원가입 승인이 진행 중입니다.',
          details: [
            '관리자가 귀하의 기업 정보를 검토하고 있습니다',
            '승인이 완료되면 이메일로 안내드리겠습니다',
            '승인 후 모든 구직자 포트폴리오를 열람하실 수 있습니다'
          ],
          buttonText: '확인'
        };
      } else if (approvalStatus === 'rejected') {
        // 승인 거절된 기업
        return {
          icon: XMarkIcon,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          title: '가입 승인 거절',
          description: '기업 회원가입이 거절되었습니다.',
          details: [
            '제출하신 기업 정보가 승인 기준에 부합하지 않습니다',
            '자세한 사항은 고객센터로 문의해주세요'
          ],
          buttonText: '고객센터 문의'
        };
      }
    }

    // 기타 경우
    return {
      icon: ShieldExclamationIcon,
      iconColor: 'text-gray-600',
      iconBg: 'bg-gray-100',
      title: '접근 권한 없음',
      description: '포트폴리오에 접근할 권한이 없습니다.',
      details: [
        '승인된 기업 회원만 구직자 포트폴리오를 열람할 수 있습니다'
      ],
      buttonText: '확인'
    };
  };

  const content = getModalContent();
  const IconComponent = content.icon;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${content.iconBg} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${content.iconColor}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {content.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            {content.description}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <ul className="space-y-2">
              {content.details.map((detail, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {content.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
} 