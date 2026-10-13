import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  MessageSquare,
  Reply,
  ShieldAlert,
} from "lucide-react";

import {
  StatCard,
} from "@/components/common/stat-card";

interface InquiriesStatsProps {
  total: number;
  newCount: number;
  // replied: number;
  // discussion: number;
  // closed: number;
  spam: number;
}

export function InquiriesStats({
  total,
  newCount,
  // replied,
  // discussion,
  // closed,
  spam,
}: InquiriesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1920px]:grid-cols-6">
      <StatCard title="Total Inquiries" value={total} icon={MessageSquare} subtitle="All buyer inquiries" />

      <StatCard title="New" value={newCount} icon={MessageCircle} subtitle="Awaiting response" />

      {/* <StatCard title="Replied" value={replied} icon={Reply} subtitle="Suppliers have replied" />

      <StatCard title="In Discussion" value={discussion} icon={Clock3} subtitle="Active conversations" />

      <StatCard title="Closed" value={closed} icon={CheckCircle2} subtitle="Successfully closed" /> */}

      <StatCard title="Spam" value={spam} icon={ShieldAlert} subtitle="Reported inquiries" />
    </div>
  );
}