import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, trend, subtitle }: StatCardProps) {
  return (
    <div className="admin-stat-card rounded-[10px] border border-border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f3f2ff]">
          <Icon className="size-5 text-[#2720a8]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#11163d] text-[13px]">{title}</p>

          <p className="mt-1 font-bold text-[#15136f] text-[26px] leading-none">{value}</p>

          {trend && (
            <div className="mt-2 inline-flex rounded-full bg-[#e8f8ee] px-2 py-[2px] font-semibold text-[#119447] text-[11px]">
              {trend}
            </div>
          )}

          {subtitle && <p className="mt-1 text-[#5d6280] text-[11px]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
