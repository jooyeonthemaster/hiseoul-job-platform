'use client';

import { useEffect, useMemo, useState } from 'react';
import { GlassDropdown } from './GlassDropdown';
import { cn } from './cn';
import {
  parseDateParts,
  joinDateParts,
  type DateParts,
  type DatePrecision,
} from '@/lib/dateUtils';

interface GlassDatePickerProps {
  /** 저장 문자열: "YYYY-MM" (year-month) 또는 "YYYY-MM-DD" (full-date). 레거시 값도 수용. */
  value: string;
  onChange: (value: string) => void;
  /** 'year-month'(경력/학력/자격증/수상) | 'full-date'(생년월일/마감일). 기본 year-month */
  precision?: DatePrecision;
  disabled?: boolean;
  /** 연도 선택 범위. 기본: (올해-60) ~ (올해+5) */
  fromYear?: number;
  toYear?: number;
  className?: string;
}

/**
 * 유리 디자인 연·월(·일) 드롭다운 날짜 선택기.
 * - native 위젯 대신 GlassDropdown 3개로 구성 → 브라우저 무관 일관 UI, 항상 유효한 포맷 보장.
 * - 부분 선택 중에는 상위로 부분 문자열을 올리지 않고(빈 문자열 유지), 필수 파트가 모두 채워지면 완성 문자열을 emit.
 */
export function GlassDatePicker({
  value,
  onChange,
  precision = 'year-month',
  disabled = false,
  fromYear,
  toYear,
  className,
}: GlassDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const startYear = fromYear ?? currentYear - 60;
  const endYear = toYear ?? currentYear + 5;

  const [parts, setParts] = useState<DateParts>(() => parseDateParts(value));

  // 외부에서 값이 (데이터 로드/리셋 등으로) 바뀌면 동기화.
  // 단, 편집 중 부분 선택(상위 value='')이 지워지지 않도록 value가 비어있지 않을 때만 재동기화한다.
  useEffect(() => {
    const combined = joinDateParts(parts, precision);
    if (value !== combined && value) {
      setParts(parseDateParts(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const yearOptions = useMemo(() => {
    const arr: { value: string; label: string }[] = [];
    for (let y = endYear; y >= startYear; y--) arr.push({ value: String(y), label: `${y}년` });
    return arr;
  }, [startYear, endYear]);

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: `${i + 1}월` })),
    [],
  );

  const daysInMonth = useMemo(() => {
    if (parts.year && parts.month) return new Date(Number(parts.year), Number(parts.month), 0).getDate();
    return 31;
  }, [parts.year, parts.month]);

  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: `${i + 1}일` })),
    [daysInMonth],
  );

  const commit = (next: DateParts) => {
    // full-date에서 월 변경으로 일수가 줄면 잘못된 day 보정
    if (next.year && next.month && next.day) {
      const dim = new Date(Number(next.year), Number(next.month), 0).getDate();
      if (Number(next.day) > dim) next = { ...next, day: String(dim).padStart(2, '0') };
    }
    setParts(next);
    onChange(joinDateParts(next, precision));
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <GlassDropdown
        className="flex-1"
        disabled={disabled}
        placeholder="연도"
        value={parts.year}
        options={yearOptions}
        onChange={(y) => commit({ ...parts, year: y })}
      />
      <GlassDropdown
        className="flex-1"
        disabled={disabled}
        placeholder="월"
        value={parts.month}
        options={monthOptions}
        onChange={(m) => commit({ ...parts, month: m })}
      />
      {precision === 'full-date' && (
        <GlassDropdown
          className="flex-1"
          disabled={disabled}
          placeholder="일"
          value={parts.day}
          options={dayOptions}
          onChange={(d) => commit({ ...parts, day: d })}
        />
      )}
    </div>
  );
}

export default GlassDatePicker;
