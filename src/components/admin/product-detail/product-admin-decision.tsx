"use client";

import * as React from "react";

import { Check, ClipboardCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reviewProductApproval } from "@/lib/api/admin-products-api";
import { sanitizeText } from "@/lib/utils/sanitize";

import type { ProductDetailData } from "./product-detail-data";
import { RejectProductDialog } from "./reject-product-dialog";

export function ProductAdminDecision({
  product,
  onUpdated,
}: {
  product: ProductDetailData;
  onUpdated: () => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);

  const [approving, setApproving] = React.useState(false);

  const [rejecting, setRejecting] = React.useState(false);

  const [error, setError] = React.useState("");

  const canReview = product.approvalStatus === "Pending" || product.approvalStatus === "Under Review";

  async function handleApprove() {
    if (approving || rejecting) {
      return;
    }

    setApproving(true);
    setError("");

    try {
      await reviewProductApproval(product.slug, {
        status: "APPROVED",
        note: "Product approved by admin.",
        is_active: true
      });

      await onUpdated();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to approve product.");
    } finally {
      setApproving(false);
    }
  }

  async function handleReject(reason: string) {
    if (approving || rejecting) {
      return;
    }

    const sanitizedReason = sanitizeText(reason);

    if (!sanitizedReason) {
      return;
    }

    setRejecting(true);
    setError("");

    try {
      await reviewProductApproval(product.slug, {
        status: "REJECTED",
        note: sanitizedReason,
        is_active: false,
      });

      setOpen(false);

      await onUpdated();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to reject product.");

      throw error;
    } finally {
      setRejecting(false);
    }
  }

  if (!canReview) {
    return null;
  }

  return (
    <>
      <div className="rounded-[9px] border border-[#ddd9ff] bg-[#faf9ff] p-4">
        <div className="mb-4 flex gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f0edff]">
            <ClipboardCheck className="size-4 text-primary" />
          </div>

          <div>
            <h2 className="font-bold text-foreground text-admin-15">Admin Decision</h2>

            <p className="mt-1 text-admin-14 text-muted-foreground">
              Review all product information before making a decision.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-3 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-admin-14 font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            className="h-10 w-full gap-2 bg-primary hover:bg-primary/90"
            disabled={approving || rejecting}
            onClick={() => {
              void handleApprove();
            }}
          >
            <Check className="size-4" />

            {approving ? "Approving..." : "Approve Product"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-10 w-full gap-2 border-red-300 text-red-600 hover:bg-red-50"
            disabled={approving || rejecting}
            onClick={() => setOpen(true)}
          >
            <X className="size-4" />
            Reject Product
          </Button>
        </div>
      </div>

      <RejectProductDialog
        open={open}
        onOpenChange={setOpen}
        productName={product.name}
        submitting={rejecting}
        onReject={handleReject}
      />
    </>
  );
}
