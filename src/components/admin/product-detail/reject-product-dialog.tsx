"use client";

import * as React from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  productName: string;

  submitting?: boolean;

  onReject: (reason: string) => Promise<void>;
}

export function RejectProductDialog({ open, onOpenChange, productName, submitting = false, onReject }: Props) {
  const [reason, setReason] = React.useState("");

  const [error, setError] = React.useState("");

  async function handleReject() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please enter a rejection reason.");

      return;
    }

    setError("");

    try {
      await onReject(trimmedReason);

      setReason("");
    } catch {
      // Parent displays API error.
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) {
      return;
    }

    if (!nextOpen) {
      setReason("");
      setError("");
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="admin-ui sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Reject Product</DialogTitle>

          <DialogDescription>
            Provide the reason for rejecting {productName}. This message will be visible to the supplier.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) {
                setError("");
              }
            }}
            disabled={submitting}
            placeholder="Enter rejection reason..."
            className="min-h-[130px]"
          />

          {error ? <p className="mt-2 text-admin-14 font-medium text-red-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={submitting} onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={!reason.trim() || submitting}
            onClick={() => {
              void handleReject();
            }}
          >
            <X className="size-4" />

            {submitting ? "Rejecting..." : "Reject Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
