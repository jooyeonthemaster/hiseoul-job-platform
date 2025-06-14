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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-0 max-w-2xl w-full mx-4 overflow-hidden relative">
              {/* 배경 그라데이션 */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700"></div>
              
              {/* 컨텐츠 */}
              <div className="relative z-10 p-8 pt-12">
                {/* 상단 아이콘과 환영 메시지 */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 relative"
                  >
                    <BuildingOfficeIcon className="w-12 h-12 text-blue-600" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                    >
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-bold text-gray-900 mb-3"
                  >
                    🎉 환영합니다!
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg text-gray-600 leading-relaxed"
                  >
                    <span className="font-semibold text-blue-600">HiSeoul Job Platform</span>에 기업 회원으로 가입해주셔서 감사합니다
                  </motion.p>
                </div>

                {/* 중요 안내 박스 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <InformationCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg mb-2">원활한 채용 매칭을 위해</h3>
                      <p className="text-blue-800 leading-relaxed mb-3">
                        <span className="font-semibold bg-blue-200 px-2 py-1 rounded">반드시 성의 있게</span> 기업 정보를 입력해주세요. 
                      </p>
                      <p className="text-blue-700 text-sm">
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
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-8"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-amber-900 text-lg">입력하실 정보</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">회사 기본 정보</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">사업 분야 및 규모</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">회사 소개 및 문화</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">복리후생 정보</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">근무 환경</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 text-sm">회사만의 매력</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 예상 시간 및 혜택 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="bg-gray-50 rounded-xl p-4 mb-8"
                >
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>⏱️ 예상 소요 시간:</span>
                      <span className="font-semibold text-gray-800">약 5-10분</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4" />
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
                    className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden"
                  >
                    {/* 버튼 배경 애니메이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      <BuildingOfficeIcon className="w-6 h-6" />
                      <span className="text-lg">기업정보 입력하기</span>
                      <ArrowLongRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                  
                  <p className="mt-4 text-xs text-gray-500">
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