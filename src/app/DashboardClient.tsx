'use client';

import { motion } from 'framer-motion';
import { formatRupiah, getTransactionLineData } from '@/lib/calculations';
import AnimatedNumber, { AnimatedRupiah } from '@/components/AnimatedNumber';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import type { Transaction, TopCustomer } from '@/types';

interface DashboardClientProps {
  customerCount: number;
  productCount: number;
  totalPiutang: number;
  totalLaba: number;
  lunasCount: number;
  piutangCount: number;
  omzetLM: number;
  omzetBR: number;
  monthlyData: any[];
  topCustomers: TopCustomer[];
  transactions: Transaction[];
}

// Spring presets — anime.js feel
const springBounce = { type: 'spring' as const, stiffness: 400, damping: 15, mass: 0.8 };
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22, mass: 0.6 };
const springSnappy = { type: 'spring' as const, stiffness: 500, damping: 25, mass: 0.5 };
const fadeSlideUp = { hidden: { opacity: 0, y: 24, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } };
const fadeSlideLeft = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

const stats = [
  { key: 'customer', label: 'Customer', icon: '👥' },
  { key: 'product', label: 'Produk', icon: '📦' },
  { key: 'piutang', label: 'Piutang', icon: '⚠' },
  { key: 'laba', label: 'Laba HL', icon: '✦' },
] as const;

const quickActions = [
  { href: '/transactions/new', label: 'Buat Bon', icon: '📝' },
  { href: '/customers/new', label: 'Customer', icon: '👤' },
  { href: '/products/new', label: 'Produk', icon: '📦' },
  { href: '/reports', label: 'Rekap', icon: '📊' },
];

export default function DashboardClient({
  customerCount, productCount, totalPiutang, totalLaba,
  lunasCount, piutangCount, omzetLM, omzetBR,
  topCustomers, transactions,
}: DashboardClientProps) {
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const totalOmzet = omzetLM + omzetBR;

  const statValues: Record<string, { value: React.ReactNode; sub: string }> = {
    customer: { value: <AnimatedNumber value={customerCount} />, sub: 'Terdaftar' },
    product: { value: <AnimatedNumber value={productCount} />, sub: 'Katalog' },
    piutang: { value: <AnimatedRupiah value={totalPiutang} />, sub: `${piutangCount} bon` },
    laba: { value: <AnimatedRupiah value={totalLaba} />, sub: `${lunasCount} lunas` },
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex items-end justify-between"
      >
        <div className="space-y-1">
          <motion.p
            variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
            transition={{ ...springGentle, delay: 0.05 }}
            className="text-xs font-bold text-emerald-600 uppercase tracking-[0.15em]"
          >
            Dashboard
          </motion.p>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ ...springSnappy, delay: 0.1 }}
            className="text-[28px] font-bold text-neutral-900 tracking-tight"
          >
            Selamat Datang
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ delay: 0.2 }}
            className="text-sm text-neutral-500"
          >
            {today}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springBounce, delay: 0.3 }}
          className="hidden md:block text-right"
        >
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.12em] mb-1">Omzet Lunas</p>
          <p className="text-2xl font-bold text-emerald-600 tabular-nums">
            <AnimatedRupiah value={totalOmzet} />
          </p>
        </motion.div>
      </motion.div>

      {/* STATS GRID */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.key} variants={fadeSlideUp} transition={springBounce}>
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.07)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl border border-neutral-200/60 p-5 cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em]">{stat.label}</span>
                <motion.span
                  whileHover={{ scale: 1.3, rotate: [0, -10] }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="text-lg"
                >
                  {stat.icon}
                </motion.span>
              </div>
              <div className="text-[24px] font-bold text-neutral-900 tracking-tight tabular-nums">
                {statValues[stat.key].value}
              </div>
              <p className="text-[11px] text-neutral-400 font-medium mt-1">{statValues[stat.key].sub}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* CHARTS */}
      <DashboardCharts topCustomers={topCustomers} omzetLM={omzetLM} omzetBR={omzetBR} />

      {/* BOTTOM GRID */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Recent Transactions */}
        <motion.div variants={fadeSlideUp} transition={springGentle} className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Transaksi Terbaru</h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">5 transaksi terakhir</p>
              </div>
              <Link href="/transactions" className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Lihat semua →
              </Link>
            </div>
            {transactions.length === 0 ? (
              <EmptyState icon="📋" title="Belum ada transaksi" description="Buat bon pertama untuk memulai" />
            ) : (
              <div className="divide-y divide-neutral-100 -mx-5">
                {transactions.map((tx, idx) => {
                  const c = getTransactionLineData(tx);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springGentle, delay: 0.35 + idx * 0.04 }}
                    >
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <motion.div
                            animate={{ scale: [1, 1.4] }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                            className={`w-2 h-2 rounded-full shrink-0 ${tx.status === 'Lunas' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-neutral-800 truncate group-hover:text-emerald-600 transition-colors">
                              {tx.nomor_bon}
                              {tx.is_bonus && (
                                <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">Bonus</span>
                              )}
                            </p>
                            <p className="text-[11px] text-neutral-400 truncate">{tx.tanggal} · {tx.customer?.nama || '-'}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-[13px] font-semibold text-neutral-800 tabular-nums">{formatRupiah(c.amountOwed)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            tx.status === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{tx.status}</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeSlideUp} transition={springGentle} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 h-full">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-neutral-900">Aksi Cepat</h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Pintasan menu</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a, i) => (
                <motion.div
                  key={a.href}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springBounce, delay: 0.4 + i * 0.05 }}
                >
                  <Link href={a.href}>
                    <motion.div
                      whileHover={{ scale: 1.04, y: -3, boxShadow: '0 8px 20px rgba(16,185,129,0.12)', borderColor: '#6ee7b7' }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-neutral-200/60 transition-colors"
                    >
                      <motion.span
                        whileHover={{ rotate: [0, -12], scale: 1.2 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="text-2xl"
                      >
                        {a.icon}
                      </motion.span>
                      <span className="text-[11px] font-semibold text-neutral-600">{a.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
