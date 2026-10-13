"use client";
import Link from "next/link";
import * as React from "react";

import {
  ArrowLeft,
  Building2,
  Eye,
  Heart,
  IndianRupee,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Warehouse,
} from "lucide-react";

import { DetailSection } from "@/components/admin/company-detail/detail-section";
import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { updateProductActiveStatus } from "@/lib/api/admin-products-api";

import { ProductAdminDecision } from "./product-admin-decision";
import type { ProductDetailData } from "./product-detail-data";

function approvalVariant(status: ProductDetailData["approvalStatus"]): StatusVariant {
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

export function ProductDetail({
  product,
  onUpdated,
}: {
  product: ProductDetailData;
  // Refetches the product after an admin action.
  onUpdated: () => Promise<void>;
}) {
  const approved = product.approvalStatus === "Approved";

  const rejected = product.approvalStatus === "Rejected";

  const [updatingActive, setUpdatingActive] = React.useState(false);

  const [activeError, setActiveError] = React.useState("");

    async function handleToggleActive() {
    if (updatingActive) {
      return;
    }

    const isCurrentlyActive = product.listingStatus === "Active";
    const nextActiveStatus = !isCurrentlyActive;

    setUpdatingActive(true);
    setActiveError("");

    try {
      await updateProductActiveStatus(
        product.slug,
        nextActiveStatus,
      );

      await onUpdated();
    } catch (error) {
      setActiveError(
        error instanceof Error
          ? error.message
          : "Unable to update product status.",
      );
    } finally {
      setUpdatingActive(false);
    }
  }

  return (
    <div className="space-y-5">
      <Link href="/products" className="inline-flex items-center gap-2 font-medium text-[#2720a8] text-admin-14">
        <ArrowLeft className="size-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-[9px] border border-border bg-white p-5">
          <div className="flex gap-5">
            <div className="flex size-[120px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-[#fafaff]">
              <Package className="size-12 text-[#2720a8]" />
            </div>

            <div>
              <h1 className="font-bold text-[#15136f] text-admin-25">{product.name}</h1>

              {product.companyId !== null ? (
                <Link
                  href={`/companies/${product.companyId}`}
                  className="mt-2 inline-flex items-center gap-2 font-semibold text-[#2720a8] text-admin-14"
                >
                  <Building2 className="size-4" />
                  {product.company}
                </Link>
              ) : (
                <p className="mt-2 inline-flex items-center gap-2 text-admin-14 font-semibold text-muted-foreground">
                  <Building2 className="size-4" />
                  {product.company}
                </p>
              )}

              <p className="mt-2 text-admin-14 text-muted-foreground">Model Number: {product.modelNumber}</p>

              <div className="mt-3 flex gap-2">
                <StatusBadge variant={approvalVariant(product.approvalStatus)}>{product.approvalStatus}</StatusBadge>

                <StatusBadge
                  variant={
                    product.stockStatus === "In Stock"
                      ? "success"
                      : product.stockStatus === "Low Stock"
                        ? "warning"
                        : "danger"
                  }
                >
                  {product.stockStatus}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>

        <ProductAdminDecision product={product} onUpdated={onUpdated} />
      </div>

      {approved && (
  <div className="flex flex-col items-end gap-2">
    {activeError ? (
      <div className="w-full rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-admin-14 font-medium text-red-600">
        {activeError}
      </div>
    ) : null}

    <div className="flex justify-end gap-3">
      {product.companyId !== null ? (
        <Button asChild variant="outline">
          <Link href={`/companies/${product.companyId}`}>
            <Building2 className="size-4" />
            View Company
          </Link>
        </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        disabled={updatingActive}
        onClick={() => {
          void handleToggleActive();
        }}
        className={
          product.listingStatus === "Active"
            ? "border-red-300 text-red-600 hover:bg-red-50"
            : "border-green-300 text-green-600 hover:bg-green-50"
        }
      >
        {updatingActive
          ? "Updating..."
          : product.listingStatus === "Active"
            ? "Deactivate Product"
            : "Activate Product"}
      </Button>
    </div>
  </div>
)}

      {rejected && (
        <div className="rounded-[9px] border border-red-200 bg-red-50 p-4">
          <h2 className="font-bold text-red-700">Product Rejected</h2>

          <p className="mt-2 text-admin-14 text-red-700">{product.rejectionReason}</p>

          {product.rejectedDate ? (
            <p className="mt-2 text-admin-14 text-muted-foreground">Reviewed on {product.rejectedDate}</p>
          ) : null}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* <Metric icon={Eye} label="Views" value={product.views.toLocaleString()} /> */}

        <Metric icon={Heart} label="Saved Count" value={product.savedCount} />

        <Metric icon={ShoppingCart} label="Inquiry Count" value={product.inquiries} />

        <Metric
          icon={IndianRupee}
          label="Price"
          value={product.price !== null ? `₹ ${product.price.toLocaleString("en-IN")}` : "-"}
        />

        <Metric
          icon={Warehouse}
          label="Stock Quantity"
          value={product.stockQuantity !== null ? `${product.stockQuantity} ${product.stockUnit}` : "-"}
        />

        <Metric icon={ShieldCheck} label="Approval" value={product.approvalStatus} />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-2 xl:grid-cols-3 [&>section]:min-w-0">
        <DetailSection title="Product Information" icon={<Package className="size-4 text-[#2720a8]" />}>
          <div className="space-y-3">
            <Info label="Product Name" value={product.name} />

            <Info label="Product Slug" value={product.slug} />

            <Info label="Company" value={product.company} />

            <Info label="Category" value={product.category} />

            <Info label="Product Type" value={product.productType} />

            <Info label="Model Number" value={product.modelNumber} />

            <Info label="Description" value={product.description} />

            <Info label="Created Date" value={product.createdDate} />

            <Info label="Updated Date" value={product.updatedDate} />
          </div>
        </DetailSection>

        <DetailSection title="Product Images / Media Gallery" icon={<Package className="size-4 text-[#2720a8]" />}>
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {product.images.length > 0 ? (
              product.images.map((image) => (
                <div
                  key={image.id}
                  className="relative h-40 min-w-0 overflow-hidden rounded-lg border border-border bg-muted sm:h-48"
                >
                  <img src={image.url} alt={image.alt} loading="lazy" className="absolute inset-0 size-full object-contain p-3" />

                  {image.isPrimary ? (
                    <span className="absolute top-2 left-2 rounded bg-primary px-2 py-1 font-semibold text-admin-14 text-primary-foreground">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="col-span-full flex min-h-40 items-center justify-center rounded-lg border border-border bg-muted">
                <div className="text-center">
                  <Package className="mx-auto size-10 text-[#a7a3d7]" />

                  <p className="mt-2 text-admin-14 text-muted-foreground">No product images</p>
                </div>
              </div>
            )}
          </div>
        </DetailSection>

        <DetailSection title="Specifications" icon={<Settings className="size-4 text-[#2720a8]" />}>
          <div className="divide-y divide-border">
            {product.specifications.map((item) => (
              <div key={item.label} className="grid grid-cols-2 gap-3 py-2 text-admin-14">
                <span className="text-muted-foreground">{item.label}</span>

                <span className="font-medium text-[#15136f]">{item.value}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DetailSection title="Pricing & Inventory" icon={<IndianRupee className="size-4 text-[#2720a8]" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Price" value={product.price !== null ? `₹ ${product.price.toLocaleString("en-IN")}` : "-"} />

            <Info label="Minimum Order Quantity" value={product.moq} />

            <Info
              label="Stock Quantity"
              value={product.stockQuantity !== null ? `${product.stockQuantity} ${product.stockUnit}` : "-"}
            />

            <Info label="Stock Status" value={product.stockStatus} />

            <Info label="SKU" value={product.sku} />

            <Info label="Availability" value="Pan India" />
          </div>
        </DetailSection>

        <DetailSection title="Category & Listing Information" icon={<Package className="size-4 text-[#2720a8]" />}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <StatusBadge key={tag} variant="info">
                  {tag}
                </StatusBadge>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Info label="Category" value={product.category} />

              <Info label="Product Type" value={product.productType} />

              <Info label="SKU" value={product.sku} />

              <Info label="Brand" value={product.brand} />

              <Info label="Listing Visibility" value="Public Listing" />
            </div>
          </div>
        </DetailSection>
      </div>

      {/* <DetailSection
        title="Company Information"
        icon={<Building2 className="size-4 text-[#2720a8]" />}
        action={
          product.companyId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/companies/${product.companyId}`}>View Company</Link>
            </Button>
          ) : null
        }
      >
        <h3 className="font-bold text-[#15136f]">{product.company || "No Company Assigned"}</h3>

        <p className="mt-2 text-admin-14 text-muted-foreground">
          Supplier company information will later come from the related company API.
        </p>
      </DetailSection> */}

      {/* {!approved && !rejected && (
        <DetailSection title="Admin Notes & Remarks" icon={<ShieldCheck className="size-4 text-[#2720a8]" />}>
          <textarea
            className="min-h-[100px] w-full resize-none rounded-[8px] border border-border p-3 text-admin-14 outline-none focus:border-[#2720a8]"
            placeholder="Add internal notes, comments or review remarks..."
          />
        </DetailSection>
      )} */}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3 sm:p-4 [&_dd]:wrap-normal [&_dd]:break-normal">
      <dl className="flex h-full min-w-0 flex-col gap-2">
        <dt className="flex items-center justify-between gap-2 font-medium text-admin-14 text-muted-foreground leading-normal">
          <span className="min-w-0">{label}</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </dt>
        <dd className="font-bold text-primary text-admin-19 leading-tight tabular-nums">
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </dd>
      </dl>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-admin-14 text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium text-[#15136f] text-admin-14">{value}</p>
    </div>
  );
}
