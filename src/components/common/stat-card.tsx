import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  layout?: "default" | "summary";
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, layout = "default" }: StatCardProps) {
  if (layout === "summary") {
    return (
      <div className="admin-stat-card rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-1 font-bold text-foreground leading-none">{value}</p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>
        </div>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        {trend && <p className="mt-2 text-sm text-primary">{trend}</p>}
      </div>
    );
  }

  return (
    <div className="admin-stat-card rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent">
          <Icon className="size-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm">{title}</p>

          <p className="mt-1 font-bold text-foreground text-[26px] leading-none">{value}</p>

          {trend && (
            <div className="mt-2 inline-flex rounded-full bg-[#e8f8ee] px-2 py-[2px] font-semibold text-[#119447] text-xs">
              {trend}
            </div>
          )}

          {subtitle && <p className="mt-1 text-muted-foreground text-[11px]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
