import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function TransactionsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-16 bg-zinc-200 rounded animate-pulse" />
      <LoadingSkeleton rows={7} cols={5} />
    </div>
  );
}
