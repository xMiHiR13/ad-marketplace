export function DealDetailSkeleton({
  isFullscreen,
}: {
  isFullscreen: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${isFullscreen ? "pt-20" : ""}`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="ri-arrow-left-line text-lg text-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">Deal Details</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 skeleton rounded" />
              <div className="h-3 w-14 skeleton rounded" />
            </div>
            <div className="h-4 w-4 skeleton rounded" />
          </div>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-5 w-32 skeleton rounded" />
              <div className="h-3 w-20 skeleton rounded mt-1.5" />
              <div className="h-3 w-24 skeleton rounded mt-1.5" />
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 skeleton rounded" />
              <div className="h-3 w-16 skeleton rounded" />
            </div>
            <div className="h-4 w-4 skeleton rounded" />
          </div>
          <div className="h-5 w-40 skeleton rounded" />
          <div className="h-3 w-full skeleton rounded mt-2" />
          <div className="h-3 w-3/4 skeleton rounded mt-1" />
        </div>

        <div className="card-surface p-4">
          <div className="h-4 w-28 skeleton rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full skeleton flex-shrink-0" />
                <div className="h-3 w-28 skeleton rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-3 w-24 skeleton rounded" />
            <div className="h-5 w-20 skeleton rounded-full" />
          </div>
          <div className="h-3 w-full skeleton rounded mt-3 pt-2 border-t border-white/5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5">
              <div className="h-3 w-10 skeleton rounded" />
              <div className="h-5 w-16 skeleton rounded mt-1.5" />
              <div className="h-3 w-12 skeleton rounded mt-1" />
            </div>
            <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5">
              <div className="h-3 w-14 skeleton rounded" />
              <div className="h-5 w-12 skeleton rounded mt-1.5" />
            </div>
          </div>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5">
              <div className="h-3 w-14 skeleton rounded" />
              <div className="h-5 w-12 skeleton rounded mt-1.5" />
            </div>
            <div className="flex-1 rounded-xl p-2.5 bg-white/5 border border-white/5">
              <div className="h-3 w-16 skeleton rounded" />
              <div className="h-5 w-16 skeleton rounded mt-1.5" />
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="h-4 w-16 skeleton rounded mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
                <div>
                  <div className="h-4 w-28 skeleton rounded" />
                  <div className="h-3 w-36 skeleton rounded mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-11 skeleton rounded-xl" />
          <div className="h-11 skeleton rounded-xl" />
        </div>
      </main>
    </div>
  );
}
