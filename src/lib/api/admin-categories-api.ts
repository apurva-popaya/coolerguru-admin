import { apiRequest } from "@/lib/api/api-client";

/* -------------------------------------------------------------------------- */
/* Category Types                                                             */
/* -------------------------------------------------------------------------- */

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  banner_image: string | null;
  icon: string | null;
  parent_id: number | null;
  can_have_children: boolean;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/* -------------------------------------------------------------------------- */
/* Response Types                                                             */
/* -------------------------------------------------------------------------- */

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    category: Category;
  };
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

/* -------------------------------------------------------------------------- */
/* Request Types                                                              */
/* -------------------------------------------------------------------------- */

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner_image?: string;
  icon?: string;
  parent_id?: number | null;
  can_have_children?: boolean;
  sort_order?: number;
  is_featured?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  banner_image?: string | null;
  icon?: string | null;
  parent_id?: number | null;
  can_have_children?: boolean;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Get All Categories                                                         */
/* GET /categories                                                            */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>("/categories", {
    method: "GET",
  });
}

/* -------------------------------------------------------------------------- */
/* Get Root / Main Categories                                                 */
/* GET /categories                                                            */
/* -------------------------------------------------------------------------- */

/*
 * The backend currently returns categories from:
 *
 * GET /categories
 *
 * This function is kept separately because the admin UI uses the
 * term "Root Categories" / "Main Categories".
 */

export async function getRootCategories(): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>("/categories", {
    method: "GET",
  });
}

/* -------------------------------------------------------------------------- */
/* Get Category By Slug                                                       */
/* GET /categories/{slug}                                                      */
/* -------------------------------------------------------------------------- */

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
    {
      method: "GET",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Get Category Children                                                      */
/* GET /categories/{slug}/children                                             */
/* -------------------------------------------------------------------------- */

export async function getCategoryChildren(
  categorySlug: string,
): Promise<CategoriesResponse> {
  return apiRequest<CategoriesResponse>(
    `/categories/${encodeURIComponent(categorySlug)}/children`,
    {
      method: "GET",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Create Category                                                            */
/* POST /categories                                                           */
/* -------------------------------------------------------------------------- */

/*
 * This endpoint can create all three levels:
 *
 * MAIN CATEGORY:
 *   parent_id: null
 *
 * CATEGORY:
 *   parent_id: main category ID
 *
 * SUBCATEGORY:
 *   parent_id: category ID
 */

export async function createCategory(
  payload: CreateCategoryRequest,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* -------------------------------------------------------------------------- */
/* Update Category                                                            */
/* PATCH /categories/{slug}                                                    */
/* -------------------------------------------------------------------------- */

export async function updateCategory(
  slug: string,
  payload: UpdateCategoryRequest,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Deactivate Category                                                        */
/* PATCH /categories/{slug}                                                    */
/* -------------------------------------------------------------------------- */

export async function deactivateCategory(
  slug: string,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active: false,
      }),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Activate Category                                                          */
/* PATCH /categories/{slug}                                                    */
/* -------------------------------------------------------------------------- */

export async function activateCategory(
  slug: string,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active: true,
      }),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Category                                                            */
/* DELETE /categories/{slug}                                                   */
/* -------------------------------------------------------------------------- */

export async function deleteCategory(
  slug: string,
): Promise<DeleteCategoryResponse> {
  return apiRequest<DeleteCategoryResponse>(
    `/categories/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Restore Category                                                           */
/* PATCH /categories/{slug}/restore                                            */
/* -------------------------------------------------------------------------- */

export async function restoreCategory(
  slug: string,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>(
    `/categories/${encodeURIComponent(slug)}/restore`,
    {
      method: "PATCH",
    },
  );
}