"use client";

import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Eye, Heart, MessageSquare, MoreVertical, Package, Pencil, Reply } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { ActivityRow } from "./activity-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getActivityIcon(activity: ActivityRow["activity"]) {
  switch (activity) {
    case "Viewed Product":
    case "Viewed Company":
      return Eye;

    case "Saved Product":
    case "Saved Company":
      return Heart;

    case "Sent Inquiry":
      return MessageSquare;

    case "Replied to Inquiry":
      return Reply;

    case "Added Product":
      return Package;

    case "Updated Product":
      return Pencil;

    default:
      return Eye;
  }
}

function getItemHref(row: ActivityRow) {
  if (row.itemType === "product") {
    return `/products/${row.itemId}`;
  }

  if (row.itemType === "company") {
    return `/companies/${row.itemId}`;
  }

  return `/inquiries/${row.itemId}`;
}

export const activityColumns: ColumnDef<DataTableFeatures, ActivityRow>[] = [
  {
    id: "search",

    accessorFn: (row) => `${row.userName} ${row.activity} ${row.itemName}`,

    filterFn: "includesString",

    enableHiding: true,
  },

  {
    accessorKey: "userName",

    header: "User",

    cell: ({ row }) => (
      <div className="flex min-w-[210px] items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff] font-bold text-[#2720a8] text-admin-14">
          {getInitials(row.original.userName)}
        </div>

        <span className="font-semibold text-[#15136f]">{row.original.userName}</span>
      </div>
    ),
  },

  {
    accessorKey: "userType",

    header: "User Type",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge variant={row.original.userType === "Buyer" ? "info" : "purple"}>{row.original.userType}</StatusBadge>
    ),
  },

  {
    accessorKey: "activity",

    header: "Activity",

    filterFn: "equalsString",

    cell: ({ row }) => {
      const Icon = getActivityIcon(row.original.activity);

      return (
        <div className="flex min-w-[190px] items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3ff]">
            <Icon className="size-4 text-[#2563eb]" />
          </div>

          <span className="font-medium text-[#15136f]">{row.original.activity}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "itemName",

    header: "Item",

    cell: ({ row }) => {
      const item = row.original;

      const ItemIcon = item.itemType === "company" ? Building2 : item.itemType === "product" ? Package : MessageSquare;

      return (
        <Link
          href={getItemHref(item)}
          className="flex min-w-[250px] items-center gap-3 font-medium text-[#2720a8] hover:underline"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[7px] bg-[#f3f4fb]">
            <ItemIcon className="size-4 text-[#5d6280]" />
          </div>

          <span>{item.itemName}</span>
        </Link>
      );
    },
  },

  {
    accessorKey: "time",

    header: "Time",

    cell: ({ row }) => <span className="whitespace-nowrap text-[#5d6280]">{row.original.time}</span>,
  },

  {
    id: "action",

    header: () => <div className="text-center">Action</div>,

    cell: ({ row }) => (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="outline" aria-label="Activity actions">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/users/${row.original.userId}`}>View User</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={getItemHref(row.original)}>View Related Item</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),

    enableSorting: false,
  },
];
