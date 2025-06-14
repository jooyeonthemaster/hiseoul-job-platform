// Firebase 이벤트를 Google Sheets로 동기화하는 훅
import { useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GoogleSheetsService } from '@/lib/googleSheets';
import { useAuth } from '@/contexts/AuthContext';

export function useFirebaseToGoogleSheets() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 마지막 동기화 시간 저장 (로컬 스토리지 사용)
    const getLastSyncTime = (collection: string) => {
      const stored = localStorage.getItem(`lastSync_${collection}`);
      return stored ? new Date(stored) : new Date(0);
    };

    const updateLastSyncTime = (collection: string) => {
      localStorage.setItem(`lastSync_${collection}`, new Date().toISOString());
    };

    // 구직자 컬렉션 리스너
    const unsubscribeJobSeekers = onSnapshot(
      query(
        collection(db, 'jobSeekers'),
        where('createdAt', '>', getLastSyncTime('jobSeekers')),
        orderBy('createdAt', 'desc')
      ),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const data = change.doc.data();
            await GoogleSheetsService.addJobSeeker({
              uid: change.doc.id,
              ...data,
            });
          }
        }
        updateLastSyncTime('jobSeekers');
      }
    );

    // 기업회원 컬렉션 리스너
    const unsubscribeEmployers = onSnapshot(
      query(
        collection(db, 'employers'),
        where('createdAt', '>', getLastSyncTime('employers')),
        orderBy('createdAt', 'desc')
      ),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const data = change.doc.data();
            await GoogleSheetsService.addEmployer({
              uid: change.doc.id,
              ...data,
            });
            
            // 승인 요청도 자동으로 추가
            if (data.approvalStatus === 'pending') {
              await GoogleSheetsService.addApprovalRequest({
                ...data,
                uid: change.doc.id,
              });
            }
          }
        }
        updateLastSyncTime('employers');
      }
    );

    // 포트폴리오 컬렉션 리스너
    const unsubscribePortfolios = onSnapshot(
      query(
        collection(db, 'portfolios'),
        where('createdAt', '>', getLastSyncTime('portfolios')),
        orderBy('createdAt', 'desc')
      ),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const data = change.doc.data();
            await GoogleSheetsService.addPortfolio({
              uid: change.doc.id,
              ...data,
            });
          }
        }
        updateLastSyncTime('portfolios');
      }
    );

    // 채용제안 컬렉션 리스너
    const unsubscribeJobInquiries = onSnapshot(
      query(
        collection(db, 'jobInquiries'),
        where('createdAt', '>', getLastSyncTime('jobInquiries')),
        orderBy('createdAt', 'desc')
      ),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === 'added') {
            const data = change.doc.data();
            await GoogleSheetsService.addJobInquiry({
              uid: change.doc.id,
              ...data,
            });
          }
        }
        updateLastSyncTime('jobInquiries');
      }
    );

    // Cleanup
    return () => {
      unsubscribeJobSeekers();
      unsubscribeEmployers();
      unsubscribePortfolios();
      unsubscribeJobInquiries();
    };
  }, [user]);
}
