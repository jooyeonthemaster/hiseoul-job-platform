'use client';

import { ReactNode } from 'react';
import { useFirebaseToGoogleSheets } from '@/hooks/useFirebaseToGoogleSheets';
import { useLoginTracking } from '@/hooks/useLoginTracking';
import { useInitialDataSync } from '@/hooks/useInitialDataSync';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Firestore 전체 컬렉션을 구글 시트로 미러링하는 동기화 훅들.
 * 보안 규칙상 모든 컬렉션 전체 읽기는 admin 역할만 가능하므로
 * (비관리자에게는 어차피 permission-denied로 동작 불가) admin일 때만 마운트한다.
 */
function AdminSheetsSync() {
  // Google Sheets 실시간 동기화 활성화
  useFirebaseToGoogleSheets();

  // 초기 데이터 동기화 (한 번만 실행됨)
  const { synced } = useInitialDataSync();

  if (!synced) {
    console.log('초기 데이터 동기화 진행 중...');
  }

  return null;
}

export default function GoogleSheetsProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';

  // 로그인 추적은 Firestore를 읽지 않고 시트 API로만 기록 → 모든 사용자 유지
  useLoginTracking();

  return (
    <>
      {isAdmin && <AdminSheetsSync />}
      {children}
    </>
  );
}
