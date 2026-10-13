"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { InquiryRow } from "./inquiries-data";

function statusVariant(status: InquiryRow["status"]): StatusVariant {
  switch (status) {
    case "New":
      return "info";

    case "Replied":
      return "success";

    case "In Discussion":
      return "warning";

    case "Closed":
      return "neutral";

    case "Closed":
      return "neutral";

    default:
      return "neutral";
  }
}

function inquiryTypeVariant(
  type: InquiryRow["inquiryType"],
): StatusVariant {
  switch (type) {
    case "Request Quote":
      return "info";

    case "Contact Supplier":
      return "purple";

    default:
      return "neutral";
  }
}

export const inquiriesColumns: ColumnDef<DataTableFeatures, InquiryRow>[] = [
  {
    id: "search",

    accessorFn: (row) => `${row.id} ${row.buyerName} ${row.companyName} ${row.productName} ${row.inquiryType}`,

    filterFn: "includesString",

    enableHiding: true,
  },

  {
    accessorKey: "id",

    header: "Inquiry ID",

    cell: ({ row }) => <span className="font-semibold text-[#2720a8]">{row.original.id}</span>,
  },

  {
    accessorKey: "buyerName",

    header: "Buyer",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <div className="min-w-[160px]">
        <p className="font-semibold text-[#15136f]">{row.original.buyerName}</p>

        <p className="mt-1 text-admin-14 text-muted-foreground">{row.original.buyerLocation}</p>
      </div>
    ),
  },

  {
    accessorKey: "companyName",

    header: "Supplier / Company",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <p className="font-semibold text-[#15136f]">{row.original.companyName}</p>

        <p className="mt-1 text-admin-14 text-muted-foreground">{row.original.companyLocation}</p>
      </div>
    ),
  },

  {
    accessorKey: "productName",

    header: "Product / Requirement",

    filterFn: "equalsString",
  },

  {
    accessorKey: "inquiryType",

    header: "Inquiry Type",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge variant={inquiryTypeVariant(row.original.inquiryType)}>{row.original.inquiryType}</StatusBadge>
    ),
  },

  {
    accessorKey: "quantity",

    header: "Quantity",
  },

  {
    accessorKey: "createdDate",

    header: "Created Date",

    cell: ({ row }) => <span className="whitespace-nowrap text-[#5d6280]">{row.original.createdDate}</span>,
  },

  // {
  //   accessorKey: "status",

  //   header: "Status",

  //   filterFn: "equalsString",

  //   cell: ({ row }) => <StatusBadge variant={statusVariant(row.original.status)}>{row.original.status}</StatusBadge>,
  // },

  {
    id: "action",

    header: () => <div className="text-center">Action</div>,

    cell: ({ row }) => (
      <div className="flex justify-center">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-[#cfcdf5] px-3 text-[#2720a8] hover:bg-[#f3f2ff]"
        >
          <Link href={`/inquiries/${row.original.id}`}>
            <Eye className="size-4" />
            View
          </Link>
        </Button>
      </div>
    ),

    enableSorting: false,
  },
];
