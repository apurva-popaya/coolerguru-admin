import { CircleCheck, Store, UserRound, UserX, Users } from "lucide-react";

import { StatCard } from "@/components/common/stat-card";

interface UsersStatsProps {
  total: number;
  buyers: number;
  suppliers: number;
  active: number;
  inactive: number;
}

export function UsersStats({ total, buyers, suppliers, active, inactive }: UsersStatsProps) {
  const stats = [
    { title: "Total Users", value: total, icon: Users },
    { title: "Buyers", value: buyers, icon: UserRound },
    { title: "Suppliers", value: suppliers, icon: Store },
    { title: "Active Users", value: active, icon: CircleCheck },
    { title: "Inactive Users", value: inactive, icon: UserX },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(({ title, value, icon }) => (
        <StatCard key={title} layout="summary" title={title} value={value} icon={icon} />
      ))}
    </div>
  );
}
