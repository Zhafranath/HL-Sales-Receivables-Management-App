import { verifySession } from '@/lib/auth';
import ProductForm from '@/components/ProductForm';

export default async function NewProductPage() {
  await verifySession();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Tambah Produk</h1>
      <div className="bg-white rounded-xl border p-6">
        <ProductForm />
      </div>
    </div>
  );
}
