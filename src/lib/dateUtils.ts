/**
 * 날짜 처리 관련 공통 유틸리티 함수들
 * 프로필 편집에서 사용되는 날짜 입력 처리를 위한 함수들
 */

/**
 * 다양한 형태의 날짜 값을 input[type="text"]에서 사용할 수 있는 문자열로 변환
 * @param dateValue - Date 객체, Firebase Timestamp, 문자열, 숫자 등
 * @returns YYYY-MM-DD 형식의 문자열 또는 빈 문자열
 */
export const formatDateForInput = (dateValue: any): string => {
  if (!dateValue) return '';
  
  try {
    let date: Date;
    
    // JavaScript Date 객체인 경우
    if (dateValue instanceof Date) {
      date = dateValue;
    }
    // Firebase Timestamp 객체인 경우 (seconds 속성이 있는 경우)
    else if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
      date = new Date(dateValue.seconds * 1000);
    }
    // Firebase Timestamp 객체 (toDate 메서드가 있는 경우)
    else if (dateValue && typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    }
    // 문자열인 경우
    else if (typeof dateValue === 'string') {
      if (dateValue.trim() === '') return '';
      date = new Date(dateValue);
    }
    // 숫자(timestamp)인 경우
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    }
    else {
      console.warn('Unknown date format:', dateValue);
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return '';
  }
};

/**
 * 문자열을 안전한 Date 객체로 변환
 * @param dateString - 날짜 문자열
 * @returns Date 객체 또는 null
 */
export const createSafeDate = (dateString: string): Date | null => {
  if (!dateString || dateString.trim() === '') return null;
  try {
    const date = new Date(dateString + 'T00:00:00.000Z'); // UTC 시간으로 명시적 설정
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Invalid date string:', dateString);
    return null;
  }
}; 