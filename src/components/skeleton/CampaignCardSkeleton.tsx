export function CampaignCardSkeleton() {
  return (
    <div className="card-surface p-4">
      {/* Header: Title + Category badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-5 w-3/5 skeleton rounded flex-1" />
        <div className="h-6 w-16 skeleton rounded-lg flex-shrink-0" />
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-4/5 skeleton rounded" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
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

      {/* Ad Types + Languages + Budget Row */}
      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <div className="h-6 w-14 skeleton rounded-lg" />
            <div className="h-6 w-16 skeleton rounded-lg" />
          </div>
          <div className="h-5 w-24 skeleton rounded" />
        </div>
        {/* Language badges */}
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-12 skeleton rounded" />
          <div className="h-5 w-14 skeleton rounded" />
          <div className="h-5 w-10 skeleton rounded" />
        </div>
      </div>

      {/* Button */}
      <div className="h-10 skeleton rounded-xl mt-4" />
    </div>
  );
}
