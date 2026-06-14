'use client';

import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import { AnimatedCard } from '@/components/animations';
import type { MonthlyDatum, TopCustomer } from '@/types';

interface DashboardChartsProps {
  monthlyData: MonthlyDatum[];
  topCustomers: TopCustomer[];
  omzetLM: number;
  omzetBR: number;
}

function OmzetBarChart({ data }: { data: MonthlyDatum[] }) {
  const maxOmzet = Math.max(
    ...data.map((d) => d.omzetLM + d.omzetBR),
    1
  );

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-44 px-1">
        {data.map((d, i) => {
          const total = d.omzetLM + d.omzetBR;
          const heightPct = (total / maxOmzet) * 100;
          const lmPct = total > 0 ? (d.omzetLM / total) * 100 : 0;
          const brPct = total > 0 ? (d.omzetBR / total) * 100 : 0;

          return (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex flex-col justify-end items-center h-36">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                  className="w-full max-w-[40px] rounded-t-md flex flex-col justify-end overflow-hidden"
                >
                  {total > 0 && (
                    <>
                      {brPct > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${brPct}%` }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                          className="bg-amber-400 w-full"
                        />
                      )}
                      {lmPct > 0 && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${lmPct}%` }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                          className="bg-blue-500 w-full"
                        />
                      )}
                    </>
                  )}
                  {total === 0 && (
                    <div className="bg-zinc-200 w-full h-full rounded-t-md" />
                  )}
                </motion.div>
              </div>
              <span className="text-[10px] text-zinc-400 leading-tight text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-500" /> LM
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-amber-400" /> BR
        </span>
      </div>
    </div>
  );
}

function OmzetDonut({ omzetLM, omzetBR }: { omzetLM: number; omzetBR: number }) {
  const total = omzetLM + omzetBR;
  const lmDeg = total > 0 ? (omzetLM / total) * 360 : 0;
  const brDeg = total > 0 ? (omzetBR / total) * 360 : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        className="relative w-28 h-28"
      >
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {total > 0 && lmDeg > 0 && (
            <motion.circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray={`${(lmDeg / 360) * 87.96} 87.96`}
              initial={{ strokeDasharray: '0 87.96' }}
              animate={{ strokeDasharray: `${(lmDeg / 360) * 87.96} 87.96` }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          )}
          {total > 0 && brDeg > 0 && (
            <motion.circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="6"
              strokeDasharray={`${(brDeg / 360) * 87.96} 87.96`}
              strokeDashoffset={`${-(lmDeg / 360) * 87.96}`}
              initial={{ strokeDasharray: '0 87.96' }}
              animate={{ strokeDasharray: `${(brDeg / 360) * 87.96} 87.96` }}
              transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          )}
          {total === 0 && (
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e4e4e7" strokeWidth="6" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-zinc-400">Omzet</span>
        </div>
      </motion.div>
      <div className="flex gap-3 text-xs">
        <div className="text-center">
          <p className="text-zinc-400">LM</p>
          <p className="font-semibold text-blue-600">{formatRupiah(omzetLM)}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400">BR</p>
          <p className="font-semibold text-amber-600">{formatRupiah(omzetBR)}</p>
        </div>
      </div>
    </div>
  );
}

function TopCustomersList({ customers }: { customers: TopCustomer[] }) {
  const maxOmzet = Math.max(...customers.map((c) => c.omzet), 1);

  return (
    <div className="space-y-2">
      {customers.length === 0 ? (
        <p className="text-sm text-zinc-400">Belum ada transaksi Lunas</p>
      ) : (
        customers.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 w-5 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-xs font-medium ml-2 shrink-0">
                    {formatRupiah(c.omzet)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.omzet / maxOmzet) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                {c.piutang > 0 && (
                  <p className="text-[10px] text-red-500 mt-0.5">
                    Piutang: {formatRupiah(c.piutang)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

export default function DashboardCharts({
  monthlyData,
  topCustomers,
  omzetLM,
  omzetBR,
}: DashboardChartsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <AnimatedCard className="p-4 lg:col-span-2">
        <h2 className="font-semibold mb-3">Omzet Bulanan (Lunas)</h2>
        <OmzetBarChart data={monthlyData} />
      </AnimatedCard>

      <div className="flex flex-col gap-6">
        <AnimatedCard className="p-4">
          <h2 className="font-semibold mb-3">Omzet LM vs BR</h2>
          <OmzetDonut omzetLM={omzetLM} omzetBR={omzetBR} />
        </AnimatedCard>

        <AnimatedCard className="p-4 flex-1">
          <h2 className="font-semibold mb-3">Top Customer</h2>
          <TopCustomersList customers={topCustomers} />
        </AnimatedCard>
      </div>
    </motion.div>
  );
}
