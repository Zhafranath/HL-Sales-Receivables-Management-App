import { verifySession } from '@/lib/auth';
import { getProducts } from '@/lib/db/products';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  await verifySession();
  const products = await getProducts();
  return <ProductsClient products={products} />;
}
