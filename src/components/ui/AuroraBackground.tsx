'use client';

import { cn } from './cn';

interface AuroraBackgroundProps {
  className?: string;
  /** intensity of the floating orbs */
  variant?: 'subtle' | 'vivid';
}

/**
 * Ambient azure aurora: soft floating glow orbs behind content.
 * Absolutely positioned & pointer-events-none — drop it as the first child
 * of a `relative overflow-hidden` section.
 */
export function AuroraBackground({ className, variant = 'subtle' }: AuroraBackgroundProps) {
  const opacity = variant === 'vivid' ? 'opacity-80' : 'opacity-50';
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', opacity, className)}>
      <div className="absolute -top-32 -left-24 h-[34rem] w-[34rem] rounded-full bg-azure-300/40 blur-3xl animate-float-slow" />
      <div className="absolute top-10 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-sky-cool-300/40 blur-3xl animate-float-slower" />
      <div className="absolute bottom-[-10rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-azure-200/45 blur-3xl animate-float-slow" />
    </div>
  );
}

export default AuroraBackground;
