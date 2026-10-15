import { MessageCircle, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";

interface InquiriesStatsProps {
  total: number;
  newCount: number;
}

export function InquiriesStats({ total, newCount }: InquiriesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard layout="summary" title="Total Inquiries" value={total} icon={MessageSquare} subtitle="All buyer inquiries" />
      <StatCard layout="summary" title="New" value={newCount} icon={MessageCircle} subtitle="Last 7 days" />
    </div>
  );
}