import {
  InquiryDetailPage,
} from "@/components/admin/inquiry-detail/inquiry-detail-page";

interface AdminInquiryDetailPageProps {
  params: Promise<{
    inquiryId: string;
  }>;
}

export default async function AdminInquiryDetailPage({
  params,
}: AdminInquiryDetailPageProps) {
  const {
    inquiryId,
  } = await params;

  return (
    <InquiryDetailPage
      inquiryNumber={
        inquiryId
      }
    />
  );
}