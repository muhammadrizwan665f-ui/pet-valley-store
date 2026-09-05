export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square animate-pulse rounded-xl bg-sage-50" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-sage-50" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-sage-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
