'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

export default function DeleteCustomerButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('customers')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      toast('Customer berhasil dihapus', 'success');
      setOpen(false);
      router.refresh();
    } else {
      toast('Gagal menghapus customer', 'error');
    }
    setDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-red-500 hover:text-red-700 text-xs"
      >
        Hapus
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Hapus Customer">
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Hapus customer <strong>{name}</strong>? Data akan di-soft-delete dan tidak muncul di pilihan baru. Riwayat transaksi tetap tersimpan.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
