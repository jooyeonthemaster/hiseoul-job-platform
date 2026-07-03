'use client';

import type { ReactNode } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { cn } from './cn';

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
  titleClassName?: string;
}

/**
 * Standard section header: optional eyebrow pill + display title + subtitle,
 * revealed on scroll. Used across pages for consistent rhythm.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <ScrollReveal
      className={cn(
        align === 'center' ? 'text-center mx-auto' : 'text-left',
        'max-w-3xl',
        align === 'center' && 'max-w-3xl mx-auto',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold tracking-wide',
            'bg-white/60 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass-sm',
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-azure-500 animate-pulse" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'font-display font-bold tracking-tight text-ink-900',
          'text-3xl md:text-4xl lg:text-5xl leading-[1.1]',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'mt-5 text-ink-500 text-base md:text-lg leading-relaxed',
            align === 'center' && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}

export default SectionHeading;
