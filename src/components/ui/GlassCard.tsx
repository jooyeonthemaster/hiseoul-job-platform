'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, MouseEventHandler } from 'react';
import { cn } from './cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  strong?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  as?: 'div' | 'article' | 'li';
}

/**
 * Frosted azure-glass surface with soft rim light and layered shadow.
 * `hover` adds a gentle lift on pointer hover / tap feedback on touch.
 */
export function GlassCard({
  children,
  className,
  hover = false,
  strong = false,
  onClick,
}: GlassCardProps) {
  const reduce = useReducedMotion();
  const surface = strong
    ? 'bg-white/75 border-white/70'
    : 'bg-white/55 border-white/60';

  const classes = cn(
    'relative backdrop-blur-xl border shadow-glass rounded-4xl',
    surface,
    'before:content-[""] before:absolute before:inset-0 before:rounded-[inherit] before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] before:pointer-events-none',
    className,
  );

  if (hover && !reduce) {
    return (
      <motion.div
        onClick={onClick}
        className={classes}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        style={{ willChange: 'transform' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div onClick={onClick} className={cn(classes, hover && 'hover-lift')}>
      {children}
    </div>
  );
}

export default GlassCard;
