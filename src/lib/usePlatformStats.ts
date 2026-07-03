'use client';

import { useEffect, useState } from 'react';
import { getAllEmployers, getAllPortfolios } from './auth';

export interface PlatformStats {
  companyCount: number;
  portfolioCount: number;
  industryCount: number;
  loading: boolean;
}

/**
 * 플랫폼 실데이터 통계 (등록 기업/포트폴리오/업종 수).
 * 홈·소개 등 여러 페이지에서 동일한 "진짜" 숫자를 보여주기 위한 단일 소스.
 * 매칭률·만족도 등은 데이터 소스가 없으므로 여기서 제공하지 않는다(가짜 금지).
 */
export function usePlatformStats(): PlatformStats {
  const [stats, setStats] = useState<PlatformStats>({
    companyCount: 0,
    portfolioCount: 0,
    industryCount: 0,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [employers, portfolios] = await Promise.all([
          getAllEmployers(),
          getAllPortfolios(),
        ]);
        if (!active) return;
        const industryCount = new Set(
          employers.map((e: any) => e?.company?.industry).filter(Boolean)
        ).size;
        setStats({
          companyCount: employers.length,
          portfolioCount: portfolios.length,
          industryCount,
          loading: false,
        });
      } catch {
        if (active) setStats((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return stats;
}
