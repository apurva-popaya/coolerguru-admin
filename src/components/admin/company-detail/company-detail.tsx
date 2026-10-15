"use client";

import Link from "next/link";

import { useState } from "react";
import { cn } from "cn";

import {
  ArrowLeft,
  Building2,
  Download,
  FileText,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  ShieldCheck,
} from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { updateAdminCompanyStatus } from "@/lib/api/admin-companies-api";

import { AdminDecisionPanel } from "./admin-decision-panel";
import type { CompanyDetailData } from "./company-detail-data";
import { CompanyHeader } from "./company-header";
import { DetailSection } from "./detail-section";

export function CompanyDetail({
  company,
}: {
  company: CompanyDetailData;
}) {
  const [isActive, setIsActive] = useState(
    company.active,
  );

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const isVerified =
    company.verificationStatus === "Verified";

  const isRejected =
    company.verificationStatus === "Rejected";

  const handleToggleCompanyStatus = async () => {
    try {
      setUpdatingStatus(true);

      const nextStatus = !isActive;

      await updateAdminCompanyStatus(
        company.id,
        {
          is_active: nextStatus,
          note: nextStatus
            ? "Company activated by admin."
            : "Company deactivated by admin.",
        },
      );

      setIsActive(nextStatus);
    } catch (error) {
      console.error(
        "Failed to update company status:",
        error,
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="company-detail-page flex flex-col gap-4">
      {/* Back */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 font-medium text-primary text-admin-14"
        >
          <ArrowLeft className="size-4" />
          Back to Companies
        </Link>
      </div>

      {/* Header + Admin Decision */}
      <div className={cn("grid grid-cols-1 items-start gap-4", company.verificationStatus === "Pending" && "xl:grid-cols-[minmax(0,1fr)_300px]")}>
        <CompanyHeader company={company} action={isVerified ? (
          <Button type="button" variant={isActive ? "destructive" : "outline"}
            onClick={handleToggleCompanyStatus} disabled={updatingStatus} className="h-10 rounded-xl">
            {updatingStatus && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {updatingStatus ? (isActive ? "Deactivating..." : "Activating...")
              : (isActive ? "Deactivate Company" : "Activate Company")}
          </Button>
        ) : undefined} />
        {company.verificationStatus === "Pending" && <AdminDecisionPanel company={company} />}
      </div>

      {/* Rejected company */}
      {isRejected && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="font-bold text-admin-14 text-destructive">
            Company Verification Rejected
          </h2>

          <div className="mt-3 grid gap-3 text-admin-14 md:grid-cols-3">
            <Info
              label="Reason"
              value={company.verificationNote ?? "-"}
            />
          </div>
        </div>
      )}

      {/* Company Metrics */}
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        <Metric
          icon={Package}
          label="Products"
          value={company.productsCount}
        />

        {/* These are not currently returned by the API */}
        <Metric
          icon={MessageSquare}
          label="Inquiries"
          value={company.inquiriesReceived}
        />

        {/* <Metric
          icon={Reply}
          label="Seller Responses"
          value={company.sellerResponses}
        /> */}

        {/* <Metric
          icon={Eye}
          label="Profile Views"
          value={company.profileViews}
        /> */}

        <Metric
          icon={Heart}
          label="Saved by Buyers"
          value={company.savedByBuyers}
        />

        {/* Removed activeProducts because it is not part of
            CompanyDetailData/current API response */}
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Company Profile */}
          <DetailSection
            title="Company Profile"
            icon={
              <Building2 className="size-4 text-primary" />
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-foreground text-admin-18">
                  {company.name}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-muted-foreground text-admin-14">
                  <MapPin className="size-4 text-primary" />

                  {company.location}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {company.businessTypes.map((type) => (
                    <StatusBadge
                      key={type}
                      variant="info"
                    >
                      {type}
                    </StatusBadge>
                  ))}

                  {company.featured && (
                    <StatusBadge variant="purple">
                      Featured
                    </StatusBadge>
                  )}
                </div>
              </div>

              <div className="border-border border-t pt-4">
                <h4 className="mb-3 font-bold text-foreground text-admin-14">
                  Supplier Account
                </h4>

                <div className="grid gap-3 text-admin-14 md:grid-cols-2">
                  <Info
                    label="Account Name"
                    value={company.supplierName}
                  />

                  <Info
                    label="Mobile"
                    value={company.supplierPhone}
                  />

                  <Info
                    label="Email"
                    value={company.supplierEmail}
                  />

                  <Info
                    label="Account Status"
                    value={
                      isActive
                        ? "Active"
                        : "Inactive"
                    }
                  />
                </div>
              </div>

              <div className="border-border border-t pt-4">
                <Info
                  label="About Company"
                  value={company.about}
                />
              </div>
            </div>
          </DetailSection>

          {/* Business & Address */}
          <DetailSection
            title="Business & Address Details"
            icon={
              <MapPin className="size-4 text-primary" />
            }
          >
            <div className="grid gap-4 text-admin-14 md:grid-cols-2">
              <Info
                label="Registered Address"
                value={company.registeredAddress}
              />

              <Info
                label="City"
                value={company.city}
              />

              <Info
                label="State"
                value={company.state}
              />

              <Info
                label="Pincode"
                value={company.pincode}
              />

              <Info
                label="Business Hours"
                value={company.businessHours}
              />

              <Info
                label="Contact Email"
                value={company.contactEmail}
              />

              <Info
                label="Contact Phone"
                value={company.contactPhone}
              />

              <Info
                label="Website"
                value={company.website}
              />
            </div>
          </DetailSection>

        </div>
        <div className="flex min-w-0 flex-col gap-4">
          {/* Verification Information */}
          <DetailSection
            title="Verification Information"
            icon={
              <ShieldCheck className="size-4 text-primary" />
            }
            action={
              <StatusBadge
                variant={
                  isVerified
                    ? "success"
                    : company.verificationStatus ===
                        "Rejected"
                      ? "danger"
                      : "warning"
                }
              >
                {company.verificationStatus}
              </StatusBadge>
            }
          >
            <div className="grid gap-4 text-admin-14 md:grid-cols-2">
              <Info
                label="Company Type"
                value={company.companyType}
              />

              <Info
                label="GST"
                value={company.gstNumber}
              />

              <Info
                label="PAN"
                value={company.panNumber}
              />

              <Info
                label="Registration"
                value={company.registrationNumber}
              />

              <Info
                label="Years in Business"
                value={company.yearsInBusiness}
              />

              <Info
                label="Employee Size"
                value={company.employeeSize}
              />

              <Info
                label="Joined Date"
                value={company.joinedDate}
              />

              <Info
                label="Verification Submitted"
                value={company.verificationSubmitted}
              />
            </div>
          </DetailSection>

          {/* Verification Documents */}
          <DetailSection
            title="Verification Documents"
            icon={
              <FileText className="size-4 text-primary" />
            }
          >
            {company.documents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {company.documents.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-2xl border border-border bg-muted/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground text-admin-14">
                          {document.name}
                        </p>
                      </div>

                      <Button
                        asChild
                        size="icon-sm"
                        variant="outline"
                        aria-label={`Open ${document.name}`}
                      >
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-admin-14">
                No verification documents available.
              </p>
            )}
          </DetailSection>
        {/* Products & Categories */}
        <DetailSection
          title="Categories"
          icon={
            <Package className="size-4 text-primary" />
          }
        >
          {company.categories.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2">
                {company.categories.map((category) => (
                  <StatusBadge
                    key={category}
                    variant="info"
                  >
                    {category}
                  </StatusBadge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-admin-14">
              No categories found for this company.
            </p>
          )}
        </DetailSection>

        </div>
      </div>

      {/* Recent Products + Inquiries */}
      <div className="company-detail-tables grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2">
        <DetailSection
          title="Recent Products"
          className="min-w-0 overflow-hidden"
          icon={
            <Package className="size-4 text-primary" />
          }
        >
          {company.products.length > 0 ? (
            <div className="min-w-0" role="region" aria-label="Recent products table">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">Recent products for {company.name}</caption>
                <colgroup><col className="w-[30%]" /><col className="w-1/4" /><col className="w-1/5" /><col className="w-1/4" /></colgroup>
                <thead>
                  <tr className="border-border border-b text-left text-muted-foreground text-admin-14">
                    <th scope="col" className="pb-3">
                      Product
                    </th>

                    <th scope="col" className="pb-3">
                      Category
                    </th>

                    <th scope="col" className="pb-3">
                      Status
                    </th>

                    <th scope="col" className="pb-3">
                      Price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {company.products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-border/60 border-b text-admin-14"
                      >
                        <td data-label="Product" className="py-3 font-semibold text-foreground">
                          {product.name}
                        </td>

                        <td data-label="Category" className="py-3 text-muted-foreground">
                          {product.category}
                        </td>

                        <td data-label="Status" className="py-3">
                          <StatusBadge
                            variant={
                              product.status ===
                              "Active"
                                ? "success"
                                : "danger"
                            }
                          >
                            {product.status}
                          </StatusBadge>
                        </td>

                        <td data-label="Price" className="py-3 text-foreground">
                          {product.price}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-admin-14">
              No products found for this company.
            </p>
          )}
        </DetailSection>

        <DetailSection
          title="Recent Inquiries"
          className="min-w-0 overflow-hidden"
          icon={
            <MessageSquare className="size-4 text-primary" />
          }
        >
          {company.inquiries.length > 0 ? (
            <div className="min-w-0" role="region" aria-label="Recent inquiries table">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">Recent inquiries for {company.name}</caption>
                <colgroup><col className="w-1/5" /><col className="w-[27%]" /><col className="w-[33%]" /><col className="w-1/5" /></colgroup>
                <thead>
                  <tr className="border-border border-b text-left text-muted-foreground text-admin-14">
                    <th scope="col" className="pb-3">
                      Buyer
                    </th>

                    <th scope="col" className="pb-3">
                      Inquiry
                    </th>

                    <th scope="col" className="pb-3">
                      Response
                    </th>

                    <th scope="col" className="pb-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {company.inquiries.map(
                    (inquiry) => (
                      <tr
                        key={inquiry.id}
                        className="border-border/60 border-b text-admin-14"
                      >
                        <td data-label="Buyer" className="py-3 font-semibold text-foreground">
                          {inquiry.buyer}
                        </td>

                        <td data-label="Inquiry" className="py-3 text-muted-foreground">
                          {inquiry.inquiry}
                        </td>

                        <td data-label="Response" className="py-3 text-muted-foreground">
                          {inquiry.response}
                        </td>

                        <td data-label="Status" className="py-3">
                          <StatusBadge
                            variant={
                              inquiry.status ===
                              "Replied"
                                ? "success"
                                : inquiry.status ===
                                    "New"
                                  ? "info"
                                  : "neutral"
                            }
                          >
                            {inquiry.status}
                          </StatusBadge>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-admin-14">
              No inquiries found for this company.
            </p>
          )}
        </DetailSection>
      </div>

      {/* Admin Notes */}
      {/* {!isVerified && !isRejected && (
        <DetailSection
          title="Admin Notes & Remarks"
          icon={
            <Users className="size-4 text-primary" />
          }
        >
          <textarea
            placeholder="Add your review notes, comments or rejection reason here..."
            className="min-h-[100px] w-full resize-none rounded-2xl border border-border p-3 text-admin-14 outline-none focus:border-[#2720a8]"
          />
        </DetailSection>
      )} */}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex h-full items-start justify-between gap-3">
        <dl className="flex min-w-0 flex-col gap-2">
          <dt className="font-medium text-muted-foreground text-admin-14 leading-normal">
            {label}
          </dt>

          <dd className="font-bold text-primary text-admin-28 leading-tight tabular-nums">
            {value.toLocaleString("en-IN")}
          </dd>
        </dl>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="font-medium text-muted-foreground text-admin-14">
        {label}
      </p>

      <p className="mt-1 font-medium text-foreground text-admin-14">
        {value}
      </p>
    </div>
  );
}
