'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import type { ProductType } from '@/types';

export default function ProductForm({
  initialData,
}: {
  initialData?: {
    id?: string;
    nama: string;
    harga_modal: number;
    harga_base: number;
    tipe: ProductType;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [nama, setNama] = useState(initialData?.nama || '');
  const [tipe, setTipe] = useState<ProductType>(initialData?.tipe || 'LM');
  const [hargaModal, setHargaModal] = useState(initialData?.harga_modal?.toString() || '');
  const [hargaBase, setHargaBase] = useState(initialData?.harga_base?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!nama.trim()) errors.nama = 'Nama wajib diisi';

    const hModal = parseInt(hargaModal) || 0;
    const hBase = parseInt(hargaBase) || 0;
    if (hargaModal !== '' && hModal < 0) errors.hargaModal = 'Tidak boleh negatif';
    if (hargaBase !== '' && hBase < 0) errors.hargaBase = 'Tidak boleh negatif';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    const hModal = parseInt(hargaModal) || 0;
    const hBase = parseInt(hargaBase) || 0;

    setSaving(true);
    const supabase = createClient();
    const data = { nama, tipe, harga_modal: hModal, harga_base: hBase };

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', initialData!.id!);

      if (updateError) {
        setError(updateError.message);
        toast('Gagal menyimpan produk', 'error');
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('products').insert(data);
      if (insertError) {
        setError(insertError.message);
        toast('Gagal membuat produk', 'error');
        setSaving(false);
        return;
      }
    }

    toast(isEdit ? 'Produk berhasil disimpan' : 'Produk berhasil dibuat', 'success');
    router.push('/products');
    router.refresh();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 text-red-700 text-sm p-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Nama Produk <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => { setNama(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.nama; return next; }); }}
          required
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
            fieldErrors.nama ? 'border-red-400 bg-red-50' : 'border-neutral-300'
          }`}
        />
        <AnimatePresence>
          {fieldErrors.nama && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
              {fieldErrors.nama}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Tipe <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {(['LM', 'BR'] as const).map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setTipe(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                tipe === t
                  ? t === 'LM'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Harga Modal
        </label>
        <input
          type="number"
          min="0"
          value={hargaModal}
          onChange={(e) => { setHargaModal(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.hargaModal; return next; }); }}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
            fieldErrors.hargaModal ? 'border-red-400 bg-red-50' : 'border-neutral-300'
          }`}
        />
        <AnimatePresence>
          {fieldErrors.hargaModal && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
              {fieldErrors.hargaModal}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Harga Jual (Base)
        </label>
        <input
          type="number"
          min="0"
          value={hargaBase}
          onChange={(e) => { setHargaBase(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.hargaBase; return next; }); }}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
            fieldErrors.hargaBase ? 'border-red-400 bg-red-50' : 'border-neutral-300'
          }`}
        />
        <AnimatePresence>
          {fieldErrors.hargaBase && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1">
              {fieldErrors.hargaBase}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

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
            'Buat Produk'
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
