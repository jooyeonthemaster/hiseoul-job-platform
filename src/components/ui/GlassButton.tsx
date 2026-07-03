'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, MouseEventHandler } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

// Hoisted once at module scope (motion.create replaces the deprecated motion()).
const MotionLink = motion.create(Link);

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-colors duration-300 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400/60 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-azure-500 to-azure-600 text-white shadow-glow hover:from-azure-400 hover:to-azure-500 hover:shadow-glow-lg',
  secondary:
    'bg-white/70 backdrop-blur-md border border-white/70 text-azure-700 shadow-glass hover:bg-white/90',
  ghost: 'text-azure-700 hover:bg-azure-50/70',
  outline: 'border border-azure-300 text-azure-700 hover:bg-azure-50 hover:border-azure-400',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2',
  md: 'text-sm sm:text-base px-6 py-3',
  lg: 'text-base sm:text-lg px-8 py-4',
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  target?: string;
  rel?: string;
  title?: string;
  'aria-label'?: string;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  onClick,
  type = 'button',
  disabled,
  target,
  rel,
  title,
  'aria-label': ariaLabel,
}: CommonProps) {
  const reduce = useReducedMotion();
  const classes = cn(base, variants[variant], sizes[size], className);
  const interaction = reduce
    ? {}
    : { whileHover: { y: -2 }, whileTap: { scale: 0.96 }, transition: { type: 'spring' as const, stiffness: 420, damping: 26 } };

  if (href) {
    return (
      <MotionLink
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        title={title}
        aria-label={ariaLabel}
        className={classes}
        {...interaction}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={classes}
      {...interaction}
    >
      {children}
    </motion.button>
  );
}

export default GlassButton;
