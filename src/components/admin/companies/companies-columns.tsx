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

function getBusinessTypeVariant(
  type: CompanyRow["businessType"],
): StatusVariant {
  switch (type) {
    case "Manufacturer":
      return "info";

    case "Supplier":
      return "purple";

    case "Exporter":
      return "info";

    case "Distributor":
      return "success";

    case "Trader":
      return "purple";

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
      <div className="flex min-w-[210px] items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-[#fafaff]">
          {row.original.logo ? (
            <img
              src={row.original.logo}
              alt={row.original.name}
              className="size-full object-contain"
            />
          ) : (
            <Building2 className="size-5 text-[#2720a8]" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-[#15136f]">
            {row.original.name}
          </p>

          <p className="text-admin-14 text-muted-foreground">
            ID: {row.original.companyId}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "location",

    header: "Location",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <span className="text-[#5d6280]">
        {row.original.location}
      </span>
    ),
  },

  {
    accessorKey: "businessType",

    header: "Business Type",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge
        variant={getBusinessTypeVariant(
          row.original.businessType,
        )}
      >
        {row.original.businessType}
      </StatusBadge>
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
      <span className="font-medium text-[#11163d]">
        {
          row.original
            .productsCount
        }
      </span>
    ),
  },

  {
    accessorKey:
      "inquiriesReceived",

    header: "Inquiries",

    cell: ({ row }) => (
      <span className="font-medium text-[#11163d]">
        {row.original
          .inquiriesReceived ??
          "—"}
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
          className="flex items-center gap-2 rounded-md p-1"
          data-drop-target={featured.dropTargetCompanyId === company.companyId || undefined}
          onDragOver={(event) => {
            if (featured.isUpdating || featured.draggedCompanyId === null ||
                featured.draggedCompanyId === company.companyId) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            featured.overDrag(company.companyId);
          }}
          onDrop={(event) => {
            event.preventDefault();
            if (!featured.isUpdating) featured.drop(company.companyId);
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            draggable={!featured.isUpdating}
            disabled={featured.isUpdating}
            aria-label={`Change ${company.name} featured priority. Use up or down arrow keys, or drag to reorder.`}
            title="Drag to reorder, or focus and press the up or down arrow key"
            onKeyDown={(event) => {
              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                featured.movePriority(company.companyId, event.key === "ArrowUp" ? -1 : 1);
              }
            }}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(company.companyId));
              featured.startDrag(company.companyId);
            }}
            onDragEnd={featured.resetDrag}
          >
            <GripVertical />
          </Button>
          <span className="font-medium">{company.featuredPriority ?? "-"}</span>
          {featured.dropTargetCompanyId === company.companyId && (
            <span className="text-muted-foreground">Drop here</span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey:
      "joinedDate",

    header: "Joined Date",

    cell: ({ row }) => (
      <span className="whitespace-nowrap text-[#5d6280]">
        {row.original.joinedDate}
      </span>
    ),
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

