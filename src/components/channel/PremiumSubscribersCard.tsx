import { formatNumber } from "@/lib/formatters";

interface PremiumSubscribersCardProps {
  part: number;
  total: number;
}

export function PremiumSubscribersCard({
  part,
  total,
}: PremiumSubscribersCardProps) {
  const percent = total > 0 ? (part / total) * 100 : 0;

  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1">
        <i className="ri-vip-diamond-line text-xs text-violet-400 flex-shrink-0" />
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
          Premium Subscribers
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-base font-bold text-foreground">
          ≈{formatNumber(Math.round(part))}
        </span>
        <span className="text-xs text-foreground-muted">
          {percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
