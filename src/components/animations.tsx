'use client';

import { motion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';

export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.995 }}
      className={`bg-white rounded-xl border border-neutral-200/80 transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return <motion.div variants={staggerItem}>{children}</motion.div>;
}

export function AnimatePresenceWrapper({ children }: { children: ReactNode }) {
  return children;
}
