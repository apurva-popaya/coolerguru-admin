import { CircleCheck, Clock3, Package, PackageX, Warehouse } from "lucide-react";

import { StatCard } from "@/components/common/stat-card";

interface ProductsStatsProps {
  total: number;
  active: number;
  inactive: number;
  approved: number;
  pending: number;
  outOfStock: number;
}

export function ProductsStats({ total, active, inactive, approved, pending, outOfStock }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-6">
      <StatCard title="Total Products" value={total} icon={Package} />

      <StatCard title="Active Products" value={active} icon={CircleCheck} />

      <StatCard title="Inactive Products" value={inactive} icon={PackageX} />

      <StatCard title="Approved Products" value={approved} icon={CircleCheck} />

      <StatCard title="Pending Approval" value={pending} icon={Clock3} />

      <StatCard title="Out of Stock" value={outOfStock} icon={Warehouse} />
    </div>
  );
}
