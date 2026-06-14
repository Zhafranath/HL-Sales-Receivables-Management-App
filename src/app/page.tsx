import { verifySession } from '@/lib/auth';
import { getCustomers } from '@/lib/db/customers';
import { getProducts } from '@/lib/db/products';
import { getTransactionLineData } from '@/lib/calculations';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import type { Transaction, MonthlyDatum, TopCustomer } from '@/types';

async function getTransactionsWithItems(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customer:customers(*), items:transaction_items(*, product:products(*))')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

function buildMonthlyData(transactions: Transaction[]): MonthlyDatum[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    months.push({ key, label });
  }

  const map: Record<string, { omzetLM: number; omzetBR: number; laba: number }> = {};
  for (const m of months) {
    map[m.key] = { omzetLM: 0, omzetBR: 0, laba: 0 };
  }

  for (const tx of transactions) {
    if (tx.status !== 'Lunas' || tx.is_bonus) continue;
    const d = new Date(tx.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) continue;
    const computed = getTransactionLineData(tx);
    for (const item of computed.items) {
      if (!item.product) continue;
      if (item.product.tipe === 'LM') {
        map[key].omzetLM += item.lineOmzet;
      } else {
        map[key].omzetBR += item.lineOmzet;
      }
    }
    map[key].laba += computed.transactionLaba;
  }

  return months.map((m) => ({ ...m, ...map[m.key] }));
}

function buildTopCustomers(transactions: Transaction[]): TopCustomer[] {
  const map: Record<string, { name: string; omzet: number; piutang: number }> = {};

  for (const tx of transactions) {
    const name = tx.customer?.nama || '-';
    if (!map[tx.customer_id]) {
      map[tx.customer_id] = { name, omzet: 0, piutang: 0 };
    }
    const computed = getTransactionLineData(tx);
    if (tx.status === 'Lunas' && !tx.is_bonus) {
      map[tx.customer_id].omzet += computed.transactionOmzet;
    } else if (tx.status === 'Piutang') {
      map[tx.customer_id].piutang += computed.amountOwed;
    }
  }

  return Object.values(map)
    .sort((a, b) => b.omzet - a.omzet)
    .slice(0, 5);
}

export default async function DashboardPage() {
  await verifySession();

  const [customers, products, transactions] = await Promise.all([
    getCustomers(),
    getProducts(),
    getTransactionsWithItems(),
  ]);

  let totalPiutang = 0;
  let totalLaba = 0;
  let lunasCount = 0;
  let piutangCount = 0;
  let omzetLM = 0;
  let omzetBR = 0;

  for (const tx of transactions) {
    const computed = getTransactionLineData(tx);
    if (tx.status === 'Piutang') {
      totalPiutang += computed.amountOwed;
      piutangCount++;
    } else {
      if (!tx.is_bonus) {
        totalLaba += computed.transactionLaba;
        for (const item of computed.items) {
          if (!item.product) continue;
          if (item.product.tipe === 'LM') omzetLM += item.lineOmzet;
          else omzetBR += item.lineOmzet;
        }
      }
      lunasCount++;
    }
  }

  const monthlyData = buildMonthlyData(transactions);
  const topCustomers = buildTopCustomers(transactions);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <DashboardClient
      customerCount={customers.length}
      productCount={products.length}
      totalPiutang={totalPiutang}
      totalLaba={totalLaba}
      lunasCount={lunasCount}
      piutangCount={piutangCount}
      omzetLM={omzetLM}
      omzetBR={omzetBR}
      monthlyData={monthlyData}
      topCustomers={topCustomers}
      transactions={recentTransactions}
    />
  );
}
