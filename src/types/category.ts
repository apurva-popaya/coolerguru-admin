export interface Category {
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  banner_image?: string | null;
  icon?: string | null;
  parent_id?: number | null;
  can_have_children?: boolean;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

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

export interface CategoryResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}
