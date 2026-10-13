import { cn } from "cn";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const variants: Record<StatusVariant, string> = {
  success: "bg-[#e8f8ee] text-[#119447]",

  warning: "bg-[#fff4df] text-[#e17b00]",

  danger: "bg-[#ffe8e8] text-[#d92d20]",

  info: "bg-[#e8f1ff] text-[#2563eb]",

  neutral: "bg-[#f1f2f6] text-[#5d6280]",

  purple: "bg-[#f0edff] text-[#6c3ce9]",
};

export function StatusBadge({ children, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "admin-status-badge inline-flex items-center rounded-md px-2 py-1 font-medium text-[11px]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
