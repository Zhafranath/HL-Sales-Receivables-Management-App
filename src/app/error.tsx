'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </motion.div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Terjadi kesalahan</h2>
      <p className="text-sm text-neutral-500 mb-6">Gagal memuat halaman. Silakan coba lagi.</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={reset}
        className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
      >
        Coba Lagi
      </motion.button>
    </motion.div>
  );
}
