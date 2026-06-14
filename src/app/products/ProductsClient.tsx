'use client';

import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';
import type { Product } from '@/types';
import EmptyState from '@/components/EmptyState';
import TypeBadge from '@/components/TypeBadge';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

export default function ProductsClient({ products }: { products: Product[] }) {
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-neutral-900">Produk</h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/products/new"
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            + Tambah Produk
          </Link>
        </motion.div>
      </motion.div>

      {products.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Belum ada produk"
          description="Tambahkan produk ke katalog Anda"
          actionLabel="Tambah Produk"
          actionHref="/products/new"
        />
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Nama</th>
                <th className="text-center p-3 font-medium text-xs text-neutral-500">Tipe</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Harga Modal</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Harga Jual</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {products.map((p) => (
                <motion.tr
                  key={p.id}
                  variants={staggerItem}
                  className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="p-3 font-medium text-neutral-900">{p.nama}</td>
                  <td className="p-3 text-center">
                    <TypeBadge tipe={p.tipe} />
                  </td>
                  <td className="p-3 text-right text-neutral-500">{formatRupiah(p.harga_modal)}</td>
                  <td className="p-3 text-right font-medium">{formatRupiah(p.harga_base)}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="text-neutral-500 hover:text-neutral-900 text-xs transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} name={p.nama} />
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
