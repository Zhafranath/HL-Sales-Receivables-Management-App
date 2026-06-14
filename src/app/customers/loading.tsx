import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function CustomersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-28 bg-zinc-200 rounded animate-pulse" />
      <LoadingSkeleton rows={6} cols={5} />
    </div>
  );
}
