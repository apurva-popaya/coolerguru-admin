import Link from "next/link";

import { cn } from "cn";
import { Building2, MessagesSquare, Package } from "lucide-react";

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
  className?: string;
}

function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case "Pending":
      return "warning";

    case "Under Review":
    case "New":
      return "info";

    case "Approved":
    case "Verified":
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
  className,
}: OverviewMiniTableProps<T>) {
  const Icon = viewAllHref === "/companies" ? Building2 : viewAllHref === "/products" ? Package : MessagesSquare;

  return (
    <div className={cn("min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-center gap-2 font-bold text-foreground text-admin-15">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span>{title}</span>
        </h2>

        <Link
          href={viewAllHref}
          className="shrink-0 rounded-lg border border-border px-3 py-2 font-medium text-primary text-admin-13 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View All
        </Link>
      </div>

      <div className="min-w-0 overflow-x-auto" role="region" aria-label={title} tabIndex={0}>
        <table aria-label={title} className="w-full min-w-[32rem] table-fixed border-collapse lg:min-w-0">
          <colgroup>
            {columns.map((column, index) => (
              <col key={String(column.key)} style={{ width: index === 0 ? "34%" : `${66 / (columns.length - 1)}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-muted/60">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className="h-10 px-2.5 text-left font-medium text-muted-foreground text-admin-13 first:rounded-l-lg last:rounded-r-lg"
                >
                  <span className="block break-words">
                    {column.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground text-admin-14">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
                  {columns.map((column, columnIndex) => {
                    const value = row[column.key];

                    const isStatus = column.key === "status";

                    return (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "min-w-0 px-2.5 align-middle text-muted-foreground text-admin-13 py-3.5",
                          column.className,
                        )}
                      >
                        {isStatus ? (
                          <StatusBadge variant={getStatusVariant(value)} className="max-w-full whitespace-normal">
                            {value}
                          </StatusBadge>
                        ) : columnIndex === 0 ? (
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                              <Icon aria-hidden="true" className="size-4" />
                            </span>
                            <span className="min-w-0 truncate font-semibold text-foreground" title={value}>
                              {value}
                            </span>
                          </span>
                        ) : (
                          <span className="block break-words" title={value}>
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
