"use client";

import { Eye, Loader2, Power, PowerOff, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { updateAdminCompanyStatus } from "@/lib/api/admin-companies-api";
import type { CompanyRow } from "./companies-data";
import type { useCompanyFeatured } from "./use-company-featured";

interface CompanyActionsProps {
  company: CompanyRow;
  featured: ReturnType<typeof useCompanyFeatured>;
  onUpdated: () => Promise<void>;
}

export function CompanyActions({ company, featured, onUpdated }: CompanyActionsProps) {
  const [confirmation, setConfirmation] = useState<"featured" | "status" | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = saving || featured.isUpdating;
  const featureLabel = company.featured ? "Unfeature company" : "Feature company";
  const statusLabel = company.isActive ? "Deactivate company" : "Activate company";
  const action = confirmation === "featured" ? featureLabel : statusLabel;

  async function confirm() {
    if (busy || !confirmation) return;
    setSaving(true);
    try {
      if (confirmation === "featured") {
        await featured.toggleFeatured(company);
      } else {
        const response = await updateAdminCompanyStatus(company.companyId, {
          is_active: !company.isActive,
          note: company.isActive ? "Deactivated by an administrator from All Companies." : "Activated by an administrator from All Companies.",
        });
        if (!response.success) throw new Error("Unable to update company status.");
        toast.success(company.isActive ? "Company deactivated." : "Company activated.");
        await onUpdated();
      }
      setConfirmation(null);
    } catch {
      toast.error("We couldn't update this company. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="flex items-center justify-center gap-2">
    <Tooltip><TooltipTrigger asChild>
      <Button asChild variant="outline" size="icon">
        <Link href={`/companies/${company.companyId}`} aria-label={`View ${company.name}`}><Eye /></Link>
      </Button>
    </TooltipTrigger><TooltipContent>View company</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger asChild>
      <span tabIndex={busy ? 0 : undefined}>
        <Button type="button" variant={company.featured ? "secondary" : "outline"} size="icon" disabled={busy}
          aria-label={`${featureLabel}: ${company.name}`} aria-pressed={company.featured}
          onClick={() => setConfirmation("featured")}>
          <Star fill={company.featured ? "currentColor" : "none"} />
        </Button>
      </span>
    </TooltipTrigger><TooltipContent>{featureLabel}</TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger asChild>
      <span tabIndex={busy ? 0 : undefined}>
        <Button type="button" variant={company.isActive ? "destructive" : "outline"} size="icon" disabled={busy}
          aria-label={`${statusLabel}: ${company.name}`} onClick={() => setConfirmation("status")}>
          {company.isActive ? <PowerOff /> : <Power />}
        </Button>
      </span>
    </TooltipTrigger><TooltipContent>{statusLabel}</TooltipContent></Tooltip>
    <AlertDialog open={confirmation !== null} onOpenChange={(open) => { if (!open && !busy) setConfirmation(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action}?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {confirmation === "featured"
              ? company.featured ? "remove" : "add"
              : company.isActive ? "deactivate" : "activate"} “{company.name}”{confirmation === "featured"
              ? company.featured ? " from featured companies" : " to featured companies" : ""}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={(confirmation === "status" && company.isActive) || (confirmation === "featured" && company.featured) ? "destructive" : "default"}
            disabled={busy} onClick={(event) => { event.preventDefault(); void confirm(); }}>
            {busy && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {busy ? "Updating..." : action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
