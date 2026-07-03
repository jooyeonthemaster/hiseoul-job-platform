// Shared framer-motion variants & transitions for the Serene Azure Glass system.
import type { Variants, Transition } from 'framer-motion';

export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const revealTransition: Transition = {
  duration: 0.62,
  ease: easeOutExpo,
};

// Fade + rise into view
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: revealTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: easeOutExpo } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: revealTransition },
};

// Stagger container
export const staggerContainer = (stagger = 0.09, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Touch / hover feedback for interactive surfaces
export const tapScale = { scale: 0.96 };
export const hoverLift = { y: -6 };

// Modal / dialog entrance
export const modalPanel: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: easeOutExpo } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
