import { verifySession } from '@/lib/auth';
import { Suspense } from 'react';
import TransactionForm from '@/components/TransactionForm';

export default async function NewTransactionPage() {
  await verifySession();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Buat Bon Baru</h1>
      <div className="bg-white rounded-xl border p-6">
        <Suspense fallback={<div className="text-sm text-zinc-500">Memuat form...</div>}>
          <TransactionForm />
        </Suspense>
      </div>
    </div>
  );
}
