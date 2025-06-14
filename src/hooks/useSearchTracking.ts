// 검색 활동 추적 훅
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSheetsService } from '@/lib/googleSheets';

export function useSearchTracking() {
  const { user, userData } = useAuth();

  const trackSearch = useCallback(
    async (searchData: {
      searchType: 'job' | 'portfolio' | 'company';
      query: string;
      filters?: {
        category?: string;
        location?: string;
        salary?: string;
        skills?: string[];
      };
      resultCount: number;
    }) => {
      await GoogleSheetsService.logSearch({
        userId: user?.uid || 'anonymous',
        userType: userData?.role || 'guest',
        searchType: searchData.searchType,
        query: searchData.query,
        categoryFilter: searchData.filters?.category || '',
        locationFilter: searchData.filters?.location || '',
        salaryFilter: searchData.filters?.salary || '',
        skillFilters: searchData.filters?.skills || [],
        resultCount: searchData.resultCount,
        clickedId: '',
        clickedRank: '',
      });
    },
    [user, userData]
  );

  const trackSearchClick = useCallback(
    async (clickedId: string, clickedRank: number) => {
      // 검색 결과 클릭 추적
      await GoogleSheetsService.logSearch({
        userId: user?.uid || 'anonymous',
        userType: userData?.role || 'guest',
        searchType: '',
        query: '',
        clickedId,
        clickedRank,
      });
    },
    [user, userData]
  );

  return { trackSearch, trackSearchClick };
}
