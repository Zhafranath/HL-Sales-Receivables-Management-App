import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function ProductsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse" />
      <LoadingSkeleton rows={5} cols={5} />
    </div>
  );
}
