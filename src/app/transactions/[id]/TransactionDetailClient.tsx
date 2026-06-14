'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah } from '@/lib/calculations';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';
import TypeBadge from '@/components/TypeBadge';
import type { Transaction } from '@/types';

export default function TransactionDetailClient({
  tx,
  computed,
}: {
  tx: Transaction;
  computed: {
    items: Array<{
      item: { id: string; product_id: string; quantity: number };
      product: { id: string; nama: string; harga_modal: number; harga_base: number; tipe: string } | undefined;
      discountedUnitPrice: number;
      lineOmzet: number;
      lineLaba: number;
    }>;
    transactionOmzet: number;
    transactionLaba: number;
    amountOwed: number;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [settleModal, setSettleModal] = useState(false);
  const [settleDate, setSettleDate] = useState(new Date().toISOString().slice(0, 10));
  const [settling, setSettling] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSettle = async () => {
    setSettling(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'Lunas', payment_date: settleDate, updated_at: new Date().toISOString() })
      .eq('id', tx.id);
    if (!error) {
      setSettleModal(false);
      toast('Transaksi berhasil dilunasi', 'success');
      router.refresh();
    }
    setSettling(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', tx.id);
    if (!error) {
      toast('Transaksi berhasil dihapus', 'success');
      router.push('/transactions');
    } else {
      toast('Gagal menghapus transaksi', 'error');
      setDeleting(false);
    }
  };

  return (
    <motion.div className="space-y-6 max-w-3xl" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Link href="/transactions" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">
            Bon {tx.nomor_bon}
            {tx.is_bonus && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium"
              >
                Bonus
              </motion.span>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/transactions/${tx.id}/edit`}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Edit
            </Link>
          </motion.div>
          {tx.status === 'Piutang' && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSettleModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              ✓ Lunas
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            Hapus
          </motion.button>
        </div>
      </motion.div>

      <AnimatedCard className="p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Tanggal</p>
            <p className="font-medium">{tx.tanggal}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Customer</p>
            <p className="font-medium">{tx.customer?.nama || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                tx.status === 'Lunas'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {tx.status}
            </motion.span>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Tgl Bayar</p>
            <p className="font-medium">{tx.payment_date || '-'}</p>
          </div>
        </div>

        {tx.deskripsi && (
          <div>
            <p className="text-xs text-neutral-500">Deskripsi</p>
            <p className="text-sm">{tx.deskripsi}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-neutral-500 mb-2">Item</p>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b">
                  <th className="text-left p-2.5 font-medium text-xs text-neutral-500">Produk</th>
                  <th className="text-center p-2.5 font-medium text-xs text-neutral-500">Tipe</th>
                  <th className="text-right p-2.5 font-medium text-xs text-neutral-500">Qty</th>
                  <th className="text-right p-2.5 font-medium text-xs text-neutral-500">Harga/Unit</th>
                  <th className="text-right p-2.5 font-medium text-xs text-neutral-500">Omzet</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {computed.items.map((ci, idx) => (
                  <motion.tr key={idx} variants={staggerItem} className="border-b last:border-0 hover:bg-neutral-50/50">
                    <td className="p-2.5 font-medium">{ci.product?.nama || '-'}</td>
                    <td className="p-2.5 text-center">
                      {ci.product?.tipe ? (
                        <TypeBadge tipe={ci.product.tipe as any} />
                      ) : '-'}
                    </td>
                    <td className="p-2.5 text-right">{ci.item.quantity}</td>
                    <td className="p-2.5 text-right">
                      {tx.is_bonus ? (
                        <span className="text-purple-600 font-medium">Gratis</span>
                      ) : (
                        formatRupiah(ci.discountedUnitPrice)
                      )}
                    </td>
                    <td className="p-2.5 text-right font-medium">
                      {tx.is_bonus ? (
                        <span className="text-purple-600">Gratis</span>
                      ) : (
                        formatRupiah(ci.lineOmzet)
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-4 space-y-1 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Omzet</span>
            <span className="font-medium">{formatRupiah(computed.transactionOmzet)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Ongkir</span>
            <span className="font-medium">{formatRupiah(tx.ongkir)}</span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between text-sm font-bold border-t pt-1"
          >
            <span>Total {tx.status === 'Piutang' ? 'Piutang' : 'Dibayar'}</span>
            <span>{formatRupiah(computed.amountOwed)}</span>
          </motion.div>
          {tx.status === 'Lunas' && !tx.is_bonus && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between text-sm text-green-600"
            >
              <span>Laba HL</span>
              <span className="font-medium">{formatRupiah(computed.transactionLaba)}</span>
            </motion.div>
          )}
        </div>
      </AnimatedCard>

      <Modal open={settleModal} onClose={() => setSettleModal(false)} title="Konfirmasi Pelunasan">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Transaksi akan ditandai Lunas. Omzet dan Laba akan diakui.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Pelunasan</label>
            <input
              type="date"
              value={settleDate}
              onChange={(e) => setSettleDate(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSettle}
              disabled={settling}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {settling ? 'Memproses...' : 'Konfirmasi'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSettleModal(false)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Batal
            </motion.button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Hapus Transaksi">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Hapus transaksi <strong>{tx.nomor_bon}</strong>? Tindakan tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDeleteModal(false)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Batal
            </motion.button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
