export type ProductType = 'LM' | 'BR';
export type TransactionStatus = 'Piutang' | 'Lunas';

export interface Customer {
  id: string;
  nama: string;
  diskon_lm: number[];
  diskon_br: number[];
  bonus_threshold: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Product {
  id: string;
  nama: string;
  harga_modal: number;
  harga_base: number;
  tipe: ProductType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Transaction {
  id: string;
  tanggal: string;
  nomor_bon: string;
  customer_id: string;
  ongkir: number;
  deskripsi: string;
  is_bonus: boolean;
  status: TransactionStatus;
  payment_date: string | null;
  bonus_consumed_threshold: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface MonthlyReport {
  month: string;
  year: number;
  total_piutang: number;
  total_dibayar: number;
  total_omzet_lm: number;
  total_omzet_br: number;
  total_omzet: number;
  total_laba: number;
  transactions: Transaction[];
}

export interface OverallReport {
  total_omzet_lm: number;
  total_omzet_br: number;
  total_omzet: number;
  total_laba: number;
  total_piutang: number;
  total_dibayar: number;
  customer_reports: CustomerReport[];
}

export interface CustomerReport {
  customer_id: string;
  customer_name: string;
  total_omzet_lm: number;
  total_omzet_br: number;
  total_omzet: number;
  total_laba: number;
  total_piutang: number;
  total_dibayar: number;
}

export interface MonthlyDatum {
  key: string;
  label: string;
  omzetLM: number;
  omzetBR: number;
  laba: number;
}

export interface TopCustomer {
  name: string;
  omzet: number;
  piutang: number;
}
