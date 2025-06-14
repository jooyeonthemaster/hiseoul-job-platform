'use client';

import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface AccessDeniedProps {
  reason?: 'pending' | 'rejected' | 'unauthorized';
  rejectedReason?: string;
}

export default function PortfolioAccessDenied({ reason = 'unauthorized', rejectedReason }: AccessDeniedProps) {
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <LockClosedIcon className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {reason === 'pending' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">승인 대기 중</h2>
            <p className="text-gray-600 mb-8">
              귀하의 기업 회원가입이 승인 대기 중입니다. 
              관리자의 승인이 완료되면 구직자 포트폴리오를 열람하실 수 있습니다.
            </p>
          </>
        ) : reason === 'rejected' ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 불가</h2>
            <p className="text-gray-600 mb-4">
              귀하의 기업 회원가입이 거절되었습니다.
            </p>
            {rejectedReason && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  <span className="font-medium">거절 사유:</span> {rejectedReason}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">포트폴리오 열람 권한 없음</h2>
            <p className="text-gray-600 mb-8">
              이 포트폴리오를 열람하려면 승인된 기업 회원이어야 합니다.
            </p>
          </>
        )}

        <div className="space-y-3">
          {userData?.role === 'employer' ? (
            <Link
              href="/employer-dashboard"
              className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              대시보드로 돌아가기
            </Link>
          ) : (
            <>
              <Link
                href="/portfolios"
                className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                포트폴리오 목록으로
              </Link>
              {!userData && (
                <Link
                  href="/auth"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  로그인
                </Link>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}