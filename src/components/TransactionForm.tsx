'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatRupiah, computeDiscountedPrice } from '@/lib/calculations';
import { useToast } from '@/components/Toast';
import TypeBadge from '@/components/TypeBadge';
import type { ProductType, Customer, Product } from '@/types';

interface LineItem {
  key: string;
  product_id: string;
  quantity: number;
}

export default function TransactionForm({
  initialData,
}: {
  initialData?: {
    id: string;
    tanggal: string;
    nomor_bon: string;
    customer_id: string;
    ongkir: number;
    deskripsi: string;
    is_bonus: boolean;
    status: string;
    items: LineItem[];
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!initialData;
  const preselectedCustomer = searchParams.get('customer');

  const [tanggal, setTanggal] = useState(
    initialData?.tanggal || new Date().toISOString().slice(0, 10)
  );
  const [nomorBon, setNomorBon] = useState(initialData?.nomor_bon || '');
  const [customerId, setCustomerId] = useState(
    initialData?.customer_id || preselectedCustomer || ''
  );
  const [ongkir, setOngkir] = useState(initialData?.ongkir?.toString() || '0');
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || '');
  const [isBonus, setIsBonus] = useState(initialData?.is_bonus || false);
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items || [{ key: '1', product_id: '', quantity: 1 }]
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('nama')
      .then(({ data }) => setCustomers(data || []));

    supabase
      .from('products')
      .select('*')
      .is('deleted_at', null)
      .order('nama')
      .then(({ data }) => setProducts(data || []));
  }, []);

  useEffect(() => {
    if (customerId) {
      const c = customers.find((c) => c.id === customerId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCustomer(c || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [customerId, customers]);

  const addItem = () => {
    setItems([...items, { key: `item-${Date.now()}`, product_id: '', quantity: 1 }]);
  };

  const removeItem = (key: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.key !== key));
  };

  const updateItem = (key: string, field: 'product_id' | 'quantity', value: string | number) => {
    setItems(
      items.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const getDiscountedPrice = (productId: string): number => {
    if (!selectedCustomer) return 0;
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;
    return computeDiscountedPrice(product.harga_base, selectedCustomer, product.tipe);
  };

  const getProductPrice = (productId: string): number => {
    const product = products.find((p) => p.id === productId);
    return product?.harga_base || 0;
  };

  const getProductTipe = (productId: string): ProductType | null => {
    const product = products.find((p) => p.id === productId);
    return product?.tipe || null;
  };

  const totalOmzet = items.reduce((sum, item) => {
    const price = isBonus ? 0 : getDiscountedPrice(item.product_id);
    return sum + price * item.quantity;
  }, 0);

  const ongkirNum = parseInt(ongkir) || 0;
  const totalPiutang = totalOmzet + ongkirNum;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!nomorBon.trim()) errors.nomor_bon = 'Nomor Bon wajib diisi';
    if (!customerId) errors.customer = 'Pilih customer';

    const validItems = items.filter((i) => i.product_id);
    if (validItems.length === 0) errors.items = 'Minimal 1 produk harus dipilih';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSaving(true);
    const supabase = createClient();

    const txData = {
      tanggal,
      nomor_bon: nomorBon.trim(),
      customer_id: customerId,
      ongkir: ongkirNum,
      deskripsi,
      is_bonus: isBonus,
      status: 'Piutang',
      payment_date: null,
    };

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ ...txData, updated_at: new Date().toISOString() })
        .eq('id', initialData!.id);

      if (updateError) {
        setError(updateError.message);
        toast('Gagal menyimpan bon', 'error');
        setSaving(false);
        return;
      }

      await supabase.from('transaction_items').delete().eq('transaction_id', initialData!.id);

      for (const item of items) {
        if (!item.product_id) continue;
        await supabase.from('transaction_items').insert({
          transaction_id: initialData!.id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    } else {
      const { data: tx, error: insertError } = await supabase
        .from('transactions')
        .insert(txData)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        toast('Gagal membuat bon', 'error');
        setSaving(false);
        return;
      }

      for (const item of items) {
        if (!item.product_id) continue;
        await supabase.from('transaction_items').insert({
          transaction_id: tx.id,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    toast(isEdit ? 'Bon berhasil disimpan' : 'Bon berhasil dibuat', 'success');
    router.push('/transactions');
    router.refresh();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl"
    >
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 text-red-700 text-sm p-3 rounded-lg overflow-hidden"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Nomor Bon <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nomorBon}
            onChange={(e) => { setNomorBon(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.nomor_bon; return next; }); }}
            required
            placeholder="contoh: B-001"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              fieldErrors.nomor_bon ? 'border-red-400 bg-red-50' : 'border-neutral-300'
            }`}
          />
          <AnimatePresence>
            {fieldErrors.nomor_bon && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
                {fieldErrors.nomor_bon}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-end">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
              isBonus
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            }`}
          >
            <input
              type="checkbox"
              checked={isBonus}
              onChange={(e) => setIsBonus(e.target.checked)}
              className="rounded accent-purple-600"
            />
            <span className="text-sm font-medium">Bonus 🎁</span>
          </motion.label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Customer <span className="text-red-500">*</span>
        </label>
        <select
          value={customerId}
          onChange={(e) => { setCustomerId(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.customer; return next; }); }}
          required
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
            fieldErrors.customer ? 'border-red-400 bg-red-50' : 'border-neutral-300'
          }`}
        >
          <option value="">Pilih Customer...</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nama}
            </option>
          ))}
        </select>
        <AnimatePresence>
          {fieldErrors.customer && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
              {fieldErrors.customer}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">Produk</label>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addItem}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            + Tambah Produk
          </motion.button>
        </div>

        <AnimatePresence>
          <div className="space-y-2">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              const discountedPrice = getDiscountedPrice(item.product_id);
              const basePrice = getProductPrice(item.product_id);
              const tipe = getProductTipe(item.product_id);
              const lineTotal = discountedPrice * item.quantity;

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.7 }}
                  className="flex gap-2 items-start p-3 border rounded-lg hover:border-neutral-300 transition-colors"
                >
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(item.key, 'product_id', e.target.value)}
                      className="w-full px-2 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      <option value="">Pilih Produk...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama} ({p.tipe})
                        </option>
                      ))}
                    </select>
                    <AnimatePresence>
                      {product && !isBonus && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-neutral-500 mt-1.5 flex gap-3"
                        >
                          <span>Base: {formatRupiah(basePrice)}</span>
                          <motion.span
                            key={discountedPrice}
                            initial={{ scale: 1.2, color: '#059669' }}
                            animate={{ scale: 1, color: '#71717a' }}
                            className="font-medium"
                          >
                            Diskon: {formatRupiah(discountedPrice)}
                          </motion.span>
                          {tipe && (
                            <TypeBadge tipe={tipe} />
                          )}
                        </motion.div>
                      )}
                      {isBonus && product && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-purple-600 mt-1.5"
                        >
                          🎁 Bonus — gratis (tidak dihitung omzet)
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.key, 'quantity', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-2 border border-neutral-300 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {!isBonus && discountedPrice > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="w-36 text-right pt-2"
                    >
                      <p className="text-sm font-medium">{formatRupiah(lineTotal)}</p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.2, color: '#ef4444' }}
                    whileTap={{ scale: 0.8 }}
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-neutral-400 hover:text-red-500 text-sm pt-2 transition-colors"
                    disabled={items.length <= 1}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
        <AnimatePresence>
          {fieldErrors.items && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
              {fieldErrors.items}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ongkir (Rp)</label>
          <input
            type="number"
            min="0"
            value={ongkir}
            onChange={(e) => setOngkir(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Deskripsi</label>
          <input
            type="text"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-50 rounded-xl p-4 space-y-1.5"
      >
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Total Omzet</span>
          <motion.span
            key={totalOmzet}
            initial={{ scale: 1.15, color: '#059669' }}
            animate={{ scale: 1, color: '#18181b' }}
            className="font-medium"
          >
            {formatRupiah(totalOmzet)}
          </motion.span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Ongkir</span>
          <span className="font-medium">{formatRupiah(ongkirNum)}</span>
        </div>
        <div className="flex justify-between text-sm pt-1.5 border-t font-semibold">
          <span>Total Piutang</span>
          <motion.span
            key={totalPiutang}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatRupiah(totalPiutang)}
          </motion.span>
        </div>
      </motion.div>

      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Menyimpan...
            </span>
          ) : isEdit ? (
            'Simpan Perubahan'
          ) : (
            'Buat Bon'
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          Batal
        </motion.button>
      </div>
    </motion.form>
  );
}
