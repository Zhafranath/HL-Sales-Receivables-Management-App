export default function LoadingSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-3 border-b bg-neutral-50">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-neutral-200 rounded animate-pulse"
                style={{ width: `${80 + (i % 3) * 40}px` }}
              />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 border-b last:border-0 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-neutral-100 rounded animate-pulse"
                style={{
                  width: `${60 + (c % 4) * 50}px`,
                  animationDelay: `${r * 100 + c * 50}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border p-4 animate-pulse">
      <div className="h-3 bg-neutral-200 rounded w-20 mb-2" />
      <div className="h-6 bg-neutral-200 rounded w-32" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between">
        <div>
          <div className="h-4 bg-neutral-200 rounded w-16 mb-2 animate-pulse" />
          <div className="h-7 bg-neutral-200 rounded w-48 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-neutral-200 rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-3 animate-pulse">
            <div className="h-3 bg-neutral-200 rounded w-16 mb-2" />
            <div className="h-5 bg-neutral-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
