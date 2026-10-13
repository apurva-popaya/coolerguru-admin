// import { notFound } from "next/navigation";

// import { ProductDetail } from "@/components/admin/product-detail/product-detail";
// import { getProductDetail } from "@/components/admin/product-detail/product-detail-data";

// interface AdminProductDetailPageProps {
//   params: Promise<{
//     productId: string;
//   }>;
// }

// export default async function AdminProductDetailPage({ params }: AdminProductDetailPageProps) {
//   const { productId } = await params;

//   const product = getProductDetail(productId);

//   if (!product) {
//     notFound();
//   }

//   return <ProductDetail product={product} />;
// }

"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { ProductDetail } from "@/components/admin/product-detail/product-detail";
import type { ProductDetailData } from "@/components/admin/product-detail/product-detail-data";
import { mapAdminProductDetail } from "@/components/admin/product-detail/product-detail-data";
import { getAdminProductBySlug } from "@/lib/api/admin-products-api";

export default function AdminProductDetailPage() {
  const params = useParams<{
    productId: string;
  }>();

  const [product, setProduct] = useState<ProductDetailData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      const slug = params.productId;

      if (!slug) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getAdminProductBySlug(slug);

        if (!active || !response.data?.product) {
          return;
        }

        setProduct(mapAdminProductDetail(response.data.product));
      } catch (error) {
        if (!active) {
          return;
        }

        setProduct(null);

        setError(error instanceof Error ? error.message : "Unable to load product details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [params.productId]);

  /*
   * Called after approve / reject / activate. This page loads on the client,
   * so router.refresh() does not refetch it. Refetches without the loading
   * screen and keeps the current view if the request fails.
   */
  const reloadProduct = useCallback(async () => {
    try {
      const response = await getAdminProductBySlug(params.productId);

      if (response.data?.product) {
        setProduct(mapAdminProductDetail(response.data.product));
      }
    } catch {
      // The action itself succeeded; the next page load shows the new state.
    }
  }, [params.productId]);

  if (loading) {
    return (
      <div className="rounded-[9px] border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-[9px] border border-red-200 bg-red-50 p-5 text-[13px] font-medium text-red-600">
        {error || "Product not found."}
      </div>
    );
  }

  return <ProductDetail product={product} onUpdated={reloadProduct} />;
}
