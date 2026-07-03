'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin azure progress bar pinned to the very top of the viewport that fills
 * as the user scrolls the page. Purely decorative — no logic dependencies.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-azure-400 via-azure-500 to-sky-cool-500"
    />
  );
}
