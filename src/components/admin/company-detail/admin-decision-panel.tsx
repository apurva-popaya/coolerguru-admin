"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  Check,
  ClipboardCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  reviewAdminCompanyVerification,
} from "@/lib/api/admin-companies-api";

import {
  getApiErrorMessage,
} from "@/lib/api/get-api-error-message";

import type {
  CompanyDetailData,
} from "./company-detail-data";

import {
  RejectCompanyDialog,
} from "./reject-company-dialog";

export function AdminDecisionPanel({
  company,
}: {
  company: CompanyDetailData;
}) {
  const router = useRouter();

  const [
    rejectDialogOpen,
    setRejectDialogOpen,
  ] = React.useState(false);

  const [
    approving,
    setApproving,
  ] = React.useState(false);

  const [
    rejecting,
    setRejecting,
  ] = React.useState(false);

  const [
    error,
    setError,
  ] = React.useState("");

  /*
   * Backend supports PENDING as the reviewable
   * verification state.
   *
   * DRAFT, VERIFIED and REJECTED should not
   * show the decision panel.
   */
  const canReview =
    company.verificationStatus ===
    "Pending";

  if (!canReview) {
    return null;
  }

  async function handleApprove() {
    if (
      approving ||
      rejecting
    ) {
      return;
    }

    setApproving(true);
    setError("");

    try {
      await reviewAdminCompanyVerification(
        company.id,
        {
          status: "VERIFIED",

          note:
            "Company verification approved by admin.",
        },
      );

      router.refresh();
    } catch (error) {
      setError(
        getApiErrorMessage(error),
      );
    } finally {
      setApproving(false);
    }
  }

  async function handleReject(
    reason: string,
  ) {
    if (
      approving ||
      rejecting
    ) {
      return;
    }

    setRejecting(true);
    setError("");

    try {
      await reviewAdminCompanyVerification(
        company.id,
        {
          status: "REJECTED",

          note: reason,
        },
      );

      setRejectDialogOpen(false);

      router.refresh();
    } catch (error) {
      setError(
        getApiErrorMessage(error),
      );

      throw error;
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      <div className="rounded-[9px] border border-[#ddd9ff] bg-[#faf9ff] p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f0edff]">
            <ClipboardCheck className="size-4 text-primary" />
          </div>

          <div>
            <h2 className="font-bold text-foreground text-admin-15">
              Admin Decision
            </h2>

            <p className="mt-1 text-muted-foreground text-admin-14">
              Review the company information and verification documents before taking an action.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-3 rounded-[7px] border border-red-200 bg-red-50 p-3 text-admin-14 text-red-600">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            disabled={
              approving ||
              rejecting
            }
            onClick={() =>
              void handleApprove()
            }
            className="h-10 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" />

            {approving
              ? "Approving..."
              : "Approve Company"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={
              approving ||
              rejecting
            }
            onClick={() =>
              setRejectDialogOpen(true)
            }
            className="h-10 w-full gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
          >
            <X className="size-4" />

            Reject Company
          </Button>
        </div>
      </div>

      <RejectCompanyDialog
        open={rejectDialogOpen}
        onOpenChange={
          setRejectDialogOpen
        }
        companyName={company.name}
        submitting={rejecting}
        onReject={handleReject}
      />
    </>
  );
}