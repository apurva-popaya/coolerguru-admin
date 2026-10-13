import { CategoryForm } from "@/components/admin/categories/category-form";

interface AddSubcategoryPageProps {
  params: Promise<{
    mainCategorySlug: string;
    categorySlug: string;
  }>;
}

export default async function AddSubcategoryPage({ params }: AddSubcategoryPageProps) {
  const { mainCategorySlug, categorySlug } = await params;

  return (
    <CategoryForm mode="SUBCATEGORY" operation="ADD" mainCategorySlug={mainCategorySlug} categorySlug={categorySlug} />
  );
}
