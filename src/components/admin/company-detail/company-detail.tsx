"use client";

import Link from "next/link";

import { useState } from "react";

import {
  ArrowLeft,
  Building2,
  Download,
  Eye,
  FileText,
  Heart,
  MapPin,
  MessageSquare,
  Package,
  Reply,
  ShieldCheck,
  Star,
  Users,
  Loader2
} from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";

import { AdminDecisionPanel } from "./admin-decision-panel";
import type { CompanyDetailData } from "./company-detail-data";
import { CompanyHeader } from "./company-header";
import { DetailSection } from "./detail-section";
import { updateAdminCompanyStatus } from "@/lib/api/admin-companies-api";

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
    <div className="space-y-5">
      {/* Back */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-2 font-medium text-[#2720a8] text-admin-14"
        >
          <ArrowLeft className="size-4" />
          Back to Companies
        </Link>
      </div>

      {/* Header + Admin Decision */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <CompanyHeader company={company} />

        <AdminDecisionPanel company={company} />
      </div>

      {/* Verified company actions */}
      {isVerified && (
        <div className="flex flex-wrap justify-end gap-3">
          {/* <Button
            className="gap-2 bg-[#2720a8] hover:bg-[#15136f]"
            type="button"
          >
            <Star className="size-4" />

            {company.featured
              ? "Remove Featured"
              : "Mark as Featured"}
          </Button> */}

          <Button
  variant="outline"
  type="button"
  onClick={handleToggleCompanyStatus}
  disabled={updatingStatus}
  className={
    isActive
      ? "gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      : "gap-2 border-green-300 text-green-600 hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-60"
  }
>
  {updatingStatus && (
    <Loader2 className="size-4 animate-spin" />
  )}

  {updatingStatus
    ? isActive
      ? "Deactivating..."
      : "Activating..."
    : isActive
      ? "Deactivate Company"
      : "Activate Company"}
</Button>
        </div>
      )}

      {/* Rejected company */}
      {isRejected && (
        <div className="rounded-[9px] border border-red-200 bg-red-50 p-4">
          <h2 className="font-bold text-admin-14 text-red-700">
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Company Profile */}
        <DetailSection
          title="Company Profile"
          icon={
            <Building2 className="size-4 text-[#2720a8]" />
          }
        >
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-[#15136f] text-admin-18">
                {company.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-[#5d6280] text-admin-14">
                <MapPin className="size-4 text-[#2720a8]" />

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
              <h4 className="mb-3 font-bold text-[#15136f] text-admin-14">
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

        {/* Verification Information */}
        <DetailSection
          title="Verification Information"
          icon={
            <ShieldCheck className="size-4 text-[#2720a8]" />
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

        {/* Business & Address */}
        <DetailSection
          title="Business & Address Details"
          icon={
            <MapPin className="size-4 text-[#2720a8]" />
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

        {/* Verification Documents */}
        <DetailSection
          title="Verification Documents"
          icon={
            <FileText className="size-4 text-[#2720a8]" />
          }
        >
          {company.documents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {company.documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-[8px] border border-border bg-[#fcfcff] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#15136f] text-admin-14">
                        {document.name}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="icon-sm"
                      variant="outline"
                    >
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="size-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#5d6280] text-admin-14">
              No verification documents available.
            </p>
          )}
        </DetailSection>
      </div>

      {/* Products & Categories */}
      <DetailSection
        title="Categories"
        icon={
          <Package className="size-4 text-[#2720a8]" />
        }
      >
        {company.categories.length > 0 ? (
          <div>
            <p className="mb-3 font-semibold text-[#15136f] text-admin-14">
              Categories
            </p>

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
          <p className="text-[#5d6280] text-admin-14">
            No categories found for this company.
          </p>
        )}
      </DetailSection>

      {/* Recent Products + Inquiries */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2 [&_thead]:bg-muted [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:align-middle [&_th]:font-semibold [&_th]:text-primary [&_th]:leading-normal [&_th]:whitespace-nowrap [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:align-middle [&_td]:leading-normal [&_td]:wrap-anywhere [&_tbody_tr:nth-child(even)]:bg-muted [&_tbody_tr:last-child]:border-b-0 [&_.admin-status-badge]:shrink-0 [&_.admin-status-badge]:whitespace-nowrap [&_.admin-status-badge]:wrap-normal [&_.admin-status-badge]:break-normal">
        <DetailSection
          title="Recent Products"
          className="min-w-0 overflow-hidden"
          icon={
            <Package className="size-4 text-[#2720a8]" />
          }
        >
          {company.products.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" tabIndex={0} role="region" aria-label="Recent products table">
              <table className="w-full min-w-[620px] table-fixed border-collapse [&_td:last-child]:whitespace-nowrap [&_td:last-child]:wrap-normal">
                <caption className="sr-only">Recent products for {company.name}</caption>
                <colgroup><col className="w-[34%]" /><col className="w-[27%]" /><col className="w-[16%]" /><col className="w-[23%]" /></colgroup>
                <thead>
                  <tr className="border-border border-b text-left text-[#5d6280] text-admin-14">
                    <th className="pb-3">
                      Product
                    </th>

                    <th className="pb-3">
                      Category
                    </th>

                    <th className="pb-3">
                      Status
                    </th>

                    <th className="pb-3">
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
                        <td className="py-3 font-semibold text-[#15136f]">
                          {product.name}
                        </td>

                        <td className="py-3 text-[#5d6280]">
                          {product.category}
                        </td>

                        <td className="py-3">
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

                        <td className="py-3 text-[#15136f]">
                          {product.price}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#5d6280] text-admin-14">
              No products found for this company.
            </p>
          )}
        </DetailSection>

        <DetailSection
          title="Recent Inquiries"
          className="min-w-0 overflow-hidden"
          icon={
            <MessageSquare className="size-4 text-[#2720a8]" />
          }
        >
          {company.inquiries.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" tabIndex={0} role="region" aria-label="Recent inquiries table">
              <table className="w-full min-w-[660px] table-fixed border-collapse">
                <caption className="sr-only">Recent inquiries for {company.name}</caption>
                <colgroup><col className="w-[23%]" /><col className="w-1/4" /><col className="w-[36%]" /><col className="w-[16%]" /></colgroup>
                <thead>
                  <tr className="border-border border-b text-left text-[#5d6280] text-admin-14">
                    <th className="pb-3">
                      Buyer
                    </th>

                    <th className="pb-3">
                      Inquiry
                    </th>

                    <th className="pb-3">
                      Response
                    </th>

                    <th className="pb-3">
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
                        <td className="py-3 font-semibold text-[#15136f]">
                          {inquiry.buyer}
                        </td>

                        <td className="py-3 text-[#5d6280]">
                          {inquiry.inquiry}
                        </td>

                        <td className="py-3 text-[#5d6280]">
                          {inquiry.response}
                        </td>

                        <td className="py-3">
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
            <p className="text-[#5d6280] text-admin-14">
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
            <Users className="size-4 text-[#2720a8]" />
          }
        >
          <textarea
            placeholder="Add your review notes, comments or rejection reason here..."
            className="min-h-[100px] w-full resize-none rounded-[8px] border border-border p-3 text-admin-14 outline-none focus:border-[#2720a8]"
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
    <div className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
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
      <p className="font-medium text-[#5d6280] text-admin-14">
        {label}
      </p>

      <p className="mt-1 font-medium text-[#15136f] text-admin-14">
        {value}
      </p>
    </div>
  );
}
