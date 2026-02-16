export function ChannelCardSkeleton() {
  return (
    <div className="card-surface p-4">
      {/* Header: Avatar, Title/Username */}
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl skeleton flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/3 skeleton rounded mt-1.5" />
        </div>
      </div>

      {/* Stats Grid: 3 columns */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="h-4 w-12 skeleton rounded mx-auto" />
          <div className="h-3 w-16 skeleton rounded mx-auto mt-1.5" />
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="h-4 w-12 skeleton rounded mx-auto" />
          <div className="h-3 w-14 skeleton rounded mx-auto mt-1.5" />
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="h-4 w-10 skeleton rounded mx-auto" />
          <div className="h-3 w-14 skeleton rounded mx-auto mt-1.5" />
        </div>
      </div>

      {/* Pricing Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <div className="h-6 w-20 skeleton rounded-lg" />
        <div className="h-6 w-24 skeleton rounded-lg" />
      </div>

      {/* Button */}
      <div className="h-10 skeleton rounded-xl mt-4" />
    </div>
  );
}
