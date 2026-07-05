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

/* ────────────────────────────────────────────────────────────────────────────
 * 통일된 날짜 포맷 유틸 (필살기 표준)
 *
 * 정책:
 *  - 의미상(사용자 입력) 날짜는 문자열로 저장한다.
 *      · 연-월(경력/학력/자격증/수상) → "YYYY-MM"
 *      · 전체날짜(생년월일/마감일)     → "YYYY-MM-DD"
 *  - createdAt 등 시스템 시각은 Firestore Timestamp 유지(여기서 건드리지 않음).
 *  - 표시/파싱 유틸은 레거시(Date · Timestamp · ISO · "YYYY.MM" 등)도 전부 수용한다(무손실 하위호환).
 *  - 연-월 문자열은 절대 new Date()로 변환하지 않는다 → 타임존 "하루 밀림" 원천 차단.
 * ──────────────────────────────────────────────────────────────────────────── */

export type DatePrecision = 'year-month' | 'full-date';

export interface DateParts {
  year: string; // "YYYY" | ''
  month: string; // "MM" | ''
  day: string; // "DD" | ''
}

const pad2 = (n: number | string): string => String(n).padStart(2, '0');

/**
 * 임의의 날짜 값을 안전하게 JS Date 로 변환. 실패 시 null.
 * (Date · Firestore Timestamp{seconds}/toDate() · epoch number · 파싱 가능한 문자열 수용)
 */
export const toDate = (value: any): Date | null => {
  if (value == null || value === '') return null;
  try {
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    if (typeof value === 'object' && typeof value.toDate === 'function') {
      const d = value.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d : null;
    }
    if (typeof value === 'object' && 'seconds' in value) {
      const d = new Date((value as any).seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'number') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
  } catch {
    /* noop */
  }
  return null;
};

/**
 * 저장된 날짜 값을 {year, month, day} 파트로 분해 (드롭다운 초기화용).
 * 문자열은 타임존 변환 없이 정규식으로 직접 파싱한다.
 */
export const parseDateParts = (value: any): DateParts => {
  const empty: DateParts = { year: '', month: '', day: '' };
  if (value == null || value === '') return empty;

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return empty;
    // YYYY-MM-DD / YYYY.MM.DD / YYYY/MM/DD (시간 등 뒤따라도 앞부분만)
    let m = s.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/);
    if (m) return { year: m[1], month: pad2(m[2]), day: pad2(m[3]) };
    // YYYY-MM / YYYY.MM
    m = s.match(/^(\d{4})[-.\/](\d{1,2})$/);
    if (m) return { year: m[1], month: pad2(m[2]), day: '' };
    // YYYY
    m = s.match(/^(\d{4})$/);
    if (m) return { year: m[1], month: '', day: '' };
    // 그 외(ISO datetime 등)는 Date 로 파싱 시도
  }

  const d = toDate(value);
  if (d) return { year: String(d.getFullYear()), month: pad2(d.getMonth() + 1), day: pad2(d.getDate()) };
  return empty;
};

/**
 * 파트를 저장 문자열로 조합. 필수 파트가 없으면 '' 반환(부분 저장 방지).
 *  - year-month → "YYYY-MM"
 *  - full-date  → "YYYY-MM-DD"
 */
export const joinDateParts = (parts: DateParts, precision: DatePrecision): string => {
  const { year, month, day } = parts;
  if (!year || !month) return '';
  if (precision === 'full-date') return day ? `${year}-${month}-${day}` : '';
  return `${year}-${month}`;
};

/** "YYYY-MM" | "YYYY-MM-DD" 형식 유효성 검사 */
export const isValidDateString = (value: string, precision: DatePrecision): boolean => {
  if (!value) return false;
  if (precision === 'full-date') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return false;
    const mo = Number(m[2]);
    const da = Number(m[3]);
    return mo >= 1 && mo <= 12 && da >= 1 && da <= 31;
  }
  const m = value.match(/^(\d{4})-(\d{2})$/);
  if (!m) return false;
  const mo = Number(m[2]);
  return mo >= 1 && mo <= 12;
};

/**
 * 통일된 한국어 날짜 표시. 모든 레거시 포맷을 무손실 수용한다.
 *  - "YYYY-MM"      → "2020년 3월"       (Date 변환 없음 → 타임존 안전)
 *  - "YYYY-MM-DD"   → "2020년 3월 15일"
 *  - Date/Timestamp → toLocaleDateString('ko-KR'), withTime 시 시:분 포함
 * @param value 임의의 날짜 값
 * @param opts.withTime 시:분 표시 (Date/Timestamp 계열에만 적용)
 * @param opts.fallback 표시 불가 시 반환값 (기본 '')
 */
export const formatKoreanDate = (
  value: any,
  opts?: { withTime?: boolean; fallback?: string },
): string => {
  const fallback = opts?.fallback ?? '';
  if (value == null || value === '') return fallback;

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return fallback;
    let m = s.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})$/);
    if (m) return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`;
    m = s.match(/^(\d{4})[-.\/](\d{1,2})$/);
    if (m) return `${m[1]}년 ${Number(m[2])}월`;
    m = s.match(/^(\d{4})$/);
    if (m) return `${m[1]}년`;
    // 그 외는 Date 파싱으로 폴백
  }

  const d = toDate(value);
  if (!d) return fallback;
  const fmt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  if (opts?.withTime) {
    fmt.hour = '2-digit';
    fmt.minute = '2-digit';
  }
  return d.toLocaleDateString('ko-KR', fmt);
}; 