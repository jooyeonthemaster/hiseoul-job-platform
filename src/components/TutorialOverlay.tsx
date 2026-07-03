'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  ArrowLongRightIcon,
  StarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function TutorialOverlay({ isVisible, onComplete }: TutorialOverlayProps) {
  const router = useRouter();

  const handleStartSetup = () => {
    onComplete();
    router.push('/employer-setup');
  };

  const infoItems = [
    '회사 기본 정보',
    '사업 분야 및 규모',
    '회사 소개 및 문화',
    '복리후생 정보',
    '근무 환경',
    '회사만의 매력',
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 블러 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink-900/30 backdrop-blur-sm z-40"
          />

          {/* 메인 환영 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
          >
            <div className="glass-strong rounded-4xl shadow-glass-lg p-0 max-w-lg sm:max-w-xl md:max-w-2xl w-full mx-1 sm:mx-4 overflow-hidden relative max-h-[98vh] overflow-y-auto">
              {/* 상단 azure 글래스 헤더 글로우 */}
              <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 md:h-36 bg-gradient-to-br from-azure-400 via-sky-cool-400 to-azure-600 opacity-90"></div>
              <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 md:h-36 bg-gradient-to-b from-white/0 to-white/20 pointer-events-none"></div>

              {/* 컨텐츠 */}
              <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 pt-8 sm:pt-10 md:pt-14">
                {/* 상단 아이콘과 환영 메시지 */}
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 glass-strong rounded-3xl shadow-glass flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 relative"
                  >
                    <BuildingOfficeIcon className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 text-azure-600" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 md:-top-2 md:-right-2 w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-gradient-to-br from-azure-400 to-azure-600 rounded-full flex items-center justify-center shadow-glow ring-2 ring-white/70"
                    >
                      <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="font-display font-bold tracking-tight text-2xl sm:text-3xl lg:text-4xl text-ink-900 mb-2 sm:mb-3"
                  >
                    🎉 환영합니다!
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-sm sm:text-base lg:text-lg text-ink-500 leading-relaxed"
                  >
                    <span className="font-semibold text-gradient-azure">면접심사 매칭 플랫폼</span>에 기업 회원으로 가입해주셔서 감사합니다
                  </motion.p>
                </div>

                {/* 중요 안내 박스 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="glass rounded-3xl p-4 sm:p-5 md:p-6 border border-azure-100 mb-4 sm:mb-5 md:mb-6"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-azure-50 rounded-2xl flex items-center justify-center ring-1 ring-azure-100">
                        <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-azure-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900 text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2">원활한 채용 매칭을 위해</h3>
                      <p className="text-ink-500 leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                        <Badge tone="azure" className="mr-1 align-middle">반드시 성의 있게</Badge> 기업 정보를 입력해주세요.
                      </p>
                      <p className="text-ink-400 text-xs sm:text-sm leading-relaxed">
                        상세하고 정확한 정보일수록 더 적합한 인재와 매칭될 확률이 높아집니다.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* 입력할 정보 미리보기 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="glass rounded-3xl p-4 sm:p-5 md:p-6 border border-white/60 mb-4 sm:mb-6 md:mb-8"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-azure-50 rounded-xl flex items-center justify-center ring-1 ring-azure-100">
                      <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-azure-600" />
                    </div>
                    <h3 className="font-semibold text-ink-900 text-base sm:text-lg md:text-xl">입력하실 정보</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 sm:gap-y-3">
                    {infoItems.map((item) => (
                      <div key={item} className="flex items-center gap-2 sm:gap-2.5">
                        <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5 text-azure-500 flex-shrink-0" />
                        <span className="text-ink-700 text-sm sm:text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 예상 시간 및 혜택 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="glass-faint rounded-2xl p-3.5 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8 border border-white/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-ink-500 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <span>⏱️ 예상 소요 시간:</span>
                      <span className="font-semibold text-ink-700">약 5-10분</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4 md:w-5 md:h-5 text-azure-600" />
                      <span className="font-semibold text-azure-700">매칭률 85% 향상</span>
                    </div>
                  </div>
                </motion.div>

                {/* 액션 버튼 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-center"
                >
                  <GlassButton
                    onClick={handleStartSetup}
                    variant="primary"
                    size="lg"
                    className="group w-full"
                  >
                    <BuildingOfficeIcon className="w-5 h-5 md:w-6 md:h-6" />
                    <span>기업정보 입력하기</span>
                    <ArrowLongRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </GlassButton>

                  <p className="mt-3 sm:mt-4 text-xs text-ink-400">
                    * 언제든지 마이페이지에서 정보를 수정할 수 있습니다
                  </p>
                </motion.div>
              </div>

              {/* 장식적 요소 */}
              <div className="absolute top-4 right-4 opacity-30 pointer-events-none">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-2 border-white/60 rounded-full"
                />
              </div>

              <div className="absolute bottom-4 left-4 opacity-20 pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 bg-azure-300 rounded-full blur-[1px]"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}