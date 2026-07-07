'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 라우트 전환 시 스크롤을 항상 최상단으로 복원한다.
 *
 * Next.js 기본 스크롤 복원은 전환 시점의 페이지 높이를 기준으로 동작하는데,
 * 이 앱은 전환 직후 로딩 화면(짧은 높이) → 데이터 로드 후 본문 확장 흐름이라
 * 이전 페이지에서 스크롤한 위치가 어중간하게 남는 문제가 있었다.
 * pathname 변경마다 명시적으로 (0,0) 으로 올려 일관성을 보장한다.
 * (해시 앵커 이동은 pathname 이 같으므로 영향받지 않는다)
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
