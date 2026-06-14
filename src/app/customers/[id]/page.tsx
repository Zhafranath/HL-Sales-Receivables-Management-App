import { verifySession } from '@/lib/auth';
import { getCustomer } from '@/lib/db/customers';
import { getTransactionsByCustomer } from '@/lib/db/transactions';
import { getAccumulatedPaidOmzet, getBonusesGranted } from '@/lib/db/reports';
import { computeBonusesAvailable, formatRupiah, formatJuta } from '@/lib/calculations';
import { notFound } from 'next/navigation';
import CustomerDetailClient from './CustomerDetailClient';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  const allTransactions = await getTransactionsByCustomer(id);

  const [accumulatedOmzet, bonusesGrantedCount] = await Promise.all([
    getAccumulatedPaidOmzet(id),
    getBonusesGranted(id),
  ]);

  const bonusesAvailable = computeBonusesAvailable(
    accumulatedOmzet,
    customer.bonus_threshold,
    Math.floor(bonusesGrantedCount / (customer.bonus_threshold || 1))
  );

  const months = new Map<string, { month: number; year: number }>();
  for (const tx of allTransactions) {
    const d = new Date(tx.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months.has(key)) {
      months.set(key, { month: d.getMonth() + 1, year: d.getFullYear() });
    }
  }

  const sortedMonths = Array.from(months.values()).sort(
    (a, b) => b.year - a.year || b.month - a.month
  );

  return (
    <CustomerDetailClient
      customer={customer}
      customerId={customer.id}
      customerName={customer.nama}
      bonusesAvailable={bonusesAvailable}
      accumulatedOmzet={accumulatedOmzet}
      months={sortedMonths}
    />
  );
}
