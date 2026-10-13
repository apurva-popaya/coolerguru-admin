"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { mapAdminProductDetail } from "@/components/admin/product-detail/product-detail-data";
import { PageHeader } from "@/components/common/page-header";
import { SafeImage } from "@/components/common/safe-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type AdminProductDetailItem, getAdminProductBySlug, updateAdminProduct } from "@/lib/api/admin-products-api";

function dateInputValue(value: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return "";
  return value.slice(0, 10);
}

function todayDateValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function LockedField({ label, value, multiline = false }: {
  label: string;
  value: string | number | null;
  multiline?: boolean;
}) {
  const id = `product-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Field data-disabled className="min-w-0">
      <FieldLabel htmlFor={id} className="text-admin-15 leading-snug group-data-[disabled=true]/field:opacity-100">{label}</FieldLabel>
      {multiline ? <Textarea id={id} value={value ?? ""} disabled className="min-h-24 resize-y text-base leading-relaxed md:text-admin-15" />
        : <Input id={id} value={value ?? ""} disabled className="h-11 min-w-0 text-base md:text-admin-15" />}
    </Field>
  );
}

export function ProductEditForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [product, setProduct] = useState<AdminProductDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(false);
  const [addedDate, setAddedDate] = useState("");
  const [applyToday, setApplyToday] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProduct(null);
    async function load() {
      try {
        const response = await getAdminProductBySlug(slug);
        const item = response.data?.product;
        if (!response.success || !item) throw new Error("Product not found.");
        if (!active) return;
        setProduct(item);
        setFeatured(item.is_featured);
        const initialDate = dateInputValue(item.is_new_arrival ?? item.created_at);
        setAddedDate(initialDate);
        setApplyToday(initialDate === todayDateValue());
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load product details.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [slug, retry]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || saving) return;
    setSaveError("");
    const initialDate = dateInputValue(product.is_new_arrival ?? product.created_at);
    const dateChanged = addedDate !== initialDate;
    const parsedDate = new Date(`${addedDate}T00:00:00.000Z`);
    if (!addedDate || Number.isNaN(parsedDate.getTime()) || dateInputValue(parsedDate.toISOString()) !== addedDate) {
      setSaveError("Choose a valid product added date.");
      return;
    }
    setSaving(true);
    try {
      const response = await updateAdminProduct(product.slug, {
        is_featured: featured,
        ...(dateChanged ? { is_new_arrival: parsedDate.toISOString() } : {}),
      });
      if (!response.success || !response.data?.product) {
        throw new Error(response.message || "Unable to update product.");
      }
      toast.success(response.message || "Product updated successfully.");
      router.push("/products");
      router.refresh();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Unable to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const back = <Button asChild variant="outline" className="min-h-11 w-full px-4 md:w-auto"><Link href="/products">
    <ArrowLeft data-icon="inline-start" />Back to Products
  </Link></Button>;

  if (loading) return <div className="flex flex-col gap-5">
    <PageHeader title="Edit Product" action={back} />
    <Skeleton className="h-96 w-full" role="status" aria-label="Loading product details" />
  </div>;

  if (!product) return <div className="flex flex-col gap-5">
    <PageHeader title="Edit Product" action={back} />
    <Alert variant="destructive"><AlertTitle>Unable to load product</AlertTitle>
      <AlertDescription><p>{error}</p><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Retry</Button></AlertDescription>
    </Alert>
  </div>;

  const detail = mapAdminProductDetail({ ...product, images: [...product.images] });
  const originalDate = dateInputValue(product.created_at);
  const today = todayDateValue();
  const storedDate = dateInputValue(product.is_new_arrival ?? product.created_at);
  // When the stored date is already today, switching off falls back to the original created date.
  const loadedDate = storedDate === today ? originalDate : storedDate;
  function toggleApplyToday(checked: boolean) {
    setApplyToday(checked);
    setAddedDate(checked ? today : loadedDate);
  }
  const effectiveDate = addedDate || originalDate;
  const sections: { title: string; fields: [string, string | number | null][] }[] = [
    { title: "Product Information", fields: [
      ["Product Name", detail.name], ["Product Slug", detail.slug], ["Company", detail.company],
      ["Category", detail.category], ["Product Type", detail.productType], ["Model Number", detail.modelNumber],
      ["Brand", detail.brand], ["SKU", detail.sku], ["HSN Code", product.hsn_code],
      ["Original Added Date", detail.createdDate], ["Updated Date", detail.updatedDate],
    ] },
    { title: "Pricing & Inventory", fields: [
      ["Price", product.price], ["Minimum Price", product.min_price], ["Maximum Price", product.max_price],
      ["Currency", detail.currency], ["Price Unit", detail.priceUnit], ["Minimum Order Quantity", detail.moq],
      ["Stock Quantity", detail.stockQuantity], ["Stock Unit", detail.stockUnit], ["Stock Status", detail.stockStatus],
      ["Availability", "Pan India"],
    ] },
    { title: "Category & Listing Information", fields: [
      ["Approval Status", detail.approvalStatus], ["Listing Status", detail.listingStatus],
      ["Listing Visibility", "Public Listing"], ["Tags", detail.tags.join(", ")],
      ["Saved Count", detail.savedCount], ["Inquiry Count", detail.inquiries],
      ["Application / Usage", detail.applicationUsage], ["Available Colors", detail.availableColors.join(", ")],
      ["Video URL", detail.videoUrl], ["Catalogue URL", detail.catalogueUrl],
      ["Approval Note", product.approval_note], ["Reviewed Date", product.approval_reviewed_at],
    ] },
  ];

  return <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 [&_.admin-page-header]:min-w-0 [&_.admin-page-header_h1]:text-admin-24! sm:[&_.admin-page-header_h1]:text-admin-28!">
    <PageHeader title="Edit Product" description="Update featured status and the product added date." action={back} />
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(20rem,0.9fr)]">
      <form onSubmit={(event) => event.preventDefault()} className="@container/product-form order-2 flex min-w-0 flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:gap-6 sm:p-6 xl:order-1">
        <div><h2 className="font-bold text-primary text-admin-19">Product Details</h2>
          <p className="mt-1 text-admin-14 text-muted-foreground">Product details are prefilled and locked. Only the two admin settings can be changed.</p>
        </div>
        {sections.map((section) => <section key={section.title} className="flex flex-col gap-4">
          <h3 className="font-semibold text-primary text-admin-17 leading-snug">{section.title}</h3>
          <FieldGroup className="grid min-w-0 grid-cols-1 gap-4 @min-[32rem]/product-form:grid-cols-2">
            {section.fields.map(([label, value]) => <LockedField key={label} label={label} value={value} />)}
          </FieldGroup>
        </section>)}
        <FieldGroup>
          <LockedField label="Short Description" value={detail.shortDescription} multiline />
          <LockedField label="Description" value={detail.description} multiline />
          <LockedField label="Highlights" value={detail.highlights.join("\n")} multiline />
        </FieldGroup>
        <section className="flex flex-col gap-4"><h3 className="font-semibold text-primary text-admin-17 leading-snug">Specifications</h3>
          {detail.specifications.length ? <FieldGroup className="grid min-w-0 grid-cols-1 gap-4 @min-[32rem]/product-form:grid-cols-2">
            {detail.specifications.map((item, index) => <Field key={`${item.label}-${index}`} data-disabled className="min-w-0">
              <FieldLabel htmlFor={`specification-${index}`} className="text-admin-15 leading-snug group-data-[disabled=true]/field:opacity-100">{item.label}</FieldLabel>
              <Input id={`specification-${index}`} value={item.value} disabled className="h-11 min-w-0 text-base md:text-admin-15" />
            </Field>)}
          </FieldGroup> : <p className="text-admin-14 text-muted-foreground">No specifications provided.</p>}
        </section>
        <section className="flex flex-col gap-4"><h3 className="font-semibold text-primary text-admin-17 leading-snug">Product Images / Media Gallery</h3>
          {detail.images.length ? <div className="grid min-w-0 grid-cols-1 gap-3 @min-[20rem]/product-form:grid-cols-2 @min-[32rem]/product-form:grid-cols-3">
            {detail.images.map((image) => <div key={image.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3">
              <SafeImage src={image.url} alt={image.alt} width={240} height={180} className="h-36 w-full object-contain" />
              {image.isPrimary && <p className="text-center font-medium text-primary text-admin-14">Primary Image</p>}
            </div>)}
          </div> : <p className="text-admin-14 text-muted-foreground">No product images provided.</p>}
          <p className="text-admin-14 text-muted-foreground">Product media cannot be edited here.</p>
        </section>
      </form>
      <aside className="order-1 flex min-w-0 flex-col gap-5 xl:order-2">
        <form onSubmit={save} aria-busy={saving} className="flex min-w-0 flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
          <div><h2 className="font-bold text-primary text-admin-18">Admin Settings</h2>
            <p className="mt-1 text-admin-14 text-muted-foreground">Manage featuring and New Launches placement.</p>
          </div>
          <FieldGroup>
            <Field orientation="horizontal" className="min-w-0 items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2"><FieldLabel htmlFor="product-featured" className="font-bold text-primary text-admin-18 leading-snug">Featured Product</FieldLabel>
                <FieldDescription className="text-admin-14 leading-relaxed">{featured ? "This product is marked as featured." : "Enable to mark this product as featured."}</FieldDescription>
              </div>
              <Switch className="mt-1 shrink-0" id="product-featured" checked={featured} onCheckedChange={setFeatured} disabled={saving} />
            </Field>
            <Field orientation="horizontal" className="min-w-0 items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2"><FieldLabel htmlFor="product-added-date" className="font-bold text-primary text-admin-18 leading-snug">Use Today as Added Date</FieldLabel>
                <FieldDescription id="product-added-date-hint" className="text-admin-14 leading-relaxed">
                  New Launches will use this date, newest first.
                </FieldDescription>
              </div>
              <Switch className="mt-1 shrink-0" id="product-added-date" checked={applyToday} onCheckedChange={toggleApplyToday} disabled={saving} aria-describedby="product-added-date-hint" />
            </Field>
          </FieldGroup>
          <Separator />
          <dl className="flex flex-col gap-3 text-admin-14">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2"><dt className="text-muted-foreground">Original added date</dt><dd className="min-w-0 break-words font-medium text-primary">{originalDate || "Unavailable"}</dd></div>
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2"><dt className="text-muted-foreground">New Launches date preview</dt><dd className="min-w-0 break-words font-medium text-primary">{effectiveDate || "Unavailable"}</dd></div>
          </dl>
          {saveError && <Alert variant="destructive" role="alert"><AlertTitle>Unable to save product</AlertTitle><AlertDescription>{saveError}</AlertDescription></Alert>}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end [&_[data-slot=button]]:min-h-11 [&_[data-slot=button]]:w-full sm:[&_[data-slot=button]]:w-auto">
            <Button asChild variant="outline"><Link href="/products">Cancel</Link></Button>
            <Button type="submit" disabled={saving || !addedDate}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </aside>
    </div>
  </div>;
}
