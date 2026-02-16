export function ProfileSkeleton({
  isFullscreen,
}: {
  isFullscreen: boolean;
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className={`sticky top-0 z-40 ${isFullscreen ? "pt-20" : ""}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative px-4 py-3 border-b border-white/5">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl skeleton flex-shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-4 w-20 skeleton rounded mt-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-surface p-3 text-center">
              <div className="h-7 w-12 skeleton rounded mx-auto" />
              <div className="h-3 w-16 skeleton rounded mx-auto mt-1.5" />
            </div>
          ))}
        </div>

        <div>
          <div className="h-3 w-24 skeleton rounded mb-2" />
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card-surface p-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-28 skeleton rounded" />
                  <div className="h-3 w-16 skeleton rounded mt-1" />
                </div>
                <div className="h-5 w-5 skeleton rounded flex-shrink-0" />
              </div>
            ))}
            <div className="card-surface p-2.5 border-dashed border border-white/10">
              <div className="h-5 w-24 skeleton rounded mx-auto" />
            </div>
          </div>
        </div>

        <div>
          <div className="h-3 w-28 skeleton rounded mb-2" />
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card-surface p-3 flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-3.5 w-32 skeleton rounded" />
                  <div className="h-3 w-20 skeleton rounded mt-1" />
                </div>
                <div className="h-5 w-14 skeleton rounded-lg flex-shrink-0" />
                <div className="h-5 w-5 skeleton rounded flex-shrink-0" />
              </div>
            ))}
            <div className="card-surface p-2.5 border-dashed border border-white/10">
              <div className="h-5 w-28 skeleton rounded mx-auto" />
            </div>
          </div>
        </div>

        <div>
          <div className="h-3 w-20 skeleton rounded mb-2" />
          <div className="space-y-1.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-surface p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg skeleton flex-shrink-0" />
                <div className="h-3.5 w-28 skeleton rounded flex-1" />
                <div className="h-5 w-5 skeleton rounded flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
