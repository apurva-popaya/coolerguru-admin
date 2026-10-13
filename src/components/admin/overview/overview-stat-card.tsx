import type { LucideIcon } from "lucide-react";

type IconVariant = "blue" | "purple" | "orange" | "green";

interface OverviewStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconVariant?: IconVariant;
  trend?: string;
  subtitle?: string;
}

const iconStyles: Record<IconVariant, string> = {
  blue: "bg-[#edf3ff] text-[#2563eb]",
  purple: "bg-[#f2edff] text-[#6c3cff]",
  orange: "bg-[#fff4df] text-[#f58a00]",
  green: "bg-[#e8f8ee] text-[#08a65c]",
};

export function OverviewStatCard({
  title,
  value,
  icon: Icon,
  iconVariant = "blue",
  trend,
  subtitle,
}: OverviewStatCardProps) {
  return (
    <div className="min-h-[140px] rounded-[8px] border border-[#e3e6f3] bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex size-[50px] shrink-0 items-center justify-center rounded-full ${iconStyles[iconVariant]}`}
        >
          <Icon className="size-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="min-h-[34px] font-semibold text-[#15136f] text-admin-14 leading-snug">{title}</p>

          <p className="mt-1 font-bold text-[#0e1453] text-admin-27 leading-none">{value}</p>

          {trend && (
            <div className="mt-2 inline-flex rounded-full bg-[#e8f8ee] px-2 py-[2px] font-semibold text-[#119447] text-admin-14">
              ↑ {trend}
            </div>
          )}

          {subtitle && <p className="mt-2 text-[#5d6280] text-admin-14">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
