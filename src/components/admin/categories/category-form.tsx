"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, ImageIcon, Info, Lightbulb } from "lucide-react";

import { FileUploadField } from "@/components/common/file-upload-field";
import { SafeImage } from "@/components/common/safe-image";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      <div className="rounded-[10px] border border-border bg-white px-6 py-10 text-center text-[#5d6280] text-admin-14">
        Loading category...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-admin-14">
            <Link href="/categories" className="font-medium text-[#2720a8]">
              Categories
            </Link>

            {mainCategory && (
              <>
                <span className="text-muted-foreground">/</span>

                <span className="text-[#5d6280]">{mainCategory.name}</span>
              </>
            )}

            {category && (
              <>
                <span className="text-muted-foreground">/</span>

                <span className="text-[#5d6280]">{category.name}</span>
              </>
            )}

            <span className="text-muted-foreground">/</span>

            <span className="font-semibold text-[#15136f]">{labels.pageTitle}</span>
          </div>

          <h1 className="font-bold text-[#15136f] text-admin-28">{labels.pageTitle}</h1>

          <p className="mt-1 text-[#5d6280] text-admin-14">{labels.pageDescription}</p>
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href="/categories">
            <ArrowLeft className="size-4" />
            Back to Categories
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 font-medium text-admin-14 text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,0.9fr)]">
        <form onSubmit={handleSubmit} className="rounded-[10px] border border-border bg-white p-6">
          <div>
            <h2 className="font-bold text-[#15136f] text-admin-19">Category Information</h2>

            <p className="mt-1 text-[#5d6280] text-admin-14">
              {operation === "EDIT" ? "Update the details below." : "Enter the basic details for the new item."}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {mode !== "MAIN_CATEGORY" && mainCategory && (
              <ReadOnlyField label="Main Category" value={mainCategory.name} />
            )}

            {mode === "SUBCATEGORY" && category && <ReadOnlyField label="Category" value={category.name} />}

            <div>
              <label htmlFor="category-name" className="font-semibold text-[#15136f] text-admin-14">
                {labels.fieldLabel} <span className="text-red-500">*</span>
              </label>

              <Input
                id="category-name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder={labels.fieldPlaceholder}
                className="mt-2 h-11"
                required
              />
            </div>

            <div>
              <label htmlFor="category-slug" className="font-semibold text-[#15136f] text-admin-14">
                Slug <span className="text-red-500">*</span>
              </label>

              <Input
                id="category-slug"
                value={slug}
                onChange={(event) => setSlug(createSlug(event.target.value))}
                placeholder="Enter URL slug"
                className="mt-2 h-11"
                required
              />

              <p className="mt-1 text-admin-14 text-muted-foreground">Use lowercase letters, numbers and hyphens only.</p>
            </div>

            <div>
              <label htmlFor="category-description" className="font-semibold text-[#15136f] text-admin-14">
                Description
              </label>

              <Textarea
                id="category-description"
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                placeholder="Enter a short description about this category..."
                className="mt-2 min-h-[125px]"
              />

              <div className="mt-1 text-right text-admin-14 text-muted-foreground">{description.length}/500</div>
            </div>

            <div>
              <label className="font-semibold text-[#15136f] text-admin-14">{labels.imageLabel}</label>

              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <FileUploadField
                  size="md"
                  category="category_image"
                  label="Upload category image"
                  items={imageUrl ? [{ key: "category-image", url: imageUrl, name: imageName }] : []}
                  isUploading={imageBusy && !imageUrl}
                  busyKeys={imageBusy ? ["category-image"] : []}
                  disabled={submitting}
                  onSelect={([file]) => handleImageSelect(file)}
                  onReplace={(_item, file) => handleImageSelect(file)}
                  onRemove={handleImageRemove}
                />

                <div className="rounded-[9px] border border-[#cfe0ff] bg-[#f5f9ff] p-4">
                  <div className="flex items-center gap-2 text-[#2563eb]">
                    <Info className="size-5" />

                    <h3 className="font-bold text-admin-14">Image Guidelines</h3>
                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-[#5d6280] text-admin-14 leading-5">
                    <li>Recommended size: 512 × 512 px</li>
                    <li>Supported formats: JPG, PNG, WEBP</li>
                    <li>Maximum file size: {MAX_UPLOAD_SIZE_MB}MB</li>
                    <li>Images are converted to WEBP automatically.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="display-order" className="font-semibold text-[#15136f] text-admin-14">
                  Display Order
                </label>

                <Input
  id="display-order"
  type="number"
  min="1"
  value={displayOrder}
  onChange={(event) => {
    const value = event.target.value;

    if (value === "") {
      setDisplayOrder("1");
      return;
    }

    const numberValue = Number(value);

    if (numberValue >= 1) {
      setDisplayOrder(String(numberValue));
    }
  }}
  className="mt-2 h-11"
/>

                <p className="mt-1 text-admin-14 text-muted-foreground">Lower numbers will appear first.</p>
              </div>

              <div>
                <label className="font-semibold text-[#15136f] text-admin-14">Status</label>

                {operation === "EDIT" ? (
                  <Select value={status} onValueChange={(value) => setStatus(value as "Active" | "Inactive")}>
                    <SelectTrigger className="mt-2 h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="text-admin-15 [&_[data-slot=select-item]]:text-admin-15">
                      <SelectItem value="Active">Active</SelectItem>

                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2 flex h-11 items-center rounded-[7px] border border-border bg-[#f7f7fb] px-3 font-medium text-[#15136f] text-admin-14">
                    Active
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-5">
              <Button asChild type="button" variant="outline">
                <Link href="/categories">Cancel</Link>
              </Button>

              <Button type="submit" disabled={submitting || imageBusy} className="bg-[#2720a8] px-6 text-white hover:bg-[#15136f]">
                {submitting ? "Saving..." : labels.submitLabel}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-5">
          <div className="rounded-[10px] border border-border bg-white p-5">
            <h2 className="font-bold text-[#15136f] text-admin-18">Preview</h2>

            <p className="mt-1 text-admin-14 text-muted-foreground">
              This is how the category will appear in the system.
            </p>

            <div className="mt-5 rounded-[9px] border border-border p-5">
              <div className="relative flex size-[95px] items-center justify-center overflow-hidden rounded-[8px] bg-[#edf3ff]">
                {imageUrl ? (
                  <SafeImage src={imageUrl} alt={name || "Category image"} fill sizes="95px" className="object-cover" />
                ) : (
                  <ImageIcon className="size-8 text-[#5d6280]" />
                )}
              </div>

              <h3 className="mt-4 font-bold text-[#15136f] text-admin-18">{name || labels.previewLabel}</h3>

              {mainCategory && (
                <p className="mt-2 text-admin-14 text-muted-foreground">
                  Under:{" "}
                  <span className="font-semibold text-[#15136f]">
                    {mode === "SUBCATEGORY" ? category?.name : mainCategory.name}
                  </span>
                </p>
              )}

              <p className="mt-2 text-[#5d6280] text-admin-14">0 Products</p>

              <div className="mt-3">
                <StatusBadge variant={status === "Active" ? "success" : "neutral"}>{status}</StatusBadge>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-border bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-[#2720a8]" />

              <h2 className="font-bold text-[#15136f] text-admin-16">Quick Tips</h2>
            </div>

            <ul className="mt-4 list-disc space-y-3 pl-5 text-[#5d6280] text-admin-14 leading-5">
              <li>Use a clear and relevant name.</li>
              <li>The slug will be used in the URL.</li>
              <li>Lower display-order numbers appear first.</li>
              <li>You can change the status later.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="font-semibold text-[#15136f] text-admin-14">{label}</label>

      <div className="mt-2 flex h-11 items-center rounded-[7px] border border-border bg-[#f7f7fb] px-3 font-medium text-[#15136f] text-admin-14">
        {value}
      </div>

      <p className="mt-1 text-admin-14 text-muted-foreground">This parent is fixed for this item.</p>
    </div>
  );
}
