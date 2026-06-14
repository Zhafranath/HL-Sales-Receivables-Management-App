'use client';

import { motion } from 'framer-motion';
import { formatRupiah, getTransactionLineData } from '@/lib/calculations';
import Link from 'next/link';
import type { Transaction } from '@/types';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

export default function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-zinc-900">Bon</h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/transactions/new"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            + Buat Bon
          </Link>
        </motion.div>
      </motion.div>

      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 text-zinc-500"
        >
          <p className="text-lg">Belum ada transaksi</p>
          <p className="text-sm mt-1">Buat bon pertama Anda</p>
        </motion.div>
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Tanggal</th>
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Nomor Bon</th>
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Customer</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Jumlah</th>
                <th className="text-center p-3 font-medium text-xs text-zinc-500">Status</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {transactions.map((tx) => {
                const computed = getTransactionLineData(tx);
                return (
                  <motion.tr
                    key={tx.id}
                    variants={staggerItem}
                    className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="p-3 text-zinc-600">{tx.tanggal}</td>
                    <td className="p-3">
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="font-medium hover:underline"
                      >
                        {tx.nomor_bon}
                      </Link>
                      {tx.is_bonus && (
                        <span className="ml-1.5 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                          Bonus
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-600">{tx.customer?.nama || '-'}</td>
                    <td className="p-3 text-right font-medium">
                      {formatRupiah(computed.amountOwed)}
                    </td>
                    <td className="p-3 text-center">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tx.status === 'Lunas'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {tx.status}
                      </motion.span>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  );
}
