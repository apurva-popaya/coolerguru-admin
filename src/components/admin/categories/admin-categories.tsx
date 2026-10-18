"use client";

import * as React from "react";

import Link from "next/link";

import {
  Box,
  ChevronDown,
  Edit3,
  Folder,
  Layers3,
  MoreVertical,
  Plus,
  RotateCcw,
  UserX,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  deleteCategory,
  getCategories,
  restoreCategory,
} from "@/lib/api/admin-categories-api";

import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

import type { Category } from "@/lib/api/admin-categories-api";

import type {
  CategoryItem,
  MainCategoryItem,
  SubcategoryItem,
} from "./categories-data";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function categoryStatus(category: Category): "Active" | "Inactive" {
  return category.is_active === false ? "Inactive" : "Active";
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function AdminCategories() {
  const [categories, setCategories] = React.useState<MainCategoryItem[]>([]);

  const [loading, setLoading] = React.useState(true);

  const [actionSlug, setActionSlug] = React.useState<string | null>(null);

  const [error, setError] = React.useState("");

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  const loadCategories = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();
      const mainCategoryItems: MainCategoryItem[] = response.data.categories.map((root) => ({
        id: root.slug,
        categoryId: root.category_id,
        name: root.name,
        slug: root.slug,
        status: categoryStatus(root),
        productsCount: root.product_count,
        categories: root.children.map((child): CategoryItem => ({
          id: child.slug,
          categoryId: child.category_id,
          name: child.name,
          slug: child.slug,
          status: categoryStatus(child),
          productsCount: child.product_count,
          subcategories: child.children.map((subcategory): SubcategoryItem => ({
            id: subcategory.slug,
            categoryId: subcategory.category_id,
            name: subcategory.name,
            slug: subcategory.slug,
            status: categoryStatus(subcategory),
            productsCount: subcategory.product_count,
          })),
        })),
      }));

      setCategories(mainCategoryItems);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const totalCategories = categories.reduce(
    (total, mainCategory) =>
      total + mainCategory.categories.length,
    0,
  );

  const totalSubcategories = categories.reduce(
    (total, mainCategory) =>
      total +
      mainCategory.categories.reduce(
        (categoryTotal, category) =>
          categoryTotal + category.subcategories.length,
        0,
      ),
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Delete / Deactivate Category                                             */
  /* ------------------------------------------------------------------------ */

  async function handleDeactivate(slug: string, label: string) {
    const confirmed = window.confirm(`Deactivate "${label}"?`);

    if (!confirmed) {
      return;
    }

    setActionSlug(slug);
    setError("");

    try {
      /*
       * DELETE /categories/{slug}
       *
       * Backend performs soft delete.
       */
      await deleteCategory(slug);

      /*
       * Keep the item visible locally as inactive
       * so the admin can restore it.
       */
      setCategories((current) =>
        updateCategoryStatusInTree(
          current,
          slug,
          "Inactive",
        ),
      );
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setActionSlug(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Restore Category                                                         */
  /* ------------------------------------------------------------------------ */

  async function handleRestore(slug: string) {
    setActionSlug(slug);
    setError("");

    try {
      /*
       * PATCH /categories/{slug}/restore
       */
      await restoreCategory(slug);

      setCategories((current) =>
        updateCategoryStatusInTree(
          current,
          slug,
          "Active",
        ),
      );
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setActionSlug(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manage Categories"
        description="Manage main categories, categories and subcategories on CoolerGuru."
        action={
          <Button
            asChild
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Link href="/categories/add-main">
              <Plus className="size-4" />
              Add Main Category
            </Link>
          </Button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-medium text-admin-14 text-red-600">
          {error}
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          layout="summary"
          title="Main Categories"
          value={categories.length}
          icon={Box}
          subtitle="Root categories"
        />

        <StatCard
          layout="summary"
          title="Categories"
          value={totalCategories}
          icon={Folder}
          subtitle="Under all main categories"
        />

        <StatCard
          layout="summary"
          title="Subcategories"
          value={totalSubcategories}
          icon={Layers3}
          subtitle="Under all categories"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Categories Table                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <div className="grid min-w-[900px] grid-cols-[minmax(300px,1fr)_175px_140px_115px_90px] lg:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_100px_80px_70px] border-border border-b bg-muted/60 px-4 py-3 font-semibold text-muted-foreground text-admin-14">
          <div>Category Name</div>

          <div>Type</div>

          <div>Status</div>

          <div>Products</div>

          <div>Action</div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-admin-14">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground text-admin-14">
            No categories found.
          </div>
        ) : (
          categories.map((mainCategory) => (
            <MainCategoryRow
              key={mainCategory.id}
              mainCategory={mainCategory}
              actionSlug={actionSlug}
              onDeactivate={handleDeactivate}
              onRestore={handleRestore}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Category Row                                                          */
/* -------------------------------------------------------------------------- */

function MainCategoryRow({
  mainCategory,
  actionSlug,
  onDeactivate,
  onRestore,
}: {
  mainCategory: MainCategoryItem;
  actionSlug: string | null;
  onDeactivate: (slug: string, label: string) => void;
  onRestore: (slug: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const childrenId = React.useId();

  return (
    <div>
      <div className="grid min-h-[58px] min-w-[900px] grid-cols-[minmax(300px,1fr)_175px_140px_115px_90px] lg:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_100px_80px_70px] items-center border-border border-b bg-primary/10 px-4">
        <div className="flex items-center gap-3">
          <Button
            type="button" variant="ghost" size="icon-sm"
            aria-expanded={expanded} aria-controls={childrenId}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${mainCategory.name}`}
            onClick={() => setExpanded((previous) => !previous)}
          >
            <ChevronDown className="transition-transform motion-reduce:transition-none"
              style={{ transform: expanded ? undefined : "rotate(-90deg)" }} />
          </Button>

          <Box className="size-5 text-primary" />

          <span className="font-bold text-foreground">
            {mainCategory.name}
          </span>
        </div>

        <div>
          <StatusBadge variant="info">
            Main Category
          </StatusBadge>
        </div>

        <div>
          <CategoryStatusBadge status={mainCategory.status} />
        </div>

        <div className="text-muted-foreground text-admin-14">
          {mainCategory.productsCount}
        </div>

        <div className="flex items-center">
          <CategoryActions
            editHref={`/categories/${mainCategory.slug}/edit`}
            addHref={`/categories/${mainCategory.slug}/add-category`}
            addLabel="Add Category"
            label={mainCategory.name}
            slug={mainCategory.slug}
            status={mainCategory.status}
            loading={actionSlug === mainCategory.slug}
            onDeactivate={onDeactivate}
            onRestore={onRestore}
          />
        </div>
      </div>

      <div id={childrenId} hidden={!expanded}>
      {mainCategory.categories.length > 0 ? (
        mainCategory.categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            mainCategory={mainCategory}
            actionSlug={actionSlug}
            onDeactivate={onDeactivate}
            onRestore={onRestore}
          />
        ))
      ) : (
        <div className="border-border border-b bg-muted/40 px-6 py-4 text-muted-foreground text-admin-14">
          No categories added yet. Click “Add Category” to create
          categories under {mainCategory.name}.
        </div>
      )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Category Row                                                               */
/* -------------------------------------------------------------------------- */

function CategoryRow({
  category,
  mainCategory,
  actionSlug,
  onDeactivate,
  onRestore,
}: {
  category: CategoryItem;
  mainCategory: MainCategoryItem;
  actionSlug: string | null;
  onDeactivate: (slug: string, label: string) => void;
  onRestore: (slug: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const childrenId = React.useId();

  return (
    <>
      <div className="grid min-h-[58px] min-w-[900px] grid-cols-[minmax(300px,1fr)_175px_140px_115px_90px] lg:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_100px_80px_70px] items-center border-border border-b bg-primary/5 px-4">
        <div className="flex items-center gap-3 pl-8">
          <Button
            type="button" variant="ghost" size="icon-sm"
            aria-expanded={expanded} aria-controls={childrenId}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${category.name}`}
            onClick={() => setExpanded((previous) => !previous)}
          >
            <ChevronDown className="transition-transform motion-reduce:transition-none"
              style={{ transform: expanded ? undefined : "rotate(-90deg)" }} />
          </Button>

          <Folder className="size-5 text-primary" />

          <span className="font-medium text-foreground">
            {category.name}
          </span>
        </div>

        <div>
          <StatusBadge variant="info">
            Category
          </StatusBadge>
        </div>

        <div>
          <CategoryStatusBadge status={category.status} />
        </div>

        <div className="text-muted-foreground text-admin-14">
          {category.productsCount}
        </div>

        <div className="flex items-center">
          <CategoryActions
            editHref={`/categories/${mainCategory.slug}/${category.slug}/edit`}
            addHref={`/categories/${mainCategory.slug}/${category.slug}/add-subcategory`}
            addLabel="Add Subcategory"
            label={category.name}
            slug={category.slug}
            status={category.status}
            loading={actionSlug === category.slug}
            onDeactivate={onDeactivate}
            onRestore={onRestore}
          />
        </div>
      </div>

      <div id={childrenId} hidden={!expanded}>
      {category.subcategories.map((subcategory) => (
        <SubcategoryRow
          key={subcategory.id}
          subcategory={subcategory}
          mainCategory={mainCategory}
          category={category}
          actionSlug={actionSlug}
          onDeactivate={onDeactivate}
          onRestore={onRestore}
        />
      ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcategory Row                                                            */
/* -------------------------------------------------------------------------- */

function SubcategoryRow({
  subcategory,
  mainCategory,
  category,
  actionSlug,
  onDeactivate,
  onRestore,
}: {
  subcategory: SubcategoryItem;
  mainCategory: MainCategoryItem;
  category: CategoryItem;
  actionSlug: string | null;
  onDeactivate: (slug: string, label: string) => void;
  onRestore: (slug: string) => void;
}) {
  return (
    <div className="grid min-h-[56px] min-w-[900px] grid-cols-[minmax(300px,1fr)_175px_140px_115px_90px] lg:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_100px_80px_70px] items-center border-border border-b bg-primary/2 px-4">
      <div className="flex items-center gap-3 pl-[76px]">
        <span className="w-4 border-[#bfc3d5] border-t border-dashed" />

        <Layers3 className="size-4 text-muted-foreground" />

        <span className="text-foreground text-admin-14">
          {subcategory.name}
        </span>
      </div>

      <div>
        <StatusBadge variant="neutral">
          Subcategory
        </StatusBadge>
      </div>

      <div>
        <CategoryStatusBadge status={subcategory.status} />
      </div>

      <div className="text-muted-foreground text-admin-14">
        {subcategory.productsCount}
      </div>

      <div className="flex items-center">
          <CategoryActions
          editHref={`/categories/${mainCategory.slug}/${category.slug}/${subcategory.slug}/edit`}
            label={subcategory.name}
          slug={subcategory.slug}
          status={subcategory.status}
          loading={actionSlug === subcategory.slug}
          onDeactivate={onDeactivate}
          onRestore={onRestore}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function CategoryStatusBadge({
  status,
}: {
  status: "Active" | "Inactive";
}) {
  return (
    <StatusBadge
      variant={status === "Active" ? "success" : "neutral"}
    >
      {status}
    </StatusBadge>
  );
}

/* -------------------------------------------------------------------------- */
/* Category Actions                                                           */
/* -------------------------------------------------------------------------- */

function CategoryActions({
  editHref,
  addHref,
  addLabel,
  label,
  slug,
  status,
  loading,
  onDeactivate,
  onRestore,
}: {
  editHref: string;
  addHref?: string;
  addLabel?: string;
  label: string;
  slug: string;
  status: "Active" | "Inactive";
  loading: boolean;
  onDeactivate: (slug: string, label: string) => void;
  onRestore: (slug: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={loading}
          aria-label={`Actions for ${label}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48"
      >
        <DropdownMenuGroup>
          {addHref && (
            <DropdownMenuItem asChild>
              <Link href={addHref}><Plus />{addLabel}</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={editHref}><Edit3 />Edit</Link>
          </DropdownMenuItem>
        {status === "Active" ? (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDeactivate(slug, label)}
          >
            <UserX className="size-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => onRestore(slug)}
          >
            <RotateCcw className="size-4" />
            Restore
          </DropdownMenuItem>
        )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------------------------------------- */
/* Update Status Locally                                                      */
/* -------------------------------------------------------------------------- */

function updateCategoryStatusInTree(
  categories: MainCategoryItem[],
  slug: string,
  status: "Active" | "Inactive",
): MainCategoryItem[] {
  return categories.map((mainCategory) => {
    if (mainCategory.slug === slug) {
      return {
        ...mainCategory,
        status,
      };
    }

    return {
      ...mainCategory,

      categories: mainCategory.categories.map((category) => {
        if (category.slug === slug) {
          return {
            ...category,
            status,
          };
        }

        return {
          ...category,

          subcategories: category.subcategories.map(
            (subcategory) =>
              subcategory.slug === slug
                ? {
                    ...subcategory,
                    status,
                  }
                : subcategory,
          ),
        };
      }),
    };
  });
}
