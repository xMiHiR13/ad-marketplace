export function DealCardSkeleton() {
  return (
    <div className="card-surface p-3">
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {/* Header: Title + Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-3 w-1/2 skeleton rounded mt-1" />
            </div>
            <div className="h-5 w-16 skeleton rounded-full flex-shrink-0" />
          </div>
          
          {/* Footer: Ad type, Role, Time, Price */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-10 skeleton rounded" />
              <div className="h-3 w-1 skeleton rounded" />
              <div className="h-3 w-14 skeleton rounded" />
              <div className="h-3 w-1 skeleton rounded" />
              <div className="h-3 w-10 skeleton rounded" />
            </div>
            <div className="h-4 w-12 skeleton rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
