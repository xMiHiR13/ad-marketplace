import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export const AppToaster = () => (
  <SonnerToaster
    position="top-center"
    offset={12}
    gap={6}
    toastOptions={{
      unstyled: true,
      className: "animate-slide-down",
    }}
  />
);

const ICONS: Record<string, string> = {
  success: "ri-checkbox-circle-fill",
  warning: "ri-error-warning-fill",
  error: "ri-close-circle-fill",
};

const STYLES: Record<string, { border: string; iconColor: string }> = {
  success: {
    border: "border-[hsl(var(--status-success)/0.3)]",
    iconColor: "text-[hsl(var(--status-success))]",
  },
  warning: {
    border: "border-[hsl(var(--status-pending)/0.3)]",
    iconColor: "text-[hsl(var(--status-pending))]",
  },
  error: {
    border: "border-[hsl(var(--status-error)/0.3)]",
    iconColor: "text-[hsl(var(--status-error))]",
  },
};

interface ToastOptions {
  description?: string;
  duration?: number;
}

const createToast =
  (type: "success" | "warning" | "error") =>
  (title: string, options?: ToastOptions) => {
    const { description, duration = 3000 } = options ?? {};
    const s = STYLES[type];

    sonnerToast.custom(
      () => (
        <div className={`mt-20 flex items-center gap-3 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl bg-[hsl(230_20%_10%/0.88)] ${s.border}`}>
          <i className={`${ICONS[type]} text-lg ${s.iconColor} flex-shrink-0`} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground leading-tight">{title}</p>
            {description && (
              <p className="text-xs text-foreground-muted leading-snug mt-0.5">{description}</p>
            )}
          </div>
        </div>
      ),
      { duration }
    );
  };

export const toast = {
  success: createToast("success"),
  warning: createToast("warning"),
  error: createToast("error"),
};
