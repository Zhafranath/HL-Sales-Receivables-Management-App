import { verifySession } from '@/lib/auth';
import { getCustomers } from '@/lib/db/customers';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  await verifySession();
  const customers = await getCustomers();
  return <CustomersClient customers={customers} />;
}
