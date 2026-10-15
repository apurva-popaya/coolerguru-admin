"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  GripVertical,
  MinusCircle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { FeaturedCompanyRow } from "./featured-companies-data";

interface CreateColumnsProps {
  onToggleFeatured: (
    companyId: number,
    isFeatured: boolean,
    priority: number | null,
  ) => void;

  onDragStart: (companyId: number) => void;

  onDragEnd: () => void;

  onDragOver: (companyId: number) => void;

  onDrop: (companyId: number) => void;

  draggedCompanyId: number | null;

  dropTargetCompanyId: number | null;

  isReordering: boolean;
}

function formatBusinessType(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function getDropHandlers(
  company: FeaturedCompanyRow,
  {
    draggedCompanyId,
    onDragOver,
    onDrop,
  }: {
    draggedCompanyId: number | null;
    onDragOver: (companyId: number) => void;
    onDrop: (companyId: number) => void;
  },
) {
  if (
    !company.isFeatured ||
    draggedCompanyId === null ||
    draggedCompanyId === company.companyId
  ) {
    return {};
  }

  return {
    onDragOver: (
      event: React.DragEvent<HTMLDivElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      event.dataTransfer.dropEffect = "move";

      onDragOver(company.companyId);
    },

    onDrop: (
      event: React.DragEvent<HTMLDivElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      onDrop(company.companyId);
    },
  };
}

function getDropClassName(
  company: FeaturedCompanyRow,
  dropTargetCompanyId: number | null,
) {
  if (
    company.isFeatured &&
    company.companyId === dropTargetCompanyId
  ) {
    return "rounded-md bg-accent ring-2 ring-inset ring-[#6c63ff]";
  }

  return "rounded-md";
}

export function createFeaturedCompaniesColumns({
  onToggleFeatured,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggedCompanyId,
  dropTargetCompanyId,
  isReordering,
}: CreateColumnsProps): ColumnDef<
  DataTableFeatures,
  FeaturedCompanyRow
>[] {
  return [
    {
      id: "search",

      accessorFn: (row) =>
        `${row.name} ${row.location} ${row.businessType}`,

      filterFn: "includesString",

      enableHiding: true,
    },

    {
      id: "featuredStatus",

      accessorFn: (row) =>
        row.isFeatured
          ? "Featured"
          : "Not Featured",

      filterFn: "equalsString",

      enableHiding: true,
    },

    {
      accessorKey: "name",

      header: "Company",

      cell: ({ row }) => {
        const company = row.original;

        const dropHandlers = getDropHandlers(
          company,
          {
            draggedCompanyId,
            onDragOver,
            onDrop,
          },
        );

        const isDragging =
          draggedCompanyId === company.companyId;

        return (
          <div
            {...dropHandlers}
            className={`flex min-w-[230px] items-center gap-3 px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            {company.isFeatured ? (
              <button
                type="button"
                draggable={!isReordering}
                disabled={isReordering}
                aria-label={`Drag ${company.name} to change priority`}
                title="Drag to change priority"
                onDragStart={(event) => {
                  if (isReordering) {
                    event.preventDefault();
                    return;
                  }

                  event.dataTransfer.effectAllowed =
                    "move";

                  event.dataTransfer.setData(
                    "text/plain",
                    String(company.companyId),
                  );

                  onDragStart(company.companyId);
                }}
                onDragEnd={() => {
                  onDragEnd();
                }}
                className={`flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-[#7b7f9d] transition-colors hover:bg-[#eeecff] hover:text-[#3025c7] active:cursor-grabbing ${
                  isDragging
                    ? "bg-[#eeecff] text-[#3025c7]"
                    : ""
                }`}
              >
                <GripVertical className="size-4" />
              </button>
            ) : (
              <div className="size-7 shrink-0" />
            )}

            <div className="flex h-10 min-w-[56px] items-center justify-center font-bold text-foreground text-admin-15">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-10 w-14 object-contain"
                  draggable={false}
                />
              ) : (
                getInitials(company.name)
              )}
            </div>

            <span className="font-semibold text-foreground">
              {company.name}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "location",

      header: "Location",

      cell: ({ row }) => {
        const company = row.original;

        return (
          <div
            {...getDropHandlers(company, {
              draggedCompanyId,
              onDragOver,
              onDrop,
            })}
            className={`px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            <span className="text-muted-foreground">
              {company.location}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "businessType",

      header: "Business Type",

      filterFn: "equalsString",

      cell: ({ row }) => {
        const company = row.original;

        return (
          <div
            {...getDropHandlers(company, {
              draggedCompanyId,
              onDragOver,
              onDrop,
            })}
            className={`px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            <div className="flex max-w-[220px] flex-wrap gap-1">
              {company.businessTypes.map(
                (type) => (
                  <span
                    key={type}
                    className="rounded-[4px] bg-[#f1efff] px-2 py-1 text-[#3025c7]"
                  >
                    {formatBusinessType(type)}
                  </span>
                ),
              )}
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "featuredSince",

      header: "Featured Since",

      cell: ({ row }) => {
        const company = row.original;

        return (
          <div
            {...getDropHandlers(company, {
              draggedCompanyId,
              onDragOver,
              onDrop,
            })}
            className={`px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            <span className="text-muted-foreground">
              {formatDate(company.featuredSince)}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "priority",

      header: "Priority",

      cell: ({ row }) => {
        const company = row.original;

        return (
          <div
            {...getDropHandlers(company, {
              draggedCompanyId,
              onDragOver,
              onDrop,
            })}
            className={`px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            {company.priority !== null ? (
              <div className="flex size-10 items-center justify-center rounded-[7px] border border-border bg-card font-medium text-foreground text-admin-14">
                {company.priority}
              </div>
            ) : (
              <div className="flex size-10 items-center justify-center rounded-[7px] border border-border bg-card text-admin-14 text-muted-foreground">
                -
              </div>
            )}
          </div>
        );
      },
    },

    {
      id: "action",

      header: "Action",

      cell: ({ row }) => {
        const company = row.original;

        return (
          <div
            {...getDropHandlers(company, {
              draggedCompanyId,
              onDragOver,
              onDrop,
            })}
            className={`px-1 py-1 ${getDropClassName(
              company,
              dropTargetCompanyId,
            )}`}
          >
            {company.isFeatured ? (
              <Button
                type="button"
                variant="outline"
                disabled={isReordering}
                onClick={() =>
                  onToggleFeatured(
                    company.companyId,
                    true,
                    company.priority,
                  )
                }
                className="h-9 min-w-[180px] gap-2 border-[#efcaca] text-red-600 hover:bg-red-50 hover:text-red-600"
              >
                <MinusCircle className="size-4" />
                Remove from Featured
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isReordering}
                onClick={() =>
                  onToggleFeatured(
                    company.companyId,
                    false,
                    company.priority,
                  )
                }
                className="h-9 min-w-[180px] gap-2 border-[#8ea0ff] text-primary hover:bg-accent"
              >
                <Plus className="size-4" />
                Add to Featured
              </Button>
            )}
          </div>
        );
      },

      enableSorting: false,
    },
  ];
}  