import { ContentSectionForm } from "@/components/admin/content-management/content-section-form";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentSectionForm id={id} />;
}
