'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, scaleIn, staggerContainer, revealTransition } from './motion';
import { cn } from './cn';

type Variant = 'fadeUp' | 'scaleIn';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  variant?: Variant;
  once?: boolean;
  as?: 'div' | 'section' | 'span' | 'li' | 'article';
}

/**
 * Reveals its children with a soft fade + rise as they enter the viewport.
 * Respects prefers-reduced-motion (renders statically).
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  variant = 'fadeUp',
  once = true,
  as = 'div',
}: ScrollRevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduce) {
    const Tag = as as 'div';
    return <Tag className={className}>{children}</Tag>;
  }

  const base = variant === 'scaleIn' ? scaleIn : fadeUp;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2, margin: '0px 0px -10% 0px' }}
      variants={{
        hidden: { opacity: 0, y: variant === 'fadeUp' ? y : 16, scale: variant === 'scaleIn' ? 0.96 : 1 },
        show: { opacity: 1, y: 0, scale: 1, transition: { ...revealTransition, delay } },
      }}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container — wrap a list and use <ScrollRevealItem> for each child. */
export function ScrollRevealStagger({
  children,
  className,
  stagger = 0.09,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className,
  variant = 'fadeUp',
}: {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={cn(className)} variants={variant === 'scaleIn' ? scaleIn : fadeUp}>
      {children}
    </motion.div>
  );
}
