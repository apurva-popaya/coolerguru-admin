import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Download,
  FileSpreadsheet,
  FileText,
  MessageCircle,
  Package,
  UserRound,
} from "lucide-react";

import { StatusBadge, type StatusVariant } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";

import type { InquiryDetailData } from "./inquiry-detail-data";
import { InquirySection } from "./inquiry-section";

function statusVariant(status: InquiryDetailData["status"]): StatusVariant {
  switch (status) {
    case "New":
      return "info";

    case "Replied":
      return "success";

    case "In Discussion":
      return "purple";

    case "Closed":
      return "neutral";

    default:
      return "neutral";
  }
}

export function InquiryDetail({
  inquiry,
}: {
  inquiry: InquiryDetailData;
}) {
  const hasSellerReply =
    inquiry.messages.some(
      (message) =>
        message.role === "Supplier",
    );

  const hasBuyerFollowUp =
    hasSellerReply &&
    inquiry.messages.some(
      (message) =>
        message.role === "Buyer",
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            href="/inquiries"
            className="inline-flex items-center gap-2 font-medium text-[#2720a8] text-admin-14"
          >
            <ArrowLeft className="size-4" />
            Back to Inquiries
          </Link>

          <h1 className="mt-3 font-bold text-[#15136f] text-admin-28">Inquiry Detail</h1>

          <p className="mt-1 text-admin-14 text-muted-foreground">
            View Inquiry sent by {inquiry.buyer.name} to {inquiry.company.name}
          </p>
        </div>

        <div className="rounded-[9px] border border-border bg-white px-4 py-3">
          {/* <StatusBadge variant={statusVariant(inquiry.status)}>{inquiry.status}</StatusBadge> */}

          <p className="mt-2 text-admin-14 text-muted-foreground">Created on {inquiry.createdDate}</p>
        </div>
      </div>

      <div className="rounded-[9px] border border-border bg-white p-5">
        <h2 className="font-bold text-[#15136f] text-admin-22">{inquiry.id}</h2>

        {/* <p className="mt-1 text-admin-14 text-muted-foreground">Inquiry Conversation Flow</p> */}

        {/* <div className="mt-5 flex flex-wrap items-center gap-3">
          <FlowStep icon={UserRound} title={inquiry.buyer.name} subtitle="Buyer" />

<Arrow />

<FlowStep icon={FileText} title="Sent" subtitle={inquiry.inquiryType} />

<Arrow />

<FlowStep icon={Building2} title={inquiry.company.name} subtitle="Supplier" /> */}

{/* {hasSellerReply ? (
  <>
    <Arrow />

    <FlowStep icon={MessageCircle} title="Seller replied" />
  </>
) : null}

{hasBuyerFollowUp ? (
  <>
    <Arrow />

    <FlowStep icon={MessageCircle} title="Buyer replied" />
  </>
) : null}

<Arrow /> */}

{/* <FlowStep icon={MessageCircle} title={inquiry.status} />
        </div> */}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <TopInfo label="Inquiry Type" value={inquiry.inquiryType} />

          <TopInfo label="Quantity" value={inquiry.quantity} />

          <TopInfo label="Product" value={inquiry.product.name} />

          <TopInfo label="Category" value={inquiry.product.category} />

          {/* <TopInfo label="Current Status" value={inquiry.status} /> */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <InquirySection title="Buyer Details">
          <ProfileHeader icon={UserRound} title={inquiry.buyer.name} subtitle={inquiry.buyer.company} />

          <div className="mt-4 space-y-3">
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

          <div className="mt-4 space-y-3">
            <Info label="Contact Person" value={inquiry.company.contactPerson} />

            <Info label="Location" value={inquiry.company.location} />

            <Info label="Email" value={inquiry.company.email} />

            <Info label="Phone" value={inquiry.company.phone} />

            <div>
              <p className="text-admin-14 text-muted-foreground">Supplier Type</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {inquiry.company.supplierTypes.map((type) => (
                  <StatusBadge key={type} variant="info">
                    {type}
                  </StatusBadge>
                ))}
              </div>
            </div>
          </div>
        </InquirySection>

        <InquirySection title="Product / Requirement">
          <ProfileHeader icon={Package} title={inquiry.product.name} />

          <div className="mt-4 space-y-3">
            <Info label="Quantity" value={inquiry.product.quantity} />

            <Info label="Budget" value={inquiry.product.budget} />

            <Info label="Delivery Location" value={inquiry.product.deliveryLocation} />

            <Info label="Requirement Notes" value={inquiry.product.notes} />
          </div>
        </InquirySection>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <InquirySection title="Original Inquiry">
            <pre className="whitespace-pre-wrap rounded-[8px] bg-[#f7f8ff] p-4 font-sans text-[#15136f] text-admin-14 leading-5">
              {inquiry.originalInquiry}
            </pre>
          </InquirySection>

          {/* <InquirySection title={`Seller Replies and Buyer Follow-ups (${inquiry.messages.length})`}>
            <div className="space-y-4">
              {inquiry.messages.map((message) => (
                <div key={message.id} className="grid grid-cols-[44px_150px_minmax(0,1fr)] gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#edf3ff] text-[#2563eb]">
                    {message.role === "Buyer" ? <UserRound className="size-5" /> : <Building2 className="size-5" />}
                  </div>

                  <div>
                    <p className="font-semibold text-[#15136f] text-admin-14">{message.sender}</p>

                    <p className="text-admin-14 text-muted-foreground">{message.role}</p>

                    <p className="mt-1 text-admin-14 text-muted-foreground">{message.time}</p>
                  </div>

                  <div className="rounded-[8px] bg-[#f4f7ff] p-3 text-[#15136f] text-admin-14 leading-5">
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </InquirySection> */}
        </div>

        <div className="space-y-4">
          <InquirySection
            title={`Attachments (${inquiry.attachments.length})`}
            action={
              <button type="button" className="font-semibold text-[#2720a8] text-admin-14">
                Download All
              </button>
            }
          >
            <div className="space-y-3">
              {inquiry.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    {attachment.type === "PDF" ? (
                      <FileText className="size-6 text-red-500" />
                    ) : (
                      <FileSpreadsheet className="size-6 text-green-600" />
                    )}

                    <div>
                      <p className="font-semibold text-[#15136f] text-admin-14">{attachment.name}</p>

                      <p className="text-admin-14 text-muted-foreground">{attachment.size}</p>
                    </div>
                  </div>

                  <Button size="icon-sm" variant="outline">
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </InquirySection>

          {/* <InquirySection title="Conversation Timeline">
            <div className="space-y-4">
              {inquiry.timeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="size-3 rounded-full bg-[#6c3ce9]" />

                    {index < inquiry.timeline.length - 1 && <div className="h-full w-px bg-[#dedcf6]" />}
                  </div>

                  <div className="pb-3">
                    <p className="text-admin-14 text-muted-foreground">{item.date}</p>

                    <p className="mt-1 text-[#15136f] text-admin-14">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </InquirySection> */}

          {/* <InquirySection title="Current Status & Admin Actions">
            <div className="rounded-[8px] bg-[#f1edff] p-4">
              <p className="font-bold text-[#6c3ce9] text-admin-16">{inquiry.status}</p>

              <p className="mt-1 text-admin-14 text-muted-foreground">
                Buyer and supplier conversation is being monitored by admin.
              </p>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <TopInfo label="Last Activity" value={inquiry.lastActivity} />

              <TopInfo label="Total Replies" value={`${inquiry.messages.length}`} />

              <TopInfo label="Attachments" value={`${inquiry.attachments.length}`} />
            </div>

            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full">
                <UserRound className="size-4" />
                View Buyer Profile
              </Button>

              <Button asChild className="w-full bg-[#2720a8] hover:bg-[#15136f]">
                <Link href={`/companies/${inquiry.company.id}`}>
                  <Building2 className="size-4" />
                  View Company Profile
                </Link>
              </Button>

              <Button variant="outline" className="w-full">
                <Download className="size-4" />
                Export Conversation
              </Button>
            </div>
          </InquirySection> */}
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex min-w-[95px] flex-col items-center text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#edf3ff] text-[#2720a8]">
        <Icon className="size-5" />
      </div>

      <p className="mt-2 font-semibold text-[#15136f] text-admin-14">{title}</p>

      {subtitle && <p className="text-admin-14 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Arrow() {
  return <div className="hidden h-px w-8 bg-[#cfd2e3] xl:block" />;
}

function TopInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-border bg-[#fcfcff] px-3 py-3">
      <p className="text-admin-14 text-muted-foreground">{label}</p>

      <p className="mt-1 font-semibold text-[#15136f] text-admin-14">{value}</p>
    </div>
  );
}

function ProfileHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#edf3ff] text-[#2563eb]">
        <Icon className="size-6" />
      </div>

      <div>
        <p className="font-bold text-[#15136f]">{title}</p>

        {subtitle && <p className="text-admin-14 text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[115px_minmax(0,1fr)] gap-3 text-admin-14">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium text-[#15136f]">{value}</span>
    </div>
  );
}
