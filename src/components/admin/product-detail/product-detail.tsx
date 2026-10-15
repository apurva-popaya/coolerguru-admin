"use client";
import Link from "next/link";
import * as React from "react";
import { cn } from "cn";

import {
  ArrowLeft,
  Building2,
  Heart,
  IndianRupee,
  ImageOff,
  Loader2,
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

  const canReview = product.approvalStatus === "Pending" || product.approvalStatus === "Under Review";

  return (
    <div className="product-detail-page flex min-w-0 flex-col gap-4">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" />Back to Products
      </Link>

      <div className={cn("grid min-w-0 grid-cols-1 items-start gap-4", canReview && "xl:grid-cols-[minmax(0,1fr)_300px]")}>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-accent sm:size-16">
                <Package aria-hidden="true" className="size-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-admin-25 font-bold text-foreground">{displayValue(product.name)}</h1>
                {product.companyId !== null ? (
                  <Link href={`/companies/${product.companyId}`} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <Building2 aria-hidden="true" className="size-4 shrink-0" />{displayValue(product.company)}
                  </Link>
                ) : <p className="mt-2 text-sm text-muted-foreground">No company assigned</p>}
                <p className="mt-2 text-sm text-muted-foreground">Model: {displayValue(product.modelNumber)}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {product.companyId !== null && (
                <Button asChild variant="outline" className="h-10 rounded-xl">
                  <Link href={`/companies/${product.companyId}`}><Building2 data-icon="inline-start" />View Company</Link>
                </Button>
              )}
              {approved && (
                <Button type="button" variant={product.listingStatus === "Active" ? "destructive" : "outline"}
                  disabled={updatingActive} onClick={() => void handleToggleActive()} className="h-10 rounded-xl">
                  {updatingActive && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  {updatingActive ? "Updating..." : product.listingStatus === "Active" ? "Deactivate Product" : "Activate Product"}
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <StatusBadge variant={approvalVariant(product.approvalStatus)}>{product.approvalStatus}</StatusBadge>
            <StatusBadge variant={product.stockStatus === "In Stock" ? "success" : product.stockStatus === "Low Stock" ? "warning" : "danger"}>
              {displayValue(product.stockStatus)}
            </StatusBadge>
            <StatusBadge variant={product.listingStatus === "Active" ? "success" : "neutral"}>{product.listingStatus}</StatusBadge>
          </div>
        </div>
        {canReview && <ProductAdminDecision product={product} onUpdated={onUpdated} />}
      </div>

      {activeError && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{activeError}</p>}
      {rejected && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="font-semibold text-destructive">Product Rejected</h2>
          <p className="mt-2 text-sm text-destructive">{displayValue(product.rejectionReason)}</p>
          {product.rejectedDate && <p className="mt-2 text-sm text-muted-foreground">Reviewed on {product.rejectedDate}</p>}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Heart} label="Saved Count" value={product.savedCount} />
        <Metric icon={ShoppingCart} label="Inquiry Count" value={product.inquiries} />
        <Metric icon={IndianRupee} label="Price" value={product.price !== null ? `₹ ${product.price.toLocaleString("en-IN")}` : "Not provided"} />
        <Metric icon={Warehouse} label="Stock Quantity" value={product.stockQuantity !== null ? `${product.stockQuantity} ${product.stockUnit}` : "Not provided"} />
        <Metric icon={ShieldCheck} label="Approval" value={product.approvalStatus} />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
        <DetailSection title="Product Information" icon={<Package className="size-4 text-primary" />}>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Info label="Product Name" value={product.name} />

            <Info label="Product Slug" value={product.slug} />

            <Info label="Company" value={product.company} />

            <Info label="Category" value={product.category} />

            <Info label="Product Type" value={product.productType} />

            <Info label="Model Number" value={product.modelNumber} />

            <div className="min-w-0 sm:col-span-2"><Info label="Description" value={product.description} /></div>

            <Info label="Created Date" value={product.createdDate} />

            <Info label="Updated Date" value={product.updatedDate} />
          </div>
        </DetailSection>
        <DetailSection title="Pricing & Inventory" icon={<IndianRupee className="size-4 text-primary" />}>
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
        </div>
        <div className="flex min-w-0 flex-col gap-4">
        <DetailSection title="Product Images / Media Gallery" icon={<Package className="size-4 text-primary" />}>
          {product.images.length > 0 ? (
            <div className={cn("grid min-w-0 gap-3", product.images.length > 1 && "sm:grid-cols-2")}>
              {product.images.map((image) => <ProductImage key={image.id} image={image} />)}
            </div>
          ) : <MediaPlaceholder message="No product images provided" />}
        </DetailSection>
        <DetailSection title="Specifications" icon={<Settings className="size-4 text-primary" />}>
          {product.specifications.length > 0 ? (
            <dl className="divide-y divide-border">
              {product.specifications.map((item) => (
                <div key={item.label} className="grid min-w-0 grid-cols-2 gap-4 py-3 first:pt-0 last:pb-0">
                  <dt className="min-w-0 break-words text-sm text-muted-foreground">{item.label}</dt>
                  <dd className="min-w-0 break-words text-sm font-medium text-foreground">{displayValue(item.value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
              <Settings aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No specifications provided.</p>
            </div>
          )}
        </DetailSection>

        </div>
      </div>
        <DetailSection title="Category & Listing Information" icon={<Package className="size-4 text-primary" />}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {product.tags.length === 0 && <p className="text-sm text-muted-foreground">No tags provided.</p>}
              {product.tags.map((tag) => (
                <StatusBadge key={tag} variant="info">
                  {tag}
                </StatusBadge>
              ))}
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              <Info label="Category" value={product.category} />

              <Info label="Product Type" value={product.productType} />

              <Info label="SKU" value={product.sku} />

              <Info label="Brand" value={product.brand} />

              <Info label="Listing Visibility" value="Public Listing" />
            </div>
          </div>
        </DetailSection>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <dl className="flex h-full min-w-0 flex-col gap-2">
        <dt className="flex items-center justify-between gap-2 font-medium text-admin-14 text-muted-foreground leading-normal">
          <span className="min-w-0">{label}</span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </dt>
        <dd className={cn("font-bold text-primary text-admin-19 leading-tight tabular-nums", value === "Not provided" && "text-sm font-medium text-muted-foreground")}>
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </dd>
      </dl>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-1 break-words text-sm font-medium text-foreground">{displayValue(value)}</p>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  const text = value?.trim();
  return !text || text === "-" || text === "—" ? "Not provided" : text;
}

function MediaPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex aspect-video min-w-0 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 p-5 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
        <ImageOff aria-hidden="true" className="size-6" />
      </span>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

function ProductImage({ image }: { image: ProductDetailData["images"][number] }) {
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null);
  if (!image.url || failedUrl === image.url) return <MediaPlaceholder message="Image unavailable" />;

  return (
    <div className="relative aspect-video min-w-0 overflow-hidden rounded-xl border border-border bg-muted/40">
      <img src={image.url} alt={image.alt || "Product image"} loading="lazy"
        onError={() => setFailedUrl(image.url)} className="absolute inset-0 size-full object-contain p-4" />
      {image.isPrimary && <div className="absolute left-3 top-3"><StatusBadge variant="info">Primary</StatusBadge></div>}
    </div>
  );
}
