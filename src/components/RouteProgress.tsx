'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500'];

export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              initial={{ rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center shadow-lg shadow-neutral-900/20"
            >
              <span className="text-white text-xl font-extrabold tracking-tight">HL</span>
              <motion.div
                animate={{ width: [8, 16, 8] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-[10px] h-[2px] rounded-full bg-amber-400"
              />
            </motion.div>

            <div className="flex items-center gap-2.5">
              {colors.map((color, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  className={`w-2 h-2 rounded-full ${color}`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
