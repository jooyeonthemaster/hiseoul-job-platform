'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  XMarkIcon,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';

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
  const reduce = useReducedMotion();

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
        iconColor: 'text-azure-600',
        iconBg: 'bg-azure-100/80',
        iconRing: 'ring-azure-200/70',
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
        iconColor: 'text-honey-600',
        iconBg: 'bg-honey-100/80',
        iconRing: 'ring-honey-400/40',
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
          iconColor: 'text-honey-600',
          iconBg: 'bg-honey-100/80',
          iconRing: 'ring-honey-400/40',
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
          iconColor: 'text-coral-600',
          iconBg: 'bg-coral-100/80',
          iconRing: 'ring-coral-400/40',
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
      iconColor: 'text-ink-500',
      iconBg: 'bg-ink-100/80',
      iconRing: 'ring-ink-200/70',
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
    <AnimatePresence>
      <motion.div
        key="portfolio-access-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg mx-4 glass-strong rounded-4xl shadow-glass-lg overflow-hidden"
        >
          {/* 상단 azure 글로우 */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-azure-400/20 blur-3xl" />

          {/* Header */}
          <div className="relative flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-white/50">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 ${content.iconBg} ring-1 ${content.iconRing} rounded-2xl flex items-center justify-center shadow-glass-sm backdrop-blur-md`}
              >
                <IconComponent className={`w-6 h-6 ${content.iconColor}`} />
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900">
                {content.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="닫기"
              className="shrink-0 w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-ink-400 hover:text-ink-700 hover:bg-white/90 transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="relative px-7 py-7">
            <p className="text-ink-500 leading-relaxed text-base mb-5">
              {content.description}
            </p>

            <div className="rounded-3xl bg-white/45 backdrop-blur-md border border-white/60 shadow-glass-sm p-5 mb-7">
              <ul className="space-y-3">
                {content.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-ink-600 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-azure-500 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <GlassButton
              onClick={handleClose}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {content.buttonText}
            </GlassButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
