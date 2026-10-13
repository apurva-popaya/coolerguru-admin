import type { TopCategory } from "../../../lib/api/admin-analytics-api";

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
    <div className="min-h-[300px] rounded-[10px] border border-border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[#15136f] text-admin-15">
          Top Categories
        </h2>

        <button
          type="button"
          className="font-semibold text-[#2720a8] text-admin-14"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
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
              <span className="truncate text-[#5d6280] text-admin-14">
                {category.name}
              </span>

              <div className="h-[12px] overflow-hidden rounded-[3px] bg-[#edeef7]">
                <div
                  className="h-full rounded-[3px] bg-[#8b85f5]"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>

              <span className="text-right text-[#5d6280] text-admin-14">
                {category.product_count.toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex h-[130px] items-center justify-center text-[#5d6280] text-admin-14">
            No category data available
          </div>
        )}
      </div>
    </div>
  );
}