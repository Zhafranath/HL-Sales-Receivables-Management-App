'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/calculations';
import AnimatedNumber, { AnimatedRupiah } from '@/components/AnimatedNumber';
import { fadeIn, staggerContainer, staggerItem, AnimatedCard } from '@/components/animations';

const MONTHS = [
  { value: '', label: 'Semua Bulan' },
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export default function ReportsClient() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [report, setReport] = useState<{
    totalOmzetLM: number;
    totalOmzetBR: number;
    totalOmzet: number;
    totalLaba: number;
    totalPiutang: number;
    totalDibayar: number;
    customerReports: Array<{
      customer_name: string;
      total_omzet_lm: number;
      total_omzet_br: number;
      total_omzet: number;
      total_laba: number;
      total_piutang: number;
      total_dibayar: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async (m?: string, y?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    const useMonth = m !== undefined ? m : month;
    const useYear = y !== undefined ? y : year;
    if (useMonth) params.set('month', useMonth);
    if (useYear) params.set('year', useYear);

    const res = await fetch(`/api/reports?${params}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();
  }, []);

  const handlePrintPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('HL App - Laporan', 14, 20);
    doc.setFontSize(11);
    const filterLabel = month
      ? `${MONTHS.find((m) => m.value === month)?.label} ${year}`
      : `${year}`;
    doc.text(`Periode: ${filterLabel}`, 14, 30);
    let y = 40;
    doc.setFontSize(13);
    doc.text('Ringkasan', 14, y);
    y += 8;
    doc.setFontSize(10);
    if (report) {
      const rows = [
        ['Total Omzet LM', formatRupiah(report.totalOmzetLM)],
        ['Total Omzet BR', formatRupiah(report.totalOmzetBR)],
        ['Total Omzet', formatRupiah(report.totalOmzet)],
        ['Total Laba HL', formatRupiah(report.totalLaba)],
        ['Total Piutang', formatRupiah(report.totalPiutang)],
        ['Total Dibayar', formatRupiah(report.totalDibayar)],
      ];
      for (const [label, value] of rows) {
        doc.text(`${label}: ${value}`, 14, y);
        y += 6;
      }
      y += 8;
      doc.setFontSize(13);
      doc.text('Per Customer', 14, y);
      y += 8;
      doc.setFontSize(10);
      if (report.customerReports.length === 0) {
        doc.text('Tidak ada data customer', 14, y);
      } else {
        for (const cr of report.customerReports) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(cr.customer_name, 14, y);
          y += 5;
          doc.text(`  Omzet LM: ${formatRupiah(cr.total_omzet_lm)} | Omzet BR: ${formatRupiah(cr.total_omzet_br)}`, 14, y);
          y += 5;
          doc.text(`  Laba: ${formatRupiah(cr.total_laba)} | Piutang: ${formatRupiah(cr.total_piutang)} | Dibayar: ${formatRupiah(cr.total_dibayar)}`, 14, y);
          y += 7;
        }
      }
    }
    doc.save(`laporan-hl-${year}${month ? '-' + month : ''}.pdf`);
  };

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>

      <AnimatedCard className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-24 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => loadReport()}
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                />
                Memuat...
              </span>
            ) : (
              'Tampilkan'
            )}
          </motion.button>
          {report && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrintPDF}
              className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              📄 Download PDF
            </motion.button>
          )}
        </div>
      </AnimatedCard>

      {report && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <AnimatedCard className="p-4">
            <h2 className="font-semibold mb-3">Ringkasan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Omzet LM</p>
                <p className="font-medium"><AnimatedRupiah value={report.totalOmzetLM} /></p>
              </div>
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Omzet BR</p>
                <p className="font-medium"><AnimatedRupiah value={report.totalOmzetBR} /></p>
              </div>
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Total Omzet</p>
                <p className="font-medium"><AnimatedRupiah value={report.totalOmzet} /></p>
              </div>
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Laba HL</p>
                <p className="font-medium text-green-600"><AnimatedRupiah value={report.totalLaba} /></p>
              </div>
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Piutang</p>
                <p className="font-medium text-red-600"><AnimatedRupiah value={report.totalPiutang} /></p>
              </div>
              <div className="group">
                <p className="text-xs text-zinc-500 group-hover:text-zinc-700 transition-colors">Dibayar</p>
                <p className="font-medium text-green-600"><AnimatedRupiah value={report.totalDibayar} /></p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-zinc-50">
                  <th className="text-left p-3 font-medium text-xs text-zinc-500">Customer</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Omzet LM</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Omzet BR</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Total Omzet</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Laba</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Piutang</th>
                  <th className="text-right p-3 font-medium text-xs text-zinc-500">Dibayar</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {report.customerReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-zinc-400">Tidak ada data</td>
                  </tr>
                ) : (
                  report.customerReports.map((cr, idx) => (
                    <motion.tr
                      key={idx}
                      variants={staggerItem}
                      className="border-b last:border-0 hover:bg-zinc-50/50 transition-colors"
                    >
                      <td className="p-3 font-medium">{cr.customer_name}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_omzet_lm)}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_omzet_br)}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_omzet)}</td>
                      <td className="p-3 text-right text-green-600">{formatRupiah(cr.total_laba)}</td>
                      <td className="p-3 text-right text-red-600">{formatRupiah(cr.total_piutang)}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_dibayar)}</td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
            </div>
          </AnimatedCard>
        </motion.div>
      )}
    </motion.div>
  );
}
