-- HL Sales & Receivables Management App
-- Database Schema for Supabase

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  diskon_lm JSONB NOT NULL DEFAULT '[]'::jsonb,
  diskon_br JSONB NOT NULL DEFAULT '[]'::jsonb,
  bonus_threshold NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  harga_modal NUMERIC NOT NULL DEFAULT 0,
  harga_base NUMERIC NOT NULL DEFAULT 0,
  tipe TEXT NOT NULL CHECK (tipe IN ('LM', 'BR')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Transactions (Bon)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nomor_bon TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  ongkir NUMERIC NOT NULL DEFAULT 0,
  deskripsi TEXT DEFAULT '',
  is_bonus BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Piutang' CHECK (status IN ('Piutang', 'Lunas')),
  payment_date DATE,
  bonus_consumed_threshold NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Items (line items)
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

-- RLS Policies (single user: allow all if authenticated)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON transaction_items FOR ALL TO authenticated USING (true);
