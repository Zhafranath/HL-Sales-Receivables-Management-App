export default function ReportsLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />
      <div className="bg-white rounded-xl border p-4 animate-pulse">
        <div className="flex gap-3">
          <div className="h-9 w-28 bg-neutral-200 rounded" />
          <div className="h-9 w-20 bg-neutral-200 rounded" />
          <div className="h-9 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}
