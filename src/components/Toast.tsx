'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const ToastContext = createContext<{
  toast: (message: string, type?: 'success' | 'error') => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const icons = {
    success: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
              className="pointer-events-auto w-full"
            >
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
                t.type === 'success'
                  ? 'bg-white border-emerald-200 text-emerald-800'
                  : 'bg-white border-red-200 text-red-800'
              }`}>
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  t.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {icons[t.type]}
                </span>
                <span className="text-sm font-medium flex-1">{t.message}</span>
              </div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.2, ease: 'linear' }}
                style={{ originX: 1 }}
                className={`h-0.5 rounded-full mt-1 ${t.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
