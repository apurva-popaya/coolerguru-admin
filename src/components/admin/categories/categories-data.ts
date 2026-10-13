export type CategoryStatus = "Active" | "Inactive";

export interface SubcategoryItem {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  status: CategoryStatus;
  productsCount: number;
}

export interface CategoryItem {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  status: CategoryStatus;
  productsCount: number;
  subcategories: SubcategoryItem[];
}

export interface MainCategoryItem {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  status: CategoryStatus;
  productsCount: number;
  categories: CategoryItem[];
}
