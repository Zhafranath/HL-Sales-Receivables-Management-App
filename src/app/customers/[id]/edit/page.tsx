import { verifySession } from '@/lib/auth';
import { getCustomer } from '@/lib/db/customers';
import { notFound } from 'next/navigation';
import CustomerForm from '@/components/CustomerForm';

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Edit Customer</h1>
      <div className="bg-white rounded-xl border p-6">
        <CustomerForm
          initialData={{
            id: customer.id,
            nama: customer.nama,
            diskon_lm: customer.diskon_lm,
            diskon_br: customer.diskon_br,
            bonus_threshold: customer.bonus_threshold,
          }}
        />
      </div>
    </div>
  );
}
