'server-only';

import { createClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { ProductType } from '@/types';

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('nama', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllProductsIncludeDeleted(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('nama', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createProduct(product: {
  nama: string;
  harga_modal: number;
  harga_base: number;
  tipe: ProductType;
}): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert({
      nama: product.nama,
      harga_modal: product.harga_modal,
      harga_base: product.harga_base,
      tipe: product.tipe,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  product: {
    nama: string;
    harga_modal: number;
    harga_base: number;
    tipe: ProductType;
  }
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update({
      nama: product.nama,
      harga_modal: product.harga_modal,
      harga_base: product.harga_base,
      tipe: product.tipe,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function softDeleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}
