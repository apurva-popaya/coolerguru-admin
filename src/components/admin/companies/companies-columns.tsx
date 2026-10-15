"use client";


import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  GripVertical,
} from "lucide-react";

import {
  StatusBadge,
  type StatusVariant,
} from "@/components/common/status-badge";

import { Button } from "@/components/ui/button";

import type { DataTableFeatures } from "@/lib/data-table-features";

import type {
  CompanyRow,
} from "./companies-data";
import type { useCompanyFeatured } from "./use-company-featured";
import { CompanyActions } from "./company-actions";

function getVerificationVariant(
  status: CompanyRow["verificationStatus"],
): StatusVariant {
  switch (status) {
    case "Verified":
      return "success";

    case "Pending":
      return "warning";

    case "Under Verification":
      return "info";

    case "Rejected":
      return "danger";

    case "Draft":
      return "neutral";

    default:
      return "neutral";
  }
}

export function createCompaniesColumns(featured: ReturnType<typeof useCompanyFeatured>, onUpdated: () => Promise<void>):
  ColumnDef<
    DataTableFeatures,
    CompanyRow
  >[] {
  return [
  {
    id: "search",

    accessorFn: (row) =>
      `${row.name} ${row.location} ${row.businessType} ${row.verificationStatus}`,

    filterFn: "includesString",

    enableHiding: true,
  },

  {
    accessorKey: "name",

    header: "Company",

    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50">
          {row.original.logo ? (
            <img
              src={row.original.logo}
              alt={row.original.name}
              className="size-full object-contain"
            />
          ) : (
            <Building2 className="size-5 text-primary" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground" title={row.original.name}>
            {row.original.name}
          </p>

          <p className="break-words text-admin-14 text-muted-foreground">
            ID: {row.original.companyId}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey:
      "verificationStatus",

    header: "Verification Status",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge
        variant={getVerificationVariant(
          row.original.verificationStatus,
        )}
      >
        {
          row.original
            .verificationStatus
        }
      </StatusBadge>
    ),
  },

  {
  id: "status",

  accessorFn: (row) =>
    row.isActive ? "Active" : "Inactive",

  header: "Status",

  filterFn: "equalsString",

  cell: ({ row }) => (
    <StatusBadge
      variant={
        row.original.isActive
          ? "success"
          : "danger"
      }
    >
      {row.original.isActive
        ? "Active"
        : "Inactive"}
    </StatusBadge>
  ),
},

  {
    accessorKey:
      "productsCount",

    header: "Products",

    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {
          row.original
            .productsCount
        }
      </span>
    ),
  },

  {
    id: "featured",

    accessorFn: (row) =>
      row.featured
        ? "Featured"
        : "Not Featured",

    header: "Featured",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge
        variant={
          row.original.featured
            ? "success"
            : "neutral"
        }
      >
        {row.original.featured
          ? "Yes"
          : "No"}
      </StatusBadge>
    ),
  },

  {
    accessorKey: "featuredPriority",
    header: "Priority",
    cell: ({ row }) => {
      const company = row.original;
      if (!company.featured) return <span className="text-muted-foreground">-</span>;

      return (
        <div
          className="flex flex-wrap items-center gap-1 rounded-md p-1 md:justify-center"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            data-company-drag-handle
            disabled={featured.isUpdating}
            aria-label={`Change ${company.name} featured priority. Use up or down arrow keys, or drag to reorder.`}
            title="Drag to reorder, or focus and press the up or down arrow key"
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                featured.movePriority(company.companyId, event.key === "ArrowUp" ? -1 : 1);
              }
            }}
          >
            <GripVertical />
          </Button>
          <span className="font-medium">{company.featuredPriority ?? "-"}</span>
        </div>
      );
    },
  },

  {
    id: "action",

    header: () => (
      <div className="text-center">
        Action
      </div>
    ),

    cell: ({ row }) => <CompanyActions company={row.original} featured={featured} onUpdated={onUpdated} />,

    enableSorting: false,

    enableHiding: false,
  },
];
}

