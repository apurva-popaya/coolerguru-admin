import Link from "next/link";
import type { TopCategory } from "@/lib/api/admin-analytics-api";

interface TopCategoriesProps {
  data: TopCategory[];
}

export function TopCategories({
  data,
}: TopCategoriesProps) {
  const maximum =
    data.length > 0
      ? Math.max(
          ...data.map(
            (item) => item.product_count,
          ),
        )
      : 0;

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-foreground text-admin-15">
          Top Categories
        </h2>

        <Link
          href="/categories"
          className="font-semibold text-primary text-admin-14"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {data.map((category) => {
          const percentage =
            maximum > 0
              ? (category.product_count /
                  maximum) *
                100
              : 0;

          return (
            <div
              key={category.category_id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_45px] items-center gap-3"
            >
              <span className="truncate text-muted-foreground text-admin-14" title={category.name}>
                {category.name}
              </span>

              <div className="h-[12px] overflow-hidden rounded-[3px] bg-muted">
                <div
                  className="h-full rounded-[3px] bg-primary/70"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <span className="text-right text-muted-foreground text-admin-14">
                {category.product_count.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex h-[130px] items-center justify-center text-muted-foreground text-admin-14">
            No category data available
          </div>
        )}
      </div>
    </div>
  );
}