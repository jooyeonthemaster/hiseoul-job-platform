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

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 배경 블러 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
          />

          {/* 메인 환영 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center z-50 p-1 sm:p-4"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-0 max-w-lg sm:max-w-xl md:max-w-2xl w-full mx-1 sm:mx-4 overflow-hidden relative max-h-[98vh] overflow-y-auto">
              {/* 배경 그라데이션 */}
              <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 md:h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"></div>
              
              {/* 컨텐츠 */}
              <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 pt-6 sm:pt-8 md:pt-12">
                {/* 상단 아이콘과 환영 메시지 */}
                <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative"
                  >
                    <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-600" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 md:-top-2 md:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    >
                      <SparklesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3"
                  >
                    🎉 환영합니다!
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed"
                  >
                    <span className="font-semibold text-blue-600">테크벤처 잡 매칭</span>에 기업 회원으로 가입해주셔서 감사합니다
                  </motion.p>
                </div>

                {/* 중요 안내 박스 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-blue-200 mb-3 sm:mb-4 md:mb-5 lg:mb-6"
                >
                  <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center">
                        <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">원활한 채용 매칭을 위해</h3>
                      <p className="text-blue-800 leading-relaxed mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                        <span className="font-semibold bg-blue-200 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs">반드시 성의 있게</span> 기업 정보를 입력해주세요. 
                      </p>
                      <p className="text-blue-700 text-xs sm:text-sm">
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
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-amber-200 mb-3 sm:mb-4 md:mb-6 lg:mb-8"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-4">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-amber-100 rounded sm:rounded-md md:rounded-lg flex items-center justify-center">
                      <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-amber-900 text-sm sm:text-base md:text-lg">입력하실 정보</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">회사 기본 정보</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">사업 분야 및 규모</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">회사 소개 및 문화</span>
                      </div>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">복리후생 정보</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">근무 환경</span>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-amber-600" />
                        <span className="text-amber-800 text-xs sm:text-sm">회사만의 매력</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 예상 시간 및 혜택 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="bg-gray-50 rounded-md sm:rounded-lg md:rounded-xl p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6 lg:mb-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-0">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <span>⏱️ 예상 소요 시간:</span>
                      <span className="font-semibold text-gray-800">약 5-10분</span>
                    </div>
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <UserGroupIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      <span className="font-semibold text-blue-600">매칭률 85% 향상</span>
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
                  <button
                    onClick={handleStartSetup}
                    className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* 버튼 배경 애니메이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center justify-center space-x-1.5 sm:space-x-2 md:space-x-3">
                      <BuildingOfficeIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      <span className="text-sm sm:text-base md:text-lg">기업정보 입력하기</span>
                      <ArrowLongRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                  
                  <p className="mt-2 sm:mt-3 md:mt-4 text-xs text-gray-500">
                    * 언제든지 마이페이지에서 정보를 수정할 수 있습니다
                  </p>
                </motion.div>
              </div>

              {/* 장식적 요소 */}
              <div className="absolute top-4 right-4 opacity-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-2 border-white rounded-full"
                />
              </div>
              
              <div className="absolute bottom-4 left-4 opacity-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 bg-blue-300 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 