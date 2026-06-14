'use client';

import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.08, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-3"
    >
      <div className="relative flex-shrink-0">
        <svg
          width="38"
          height="38"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <defs>
            <linearGradient id="hlGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>
            <linearGradient id="hlAccent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#hlGrad)"
          />
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            stroke="white"
            strokeOpacity="0.08"
            strokeWidth="1.5"
          />
          <text
            x="24"
            y="31"
            textAnchor="middle"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="20"
            fontWeight="700"
            letterSpacing="-0.5"
          >
            HL
          </text>
          <rect x="10" y="34" width="16" height="2.5" rx="1.25" fill="url(#hlAccent)" />
        </svg>
      </div>

      <div className="flex flex-col gap-px">
        <h1 className="text-[15px] font-bold text-zinc-900 leading-none tracking-tight">
          HL App
        </h1>
        <p className="text-[10px] font-medium text-zinc-400 tracking-[0.06em] uppercase leading-none">
          Sales &amp; Receivables
        </p>
      </div>
    </motion.div>
  );
}
