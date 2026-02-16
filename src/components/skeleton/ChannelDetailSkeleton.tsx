export function ChannelDetailSkeleton({
  isFullscreen,
}: {
  isFullscreen: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="ri-arrow-left-line text-lg text-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">Channel Details</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Channel Header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl skeleton mx-auto mb-3" />
          <div className="h-6 w-40 skeleton rounded mx-auto" />
          <div className="h-4 w-24 skeleton rounded mx-auto mt-1.5" />
          <div className="h-4 w-28 skeleton rounded mx-auto mt-2" />
        </div>

        {/* Overview Stats */}
        <div>
          <div className="h-3 w-20 skeleton rounded mb-2" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-3 w-3 skeleton rounded" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="h-5 w-12 skeleton rounded" />
                  <div className="h-3 w-8 skeleton rounded" />
                </div>
              </div>
            ))}
            <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="h-4 w-36 skeleton rounded mb-2" />
              <div className="h-2 w-full skeleton rounded-full" />
              <div className="flex justify-between mt-1.5">
                <div className="h-3 w-12 skeleton rounded" />
                <div className="h-3 w-16 skeleton rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Post Metrics */}
        <div>
          <div className="h-3 w-24 skeleton rounded mb-2" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-3 w-3 skeleton rounded" />
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="h-5 w-10 skeleton rounded" />
                  <div className="h-3 w-6 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Metrics */}
        <div>
          <div className="h-3 w-24 skeleton rounded mb-2" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-3 w-3 skeleton rounded" />
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="h-5 w-10 skeleton rounded" />
                  <div className="h-3 w-6 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart placeholder */}
        <div className="card-surface p-4">
          <div className="h-4 w-32 skeleton rounded mb-3" />
          <div className="h-40 w-full skeleton rounded-xl" />
        </div>

        {/* Language chart placeholder */}
        <div className="card-surface p-4">
          <div className="h-4 w-36 skeleton rounded mb-3" />
          <div className="h-32 w-full skeleton rounded-xl" />
        </div>

        {/* Pricing Section */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-3 w-20 skeleton rounded" />
          </div>
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full skeleton" />
                  <div className="h-4 w-24 skeleton rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-14 skeleton rounded" />
                  <div className="h-3 w-10 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats updated */}
        <div className="h-9 w-full skeleton rounded-lg" />

        {/* CTA Button */}
        <div className="h-12 skeleton rounded-xl" />
      </main>
    </div>
  );
}