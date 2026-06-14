'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 backdrop-blur-sm bg-white/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(2px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.8 }}
            className="relative bg-white rounded-2xl shadow-2xl shadow-black/20 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-neutral-100"
          >
            <div className="flex items-center justify-between p-5 pb-3">
              <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: '#f5f5f5' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-full"
              >
                ✕
              </motion.button>
            </div>
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
