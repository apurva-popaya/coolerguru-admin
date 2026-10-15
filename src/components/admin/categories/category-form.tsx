"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, ImageIcon, Info, Loader2 } from "lucide-react";

import { FileUploadField } from "@/components/common/file-upload-field";
import { SafeImage } from "@/components/common/safe-image";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/api-client";
import { createCategory, getCategoryBySlug, updateCategory } from "@/lib/api/admin-categories-api";
import {
  deleteFile,
  getUploadErrorMessage,
  listAllFiles,
  MAX_UPLOAD_SIZE_MB,
  replaceFile,
  uploadFile,
} from "@/lib/api/file-upload-api";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { sanitizeText } from "@/lib/utils/sanitize";
import type { Category } from "@/types/category";

export type CategoryFormMode = "MAIN_CATEGORY" | "CATEGORY" | "SUBCATEGORY";

export type CategoryFormOperation = "ADD" | "EDIT";

interface CategoryFormProps {
  mode: CategoryFormMode;

  operation?: CategoryFormOperation;

  mainCategorySlug?: string;

  categorySlug?: string;

  editSlug?: string;
}

interface FormLabels {
  pageTitle: string;
  pageDescription: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  imageLabel: string;
  submitLabel: string;
  previewLabel: string;
}

function getLabels(mode: CategoryFormMode, operation: CategoryFormOperation): FormLabels {
  const editing = operation === "EDIT";

  if (mode === "MAIN_CATEGORY") {
    return {
      pageTitle: editing ? "Edit Main Category" : "Add Main Category",

      pageDescription: editing
        ? "Update the selected main category."
        : "Create a new main category (e.g. Air Cooler, Air Conditioners, Fans).",

      fieldLabel: "Category Name",

      fieldPlaceholder: "Enter category name (e.g. Air Cooler)",

      imageLabel: "Category Image / Icon",

      submitLabel: editing ? "Update Category" : "Create Category",

      previewLabel: "Category Name",
    };
  }

  if (mode === "CATEGORY") {
    return {
      pageTitle: editing ? "Edit Category" : "Add Category",

      pageDescription: editing
        ? "Update the selected category."
        : "Create a category under the selected main category.",

      fieldLabel: "Category Name",

      fieldPlaceholder: "Enter category name (e.g. Air Cooler Manufacturers)",

      imageLabel: "Category Image / Icon",

      submitLabel: editing ? "Update Category" : "Create Category",

      previewLabel: "Category Name",
    };
  }

  return {
    pageTitle: editing ? "Edit Subcategory" : "Add Subcategory",

    pageDescription: editing ? "Update the selected subcategory." : "Create a subcategory under the selected category.",

    fieldLabel: "Subcategory Name",

    fieldPlaceholder: "Enter subcategory name (e.g. Domestic Air Coolers)",

    imageLabel: "Subcategory Image / Icon",

    submitLabel: editing ? "Update Subcategory" : "Create Subcategory",

    previewLabel: "Subcategory Name",
  };
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({ mode, operation = "ADD", mainCategorySlug, categorySlug, editSlug }: CategoryFormProps) {
  const router = useRouter();

  const labels = getLabels(mode, operation);

  const [name, setName] = React.useState("");

  const [slug, setSlug] = React.useState("");

  const [description, setDescription] = React.useState("");

  const [displayOrder, setDisplayOrder] = React.useState("1");

  const [status, setStatus] = React.useState<"Active" | "Inactive">("Active");

  const [mainCategory, setMainCategory] = React.useState<Category | undefined>();

  const [category, setCategory] = React.useState<Category | undefined>();

  const [loading, setLoading] = React.useState(operation === "EDIT" || Boolean(mainCategorySlug || categorySlug));

  const [submitting, setSubmitting] = React.useState(false);

  const [error, setError] = React.useState("");

  // Set in edit mode; uploads with categoryId are linked to the saved category.
  const [editCategoryId, setEditCategoryId] = React.useState<number | undefined>();

  const [imageUrl, setImageUrl] = React.useState("");

  const [imageFileId, setImageFileId] = React.useState<string | undefined>();

  const [imageName, setImageName] = React.useState<string | undefined>();

  // Edit mode: only send `image` when the admin changed it.
  const [imageDirty, setImageDirty] = React.useState(false);

  const [imageBusy, setImageBusy] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
 if (mainCategorySlug) {
  const response = await getCategoryBySlug(mainCategorySlug);

  if (response.data?.category) {
    setMainCategory(response.data.category);
  }
}

if (categorySlug) {
  const response = await getCategoryBySlug(categorySlug);

  if (response.data?.category) {
    setCategory(response.data.category);
  }
}

if (operation === "EDIT" && editSlug) {
  const response = await getCategoryBySlug(editSlug);

  const item = response.data?.category;

  if (!item) {
    throw new Error("Categories are coming soon.");
  }

  setName(item.name);
  setSlug(item.slug);
  setDescription(item.description ?? "");
  setDisplayOrder(String(item.sort_order ?? 0));
  setStatus(item.is_active === false ? "Inactive" : "Active");
  setEditCategoryId(item.category_id);
  setImageUrl(item.image ?? "");

  // GET /categories returns the URL only;
  // find its fileId for replace/delete.
  if (item.image) {
    try {
      const files = await listAllFiles({
        category: "category_image",
        categoryId: item.category_id,
      });

      const file = files.find(
        (candidate) => candidate.url === item.image,
      );

      setImageFileId(file?.fileId);
      setImageName(file?.originalFilename ?? undefined);
    } catch (lookupError) {
      // Not fatal.
      console.error("Category image lookup failed:", lookupError);
    }
  }
}
      } catch (error) {
        setError(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [operation, editSlug, mainCategorySlug, categorySlug]);

  function handleNameChange(value: string) {
    setName(value);

    if (operation === "ADD") {
      setSlug(createSlug(value));
    }
  }

  /*
   * An existing upload is replaced in place (same fileId, new url; the backend
   * also updates a saved category). Otherwise upload a new file.
   */
  async function handleImageSelect(file: File) {
    setImageBusy(true);
    setError("");

    try {
      const uploaded = imageFileId
        ? await replaceFile(imageFileId, file)
        : await uploadFile(file, "category_image", editCategoryId ? { categoryId: editCategoryId } : {});

      setImageUrl(uploaded.url);
      setImageFileId(uploaded.fileId);
      setImageName(file.name);
      setImageDirty(true);
    } catch (uploadError) {
      setError(getUploadErrorMessage(uploadError));
    } finally {
      setImageBusy(false);
    }
  }

  async function handleImageRemove() {
    if (imageFileId) {
      setImageBusy(true);
      setError("");

      try {
        // The backend also clears a saved category image.
        await deleteFile(imageFileId);
      } catch (deleteError) {
        if (!(deleteError instanceof ApiError && deleteError.status === 404)) {
          setError(getUploadErrorMessage(deleteError));
          return;
        }
      } finally {
        setImageBusy(false);
      }
    }

    setImageUrl("");
    setImageFileId(undefined);
    setImageName(undefined);
    setImageDirty(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (submitting || imageBusy || !name.trim() || !slug.trim()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (operation === "EDIT") {
        if (!editSlug) {
          throw new Error("Category slug is missing.");
        }

        await updateCategory(editSlug, {
          name: sanitizeText(name),

          slug: slug.trim(),

          description: sanitizeText(description) || null,

          sort_order: Math.max(1, Number(displayOrder) || 1),

          is_active: status === "Active",

          can_have_children: mode !== "SUBCATEGORY",

          ...(imageDirty ? { image: imageUrl || null } : {}),
        });
      } else {
        let parentId: number | null = null;

        if (mode === "CATEGORY") {
          if (!mainCategory) {
            throw new Error("Main category could not be loaded.");
          }

          parentId = mainCategory.category_id;
        }

        if (mode === "SUBCATEGORY") {
          if (!category) {
            throw new Error("Parent category could not be loaded.");
          }

          parentId = category.category_id;
        }

        await createCategory({
          name: sanitizeText(name),

          slug: slug.trim(),

          description: sanitizeText(description) || undefined,

          parent_id: parentId,

          can_have_children: mode !== "SUBCATEGORY",

          sort_order: Number(displayOrder),

          is_featured: false,

          image: imageUrl || undefined,
        });

        /*
         * CreateCategoryRequest does not
         * expose is_active.
         *
         * Newly created categories should
         * therefore start active.
         */
      }

      router.push("/categories");

      router.refresh();
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-muted-foreground text-admin-14">
        Loading category...
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" />Back to Categories
      </Link>
      <div>
        <h1 className="text-admin-28 font-bold text-foreground">{labels.pageTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{labels.pageDescription}</p>
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold text-foreground">Category information</h2>
            <p className="mt-1 text-sm text-muted-foreground">{operation === "EDIT" ? "Update the details below." : "Add the details for your new item."}</p>
          </div>
          <fieldset disabled={submitting} className="min-w-0 p-4 sm:p-5">
            <FieldGroup className="gap-5">
              {(mainCategory || category) && (
                <div className="flex min-w-0 flex-wrap gap-3 rounded-xl bg-muted/50 p-3">
                  {mode !== "MAIN_CATEGORY" && mainCategory && <ReadOnlyField label="Main category" value={mainCategory.name} />}
                  {mode === "SUBCATEGORY" && category && <ReadOnlyField label="Parent category" value={category.name} />}
                </div>
              )}
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="category-name">{labels.fieldLabel} <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                  <Input id="category-name" value={name} onChange={(event) => handleNameChange(event.target.value)} placeholder={labels.fieldPlaceholder} className="h-11 rounded-xl" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="category-slug">Slug <span aria-hidden="true" className="text-destructive">*</span></FieldLabel>
                  <Input id="category-slug" value={slug} onChange={(event) => setSlug(createSlug(event.target.value))} placeholder="Enter URL slug" className="h-11 rounded-xl" aria-describedby="category-slug-hint" required />
                  <p id="category-slug-hint" className="text-xs text-muted-foreground">Lowercase letters, numbers and hyphens only.</p>
                </Field>
              </FieldGroup>
              <Field>
                <FieldLabel htmlFor="category-description">Description <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                <Textarea id="category-description" value={description} onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                  placeholder="Write a short description..." maxLength={500} aria-describedby="description-count" className="min-h-28 rounded-xl" />
                <p id="description-count" className="text-right text-xs tabular-nums text-muted-foreground">{description.length}/500</p>
              </Field>
              <div className="flex min-w-0 flex-col gap-3 border-t border-border pt-5">
                <h3 className="text-sm font-medium text-foreground">{labels.imageLabel}</h3>
                <FileUploadField size="md" category="category_image" label="Upload category image"
                  items={imageUrl ? [{ key: "category-image", url: imageUrl, name: imageName }] : []}
                  isUploading={imageBusy && !imageUrl} busyKeys={imageBusy ? ["category-image"] : []}
                  disabled={submitting} onSelect={([file]) => handleImageSelect(file)}
                  onReplace={(_item, file) => handleImageSelect(file)} onRemove={handleImageRemove} />
                <Alert role="note" className="rounded-xl">
                  <Info aria-hidden="true" />
                  <AlertDescription>Recommended: 512 x 512 px. JPG, PNG or WEBP, up to {MAX_UPLOAD_SIZE_MB}MB. Images are converted to WEBP automatically.</AlertDescription>
                </Alert>
              </div>
              <FieldGroup className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="display-order">Display order</FieldLabel>
                  <Input id="display-order" type="number" min="1" value={displayOrder} className="h-11 rounded-xl"
                    aria-describedby="display-order-hint" onChange={(event) => {
                      const value = event.target.value;
                      if (!value) { setDisplayOrder("1"); return; }
                      if (Number(value) >= 1) setDisplayOrder(String(Number(value)));
                    }} />
                  <p id="display-order-hint" className="text-xs text-muted-foreground">Lower numbers appear first.</p>
                </Field>
                <Field>
                  <FieldLabel htmlFor="category-status">Status</FieldLabel>
                  {operation === "EDIT" ? (
                    <Select value={status} onValueChange={(value) => {
                      if (value === "Active" || value === "Inactive") setStatus(value);
                    }}>
                      <SelectTrigger id="category-status" className="w-full rounded-xl data-[size=default]:h-11"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectGroup><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectGroup></SelectContent>
                    </Select>
                  ) : <Input id="category-status" value="Active" readOnly className="h-11 rounded-xl" />}
                  {operation === "ADD" && <p className="text-xs text-muted-foreground">New categories start active.</p>}
                </Field>
              </FieldGroup>
            </FieldGroup>
          </fieldset>
          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
            <Button asChild variant="outline" className="h-10 rounded-xl"><Link href="/categories">Cancel</Link></Button>
            <Button type="submit" disabled={submitting || imageBusy} className="h-10 rounded-xl px-5">
              {submitting && <Loader2 data-icon="inline-start" className="animate-spin" />}{submitting ? "Saving..." : labels.submitLabel}
            </Button>
          </div>
        </form>
        <aside className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm xl:sticky xl:top-28">
          <div className="border-b border-border p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">Live preview</h2>
            <p className="mt-1 text-sm text-muted-foreground">Updates as you fill in the form.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
            <div className="relative flex aspect-square max-h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              {imageUrl ? <SafeImage src={imageUrl} alt={name || "Category image"} fill sizes="320px" className="object-contain p-3" />
                : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon aria-hidden="true" className="size-8" /><p className="text-xs">No image selected</p></div>}
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-base font-semibold text-foreground">{name || labels.previewLabel}</h3>
              <p className="mt-1 break-all text-xs text-muted-foreground">{slug || "category-slug"}</p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{description || "Your category description will appear here."}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <StatusBadge variant={status === "Active" ? "success" : "neutral"}>{status}</StatusBadge>
              <span className="text-xs text-muted-foreground">Display order: {displayOrder}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <dl className="min-w-0 flex-1"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd></dl>;
}
