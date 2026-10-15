import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  FileSpreadsheet,
  FileText,
  CalendarDays,
  Paperclip,
  Package,
  UserRound,
} from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";

import type { InquiryDetailData } from "./inquiry-detail-data";
import { InquirySection } from "./inquiry-section";

export function InquiryDetail({
  inquiry,
}: {
  inquiry: InquiryDetailData;
}) {
  return (
    <div className="inquiry-detail-page flex min-w-0 flex-col gap-4">
      <Link href="/inquiries" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft aria-hidden="true" className="size-4" />Back to Inquiries
      </Link>
      <header className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Inquiry Detail</p>
            <h1 className="mt-1 break-words text-admin-22 font-bold text-foreground">{inquiry.id}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sent by {inquiry.buyer.name} to {inquiry.company.name}</p>
          </div>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Created on {displayValue(inquiry.createdDate)}</span>
          </p>
        </div>
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <TopInfo label="Inquiry Type" value={inquiry.inquiryType} />
          <TopInfo label="Quantity" value={inquiry.quantity} />
          <TopInfo label="Product" value={inquiry.product.name} />
          <TopInfo label="Category" value={inquiry.product.category} />
        </div>
      </header>
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <InquirySection title="Buyer Details">
          <ProfileHeader icon={UserRound} title={inquiry.buyer.name} subtitle={inquiry.buyer.company} />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="Location" value={inquiry.buyer.location} />

            <Info label="Email" value={inquiry.buyer.email} />

            <Info label="Phone" value={inquiry.buyer.phone} />

            <Info label="Buyer Type" value={inquiry.buyer.buyerType} />
          </div>
        </InquirySection>
        <InquirySection title="Supplier / Company Details">
          <ProfileHeader
            icon={Building2}
            title={inquiry.company.name}
            subtitle={inquiry.company.verified ? "Verified" : undefined}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="Contact Person" value={inquiry.company.contactPerson} />

            <Info label="Location" value={inquiry.company.location} />

            <Info label="Email" value={inquiry.company.email} />

            <Info label="Phone" value={inquiry.company.phone} />

            <div className="sm:col-span-2">
              <p className="text-admin-14 text-muted-foreground">Supplier Type</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {inquiry.company.supplierTypes.length === 0 && <p className="text-sm text-muted-foreground">Not provided</p>}
                {inquiry.company.supplierTypes.map((type) => (
                  <StatusBadge key={type} variant="info">
                    {type}
                  </StatusBadge>
                ))}
              </div>
            </div>
          </div>
        </InquirySection>
      </div>
        <InquirySection title="Product / Requirement">
          <ProfileHeader icon={Package} title={inquiry.product.name} />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <Info label="Quantity" value={inquiry.product.quantity} />

            <Info label="Budget" value={inquiry.product.budget} />

            <Info label="Delivery Location" value={inquiry.product.deliveryLocation} />

            <Info label="Requirement Notes" value={inquiry.product.notes} />
          </div>
        </InquirySection>
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <InquirySection title="Original Inquiry">
          <p className="whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
            {displayValue(inquiry.originalInquiry)}
          </p>
        </InquirySection>
        <InquirySection title={`Attachments (${inquiry.attachments.length})`}>
          {inquiry.attachments.length > 0 ? (
            <div className="flex min-w-0 flex-col gap-3">
              {inquiry.attachments.map((attachment) => (
                <div key={attachment.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    {attachment.type === "PDF" ? <FileText aria-hidden="true" className="size-5" /> : <FileSpreadsheet aria-hidden="true" className="size-5" />}
                  </span>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-foreground">{attachment.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{displayValue(attachment.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
              <Paperclip aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">No attachments</p>
                <p className="mt-1 text-xs text-muted-foreground">No files were included with this inquiry.</p>
              </div>
            </div>
          )}
        </InquirySection>
      </div>
    </div>
  );
}

function TopInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/50 px-3 py-3">
      <p className="text-admin-14 text-muted-foreground">{label}</p>

      <p className="mt-1 break-words font-semibold text-foreground text-sm">{displayValue(value)}</p>
    </div>
  );
}

function ProfileHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
        <Icon className="size-6" />
      </div>

      <div className="min-w-0">
        <p className="break-words font-semibold text-foreground">{title}</p>

        {subtitle && <p className="text-admin-14 text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>

      <span className="break-words font-medium text-foreground">{displayValue(value)}</span>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  const text = value?.trim();
  return !text || text === "-" || text === "\u2014" ? "Not provided" : text;
}
