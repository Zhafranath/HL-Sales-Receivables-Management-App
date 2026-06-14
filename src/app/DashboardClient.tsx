'use client';

import { motion } from 'framer-motion';
import { formatRupiah, getTransactionLineData } from '@/lib/calculations';
import AnimatedNumber, { AnimatedRupiah } from '@/components/AnimatedNumber';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';
import type { Transaction, MonthlyDatum, TopCustomer } from '@/types';

interface DashboardClientProps {
  customerCount: number;
  productCount: number;
  totalPiutang: number;
  totalLaba: number;
  lunasCount: number;
  piutangCount: number;
  omzetLM: number;
  omzetBR: number;
  monthlyData: MonthlyDatum[];
  topCustomers: TopCustomer[];
  transactions: Transaction[];
}

const quickActions = [
  { href: '/transactions/new', label: 'Buat Bon Baru', icon: '📝' },
  { href: '/customers/new', label: 'Tambah Customer', icon: '👤' },
  { href: '/products/new', label: 'Tambah Produk', icon: '📦' },
  { href: '/reports', label: 'Lihat Rekap', icon: '📈' },
];

export default function DashboardClient({
  customerCount,
  productCount,
  totalPiutang,
  totalLaba,
  lunasCount,
  piutangCount,
  omzetLM,
  omzetBR,
  monthlyData,
  topCustomers,
  transactions,
}: DashboardClientProps) {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.h1
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 }}
        className="text-2xl font-bold text-zinc-900"
      >
        Dashboard
      </motion.h1>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group cursor-default">
            <p className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
              Total Customer
            </p>
            <motion.p
              key={customerCount}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold mt-1"
            >
              <AnimatedNumber value={customerCount} />
            </motion.p>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group cursor-default">
            <p className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
              Total Produk
            </p>
            <motion.p
              key={productCount}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold mt-1"
            >
              <AnimatedNumber value={productCount} />
            </motion.p>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group cursor-default">
            <p className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
              Total Piutang
            </p>
            <motion.p
              key={totalPiutang}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-red-600 mt-1"
            >
              <AnimatedRupiah value={totalPiutang} />
            </motion.p>
            <p className="text-xs text-zinc-400 mt-0.5">{piutangCount} bon</p>
          </AnimatedCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group cursor-default">
            <p className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
              Total Laba HL
            </p>
            <motion.p
              key={totalLaba}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-green-600 mt-1"
            >
              <AnimatedRupiah value={totalLaba} />
            </motion.p>
            <p className="text-xs text-zinc-400 mt-0.5">{lunasCount} bon lunas</p>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      <DashboardCharts
        monthlyData={monthlyData}
        topCustomers={topCustomers}
        omzetLM={omzetLM}
        omzetBR={omzetBR}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <AnimatedCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Transaksi Terbaru</h2>
              <Link
                href="/transactions"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Lihat semua →
              </Link>
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-zinc-400">Belum ada transaksi</p>
            ) : (
              <div className="space-y-1">
                {transactions.map((tx, idx) => {
                  const computed = getTransactionLineData(tx);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + idx * 0.04 }}
                    >
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-medium group-hover:text-zinc-900 transition-colors">
                            {tx.nomor_bon}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {tx.tanggal} · {tx.customer?.nama || '-'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatRupiah(computed.amountOwed)}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              tx.status === 'Lunas'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {tx.status}
                            {tx.is_bonus && ' · Bonus'}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatedCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <AnimatedCard className="p-4">
            <h2 className="font-semibold mb-3">Aksi Cepat</h2>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 text-sm font-medium transition-all group"
                  >
                    <motion.span
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {action.icon}
                    </motion.span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {action.label}
                    </span>
                    <motion.span
                      className="ml-auto text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all"
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
