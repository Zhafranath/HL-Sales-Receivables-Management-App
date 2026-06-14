import { verifySession } from '@/lib/auth';
import { getProduct } from '@/lib/db/products';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Edit Produk</h1>
      <div className="bg-white rounded-xl border p-6">
        <ProductForm
          initialData={{
            id: product.id,
            nama: product.nama,
            harga_modal: product.harga_modal,
            harga_base: product.harga_base,
            tipe: product.tipe,
          }}
        />
      </div>
    </div>
  );
}
