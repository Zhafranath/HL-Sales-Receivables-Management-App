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

type ReportData = {
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
};

export default function ReportsClient() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [report, setReport] = useState<ReportData | null>(null);
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
    loadReport();
  }, [month, year]);

  const handlePrintPDF = async () => {
    if (!report) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF('p', 'mm', 'a4');
    const w = doc.internal.pageSize.width;
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const filterLabel = month
      ? `${MONTHS.find((m) => m.value === month)?.label} ${year}`
      : `Tahun ${year}`;

    // ── HEADER BAND ──
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, w, 44, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HL  APP', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 240, 220);
    doc.text('Laporan Keuangan', 14, 29);
    doc.text(`Periode: ${filterLabel}`, 14, 36);

    // ── SUMMARY TABLE ──
    let y = 54;
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: 14 },
      tableWidth: 90,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [245, 245, 245], textColor: [100, 100, 100], fontStyle: 'bold' },
      body: [
        ['Omzet LM', { content: formatRupiah(report.totalOmzetLM), styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] } }],
        ['Omzet BR', { content: formatRupiah(report.totalOmzetBR), styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] } }],
        ['Total Omzet', { content: formatRupiah(report.totalOmzet), styles: { halign: 'right', fontStyle: 'bold', textColor: [30, 30, 30] } }],
        ['Laba HL', { content: formatRupiah(report.totalLaba), styles: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } }],
        ['Piutang', { content: formatRupiah(report.totalPiutang), styles: { halign: 'right', fontStyle: 'bold', textColor: [220, 50, 50] } }],
        ['Sudah Dibayar', { content: formatRupiah(report.totalDibayar), styles: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } }],
      ] as any,
      columns: [
        { header: 'Keterangan', dataKey: 0 },
        { header: 'Jumlah', dataKey: 1 },
      ],
    });

    // ── CUSTOMER TABLE ──
    y = (doc as any).lastAutoTable.finalY + 14;
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Per Customer', 14, y);

    const customerRows = report.customerReports.map((cr, i) => [
      i + 1,
      cr.customer_name,
      formatRupiah(cr.total_omzet_lm),
      formatRupiah(cr.total_omzet_br),
      formatRupiah(cr.total_omzet),
      { content: formatRupiah(cr.total_laba), styles: { textColor: [5, 150, 105] } },
      { content: formatRupiah(cr.total_piutang), styles: { textColor: [220, 50, 50] } },
      formatRupiah(cr.total_dibayar),
    ]);

    autoTable(doc, {
      startY: y + 4,
      margin: { left: 14, right: 14 },
      head: [['#', 'Customer', 'Omzet LM', 'Omzet BR', 'Total Omzet', 'Laba', 'Piutang', 'Dibayar']],
      body: (customerRows.length > 0 ? customerRows : [['', 'Tidak ada data customer', '', '', '', '', '', '']]) as any,
      theme: 'striped',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right' },
      },
      didDrawPage: () => {
        const h = doc.internal.pageSize.height;
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(`HL App — Laporan ${filterLabel}`, 14, h - 8);
        doc.text(today, w - 14, h - 8, { align: 'right' });
      },
    });

    // ── TOTAL ROW ──
    const finalY = (doc as any).lastAutoTable.finalY + 2;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.3);
    doc.line(14, finalY, w - 14, finalY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const totalLabel = report.customerReports.length > 0
      ? `${report.customerReports.length} Customer`
      : '';
    doc.text(totalLabel, 14, finalY + 6);
    doc.text(`Total Omzet: ${formatRupiah(report.totalOmzet)}  |  Laba: ${formatRupiah(report.totalLaba)}  |  Piutang: ${formatRupiah(report.totalPiutang)}`, w - 14, finalY + 6, { align: 'right' });

    doc.save(`laporan-hl-${year}${month ? '-' + month : ''}.pdf`);
  };

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={fadeIn}>
      <AnimatedCard className="p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-28 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
            />
          </div>
          {loading && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-3.5 h-3.5 border-2 border-neutral-300 border-t-emerald-600 rounded-full"
            />
          )}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePrintPDF}
            disabled={!report}
            className="px-5 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-40"
          >
            📄 Download PDF
          </motion.button>
        </div>
      </AnimatedCard>

      {report && (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <AnimatedCard className="p-5">
            <h2 className="font-semibold text-neutral-900 mb-4">Ringkasan</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-medium mb-0.5">Omzet LM</p>
                <p className="font-semibold text-sm"><AnimatedRupiah value={report.totalOmzetLM} /></p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-amber-600 font-medium mb-0.5">Omzet BR</p>
                <p className="font-semibold text-sm"><AnimatedRupiah value={report.totalOmzetBR} /></p>
              </div>
              <div className="bg-neutral-100 rounded-xl p-3">
                <p className="text-xs text-neutral-600 font-medium mb-0.5">Total Omzet</p>
                <p className="font-semibold text-sm"><AnimatedRupiah value={report.totalOmzet} /></p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-medium mb-0.5">Laba HL</p>
                <p className="font-semibold text-sm text-emerald-700"><AnimatedRupiah value={report.totalLaba} /></p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs text-red-600 font-medium mb-0.5">Piutang</p>
                <p className="font-semibold text-sm text-red-700"><AnimatedRupiah value={report.totalPiutang} /></p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-xs text-emerald-600 font-medium mb-0.5">Dibayar</p>
                <p className="font-semibold text-sm text-emerald-700"><AnimatedRupiah value={report.totalDibayar} /></p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="text-left p-3 font-medium text-xs text-neutral-500">Customer</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Omzet LM</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Omzet BR</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Total Omzet</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Laba</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Piutang</th>
                  <th className="text-right p-3 font-medium text-xs text-neutral-500">Dibayar</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
                {report.customerReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-neutral-400">Tidak ada data customer</td>
                  </tr>
                ) : (
                  report.customerReports.map((cr, idx) => (
                    <motion.tr
                      key={idx}
                      variants={staggerItem}
                      className="border-b last:border-0 hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="p-3 font-medium">{cr.customer_name}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_omzet_lm)}</td>
                      <td className="p-3 text-right">{formatRupiah(cr.total_omzet_br)}</td>
                      <td className="p-3 text-right font-medium">{formatRupiah(cr.total_omzet)}</td>
                      <td className="p-3 text-right text-emerald-600 font-medium">{formatRupiah(cr.total_laba)}</td>
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
