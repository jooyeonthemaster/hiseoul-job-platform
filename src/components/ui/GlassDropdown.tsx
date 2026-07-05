'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from './cn';

export interface GlassDropdownOption {
  value: string;
  label: string;
}

interface GlassDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: GlassDropdownOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface MenuRect {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const MENU_MAX = 288; // max-h-72

/**
 * 텍스트가 길어도 잘리지 않고 줄바꿈되는 커스텀 셀렉트.
 * 메뉴는 body 로 portal + position:fixed 로 렌더하므로 overflow-hidden 조상에 의해 클리핑되지 않는다.
 * (긴 옵션·좁은 카드·모달 어디서든 안전. 스크롤/리사이즈 시 위치 추적, 공간 부족 시 위로 플립)
 */
export function GlassDropdown({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  className,
  disabled = false,
}: GlassDropdownProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<MenuRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const place = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const openUp = spaceBelow < Math.min(MENU_MAX, 240) + 16 && spaceAbove > spaceBelow;
    if (openUp) {
      setRect({
        left: r.left,
        width: r.width,
        bottom: window.innerHeight - r.top + 6,
        maxHeight: Math.min(MENU_MAX, spaceAbove - 16),
      });
    } else {
      setRect({
        left: r.left,
        width: r.width,
        top: r.bottom + 6,
        maxHeight: Math.min(MENU_MAX, spaceBelow - 16),
      });
    }
  };

  const toggle = () => {
    if (disabled) return;
    if (!open) place();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const reposition = () => place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const menu =
    open && rect && mounted
      ? createPortal(
          <ul
            ref={menuRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: rect.left,
              width: rect.width,
              top: rect.top,
              bottom: rect.bottom,
              maxHeight: rect.maxHeight,
              zIndex: 60,
            }}
            className="overflow-auto rounded-2xl border border-white/70 bg-white/95 p-1.5 shadow-glass backdrop-blur-xl"
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm leading-snug break-keep transition-colors',
                      active ? 'bg-azure-500 text-white' : 'text-ink-700 hover:bg-azure-50',
                    )}
                  >
                    <CheckIcon className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
                    <span className="min-w-0 flex-1 whitespace-normal">{opt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className={cn('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex w-full items-start justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-left text-sm text-ink-800 shadow-glass-sm backdrop-blur-md transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-azure-400/50 focus:border-azure-300',
          'disabled:cursor-not-allowed disabled:opacity-60',
          open && 'border-azure-300 bg-white/90 ring-2 ring-azure-400/50',
        )}
      >
        <span className={cn('min-w-0 flex-1 whitespace-normal break-keep leading-snug', !selected && 'text-ink-400')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={cn('mt-0.5 h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {menu}
    </div>
  );
}

export default GlassDropdown;
