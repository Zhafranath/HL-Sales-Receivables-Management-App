'use client';

import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';
import type { Product } from '@/types';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

export default function ProductsClient({ products }: { products: Product[] }) {
  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-zinc-900">Produk</h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/products/new"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            + Tambah Produk
          </Link>
        </motion.div>
      </motion.div>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 text-zinc-500"
        >
          <p className="text-lg">Belum ada produk</p>
          <p className="text-sm mt-1">Tambahkan produk untuk memulai</p>
        </motion.div>
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Nama</th>
                <th className="text-center p-3 font-medium text-xs text-zinc-500">Tipe</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Harga Modal</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Harga Jual</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {products.map((p) => (
                <motion.tr
                  key={p.id}
                  variants={staggerItem}
                  className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="p-3 font-medium text-zinc-900">{p.nama}</td>
                  <td className="p-3 text-center">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.tipe === 'LM'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.tipe}
                    </motion.span>
                  </td>
                  <td className="p-3 text-right text-zinc-500">{formatRupiah(p.harga_modal)}</td>
                  <td className="p-3 text-right font-medium">{formatRupiah(p.harga_base)}</td>
                  <td className="p-3 text-right space-x-3">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="text-zinc-500 hover:text-zinc-900 text-xs transition-colors"
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
