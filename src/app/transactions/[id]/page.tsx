import { verifySession } from '@/lib/auth';
import { getTransaction } from '@/lib/db/transactions';
import { formatRupiah, getTransactionLineData } from '@/lib/calculations';
import { notFound } from 'next/navigation';
import TransactionDetailClient from './TransactionDetailClient';

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const tx = await getTransaction(id);
  if (!tx) notFound();

  const computed = getTransactionLineData(tx);

  return <TransactionDetailClient tx={tx} computed={computed} />;
}
