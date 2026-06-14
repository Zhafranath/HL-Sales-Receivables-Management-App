import { CardSkeleton } from '@/components/LoadingSkeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="h-8 w-32 bg-neutral-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-5 bg-neutral-200 rounded w-40 mb-4" />
            <div className="h-44 bg-neutral-100 rounded" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="h-5 bg-neutral-200 rounded w-32 mb-4" />
            <div className="h-28 bg-neutral-100 rounded-full w-28 mx-auto" />
          </div>
          <div className="bg-white rounded-xl border p-4 flex-1 animate-pulse">
            <div className="h-5 bg-neutral-200 rounded w-28 mb-4" />
            <div className="space-y-2">{[1,2,3].map((i) => (
              <div key={i} className="h-6 bg-neutral-100 rounded" />
            ))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
