// 포트폴리오 관련 유틸리티 함수들

import { formatKoreanDate } from '@/lib/dateUtils';

// 전문분야별 아바타 매핑
export const getAvatarBySpeciality = (speciality: string): string => {
  const avatarMap: { [key: string]: string } = {
    'SNS마케팅': '📱',
    '키워드광고': '🎯',
    '브랜드마케팅': '🎨',
    '퍼포먼스마케팅': '📊',
    '콘텐츠마케팅': '✍️',
    '마케팅기획': '💡',
    '이커머스마케팅': '🛒',
    '데이터마케팅': '📈',
    '웹개발': '💻',
    '앱개발': '📱',
    '디자인': '🎨',
    '기타': '👤'
  };
  return avatarMap[speciality] || '👤';
};

// YouTube URL에서 ID 추출
export const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

/**
 * 다양한 날짜 값을 한국어 표시 문자열로 변환.
 * 공용 formatKoreanDate에 위임한다 — 연-월("YYYY-MM") 문자열도 타임존 변환 없이
 * "2020년 3월"로 올바르게 표시하며, Timestamp/Date/ISO/epoch 등 레거시 포맷을 모두 수용한다.
 */
export const formatFirebaseDate = (dateValue: any): string =>
  formatKoreanDate(dateValue, { fallback: '날짜 정보 없음' });