"use client";

import * as React from "react";

import {
  getAdminInquiryDetails,
} from "@/lib/api/admin-inquiries-api";

import {
  InquiryDetail,
} from "./inquiry-detail";

import {
  mapAdminInquiryDetail,
  type InquiryDetailData,
} from "./inquiry-detail-data";

interface InquiryDetailPageProps {
  inquiryNumber: string;
}

export function InquiryDetailPage({
  inquiryNumber,
}: InquiryDetailPageProps) {
  const [
    inquiry,
    setInquiry,
  ] =
    React.useState<InquiryDetailData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    error,
    setError,
  ] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function loadInquiry() {
      setLoading(true);
      setError("");

      try {
        const response =
          await getAdminInquiryDetails(
            inquiryNumber,
          );

        if (
          !active ||
          !response.data
        ) {
          return;
        }

        setInquiry(
          mapAdminInquiryDetail(
            response.data.inquiry,
          ),
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load inquiry.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInquiry();

    return () => {
      active = false;
    };
  }, [inquiryNumber]);

  if (loading) {
    return (
      <div className="rounded-[9px] border border-border bg-card p-10 text-center text-admin-14 text-muted-foreground">
        Loading inquiry details...
      </div>
    );
  }

  if (
    error ||
    !inquiry
  ) {
    return (
      <div className="rounded-[9px] border border-red-200 bg-red-50 p-5 text-admin-14 font-medium text-red-600">
        {error ||
          "Inquiry not found."}
      </div>
    );
  }

  return (
    <InquiryDetail
      inquiry={inquiry}
    />
  );
}