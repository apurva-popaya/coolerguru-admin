import { CircleCheck, Clock3, Package } from "lucide-react";

import { StatCard } from "@/components/common/stat-card";

interface ProductsStatsProps {
  total: number;
  approved: number;
  pending: number;
}

export function ProductsStats({ total, approved, pending }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard layout="summary" title="Total Products" value={total} icon={Package} subtitle="All product records" />
      <StatCard layout="summary" title="Approved Products" value={approved} icon={CircleCheck} subtitle="Approved for listing" />
      <StatCard layout="summary" title="Pending Approval" value={pending} icon={Clock3} subtitle="Awaiting product review" />
    </div>
  );
}
