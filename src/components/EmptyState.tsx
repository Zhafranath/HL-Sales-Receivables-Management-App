import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4"
      >
        <span className="text-3xl">{icon}</span>
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base font-semibold text-neutral-800 mb-1"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-sm text-neutral-400 mb-5"
      >
        {description}
      </motion.p>
      {actionLabel && actionHref && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 18 }}
        >
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-700/15"
          >
            + {actionLabel}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
