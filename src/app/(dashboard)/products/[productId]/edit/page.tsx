import { ProductEditForm } from "@/components/admin/products/product-edit-form";

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return <ProductEditForm slug={productId} />;
}
