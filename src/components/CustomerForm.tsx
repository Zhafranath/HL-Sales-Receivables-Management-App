'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';

interface DiscountStep {
  id: string;
  value: string;
}

export default function CustomerForm({
  initialData,
}: {
  initialData?: {
    id?: string;
    nama: string;
    diskon_lm: number[];
    diskon_br: number[];
    bonus_threshold: number;
  };
}) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [nama, setNama] = useState(initialData?.nama || '');
  const [bonusThreshold, setBonusThreshold] = useState(
    initialData?.bonus_threshold?.toString() || '0'
  );
  const [lmSteps, setLmSteps] = useState<DiscountStep[]>(
    (initialData?.diskon_lm || []).map((v, i) => ({
      id: `lm-${i}`,
      value: v.toString(),
    }))
  );
  const [brSteps, setBrSteps] = useState<DiscountStep[]>(
    (initialData?.diskon_br || []).map((v, i) => ({
      id: `br-${i}`,
      value: v.toString(),
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const addStep = (type: 'lm' | 'br') => {
    const id = `${type}-${Date.now()}`;
    if (type === 'lm') setLmSteps([...lmSteps, { id, value: '' }]);
    else setBrSteps([...brSteps, { id, value: '' }]);
  };

  const removeStep = (type: 'lm' | 'br', id: string) => {
    if (type === 'lm') setLmSteps(lmSteps.filter((s) => s.id !== id));
    else setBrSteps(brSteps.filter((s) => s.id !== id));
  };

  const updateStep = (type: 'lm' | 'br', id: string, value: string) => {
    if (type === 'lm')
      setLmSteps(lmSteps.map((s) => (s.id === id ? { ...s, value } : s)));
    else setBrSteps(brSteps.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const getDiscounts = (steps: DiscountStep[]): number[] => {
    return steps.map((s) => parseInt(s.value) || 0).filter((v) => !isNaN(v));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!nama.trim()) errors.nama = 'Nama wajib diisi';

    for (let i = 0; i < lmSteps.length; i++) {
      const v = parseInt(lmSteps[i].value);
      if (lmSteps[i].value !== '' && (isNaN(v) || v < 0 || v > 100)) {
        errors[`diskon_lm_${lmSteps[i].id}`] = '0–100';
      }
    }
    for (let i = 0; i < brSteps.length; i++) {
      const v = parseInt(brSteps[i].value);
      if (brSteps[i].value !== '' && (isNaN(v) || v < 0 || v > 100)) {
        errors[`diskon_br_${brSteps[i].id}`] = '0–100';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    const diskon_lm = getDiscounts(lmSteps);
    const diskon_br = getDiscounts(brSteps);

    setSaving(true);
    const supabase = createClient();

    const data = {
      nama,
      diskon_lm,
      diskon_br,
      bonus_threshold: parseInt(bonusThreshold) || 0,
    };

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', initialData!.id!);

      if (updateError) {
        setError(updateError.message);
        toast('Gagal menyimpan customer', 'error');
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from('customers').insert(data);

      if (insertError) {
        setError(insertError.message);
        toast('Gagal membuat customer', 'error');
        setSaving(false);
        return;
      }
    }

    toast(isEdit ? 'Customer berhasil disimpan' : 'Customer berhasil dibuat', 'success');
    router.push('/customers');
    router.refresh();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5 max-w-xl"
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
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Nama Customer <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={nama}
          onChange={(e) => { setNama(e.target.value); setFieldErrors((prev) => { const next = { ...prev }; delete next.nama; return next; }); }}
          required
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all ${
            fieldErrors.nama ? 'border-red-400 bg-red-50' : 'border-zinc-300'
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
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Threshold Bonus (Rp)
        </label>
        <input
          type="number"
          min="0"
          value={bonusThreshold}
          onChange={(e) => setBonusThreshold(e.target.value)}
          className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
        />
      </div>

      <DiscountSection
        label="Diskon LM"
        steps={lmSteps}
        onAdd={() => addStep('lm')}
        onRemove={(id) => removeStep('lm', id)}
        onUpdate={(id, v) => updateStep('lm', id, v)}
        effectiveDiscount={getDiscounts(lmSteps)}
        colorClass="bg-blue-50 text-blue-700 border-blue-200"
        fieldErrors={fieldErrors}
        errorPrefix="diskon_lm"
      />

      <DiscountSection
        label="Diskon BR"
        steps={brSteps}
        onAdd={() => addStep('br')}
        onRemove={(id) => removeStep('br', id)}
        onUpdate={(id, v) => updateStep('br', id, v)}
        effectiveDiscount={getDiscounts(brSteps)}
        colorClass="bg-amber-50 text-amber-700 border-amber-200"
        fieldErrors={fieldErrors}
        errorPrefix="diskon_br"
      />

      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
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
            'Buat Customer'
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          Batal
        </motion.button>
      </div>
    </motion.form>
  );
}

function DiscountSection({
  label,
  steps,
  onAdd,
  onRemove,
  onUpdate,
  effectiveDiscount,
  colorClass,
  fieldErrors,
  errorPrefix,
}: {
  label: string;
  steps: DiscountStep[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
  effectiveDiscount: number[];
  colorClass: string;
  fieldErrors: Record<string, string>;
  errorPrefix: string;
}) {
  void colorClass;
  let effectiveLabel = '';
  if (effectiveDiscount.length > 0) {
    let mult = 1;
    for (const d of effectiveDiscount) mult *= 1 - d / 100;
    const eff = Math.round((1 - mult) * 10000) / 100;
    effectiveLabel = `→ Efektif: ${eff}%`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-medium text-zinc-700">
          {label}
          {effectiveLabel && (
            <motion.span
              key={effectiveLabel}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-zinc-400 ml-1.5 font-normal"
            >
              {effectiveLabel}
            </motion.span>
          )}
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onAdd}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          + Tambah Diskon
        </motion.button>
      </div>
      {steps.length === 0 ? (
        <p className="text-xs text-zinc-400 italic">Belum ada diskon</p>
      ) : (
        <motion.div className="flex flex-wrap gap-2 items-center">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <div className="flex flex-col">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={step.value}
                  onChange={(e) => onUpdate(step.id, e.target.value)}
                  placeholder="0"
                  className={`w-16 px-2 py-1.5 border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all ${
                    fieldErrors[`${errorPrefix}_${step.id}`] ? 'border-red-400 bg-red-50' : 'border-zinc-300'
                  }`}
                />
                {fieldErrors[`${errorPrefix}_${step.id}`] && (
                  <span className="text-[10px] text-red-500 mt-0.5 text-center">
                    {fieldErrors[`${errorPrefix}_${step.id}`]}
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500">%</span>
              {idx < steps.length - 1 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-zinc-300 mx-0.5"
                >
                  →
                </motion.span>
              )}
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                type="button"
                onClick={() => onRemove(step.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors ml-0.5 w-5 h-5 flex items-center justify-center"
              >
                ✕
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
