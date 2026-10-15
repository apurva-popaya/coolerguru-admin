"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, MoreHorizontal, Package, Pencil, Power, PowerOff } from "lucide-react";

import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateProductActiveStatus } from "@/lib/api/admin-products-api";
import type { DataTableFeatures } from "@/lib/data-table-features";

import type { ProductRow } from "./products-data";

function approvalVariant(status: ProductRow["approvalStatus"]): StatusVariant {
  switch (status) {
    case "Approved":
      return "success";

    case "Pending":
      return "warning";

    case "Under Review":
      return "info";

    case "Rejected":
      return "danger";

    default:
      return "neutral";
  }
}

function ProductActions({ product, onStatusUpdated }: { product: ProductRow; onStatusUpdated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const active = product.listingStatus === "Active";
  const canToggle = Boolean(product.slug) && product.approvalStatus === "Approved";
  const action = active ? "Deactivate product" : "Activate product";

  async function toggleStatus() {
    if (saving || !canToggle) return;
    setSaving(true);
    try {
      const response = await updateProductActiveStatus(product.slug, !active);
      if (!response.success) throw new Error("Status update failed.");
      toast.success(active ? "Product deactivated." : "Product activated.");
      setConfirmOpen(false);
      onStatusUpdated();
    } catch {
      toast.error("We couldn't update the product status. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="flex items-center justify-center gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={saving} aria-label={`Actions for ${product.name}`}>
          {saving ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild disabled={!product.slug}><Link href={product.slug ? `/products/${encodeURIComponent(product.slug)}/edit` : "#"}><Pencil />Edit product</Link></DropdownMenuItem>
          <DropdownMenuItem asChild disabled={!product.slug}><Link href={product.slug ? `/products/${encodeURIComponent(product.slug)}` : "#"}><Eye />View product</Link></DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={!canToggle || saving} variant={active ? "destructive" : "default"} onSelect={() => setConfirmOpen(true)}>{active ? <PowerOff /> : <Power />}{action}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!saving) setConfirmOpen(open); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{active ? "Deactivate product?" : "Activate product?"}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {active ? "deactivate" : "activate"} “{product.name}”?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={active ? "destructive" : "default"} disabled={saving} onClick={(event) => {
            event.preventDefault();
            void toggleStatus();
          }}>
            {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {saving ? "Updating..." : active ? "Deactivate" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}

export function createProductsColumns(onStatusUpdated: () => void): ColumnDef<DataTableFeatures, ProductRow>[] {
  return [
  {
    id: "search",

    accessorFn: (row) => `${row.name} ${row.modelNumber} ${row.company} ${row.category}`,

    filterFn: "includesString",

    enableHiding: true,
  },

  {
    accessorKey: "name",

    header: "Product",

    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/50">
          <Package className="size-5 text-primary" />
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground" title={row.original.name}>{row.original.name}</p>

          <p className="mt-1 break-words text-admin-14 text-muted-foreground">{row.original.modelNumber}</p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "company",

    header: "Company",

    filterFn: "equalsString",
  },

  {
    accessorKey: "category",

    header: "Category",

    filterFn: "equalsString",
  },



  {
    accessorKey: "listingStatus",

    header: "Status",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge variant={row.original.listingStatus === "Active" ? "success" : "danger"}>
        {row.original.listingStatus}
      </StatusBadge>
    ),
  },


  {
    accessorKey: "approvalStatus",

    header: "Approval Status",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge variant={approvalVariant(row.original.approvalStatus)}>{row.original.approvalStatus}</StatusBadge>
    ),
  },

  // {
  //   accessorKey: "views",
  //   header: "Views",
  // },

  {
    accessorKey: "savedCount",
    header: "Saved",
  },

  {
    accessorKey: "inquiries",
    header: "Inquiries",
  },

  {
    id: "action",

    header: () => <div className="text-center">Action</div>,

    cell: ({ row }) => <ProductActions product={row.original} onStatusUpdated={onStatusUpdated} />,

    enableSorting: false,
  },
];
}
