"use client";

import * as React from "react";

import {
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  sanitizeText,
} from "@/lib/utils/sanitize";

interface RejectCompanyDialogProps {
  open: boolean;

  onOpenChange:
    (open: boolean) =>
      void;

  companyName: string;

  submitting?: boolean;

  onReject:
    (reason: string) =>
      Promise<void>;
}

export function RejectCompanyDialog({
  open,
  onOpenChange,
  companyName,
  submitting = false,
  onReject,
}: RejectCompanyDialogProps) {
  const [
    rejectionReason,
    setRejectionReason,
  ] =
    React.useState("");

  const [
    error,
    setError,
  ] =
    React.useState("");

  async function handleReject() {
    const reason =
      sanitizeText(
        rejectionReason,
      );

    if (!reason) {
      setError(
        "Please enter a rejection reason.",
      );

      return;
    }

    setError("");

    try {
      await onReject(
        reason,
      );

      setRejectionReason(
        "",
      );
    } catch {
      // Parent displays API error.
    }
  }

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (submitting) {
      return;
    }

    if (!nextOpen) {
      setRejectionReason(
        "",
      );

      setError("");
    }

    onOpenChange(
      nextOpen,
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="admin-ui sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[#15136f]">
            Reject Company Verification
          </DialogTitle>

          <DialogDescription>
            Provide the reason for rejecting {companyName}. This message will be visible to the supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label htmlFor="rejection-reason" className="font-semibold text-[#11163d] text-admin-14">
            Rejection Reason *
          </label>

          <Textarea id="rejection-reason" value={rejectionReason} onChange={(event) => { setRejectionReason(event.target.value); if (error) { setError(""); } }} disabled={submitting} placeholder="Explain why this company cannot be approved..." className="min-h-[130px]" />

          {error ? (
            <p className="text-admin-14 font-medium text-red-600">
              {error}
            </p>
          ) : null}

          {rejectionReason ? (
            <div className="rounded-[8px] bg-[#fff7f7] p-3">
              <p className="font-semibold text-[#d92d20] text-admin-14">
                Message sent to supplier
              </p>

              <p className="mt-1 text-[#5d6280] text-admin-14">
                {rejectionReason}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={submitting} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          <Button type="button" variant="destructive" disabled={!rejectionReason.trim() || submitting} onClick={() => void handleReject()} className="gap-2">
            <X className="size-4" />

            {submitting
              ? "Rejecting..."
              : "Reject Company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}