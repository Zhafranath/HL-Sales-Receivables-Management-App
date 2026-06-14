'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatRupiah, formatJuta } from '@/lib/calculations';
import Modal from '@/components/Modal';
import Link from 'next/link';
import { fadeIn, AnimatedCard, staggerContainer, staggerItem } from '@/components/animations';
import EmptyState from '@/components/EmptyState';
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
          <Link href="/customers" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">{customerName}</h1>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/customers/${customerId}/edit`}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Edit
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={`/transactions/new?customer=${customerId}`}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
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
          <AnimatedCard className="p-4 group">
            <p className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors">Diskon LM</p>
            <p className="text-sm font-medium mt-0.5">
              {customer.diskon_lm.length > 0
                ? customer.diskon_lm.map((d, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-neutral-300 mx-1">→</span>}
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{d}%</span>
                    </span>
                  ))
                : '-'}
            </p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group">
            <p className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors">Diskon BR</p>
            <p className="text-sm font-medium mt-0.5">
              {customer.diskon_br.length > 0
                ? customer.diskon_br.map((d, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-neutral-300 mx-1">→</span>}
                      <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-xs">{d}%</span>
                    </span>
                  ))
                : '-'}
            </p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group">
            <p className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors">Threshold Bonus</p>
            <p className="text-sm font-medium mt-0.5">{formatRupiah(customer.bonus_threshold)}</p>
          </AnimatedCard>
        </motion.div>
        <motion.div variants={staggerItem}>
          <AnimatedCard className="p-4 group">
            <p className="text-xs text-neutral-500 group-hover:text-neutral-700 transition-colors">Bonus Tersedia</p>
            <p className="text-sm font-medium text-emerald-600 mt-0.5">
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
        <EmptyState
          icon="📋"
          title="Belum ada transaksi"
          description="Customer ini belum memiliki transaksi"
          actionLabel="Buat Bon"
          actionHref={`/transactions/new?customer=${customerId}`}
        />
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

type MonthDataDetail = {
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
};

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
  const [data, setData] = useState<MonthDataDetail | null>(null);
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

  const handlePrintPDF = async () => {
    if (!data) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('p', 'mm', 'a4');
    const monthLabel = `${MONTH_NAMES[monthNum - 1]} ${year}`;
    const w = doc.internal.pageSize.width;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Header
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, w, 40, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`HL APP — ${customerName}`, 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 240, 220);
    doc.text(monthLabel, 14, 28);
    doc.text(`Dicetak: ${today}`, 14, 35);

    // Summary
    let y = 50;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: 14 },
      tableWidth: 100,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: [245, 245, 245], textColor: [100, 100, 100], fontStyle: 'bold' },
      body: [
        ['Total Piutang', { content: formatRupiah(data.totalPiutang), styles: { halign: 'right', fontStyle: 'bold', textColor: [220, 50, 50] } }],
        ['Sudah Dibayar', { content: formatRupiah(data.totalDibayar), styles: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } }],
        ['Omzet LM', { content: formatRupiah(data.totalOmzetLM), styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] } }],
        ['Omzet BR', { content: formatRupiah(data.totalOmzetBR), styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] } }],
        ['Laba HL', { content: formatRupiah(data.totalLaba), styles: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } }],
      ],
      columns: [
        { header: 'Keterangan', dataKey: 0 },
        { header: 'Jumlah', dataKey: 1 },
      ],
    });

    // Transaction table
    y = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Daftar Transaksi', 14, y);

    const txRows = data.transactions.map((tx) => [
      tx.tanggal,
      tx.is_bonus ? `${tx.nomor_bon} (Bonus)` : tx.nomor_bon,
      { content: tx.status, styles: { textColor: tx.status === 'Lunas' ? [5, 150, 105] : [180, 130, 0], fontStyle: 'bold' } },
      { content: formatRupiah(tx.amountOwed), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatRupiah(tx.omzetLM), styles: { halign: 'right' } },
      { content: formatRupiah(tx.omzetBR), styles: { halign: 'right' } },
    ]);

    autoTable(doc, {
      startY: y + 4,
      margin: { left: 14, right: 14 },
      head: [['Tanggal', 'Nomor Bon', 'Status', 'Jumlah', 'Omzet LM', 'Omzet BR']],
      body: txRows as any,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 48 },
        2: { cellWidth: 22, halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      didDrawPage: () => {
        const h = doc.internal.pageSize.height;
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(`${customerName} — ${monthLabel}`, 14, h - 8);
        doc.text(today, w - 14, h - 8, { align: 'right' });
      },
    });

    doc.save(`${customerName.toLowerCase().replace(/\s+/g, '-')}-${year}-${String(monthNum).padStart(2, '0')}.pdf`);
  };

  const monthLabel = `${MONTH_NAMES[monthNum - 1] || ''} ${year}`;

  return (
    <AnimatedCard>
      <motion.button
        whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
        onClick={loadData}
        className="w-full p-4 flex items-center justify-between text-left transition-colors"
      >
        <h3 className="font-semibold text-neutral-900">{monthLabel}</h3>
        <motion.span
          animate={{ rotate: show ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-neutral-400 text-sm"
        >
          ▼
        </motion.span>
      </motion.button>

      {loading && (
        <div className="p-4 flex items-center gap-2 text-sm text-neutral-500">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full"
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-neutral-50 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Total Piutang</p>
              <p className="font-medium text-red-600">{formatRupiah(data.totalPiutang)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Sudah Dibayar</p>
              <p className="font-medium text-emerald-600">{formatRupiah(data.totalDibayar)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Omzet LM</p>
              <p className="font-medium">{formatRupiah(data.totalOmzetLM)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Omzet BR</p>
              <p className="font-medium">{formatRupiah(data.totalOmzetBR)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Laba HL</p>
              <p className="font-medium">{formatRupiah(data.totalLaba)}</p>
            </div>
          </div>

          <div className="px-4 py-2 border-b flex items-center justify-between gap-2">
            {data.totalPiutang > 0 && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSettleModal(true)}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                ✓ Lunasi Semua ({formatRupiah(data.totalPiutang)})
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrintPDF}
              className="text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors ml-auto"
            >
              📄 PDF
            </motion.button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Tanggal</th>
                <th className="text-left p-3 font-medium text-xs text-neutral-500">Nomor Bon</th>
                <th className="text-center p-3 font-medium text-xs text-neutral-500">Status</th>
                <th className="text-right p-3 font-medium text-xs text-neutral-500">Jumlah</th>
                <th className="text-center p-3 font-medium text-xs text-neutral-500">Aksi</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
              {data.transactions.map((tx) => (
                <motion.tr
                  key={tx.id}
                  variants={staggerItem}
                  className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors"
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
                  <td className="p-3 text-center">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tx.status}
                    </motion.span>
                  </td>
                  <td className="p-3 text-right font-medium">{formatRupiah(tx.amountOwed)}</td>
                  <td className="p-3 text-center">
                    {tx.status === 'Piutang' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSettleSingle(tx.id)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
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
              <p className="text-sm text-neutral-600">
                Semua transaksi Piutang di bulan ini akan ditandai Lunas.
                Total: <strong>{formatRupiah(data.totalPiutang)}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tanggal Pelunasan
                </label>
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
                  onClick={handleSettleMonth}
                  disabled={settling}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
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
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
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
