import { verifySession } from '@/lib/auth';
import { getTransaction } from '@/lib/db/transactions';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import TransactionForm from '@/components/TransactionForm';

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const tx = await getTransaction(id);
  if (!tx) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Edit Bon</h1>
      <div className="bg-white rounded-xl border p-6">
        <Suspense fallback={<div className="text-sm text-neutral-500">Memuat form...</div>}>
          <TransactionForm
            initialData={{
              id: tx.id,
              tanggal: tx.tanggal,
              nomor_bon: tx.nomor_bon,
              customer_id: tx.customer_id,
              ongkir: tx.ongkir,
              deskripsi: tx.deskripsi,
              is_bonus: tx.is_bonus,
              status: tx.status,
              items: (tx.items || []).map((item, i) => ({
                key: `item-${i}`,
                product_id: item.product_id,
                quantity: item.quantity,
              })),
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
