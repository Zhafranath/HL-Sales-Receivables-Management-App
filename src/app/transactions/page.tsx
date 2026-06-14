import { verifySession } from '@/lib/auth';
import { getTransactions } from '@/lib/db/transactions';
import TransactionsClient from './TransactionsClient';

export default async function TransactionsPage() {
  await verifySession();
  const transactions = await getTransactions();
  return <TransactionsClient transactions={transactions} />;
}
