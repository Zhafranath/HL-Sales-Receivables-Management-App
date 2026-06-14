'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-neutral-100 flex items-center justify-center relative overflow-hidden">
          <motion.span
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, ...springForm }}
            className="text-[40px] font-black text-neutral-300"
          >
            4
          </motion.span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 12 }}
            className="text-[40px] font-black text-neutral-400"
          >
            0
          </motion.span>
          <motion.span
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, ...springForm }}
            className="text-[40px] font-black text-neutral-300"
          >
            4
          </motion.span>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-xl font-bold text-neutral-900 mb-1"
      >
        Halaman tidak ditemukan
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-neutral-500 mb-6"
      >
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-700/20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

const springForm = { type: 'spring' as const, stiffness: 300, damping: 20 };
