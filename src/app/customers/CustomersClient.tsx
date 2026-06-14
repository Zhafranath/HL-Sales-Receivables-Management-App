'use client';

import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import Link from 'next/link';
import DeleteCustomerButton from './DeleteCustomerButton';
import type { Customer } from '@/types';
import EmptyState from '@/components/EmptyState';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

export default function CustomersClient({ customers }: { customers: Customer[] }) {
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-neutral-900">Customer</h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/customers/new"
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            + Tambah Customer
          </Link>
        </motion.div>
      </motion.div>

      {customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Belum ada customer"
          description="Daftarkan customer pertama Anda"
          actionLabel="Tambah Customer"
          actionHref="/customers/new"
        />
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Nama</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Diskon LM</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Diskon BR</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Threshold Bonus</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {customers.map((c) => (
                <motion.tr
                  key={c.id}
                  variants={staggerItem}
                  className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="p-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {c.nama}
                    </Link>
                  </td>
                  <td className="p-3 text-neutral-600">
                    {c.diskon_lm.length > 0
                      ? c.diskon_lm.map((d, i) => (
                          <span key={i}>
                            {i > 0 && <span className="text-neutral-300 mx-1">→</span>}
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                              {d}%
                            </span>
                          </span>
                        ))
                      : '-'}
                  </td>
                  <td className="p-3 text-neutral-600">
                    {c.diskon_br.length > 0
                      ? c.diskon_br.map((d, i) => (
                          <span key={i}>
                            {i > 0 && <span className="text-neutral-300 mx-1">→</span>}
                            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs">
                              {d}%
                            </span>
                          </span>
                        ))
                      : '-'}
                  </td>
                  <td className="p-3 font-medium">{formatRupiah(c.bonus_threshold)}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="text-neutral-500 hover:text-neutral-900 text-xs transition-colors"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/customers/${c.id}/edit`}
                      className="text-neutral-500 hover:text-neutral-900 text-xs transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteCustomerButton id={c.id} name={c.nama} />
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  );
}
