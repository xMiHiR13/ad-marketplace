export function CampaignDetailSkeleton({
  isFullscreen,
}: {
  isFullscreen: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border ${isFullscreen ? "pt-20" : ""}`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <i className="ri-arrow-left-line text-lg text-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground truncate flex-1">
            Campaign Details
          </h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Campaign Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="h-6 w-3/5 skeleton rounded flex-1" />
            <div className="h-7 w-16 skeleton rounded-lg flex-shrink-0" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full skeleton rounded" />
          <div className="h-4 w-5/6 skeleton rounded" />
          <div className="h-4 w-3/4 skeleton rounded" />
        </div>

        {/* Budget Card */}
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-4 skeleton rounded" />
            <div className="h-3 w-24 skeleton rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 skeleton rounded" />
            <div className="h-4 w-4 skeleton rounded" />
            <div className="h-6 w-16 skeleton rounded" />
          </div>
          <div className="h-3 w-28 skeleton rounded mt-1.5" />
        </div>

        {/* Requirements Stats */}
        <div>
          <div className="h-3 w-36 skeleton rounded mb-2" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
              >
                <div className="flex items-center justify-center gap-1">
                  <div className="h-3 w-3 skeleton rounded" />
                  <div className="h-4 w-10 skeleton rounded" />
                </div>
                <div className="h-3 w-14 skeleton rounded mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Ad Types */}
        <div>
          <div className="h-3 w-28 skeleton rounded mb-2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-20 skeleton rounded-xl" />
            <div className="h-9 w-24 skeleton rounded-xl" />
          </div>
        </div>

        {/* Languages */}
        <div>
          <div className="h-3 w-28 skeleton rounded mb-2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-16 skeleton rounded-xl" />
            <div className="h-9 w-20 skeleton rounded-xl" />
            <div className="h-9 w-14 skeleton rounded-xl" />
          </div>
        </div>
      </main>

      {/* Sticky CTA */}
      <div className="sticky-bottom">
        <div className="h-12 skeleton rounded-xl" />
      </div>
    </div>
  );
}
