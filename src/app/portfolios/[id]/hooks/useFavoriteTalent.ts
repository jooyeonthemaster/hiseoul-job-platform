// 관심 인재 관리 훅
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addToFavoriteTalents, removeFromFavoriteTalents, isFavoriteTalent } from '@/lib/auth';
import { FavoriteTalentState } from '../types/portfolio.types';

export const useFavoriteTalent = (portfolioId: string) => {
  const { user, userData } = useAuth();
  
  const [state, setState] = useState<FavoriteTalentState>({
    isFavorite: false,
    favoriteLoading: false
  });

  // 관심 인재 상태 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !portfolioId || userData?.role !== 'employer') return;
      
      try {
        const favorite = await isFavoriteTalent(user.uid, portfolioId);
        setState(prev => ({ ...prev, isFavorite: favorite }));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, portfolioId, userData]);

  // 관심 인재 토글 함수
  const handleFavoriteToggle = async () => {
    if (!user || !portfolioId || userData?.role !== 'employer') return;
    
    try {
      setState(prev => ({ ...prev, favoriteLoading: true }));
      
      if (state.isFavorite) {
        await removeFromFavoriteTalents(user.uid, portfolioId);
        setState(prev => ({ ...prev, isFavorite: false }));
      } else {
        await addToFavoriteTalents(user.uid, portfolioId);
        setState(prev => ({ ...prev, isFavorite: true }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setState(prev => ({ ...prev, favoriteLoading: false }));
    }
  };

  return {
    ...state,
    handleFavoriteToggle
  };
};