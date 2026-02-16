interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${isCompact ? "py-6" : "py-12"}`}>
      <div className={`${isCompact ? "w-12 h-12" : "w-16 h-16"} rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center mb-3`}>
        <i className={`${icon} ${isCompact ? "text-xl" : "text-2xl"} text-foreground-muted`} />
      </div>
      <h4 className={`${isCompact ? "text-sm" : "text-base"} font-semibold text-foreground mb-1`}>{title}</h4>
      {description && (
        <p className={`${isCompact ? "text-xs" : "text-sm"} text-foreground-muted max-w-[200px]`}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`mt-3 inline-flex items-center gap-1.5 px-4 ${isCompact ? "py-1.5 text-xs" : "py-2 text-sm"} rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-colors`}
        >
          <i className="ri-add-line" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
