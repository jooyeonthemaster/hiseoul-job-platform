// 포트폴리오 관련 유틸리티 함수들

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

// Firebase Timestamp를 안전하게 날짜 문자열로 변환
export const formatFirebaseDate = (dateValue: any): string => {
  if (!dateValue) return '날짜 정보 없음';
  
  // 빈 객체 체크
  if (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
    console.warn('Empty object passed as date:', dateValue);
    return '날짜 정보 없음';
  }
  
  try {
    let date: Date;
    
    // Firebase Timestamp 객체인 경우
    if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      date = new Date(dateValue.seconds * 1000);
    }
    // Firebase Timestamp 객체 (toDate 메서드가 있는 경우)
    else if (dateValue && typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    }
    // JavaScript Date 객체인 경우
    else if (dateValue instanceof Date) {
      date = dateValue;
    }
    // 문자열인 경우
    else if (typeof dateValue === 'string') {
      if (dateValue.trim() === '') return '날짜 정보 없음';
      date = new Date(dateValue);
    }
    // 숫자(timestamp)인 경우
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    else {
      console.warn('Unknown date format:', dateValue);
      return '날짜 정보 없음';
    }
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateValue);
      return '날짜 정보 없음';
    }
    
    return date.toLocaleDateString('ko-KR');
  } catch (error) {
    console.error('Date formatting error:', error, 'Value:', dateValue);
    return '날짜 정보 없음';
  }
};