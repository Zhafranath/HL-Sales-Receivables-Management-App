import { verifySession } from '@/lib/auth';
import CustomerForm from '@/components/CustomerForm';

export default async function NewCustomerPage() {
  await verifySession();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Tambah Customer</h1>
      <div className="bg-white rounded-xl border p-6">
        <CustomerForm />
      </div>
    </div>
  );
}
