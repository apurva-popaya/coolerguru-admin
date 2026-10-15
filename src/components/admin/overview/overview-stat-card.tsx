import type { ComponentProps } from "react";

import { StatCard } from "@/components/common/stat-card";

type OverviewStatCardProps = Omit<ComponentProps<typeof StatCard>, "layout">;

export function OverviewStatCard(props: OverviewStatCardProps) {
  return <StatCard {...props} layout="summary" />;
}
