import Link from "next/link";

import { Building2, Package } from "lucide-react";

import type { RankingItem } from "./analytics-data";

interface AnalyticsRankingCardProps {
  title: string;

  items: RankingItem[];

  type: "product" | "company";
}

export function AnalyticsRankingCard({
  title,
  items,
  type,
}: AnalyticsRankingCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-foreground text-admin-14">
          {title}
        </h2>

        <Link
          href={
            type === "product"
              ? "/products"
              : "/companies"
          }
          className="font-semibold text-primary text-admin-14"
        >
          View All
        </Link>
      </div>

      <div>
        {items.map((item, index) => {
          const Icon =
            type === "product"
              ? Package
              : Building2;

          return (
            <div
              key={item.id}
              className="grid min-h-14 grid-cols-[22px_34px_minmax(0,1fr)_auto] items-center gap-2 border-border border-b last:border-b-0"
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground text-admin-14">
                {index + 1}
              </div>

              <div className="flex size-8 items-center justify-center rounded-[5px] bg-accent">
                <Icon className="size-4 text-primary" />
              </div>

              <span className="truncate font-medium text-foreground text-admin-14" title={item.name}>
                {item.name}
              </span>

              <span className="font-medium text-muted-foreground text-admin-14">
                {item.value}
              </span>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="flex h-[100px] items-center justify-center text-muted-foreground text-admin-14">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}