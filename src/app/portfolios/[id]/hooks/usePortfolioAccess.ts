// 포트폴리오 접근 권한 관리 훅
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPortfolio, getEmployerWithApprovalStatus } from '@/lib/auth';
import { PortfolioAccessState } from '../types/portfolio.types';

export const usePortfolioAccess = (portfolioId: string) => {
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [state, setState] = useState<PortfolioAccessState>({
    hasAccess: false,
    accessChecked: false,
    showAccessModal: false,
    employerStatus: null
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setState(prev => ({
          ...prev,
          hasAccess: false,
          accessChecked: true,
          showAccessModal: true
        }));
        return;
      }

      try {
        // 구직자가 자신의 포트폴리오를 보는 경우는 허용
        const isOwnPortfolio = userData?.role === 'jobseeker' && portfolioId === user.uid;
        
        if (isOwnPortfolio) {
          setState(prev => ({
            ...prev,
            hasAccess: true,
            accessChecked: true
          }));
          return;
        }

        // 그 외의 경우는 기존 로직 적용 (승인된 기업만 접근 가능)
        const access = await canAccessPortfolio(user.uid);
        
        // 기업 회원인 경우 승인 상태 확인
        let employerStatus = null;
        if (userData?.role === 'employer') {
          employerStatus = await getEmployerWithApprovalStatus(user.uid);
        }

        setState(prev => ({
          ...prev,
          hasAccess: access,
          accessChecked: true,
          showAccessModal: !access,
          employerStatus
        }));
      } catch (error) {
        console.error('Error checking portfolio access:', error);
        setState(prev => ({
          ...prev,
          hasAccess: false,
          accessChecked: true,
          showAccessModal: true
        }));
      }
    };

    if (user !== undefined) {
      checkAccess();
    }
  }, [user, userData, portfolioId, router]);

  return state;
};