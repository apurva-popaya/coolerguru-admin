import { CategoryForm } from "@/components/admin/categories/category-form";

interface AddCategoryPageProps {
  params: Promise<{
    mainCategorySlug: string;
  }>;
}

export default async function AddCategoryPage({ params }: AddCategoryPageProps) {
  const { mainCategorySlug } = await params;

  return <CategoryForm mode="CATEGORY" operation="ADD" mainCategorySlug={mainCategorySlug} />;
}
