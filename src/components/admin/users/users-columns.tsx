"use client";

import Link from "next/link";

import type {
  ColumnDef,
} from "@tanstack/react-table";

import {
  Eye,
} from "lucide-react";

import {
  StatusBadge,
  type StatusVariant,
} from "@/components/common/status-badge";

import {
  Button,
} from "@/components/ui/button";

import type {
  DataTableFeatures,
} from "@/lib/data-table-features";

import {
  UserActionsMenu,
} from "./user-actions-menu";

import type {
  AdminUserRow,
  UserRole,
} from "./users-data";

function roleVariant(
  role: UserRole,
): StatusVariant {
  if (role === "Buyer") {
    return "info";
  }

  if (role === "Admin") {
    return "warning";
  }

  return "purple";
}

function getInitials(
  name: string,
) {
  return name
    .split(" ")
    .map(
      (part) => part[0],
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createUsersColumns({
  onStatusUpdated,
}: {
  onStatusUpdated?: () => void;
} = {}): ColumnDef<
  DataTableFeatures,
  AdminUserRow
>[] {
  return [
    {
      id: "search",

      accessorFn: (row) =>
        `${row.name} ${row.mobile} ${row.email}`,

      filterFn:
        "includesString",

      enableHiding:
        true,
    },

    {
      accessorKey:
        "name",

      header:
        "Name",

      cell: ({ row }) => (
        <div className="flex min-w-[190px] items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-admin-14">
            {getInitials(
              row.original.name,
            )}
          </div>

          <div>
            <span className="font-semibold text-foreground">
              {row.original.name}
            </span>

            {row.original.companyName ? (
              <p className="mt-1 text-admin-14 text-muted-foreground">
                {row.original.companyName}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },

    {
      id: "contact",

      header:
        "Mobile",

      cell: ({ row }) => (
        <div className="min-w-[170px]">
          <p className="text-muted-foreground">
            {row.original.mobile}
          </p>

          {row.original.email ? (
            <p className="mt-1 text-admin-14 text-muted-foreground">
              {row.original.email}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      id: "roles",

      header:
        "Role",

      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map(
            (role) => (
              <StatusBadge key={role} variant={roleVariant(role)}>
                {role}
              </StatusBadge>
            ),
          )}
        </div>
      ),
    },

    // {
    //   accessorKey:
    //     "accountType",

    //   header:
    //     "Account Type",
    // },

    {
      accessorKey:
        "status",

      header:
        "Status",

      cell: ({ row }) => (
        <StatusBadge variant={row.original.status === "Active" ? "success" : "danger"}>
          {row.original.status}
        </StatusBadge>
      ),
    },

    {
      accessorKey:
        "joinedDate",

      header:
        "Joined",

      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.joinedDate}
        </span>
      ),
    },

    {
      accessorKey:
        "lastActivity",

      header:
        "Last Activity",

      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {row.original.lastActivity}
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

      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="outline" size="icon-sm">
            <Link href={`/users/${row.original.backendId}`} aria-label={`View ${row.original.name}`}>
              <Eye className="size-4" />
            </Link>
          </Button>

          <UserActionsMenu user={row.original} onStatusUpdated={onStatusUpdated} />
        </div>
      ),

      enableSorting:
        false,

      enableHiding:
        false,
    },
  ];
}
