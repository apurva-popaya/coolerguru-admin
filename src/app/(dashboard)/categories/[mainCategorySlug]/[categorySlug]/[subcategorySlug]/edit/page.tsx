import { CategoryForm } from "@/components/admin/categories/category-form";

interface EditSubcategoryPageProps {
  params: Promise<{
    mainCategorySlug: string;
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export default async function EditSubcategoryPage({ params }: EditSubcategoryPageProps) {
  const { mainCategorySlug, categorySlug, subcategorySlug } = await params;

  return (
    <CategoryForm
      mode="SUBCATEGORY"
      operation="EDIT"
      mainCategorySlug={mainCategorySlug}
      categorySlug={categorySlug}
      editSlug={subcategorySlug}
    />
  );
}
