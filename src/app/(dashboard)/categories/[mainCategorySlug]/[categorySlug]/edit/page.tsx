import { CategoryForm } from "@/components/admin/categories/category-form";

interface EditCategoryPageProps {
  params: Promise<{
    mainCategorySlug: string;
    categorySlug: string;
  }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { mainCategorySlug, categorySlug } = await params;

  return <CategoryForm mode="CATEGORY" operation="EDIT" mainCategorySlug={mainCategorySlug} editSlug={categorySlug} />;
}
