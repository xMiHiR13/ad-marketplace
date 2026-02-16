import { formatNumber, formatDelta } from "@/lib/formatters";

interface StatItemProps {
  label: string;
  current: number;
  previous: number;
  icon: string;
  iconColor: string;
}

/** Reusable stat card showing current value with delta indicator */
export function StatItem({
  label,
  current,
  previous,
  icon,
  iconColor,
}: StatItemProps) {
  const delta = formatDelta(current, previous);
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1">
        <i className={`${icon} text-xs ${iconColor} flex-shrink-0`} aria-hidden="true" />
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-bold text-foreground">{formatNumber(current)}</span>
        <span
          className={`text-[10px] font-medium ${
            delta.positive ? "text-status-success" : "text-status-error"
          }`}
        >
          {delta.value}
        </span>
      </div>
    </div>
  );
}
