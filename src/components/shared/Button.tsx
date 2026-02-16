interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 touch-target select-none overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-[hsl(195,90%,50%)] text-primary-foreground hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-none",
    secondary:
      "bg-secondary/80 backdrop-blur-sm text-secondary-foreground border border-white/10 hover:bg-secondary hover:border-white/20 active:scale-[0.98] disabled:opacity-50",
    danger:
      "bg-gradient-to-r from-destructive to-[hsl(20,80%,55%)] text-destructive-foreground hover:shadow-lg hover:shadow-destructive/25 active:scale-[0.98] disabled:opacity-50",
    ghost:
      "bg-transparent text-foreground hover:bg-white/5 active:scale-[0.98] disabled:opacity-50",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs min-w-[70px]",
    md: "h-10 px-4 text-sm min-w-[80px]",
    lg: "h-11 px-6 text-sm min-w-[100px]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
