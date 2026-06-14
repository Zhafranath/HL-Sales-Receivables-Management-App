'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatRupiah, getTransactionLineData } from '@/lib/calculations';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { Transaction } from '@/types';
import EmptyState from '@/components/EmptyState';
import TypeBadge from '@/components/TypeBadge';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

export default function TransactionsClient({ transactions }: { transactions: Transaction[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [detailTx, setDetailTx] = useState<Transaction | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetNomor, setDeleteTargetNomor] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDetail = async (id: string) => {
    setDetailModal(true);
    setLoadingDetail(true);
    setDetailTx(null);
    try {
      const res = await fetch(`/api/transactions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailTx(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  };

  const openDelete = (id: string, nomor: string) => {
    setDeleteTargetId(id);
    setDeleteTargetNomor(nomor);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', deleteTargetId);
    if (!error) {
      toast('Transaksi berhasil dihapus', 'success');
      setDeleteModal(false);
      setDetailModal(false);
      router.refresh();
    } else {
      toast('Gagal menghapus transaksi', 'error');
      setDeleting(false);
    }
  };

  const detailComputed = detailTx ? getTransactionLineData(detailTx) : null;

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold text-neutral-900">Bon</h1>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/transactions/new"
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
          >
            + Buat Bon
          </Link>
        </motion.div>
      </motion.div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Belum ada transaksi"
          description="Buat bon pertama Anda untuk memulai"
          actionLabel="Buat Bon"
          actionHref="/transactions/new"
        />
      ) : (
        <AnimatedCard>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Tanggal</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Nomor Bon</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Customer</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Jumlah</th>
                <th className="text-center p-3 font-medium text-xs text-neutral-500">Status</th>
                <th className="text-center p-3 font-medium text-xs text-neutral-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {transactions.map((tx) => {
                const computed = getTransactionLineData(tx);
                return (
                  <motion.tr
                    key={tx.id}
                    variants={staggerItem}
                    className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="p-3 text-neutral-600">{tx.tanggal}</td>
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
                    <td className="p-3 text-neutral-600">{tx.customer?.nama || '-'}</td>
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
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDetail(tx.id)}
                          className="px-2 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => openDelete(tx.id, tx.nomor_bon)}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          </div>
        </AnimatedCard>
      )}

      {/* Detail Modal */}
      <Modal open={detailModal} onClose={() => { setDetailModal(false); setDetailTx(null); }} title={detailTx ? `Bon ${detailTx.nomor_bon}` : 'Detail Bon'}>
        {loadingDetail ? (
          <div className="py-6 text-center text-sm text-neutral-500">Memuat...</div>
        ) : detailTx && detailComputed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-neutral-500">Tanggal</p>
                <p className="font-medium text-sm">{detailTx.tanggal}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Customer</p>
                <p className="font-medium text-sm">{detailTx.customer?.nama || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Status</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  detailTx.status === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {detailTx.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Tgl Bayar</p>
                <p className="font-medium text-sm">{detailTx.payment_date || '-'}</p>
              </div>
            </div>

            {detailTx.deskripsi && (
              <div>
                <p className="text-xs text-neutral-500">Deskripsi</p>
                <p className="text-sm">{detailTx.deskripsi}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-neutral-500 mb-1.5">Item</p>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b">
                      <th className="text-left p-2 font-medium text-neutral-500">Produk</th>
                      <th className="text-center p-2 font-medium text-neutral-500">Tipe</th>
                      <th className="text-right p-2 font-medium text-neutral-500">Qty</th>
                      <th className="text-right p-2 font-medium text-neutral-500">Harga/Unit</th>
                      <th className="text-right p-2 font-medium text-neutral-500">Omzet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailComputed.items.map((ci, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-neutral-50/50">
                        <td className="p-2 font-medium">{ci.product?.nama || '-'}</td>
                        <td className="p-2 text-center">
                          {ci.product?.tipe ? (
                            <TypeBadge tipe={ci.product.tipe as any} />
                          ) : '-'}
                        </td>
                        <td className="p-2 text-right">{ci.item.quantity}</td>
                        <td className="p-2 text-right">
                          {detailTx.is_bonus ? (
                            <span className="text-purple-600 font-medium">Gratis</span>
                          ) : (
                            formatRupiah(ci.discountedUnitPrice)
                          )}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {detailTx.is_bonus ? (
                            <span className="text-purple-600">Gratis</span>
                          ) : (
                            formatRupiah(ci.lineOmzet)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-3 space-y-1 max-w-xs ml-auto text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Omzet</span>
                <span className="font-medium">{formatRupiah(detailComputed.transactionOmzet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ongkir</span>
                <span className="font-medium">{formatRupiah(detailTx.ongkir)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Total {detailTx.status === 'Piutang' ? 'Piutang' : 'Dibayar'}</span>
                <span>{formatRupiah(detailComputed.amountOwed)}</span>
              </div>
              {detailTx.status === 'Lunas' && !detailTx.is_bonus && (
                <div className="flex justify-between text-green-600">
                  <span>Laba HL</span>
                  <span className="font-medium">{formatRupiah(detailComputed.transactionLaba)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Link
                href={`/transactions/${detailTx.id}/edit`}
                onClick={() => setDetailModal(false)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors"
              >
                Edit
              </Link>
              <Link
                href={`/transactions/${detailTx.id}`}
                onClick={() => setDetailModal(false)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors"
              >
                Halaman Detail
              </Link>
              <button
                onClick={() => { setDetailModal(false); openDelete(detailTx.id, detailTx.nomor_bon); }}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors ml-auto"
              >
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-neutral-500">Gagal memuat detail</div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal} onClose={() => { if (!deleting) { setDeleteModal(false); setDeleteTargetId(null); } }} title="Hapus Transaksi">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Hapus transaksi <strong>{deleteTargetNomor}</strong>? Tindakan tidak dapat dibatalkan.
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
              onClick={() => { setDeleteModal(false); setDeleteTargetId(null); }}
              disabled={deleting}
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
