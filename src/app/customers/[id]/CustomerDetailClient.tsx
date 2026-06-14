'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatRupiah, formatJuta } from '@/lib/calculations';
import Modal from '@/components/Modal';
import Link from 'next/link';
import { fadeIn, AnimatedCard, staggerContainer, staggerItem } from '@/components/animations';
import type { Customer } from '@/types';

interface MonthData {
  month: number;
  year: number;
}

export default function CustomerDetailClient({
  customer,
  customerId,
  customerName,
  bonusesAvailable,
  accumulatedOmzet,
  months,
}: {
  customer: Customer;
  customerId: string;
  customerName: string;
  bonusesAvailable: number;
  accumulatedOmzet: number;
  months: MonthData[];
}) {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={fadeIn}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <Link href="/customers" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">{customerName}</h1>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/customers/${customerId}/edit`}
              className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Edit
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/transactions/new?customer=${customerId}`}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              + Bon Baru
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-3 group">
            <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Diskon LM</p>
            <p className="text-sm font-medium">
              {customer.diskon_lm.length > 0
                ? customer.diskon_lm.map((d, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-zinc-300 mx-1">→</span>}
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{d}%</span>
                    </span>
                  ))
                : '-'}
            </p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-3 group">
            <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Diskon BR</p>
            <p className="text-sm font-medium">
              {customer.diskon_br.length > 0
                ? customer.diskon_br.map((d, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-zinc-300 mx-1">→</span>}
                      <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs">{d}%</span>
                    </span>
                  ))
                : '-'}
            </p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-3 group">
            <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Threshold Bonus</p>
            <p className="text-sm font-medium">{formatRupiah(customer.bonus_threshold)}</p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-3 group">
            <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Bonus Tersedia</p>
            <p className="text-sm font-medium text-green-600">
              <motion.span
                key={bonusesAvailable}
                initial={{ scale: 1.4, color: '#059669' }}
                animate={{ scale: 1, color: '#16a34a' }}
              >
                {bonusesAvailable}
              </motion.span>
              {' '}bonus · Akumulasi: {formatJuta(accumulatedOmzet)}
            </p>
          </AnimatedCard>
        </motion.div>
      </motion.div>

      {months.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 text-zinc-500"
        >
          <p>Belum ada transaksi untuk customer ini</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {months.map((m) => (
            <MonthSection
              key={`${m.year}-${m.month}`}
              customerId={customerId}
              customerName={customerName}
              monthNum={m.month}
              year={m.year}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function MonthSection({
  customerId,
  customerName,
  monthNum,
  year,
}: {
  customerId: string;
  customerName: string;
  monthNum: number;
  year: number;
}) {
  const router = useRouter();
  const [data, setData] = useState<{
    transactions: Array<{
      id: string;
      tanggal: string;
      nomor_bon: string;
      status: string;
      ongkir: number;
      is_bonus: boolean;
      amountOwed: number;
      omzet: number;
      laba: number;
      omzetLM: number;
      omzetBR: number;
    }>;
    totalPiutang: number;
    totalDibayar: number;
    totalOmzet: number;
    totalLaba: number;
    totalOmzetLM: number;
    totalOmzetBR: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [settleModal, setSettleModal] = useState(false);
  const [settleDate, setSettleDate] = useState(new Date().toISOString().slice(0, 10));
  const [settling, setSettling] = useState(false);
  const [apiError, setApiError] = useState('');

  const loadData = async () => {
    if (data) { setShow(!show); return; }
    setLoading(true);
    setApiError('');
    const res = await fetch(
      `/api/customers/${customerId}/monthly?month=${monthNum}&year=${year}`
    );
    const json = await res.json();
    if (!res.ok) {
      setApiError(json.error || 'Gagal memuat data');
      setLoading(false);
      return;
    }
    setData(json);
    setLoading(false);
    setShow(true);
  };

  const handleSettleMonth = async () => {
    const monthName = MONTH_NAMES[monthNum - 1] || '';
    if (!confirm(`Lunasi semua transaksi ${monthName} ${year} untuk ${customerName}?`))
      return;
    setSettling(true);
    const res = await fetch(`/api/customers/${customerId}/settle-month`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: monthNum, year, payment_date: settleDate }),
    });
    if (res.ok) {
      setData(null);
      setShow(false);
      setSettleModal(false);
      router.refresh();
    }
    setSettling(false);
  };

  const handleSettleSingle = async (txId: string) => {
    if (!confirm(`Lunasi transaksi ini?`)) return;
    const res = await fetch(`/api/transactions/${txId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_date: settleDate }),
    });
    if (res.ok) {
      setData(null);
      setShow(false);
      router.refresh();
    }
  };

  const monthLabel = `${MONTH_NAMES[monthNum - 1] || ''} ${year}`;

  return (
    <AnimatedCard>
      <motion.button
        whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
        onClick={loadData}
        className="w-full p-4 flex items-center justify-between text-left transition-colors"
      >
        <h3 className="font-semibold text-zinc-900">{monthLabel}</h3>
        <motion.span
          animate={{ rotate: show ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-400 text-sm"
        >
          ▼
        </motion.span>
      </motion.button>

      {loading && (
        <div className="p-4 flex items-center gap-2 text-sm text-zinc-500">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full"
          />
          Memuat...
        </div>
      )}

      {apiError && <div className="p-4 text-sm text-red-600">{apiError}</div>}

      {show && data && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t overflow-hidden"
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-zinc-50 text-sm">
            <div>
              <p className="text-xs text-zinc-500">Total Piutang</p>
              <p className="font-medium text-red-600">{formatRupiah(data.totalPiutang)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Sudah Dibayar</p>
              <p className="font-medium text-green-600">{formatRupiah(data.totalDibayar)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Omzet LM</p>
              <p className="font-medium">{formatRupiah(data.totalOmzetLM)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Omzet BR</p>
              <p className="font-medium">{formatRupiah(data.totalOmzetBR)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Laba HL</p>
              <p className="font-medium">{formatRupiah(data.totalLaba)}</p>
            </div>
          </div>

          {data.totalPiutang > 0 && (
            <div className="px-4 py-2 border-b">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSettleModal(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                ✓ Lunasi Semua ({formatRupiah(data.totalPiutang)})
              </motion.button>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Tanggal</th>
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Nomor Bon</th>
                <th className="text-left p-3 font-medium text-xs text-zinc-500">Status</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Jumlah</th>
                <th className="text-right p-3 font-medium text-xs text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {data.transactions.map((tx) => (
                <motion.tr
                  key={tx.id}
                  variants={staggerItem}
                  className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="p-3">{tx.tanggal}</td>
                  <td className="p-3">
                    <Link href={`/transactions/${tx.id}`} className="font-medium hover:underline">
                      {tx.nomor_bon}
                    </Link>
                    {tx.is_bonus && (
                      <span className="ml-1.5 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                        Bonus
                      </span>
                    )}
                  </td>
                  <td className="p-3">
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
                  <td className="p-3 text-right font-medium">{formatRupiah(tx.amountOwed)}</td>
                  <td className="p-3 text-right">
                    {tx.status === 'Piutang' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSettleSingle(tx.id)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Lunas
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>

          <Modal
            open={settleModal}
            onClose={() => setSettleModal(false)}
            title={`Lunasi ${monthLabel} - ${customerName}`}
          >
            <div className="space-y-4">
              <p className="text-sm text-zinc-600">
                Semua transaksi Piutang di bulan ini akan ditandai Lunas.
                Total: <strong>{formatRupiah(data.totalPiutang)}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Tanggal Pelunasan
                </label>
                <input
                  type="date"
                  value={settleDate}
                  onChange={(e) => setSettleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSettleMonth}
                  disabled={settling}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {settling ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Memproses...
                    </span>
                  ) : (
                    'Konfirmasi Lunas'
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSettleModal(false)}
                  className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </motion.button>
              </div>
            </div>
          </Modal>
        </motion.div>
      )}
    </AnimatedCard>
  );
}
