import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-zinc-400">404</span>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-1">Halaman tidak ditemukan</h2>
      <p className="text-sm text-zinc-500 mb-6">Halaman yang Anda cari tidak tersedia.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
