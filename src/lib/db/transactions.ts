'server-only';

import { createClient } from '@/lib/supabase/server';
import { Transaction, Customer, Product } from '@/types';
import { getCustomer } from './customers';
import { getProduct } from './products';

export interface CreateTransactionInput {
  tanggal: string;
  nomor_bon: string;
  customer_id: string;
  ongkir: number;
  deskripsi: string;
  is_bonus: boolean;
  status: 'Piutang' | 'Lunas';
  payment_date: string | null;
  items: { product_id: string; quantity: number }[];
}

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customer:customers(*)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*, customer:customers(*), items:transaction_items(*, product:products(*))')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getTransactionsByCustomer(
  customerId: string,
  month?: number,
  year?: number
): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase
    .from('transactions')
    .select('*, customer:customers(*), items:transaction_items(*, product:products(*))')
    .eq('customer_id', customerId)
    .order('tanggal', { ascending: false });

  if (month !== undefined && year !== undefined) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;
    query = query.gte('tanggal', startDate).lt('tanggal', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const supabase = await createClient();

  const customer = await getCustomer(input.customer_id);
  if (!customer) throw new Error('Customer not found');

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .insert({
      tanggal: input.tanggal,
      nomor_bon: input.nomor_bon,
      customer_id: input.customer_id,
      ongkir: input.ongkir,
      deskripsi: input.deskripsi,
      is_bonus: input.is_bonus,
      status: input.status,
      payment_date: input.payment_date,
    })
    .select()
    .single();

  if (txError) throw txError;

  for (const item of input.items) {
    const product = await getProduct(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    await supabase.from('transaction_items').insert({
      transaction_id: tx.id,
      product_id: item.product_id,
      quantity: item.quantity,
    });
  }

  const created = await getTransaction(tx.id);
  if (!created) throw new Error('Failed to create transaction');
  return created;
}

export async function updateTransaction(
  id: string,
  input: Partial<CreateTransactionInput>
): Promise<Transaction> {
  const supabase = await createClient();
  const existing = await getTransaction(id);
  if (!existing) throw new Error('Transaction not found');

  const updateData: Record<string, unknown> = {};
  if (input.tanggal !== undefined) updateData.tanggal = input.tanggal;
  if (input.nomor_bon !== undefined) updateData.nomor_bon = input.nomor_bon;
  if (input.customer_id !== undefined) updateData.customer_id = input.customer_id;
  if (input.ongkir !== undefined) updateData.ongkir = input.ongkir;
  if (input.deskripsi !== undefined) updateData.deskripsi = input.deskripsi;
  if (input.is_bonus !== undefined) updateData.is_bonus = input.is_bonus;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.payment_date !== undefined) updateData.payment_date = input.payment_date;
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;

  if (input.items) {
    await supabase.from('transaction_items').delete().eq('transaction_id', id);
    for (const item of input.items) {
      await supabase.from('transaction_items').insert({
        transaction_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }
  }

  const updated = await getTransaction(id);
  if (!updated) throw new Error('Transaction not found after update');
  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function settleTransaction(
  id: string,
  paymentDate: string
): Promise<Transaction> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'Lunas',
      payment_date: paymentDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
  const settled = await getTransaction(id);
  if (!settled) throw new Error('Transaction not found after settle');
  return settled;
}

export async function settleCustomerMonth(
  customerId: string,
  month: number,
  year: number,
  paymentDate: string
): Promise<void> {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'Lunas',
      payment_date: paymentDate,
      updated_at: new Date().toISOString(),
    })
    .eq('customer_id', customerId)
    .eq('status', 'Piutang')
    .gte('tanggal', startDate)
    .lt('tanggal', endDate);

  if (error) throw error;
}
