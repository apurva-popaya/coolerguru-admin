import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "cn";

interface AnalyticsStatCardProps {
  title: string;

  value: string;

  growth: number;

  icon: LucideIcon;

  comparisonLabel?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  growth,
  icon: Icon,
  comparisonLabel = "vs previous period",
}: AnalyticsStatCardProps) {
  const isNegative = growth < 0;

  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-admin-14 font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 break-words text-admin-24 font-bold leading-tight text-foreground">{value}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon aria-hidden="true" className="size-5 text-primary" />
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-admin-14 font-semibold",
            isNegative ? "text-red-600" : "text-emerald-600",
          )}
        >
          {isNegative ? (
            <ArrowDown aria-hidden="true" className="size-3 shrink-0" />
          ) : (
            <ArrowUp aria-hidden="true" className="size-3 shrink-0" />
          )}
          {Math.abs(growth)}%
        </span>
        <span className="min-w-0 text-admin-14 text-muted-foreground">{comparisonLabel}</span>
      </div>
    </div>
  );
}
