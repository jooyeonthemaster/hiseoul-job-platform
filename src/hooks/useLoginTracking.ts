// 로그인 이벤트를 Google Sheets에 기록하는 훅
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSheetsService } from '@/lib/googleSheets';

export function useLoginTracking() {
  const { user, userData, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // 브라우저 정보 가져오기
    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent;
      let browser = 'Unknown';
      
      if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Edge')) browser = 'Edge';
      
      return browser;
    };

    // 디바이스 정보 가져오기
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      
      if (/Android/i.test(userAgent)) return 'Android';
      if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
      if (/Windows/i.test(userAgent)) return 'Windows';
      if (/Mac/i.test(userAgent)) return 'Mac';
      
      return 'Unknown';
    };

    // 로그인 기록
    const trackLogin = async () => {
      try {
        await GoogleSheetsService.logLogin({
          uid: user.uid,
          email: user.email || '',
          userType: userData?.role || 'unknown',
          browser: getBrowserInfo(),
          device: getDeviceInfo(),
          ipAddress: '', // 서버사이드에서 처리하는 것이 더 안전
          location: '', // 필요시 Geolocation API 사용
        });
      } catch (error) {
        console.error('Failed to track login:', error);
      }
    };

    trackLogin();
  }, [isAuthenticated, user, userData]);
}
