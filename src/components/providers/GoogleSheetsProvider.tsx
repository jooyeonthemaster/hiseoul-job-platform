'use client';

import { ReactNode } from 'react';
import { useFirebaseToGoogleSheets } from '@/hooks/useFirebaseToGoogleSheets';
import { useLoginTracking } from '@/hooks/useLoginTracking';
import { useInitialDataSync } from '@/hooks/useInitialDataSync';

export default function GoogleSheetsProvider({ children }: { children: ReactNode }) {
  // Google Sheets 동기화 활성화
  useFirebaseToGoogleSheets();
  
  // 로그인 추적 활성화
  useLoginTracking();
  
  // 초기 데이터 동기화 (한 번만 실행됨)
  const { synced } = useInitialDataSync();
  
  if (!synced) {
    console.log('초기 데이터 동기화 진행 중...');
  }

  return <>{children}</>;
}
