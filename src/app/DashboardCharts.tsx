'use client';

import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import EmptyState from '@/components/EmptyState';
import type { TopCustomer } from '@/types';

interface DashboardChartsProps {
  topCustomers: TopCustomer[];
  omzetLM: number;
  omzetBR: number;
}

// anime.js spring presets
const springBounce = { type: 'spring' as const, stiffness: 350, damping: 14, mass: 0.7 };
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 22, mass: 0.5 };
const springElastic = { type: 'spring' as const, stiffness: 200, damping: 8, mass: 0.5 };

function OmzetDonut({ omzetLM, omzetBR }: { omzetLM: number; omzetBR: number }) {
  const total = omzetLM + omzetBR;
  const lmPct = total > 0 ? Math.round((omzetLM / total) * 100) : 0;
  const brPct = total > 0 ? Math.round((omzetBR / total) * 100) : 0;
  const lmDeg = total > 0 ? (omzetLM / total) * 360 : 0;
  const brDeg = total > 0 ? (omzetBR / total) * 360 : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -120 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...springElastic, delay: 0.2 }}
        className="relative w-32 h-32"
      >
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {total > 0 && lmDeg > 0 && (
            <motion.circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="url(#gLm)"
              strokeWidth="4.5"
              strokeDasharray={`${(lmDeg / 360) * 87.96} 87.96`}
              initial={{ strokeDasharray: '0 87.96' }}
              animate={{ strokeDasharray: `${(lmDeg / 360) * 87.96} 87.96` }}
              transition={{ ...springSnappy, delay: 0.4 }}
              strokeLinecap="round"
            />
          )}
          {total > 0 && brDeg > 0 && (
            <motion.circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="url(#gBr)"
              strokeWidth="4.5"
              strokeDasharray={`${(brDeg / 360) * 87.96} 87.96`}
              strokeDashoffset={`${-(lmDeg / 360) * 87.96}`}
              initial={{ strokeDasharray: '0 87.96' }}
              animate={{ strokeDasharray: `${(brDeg / 360) * 87.96} 87.96` }}
              transition={{ ...springSnappy, delay: 0.5 }}
              strokeLinecap="round"
            />
          )}
          {total === 0 && (
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e5e5" strokeWidth="4.5" />
          )}
          <defs>
            <linearGradient id="gLm" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="gBr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={total}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springBounce}
            className="text-base font-bold text-neutral-800"
          >
            {total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)}jt` : `${(total / 1_000).toFixed(0)}rb`}
          </motion.span>
          <span className="text-[9px] text-neutral-400">Total</span>
        </div>
      </motion.div>
      <div className="flex gap-2 text-xs">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.5 }}
          className="bg-blue-50 rounded-lg px-3 py-1.5 text-center"
        >
          <p className="text-neutral-400">LM</p>
          <p className="font-bold text-blue-600 text-sm">{formatRupiah(omzetLM)}</p>
          <p className="text-[10px] text-blue-400">{lmPct}%</p>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...springBounce, delay: 0.55 }}
          className="bg-amber-50 rounded-lg px-3 py-1.5 text-center"
        >
          <p className="text-neutral-400">BR</p>
          <p className="font-bold text-amber-600 text-sm">{formatRupiah(omzetBR)}</p>
          <p className="text-[10px] text-amber-400">{brPct}%</p>
        </motion.div>
      </div>
    </div>
  );
}

function TopCustomersList({ customers }: { customers: TopCustomer[] }) {
  const maxOmzet = Math.max(...customers.map((c) => c.omzet), 1);

  return (
    <div className="space-y-4">
      {customers.length === 0 ? (
        <EmptyState icon="🏆" title="Belum ada data omzet" description="Transaksi Lunas akan muncul di sini" />
      ) : (
        customers.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springGentle(), delay: 0.2 + i * 0.06 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...springBounce, delay: 0.2 + i * 0.06 }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {i + 1}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold truncate">{c.name}</span>
                  <span className="text-xs font-bold ml-2 shrink-0">{formatRupiah(c.omzet)}</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.omzet / maxOmzet) * 100}%` }}
                    transition={{ ...springElastic, delay: 0.3 + i * 0.06 }}
                    className={`h-full rounded-full ${
                      i === 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-neutral-300 to-neutral-400'
                    }`}
                  />
                </div>
                {c.piutang > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.5] }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="w-1.5 h-1.5 rounded-full bg-red-400"
                    />
                    <p className="text-[10px] text-red-500 font-medium">Piutang: {formatRupiah(c.piutang)}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

function springGentle() {
  return { type: 'spring' as const, stiffness: 200, damping: 22, mass: 0.6 };
}

export default function DashboardCharts({
  topCustomers,
  omzetLM,
  omzetBR,
}: DashboardChartsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle(), delay: 0.25 }}
        className="bg-white rounded-2xl border border-neutral-200/60 p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-amber-400" />
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-neutral-900">Distribusi Omzet</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">LM vs BR — omzet lunas</p>
        </div>
        <OmzetDonut omzetLM={omzetLM} omzetBR={omzetBR} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle(), delay: 0.3 }}
        className="bg-white rounded-2xl border border-neutral-200/60 p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">Top Customer</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">Berdasarkan omzet lunas</p>
        </div>
        <TopCustomersList customers={topCustomers} />
      </motion.div>
    </motion.div>
  );
}
