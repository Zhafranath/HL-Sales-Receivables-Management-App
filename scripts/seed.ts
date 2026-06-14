import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jdesjreowkmgssoshchf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first');
  process.exit(1);
}

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ---- Clean existing data (order matters due to FK) ----
  await supabase.from('transaction_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // ---- Customers ----
  const { data: customers } = await supabase.from('customers').insert([
    { nama: 'Toko Berkah Abadi',    diskon_lm: [20, 10],    diskon_br: [15, 5],     bonus_threshold: 10_000_000 },
    { nama: 'CV Sumber Rezeki',     diskon_lm: [25],        diskon_br: [10, 10],    bonus_threshold: 15_000_000 },
    { nama: 'UD Maju Jaya',         diskon_lm: [30, 10, 5], diskon_br: [20],        bonus_threshold: 8_000_000  },
  ]).select('id, nama');
  if (!customers) throw new Error('Fail insert customers');

  const [tokoberkah, sumbers, maju] = customers;
  console.log('✓ Customers:', customers.map(c => c.nama).join(', '));

  // ---- Products ----
  const productsData = [
    // LM products
    { nama: 'Kain Batik Premium',   harga_modal: 35000, harga_base: 75000, tipe: 'LM' },
    { nama: 'Kain Sutra Halus',     harga_modal: 28000, harga_base: 60000, tipe: 'LM' },
    { nama: 'Sarung Tenun Asli',    harga_modal: 42000, harga_base: 90000, tipe: 'LM' },
    // BR products
    { nama: 'Kaos Polo Premium',    harga_modal: 45000, harga_base: 110000, tipe: 'BR' },
    { nama: 'Kemeja Batik Pria',    harga_modal: 38000, harga_base: 85000,  tipe: 'BR' },
    { nama: 'Celana Chino Slim',    harga_modal: 55000, harga_base: 125000, tipe: 'BR' },
    { nama: 'Jaket Parka Modern',   harga_modal: 72000, harga_base: 160000, tipe: 'BR' },
    { nama: 'Rok Batik Elegan',     harga_modal: 32000, harga_base: 70000,  tipe: 'LM' },
  ];
  const { data: products } = await supabase.from('products').insert(productsData).select('id, nama, harga_base, tipe');
  if (!products) throw new Error('Fail insert products');
  console.log('✓ Products:', products.length, 'items');

  const find = (name: string) => products.find(p => p.nama === name)!;

  // ---- Transactions ----
  const now = new Date();
  const fmt = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  // Transaction 1: Toko Berkah - Piutang
  const { data: [tx1] } = await supabase.from('transactions').insert({
    tanggal: fmt(3), nomor_bon: 'INV-2026-001', customer_id: tokoberkah.id,
    ongkir: 15000, deskripsi: 'Pesanan rutin mingguan', status: 'Piutang',
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx1!.id, product_id: find('Kain Batik Premium').id, quantity: 5 },
    { transaction_id: tx1!.id, product_id: find('Kain Sutra Halus').id, quantity: 3 },
    { transaction_id: tx1!.id, product_id: find('Kaos Polo Premium').id, quantity: 10 },
  ]);

  // Transaction 2: Toko Berkah - Lunas
  const { data: [tx2] } = await supabase.from('transactions').insert({
    tanggal: fmt(10), nomor_bon: 'INV-2026-002', customer_id: tokoberkah.id,
    ongkir: 10000, deskripsi: '', status: 'Lunas', payment_date: fmt(8),
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx2!.id, product_id: find('Sarung Tenun Asli').id, quantity: 4 },
    { transaction_id: tx2!.id, product_id: find('Rok Batik Elegan').id, quantity: 6 },
  ]);

  // Transaction 3: Sumber Rezeki - Lunas
  const { data: [tx3] } = await supabase.from('transactions').insert({
    tanggal: fmt(15), nomor_bon: 'INV-2026-003', customer_id: sumbers.id,
    ongkir: 25000, deskripsi: 'PO cabang timur', status: 'Lunas', payment_date: fmt(12),
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx3!.id, product_id: find('Kain Batik Premium').id, quantity: 12 },
    { transaction_id: tx3!.id, product_id: find('Kemeja Batik Pria').id, quantity: 8 },
    { transaction_id: tx3!.id, product_id: find('Jaket Parka Modern').id, quantity: 3 },
  ]);

  // Transaction 4: Sumber Rezeki - Piutang
  const { data: [tx4] } = await supabase.from('transactions').insert({
    tanggal: fmt(5), nomor_bon: 'INV-2026-004', customer_id: sumbers.id,
    ongkir: 0, deskripsi: 'Tambah stok toko pusat', status: 'Piutang',
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx4!.id, product_id: find('Sarung Tenun Asli').id, quantity: 7 },
    { transaction_id: tx4!.id, product_id: find('Kain Sutra Halus').id, quantity: 5 },
    { transaction_id: tx4!.id, product_id: find('Celana Chino Slim').id, quantity: 4 },
  ]);

  // Transaction 5: Maju Jaya - Piutang
  const { data: [tx5] } = await supabase.from('transactions').insert({
    tanggal: fmt(2), nomor_bon: 'INV-2026-005', customer_id: maju.id,
    ongkir: 20000, deskripsi: 'Pengiriman ekspedisi darat', status: 'Piutang',
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx5!.id, product_id: find('Kaos Polo Premium').id, quantity: 20 },
    { transaction_id: tx5!.id, product_id: find('Kemeja Batik Pria').id, quantity: 6 },
  ]);

  // Transaction 6: Maju Jaya - Lunas
  const { data: [tx6] } = await supabase.from('transactions').insert({
    tanggal: fmt(20), nomor_bon: 'INV-2026-006', customer_id: maju.id,
    ongkir: 35000, deskripsi: 'PO akhir bulan', status: 'Lunas', payment_date: fmt(18),
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx6!.id, product_id: find('Jaket Parka Modern').id, quantity: 5 },
    { transaction_id: tx6!.id, product_id: find('Celana Chino Slim').id, quantity: 10 },
    { transaction_id: tx6!.id, product_id: find('Rok Batik Elegan').id, quantity: 8 },
  ]);

  // Transaction 7: Toko Berkah - Piutang
  const { data: [tx7] } = await supabase.from('transactions').insert({
    tanggal: fmt(1), nomor_bon: 'INV-2026-007', customer_id: tokoberkah.id,
    ongkir: 5000, deskripsi: 'Tambahan mendadak', status: 'Piutang',
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx7!.id, product_id: find('Kain Batik Premium').id, quantity: 2 },
    { transaction_id: tx7!.id, product_id: find('Kemeja Batik Pria').id, quantity: 3 },
  ]);

  // Transaction 8: Bonus untuk Sumber Rezeki
  const { data: [tx8] } = await supabase.from('transactions').insert({
    tanggal: fmt(0), nomor_bon: 'BNS-2026-001', customer_id: sumbers.id,
    ongkir: 0, deskripsi: 'Bonus akumulasi omzet Q1', is_bonus: true,
    status: 'Lunas', payment_date: fmt(0), bonus_consumed_threshold: 15000000,
  }).select('id');
  await supabase.from('transaction_items').insert([
    { transaction_id: tx8!.id, product_id: find('Kaos Polo Premium').id, quantity: 5 },
    { transaction_id: tx8!.id, product_id: find('Kain Sutra Halus').id, quantity: 2 },
  ]);

  console.log(`✓ Transactions: 8 bon (3 Lunas, 4 Piutang, 1 Bonus)`);
  console.log('\n✅ Seed complete!');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
