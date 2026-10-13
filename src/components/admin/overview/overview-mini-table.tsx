import Link from "next/link";

import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";

export interface MiniTableColumn<T> {
  key: keyof T;
  label: string;
  className?: string;
}

interface OverviewMiniTableProps<T extends Record<string, string>> {
  title: string;
  columns: MiniTableColumn<T>[];
  data: T[];
  viewAllHref: string;
  emptyMessage?: string;
}

function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "Pending":
      return "warning";

    case "Under Review":
    case "New":
      return "info";

    case "Replied":
      return "success";

    case "In Discussion":
      return "purple";

    case "Closed":
      return "neutral";

    case "Rejected":
      return "danger";

    default:
      return "neutral";
  }
}

export function OverviewMiniTable<T extends Record<string, string>>({
  title,
  columns,
  data,
  viewAllHref,
  emptyMessage = "No recent records found.",
}: OverviewMiniTableProps<T>) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[10px] border border-[#e3e6f3] bg-white shadow-[0_1px_3px_rgba(21,19,111,0.03)]">
      <div className="flex min-h-16 items-center justify-between gap-4 border-[#eef0f6] border-b px-5 py-4">
        <h2 className="min-w-0 truncate font-bold text-[#15136f] text-admin-15" title={title}>
          {title}
        </h2>

        <Link
          href={viewAllHref}
          className="shrink-0 font-semibold text-[#2720a8] text-admin-14 transition-opacity hover:opacity-75"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35 [&::-webkit-scrollbar-track]:bg-transparent">
        <table className="w-full min-w-[620px] table-fixed border-collapse">
          <thead>
            <tr className="bg-[#fafafe]">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="h-11 overflow-hidden px-4 text-left font-semibold text-[#5d6280] text-admin-13"
                >
                  <span className="block truncate" title={column.label}>
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr className="border-[#f0f1f6] border-t">
                <td colSpan={columns.length} className="h-28 px-5 text-center text-muted-foreground text-admin-14">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-[#f0f1f6] border-t transition-colors hover:bg-[#fafaff]">
                  {columns.map((column) => {
                    const value = row[column.key];

                    const isStatus = column.key === "status";

                    return (
                      <td
                        key={String(column.key)}
                        className={`h-12 overflow-hidden px-4 text-[#5d6280] text-admin-14 ${column.className ?? ""}`}
                      >
                        {isStatus ? (
                          <StatusBadge variant={getStatusVariant(value)}>{value}</StatusBadge>
                        ) : (
                          <span className="block truncate" title={value}>
                            {value}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
