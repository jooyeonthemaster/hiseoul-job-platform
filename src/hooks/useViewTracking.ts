// 조회수 추적 훅
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSheetsService } from '@/lib/googleSheets';

export function useViewTracking(
  targetType: 'portfolio' | 'job' | 'profile',
  targetId: string,
  targetTitle: string
) {
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!targetId || !targetType) return;

    const startTime = Date.now();

    // 페이지 진입 시 조회 기록
    const trackView = async () => {
      await GoogleSheetsService.logView({
        viewerId: user?.uid || 'anonymous',
        viewerType: userData?.role || 'guest',
        targetType,
        targetId,
        targetTitle,
        page: window.location.pathname,
        duration: 0,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        referrer: document.referrer,
      });
    };

    trackView();

    // 페이지 이탈 시 체류시간 업데이트
    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      // 비동기로 처리 (페이지 이탈 시에도 전송)
      navigator.sendBeacon(
        '/api/track-view',
        JSON.stringify({
          viewerId: user?.uid || 'anonymous',
          targetId,
          duration,
        })
      );
    };
  }, [targetType, targetId, targetTitle, user, userData]);
}
