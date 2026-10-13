import { CategoryForm } from "@/components/admin/categories/category-form";

interface EditMainCategoryPageProps {
  params: Promise<{
    mainCategorySlug: string;
  }>;
}

export default async function EditMainCategoryPage({ params }: EditMainCategoryPageProps) {
  const { mainCategorySlug } = await params;

  return <CategoryForm mode="MAIN_CATEGORY" operation="EDIT" editSlug={mainCategorySlug} />;
}
