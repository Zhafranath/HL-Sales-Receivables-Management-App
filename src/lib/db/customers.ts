'server-only';

import { createClient } from '@/lib/supabase/server';
import { Customer } from '@/types';

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .is('deleted_at', null)
    .order('nama', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllCustomersIncludeDeleted(): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('nama', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createCustomer(customer: {
  nama: string;
  diskon_lm: number[];
  diskon_br: number[];
  bonus_threshold: number;
}): Promise<Customer> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      nama: customer.nama,
      diskon_lm: customer.diskon_lm,
      diskon_br: customer.diskon_br,
      bonus_threshold: customer.bonus_threshold,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(
  id: string,
  customer: {
    nama: string;
    diskon_lm: number[];
    diskon_br: number[];
    bonus_threshold: number;
  }
): Promise<Customer> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('customers')
    .update({
      nama: customer.nama,
      diskon_lm: customer.diskon_lm,
      diskon_br: customer.diskon_br,
      bonus_threshold: customer.bonus_threshold,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteCustomer(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customers')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}
