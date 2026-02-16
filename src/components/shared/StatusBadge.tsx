import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "success" | "error" | "neutral";
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status,
  children,
  size = "md",
  className,
}: StatusBadgeProps) {
  const statusStyles = {
    pending: "badge-pending",
    success: "badge-success",
    error: "badge-error",
    neutral: "badge-neutral",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-3 py-1.5 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        statusStyles[status],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
