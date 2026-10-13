"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Loader2, Package, Pencil, Power, PowerOff } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

function stockVariant(status: ProductRow["stockStatus"]): StatusVariant {
  switch (status) {
    case "In Stock":
      return "success";

    case "Low Stock":
      return "warning";

    case "Out of Stock":
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
    <Tooltip><TooltipTrigger asChild>
      <span tabIndex={!product.slug ? 0 : undefined}>
        {product.slug ? <Button asChild variant="outline" size="icon">
          <Link href={`/products/${encodeURIComponent(product.slug)}/edit`} aria-label={`Edit ${product.name}`}><Pencil /></Link>
        </Button> : <Button variant="outline" size="icon" disabled aria-label="Edit product unavailable"><Pencil /></Button>}
      </span>
    </TooltipTrigger><TooltipContent>{product.slug ? "Edit product" : "This product is missing its slug."}</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger asChild>
      <span tabIndex={!product.slug ? 0 : undefined}>
        {product.slug ? <Button asChild variant="outline" size="icon">
          <Link href={`/products/${encodeURIComponent(product.slug)}`} aria-label={`View ${product.name}`}><Eye /></Link>
        </Button> : <Button variant="outline" size="icon" disabled aria-label="View product unavailable"><Eye /></Button>}
      </span>
    </TooltipTrigger><TooltipContent>{product.slug ? "View product" : "This product has no link. Please correct its missing slug."}</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger asChild>
      <span tabIndex={!canToggle || saving ? 0 : undefined}>
        <Button type="button" variant={active ? "destructive" : "outline"} size="icon" disabled={!canToggle || saving}
          aria-label={`${action}: ${product.name}`} aria-busy={saving} onClick={() => setConfirmOpen(true)}>
          {saving ? <Loader2 className="animate-spin" /> : active ? <PowerOff /> : <Power />}
        </Button>
      </span>
    </TooltipTrigger><TooltipContent>{!product.slug ? "This product is missing its slug." : !canToggle
      ? "Review and approve this product before changing its listing status." : saving ? "Updating product status..." : action}</TooltipContent></Tooltip>
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
      <div className="flex min-w-[230px] items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] border border-border bg-[#fafaff]">
          <Package className="size-5 text-[#2720a8]" />
        </div>

        <div>
          <p className="font-semibold text-[#15136f]">{row.original.name}</p>

          <p className="mt-1 text-admin-14 text-muted-foreground">{row.original.modelNumber}</p>
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
    accessorKey: "modelNumber",

    header: "Model Number",
  },

  {
    accessorKey: "price",

    header: "Price",

    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium text-[#15136f]">
        {row.original.price !== null ? `₹ ${row.original.price.toLocaleString("en-IN")}` : "-"}
      </span>
    ),
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
    accessorKey: "stockStatus",

    header: "Stock",

    filterFn: "equalsString",

    cell: ({ row }) => (
      <StatusBadge variant={stockVariant(row.original.stockStatus)}>{row.original.stockStatus}</StatusBadge>
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
