import { verifySession } from '@/lib/auth';
import { formatRupiah } from '@/lib/calculations';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  await verifySession();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Rekap / Laporan</h1>
      <ReportsClient />
    </div>
  );
}
