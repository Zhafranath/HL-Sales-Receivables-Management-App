'server-only';

import { createClient } from '@/lib/supabase/server';
import { Transaction, CustomerReport } from '@/types';
import { getTransactionLineData } from '@/lib/calculations';

export async function getAccumulatedPaidOmzet(customerId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', customerId)
    .eq('status', 'Lunas')
    .eq('is_bonus', false);

  if (error) throw error;

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!customer) return 0;

  let total = 0;
  for (const tx of data || []) {
    const { data: items } = await supabase
      .from('transaction_items')
      .select('*, product:products(*)')
      .eq('transaction_id', tx.id);

    if (!items) continue;

    for (const item of items) {
      const product = item.product;
      if (!product) continue;
      const discountSteps = (product.tipe === 'LM' ? customer.diskon_lm : customer.diskon_br) || [];
      let price = product.harga_base;
      for (const d of discountSteps) {
        price *= 1 - d / 100;
      }
      total += price * item.quantity;
    }
  }

  return total;
}

export async function getBonusesGranted(customerId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('bonus_consumed_threshold')
    .eq('customer_id', customerId)
    .eq('is_bonus', true)
    .eq('status', 'Lunas');

  if (error) throw error;

  let total = 0;
  for (const tx of data || []) {
    total += tx.bonus_consumed_threshold || 0;
  }

  return total;
}

export interface MonthlyData {
  transactions: Transaction[];
  totalPiutang: number;
  totalDibayar: number;
  totalOmzetLM: number;
  totalOmzetBR: number;
  totalOmzet: number;
  totalLaba: number;
}

export async function getCustomerMonthlyData(
  customerId: string,
  month: number,
  year: number
): Promise<MonthlyData> {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const { data: txs, error } = await supabase
    .from('transactions')
    .select('*, customer:customers(*), items:transaction_items(*, product:products(*))')
    .eq('customer_id', customerId)
    .gte('tanggal', startDate)
    .lt('tanggal', endDate)
    .order('tanggal', { ascending: false });

  if (error) throw error;

  let totalPiutang = 0;
  let totalDibayar = 0;
  let totalOmzetLM = 0;
  let totalOmzetBR = 0;
  let totalOmzet = 0;
  let totalLaba = 0;

  for (const tx of txs || []) {
    const computed = getTransactionLineData(tx);
    const amount = computed.amountOwed;

    if (tx.status === 'Piutang') {
      totalPiutang += amount;
    } else {
      totalDibayar += amount;
      if (!tx.is_bonus) {
        totalOmzet += computed.transactionOmzet;
        totalLaba += computed.transactionLaba;
        for (const c of computed.items) {
          if (c.product?.tipe === 'LM') totalOmzetLM += c.lineOmzet;
          else if (c.product?.tipe === 'BR') totalOmzetBR += c.lineOmzet;
        }
      }
    }
  }

  return {
    transactions: txs || [],
    totalPiutang,
    totalDibayar,
    totalOmzetLM,
    totalOmzetBR,
    totalOmzet,
    totalLaba,
  };
}

export async function getOverallReport(
  month?: number,
  year?: number
): Promise<{
  totalOmzetLM: number;
  totalOmzetBR: number;
  totalOmzet: number;
  totalLaba: number;
  totalPiutang: number;
  totalDibayar: number;
  customerReports: CustomerReport[];
}> {
  const supabase = await createClient();

  let query = supabase
    .from('transactions')
    .select('*, customer:customers(*), items:transaction_items(*, product:products(*))');

  if (month !== undefined && year !== undefined) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('tanggal', startDate).lt('tanggal', endDate);
  }

  const { data: txs, error } = await query;
  if (error) throw error;

  let totalOmzetLM = 0;
  let totalOmzetBR = 0;
  let totalOmzet = 0;
  let totalLaba = 0;
  let totalPiutang = 0;
  let totalDibayar = 0;

  const customerTotals: Record<string, CustomerReport> = {};

  for (const tx of txs || []) {
    const computed = getTransactionLineData(tx);
    const amount = computed.amountOwed;

    if (tx.status === 'Piutang') {
      totalPiutang += amount;
    } else {
      totalDibayar += amount;
      if (!tx.is_bonus) {
        totalOmzet += computed.transactionOmzet;
        totalLaba += computed.transactionLaba;

        let txOmzetLM = 0;
        let txOmzetBR = 0;
        for (const c of computed.items) {
          if (c.product?.tipe === 'LM') txOmzetLM += c.lineOmzet;
          else if (c.product?.tipe === 'BR') txOmzetBR += c.lineOmzet;
        }
        totalOmzetLM += txOmzetLM;
        totalOmzetBR += txOmzetBR;
      }
    }

    const cid = tx.customer_id;
    if (!customerTotals[cid]) {
      customerTotals[cid] = {
        customer_id: cid,
        customer_name: tx.customer?.nama || 'Unknown',
        total_omzet_lm: 0,
        total_omzet_br: 0,
        total_omzet: 0,
        total_laba: 0,
        total_piutang: 0,
        total_dibayar: 0,
      };
    }

    if (tx.status === 'Piutang') {
      customerTotals[cid].total_piutang += amount;
    } else {
      customerTotals[cid].total_dibayar += amount;
      if (!tx.is_bonus) {
        customerTotals[cid].total_omzet += computed.transactionOmzet;
        customerTotals[cid].total_laba += computed.transactionLaba;
        for (const c of computed.items) {
          if (c.product?.tipe === 'LM') customerTotals[cid].total_omzet_lm += c.lineOmzet;
          else if (c.product?.tipe === 'BR') customerTotals[cid].total_omzet_br += c.lineOmzet;
        }
      }
    }
  }

  return {
    totalOmzetLM,
    totalOmzetBR,
    totalOmzet,
    totalLaba,
    totalPiutang,
    totalDibayar,
    customerReports: Object.values(customerTotals),
  };
}
