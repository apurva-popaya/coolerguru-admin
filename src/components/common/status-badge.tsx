import { cn } from "cn";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const variants: Record<StatusVariant, string> = {
  success: "bg-emerald-50 text-emerald-700",

  warning: "bg-amber-50 text-amber-700",

  danger: "bg-destructive/10 text-destructive",

  info: "bg-accent text-primary",

  neutral: "bg-muted text-muted-foreground",

  purple: "bg-accent text-primary",
};

export function StatusBadge({ children, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "admin-status-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
