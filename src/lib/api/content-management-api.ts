import { type ApiResponse, apiRequest } from "./api-client";

export interface ContentImage {
  id: string;
  image_url: string;
  filename: string;
  display_order: number;
  file?: File;
}

export interface ContentSection {
  id: string;
  page: string;
  section: string;
  content_type: string;
  images: ContentImage[];
  status: "active" | "inactive" | null;
  updated_at?: string;
}

export const contentPages = [{ id: "homepage", label: "Homepage" }];
export const contentSectionOptions: {
  id: string;
  page: string;
  label: string;
  contentType: string;
  contentTypeLabel: string;
}[] = [
  { id: "hero", page: "homepage", label: "Hero", contentType: "hero-image", contentTypeLabel: "Hero Image" },
  { id: "premium", page: "homepage", label: "Premium Advertisement", contentType: "banner", contentTypeLabel: "Banner" },
  { id: "normal", page: "homepage", label: "Normal Advertisement", contentType: "banner", contentTypeLabel: "Banner" },
];

export const contentCapabilities = { multipleImages: false, status: true, genericCreation: true };

export interface ContentManagementData {
  pages: { id: string; label: string }[];
  section_options: {
    id: string;
    page: string;
    label: string;
    content_types: { id: string; label: string }[];
  }[];
  sections: ContentSection[];
}

export async function getContentManagement(): Promise<ContentManagementData> {
  const response = await apiRequest<ApiResponse<ContentManagementData>>("/admin/content-sections", {
    method: "GET",
    portal: "ADMIN",
    cache: "no-store",
  });
  if (!response.success || !response.data || !Array.isArray(response.data.sections)) {
    throw new Error("Unable to load content sections. Please try again.");
  }
  return {
    pages: response.data.pages ?? contentPages,
    section_options: response.data.section_options ?? contentSectionOptions.map((option) => ({
      id: option.id, page: option.page, label: option.label,
      content_types: [{ id: option.contentType, label: option.contentTypeLabel }],
    })),
    sections: response.data.sections.map((section) => ({
      ...section,
      id: String(section.id),
      images: (section.images ?? []).map((image) => ({ ...image, id: String(image.id) }))
        .sort((left, right) => left.display_order - right.display_order),
    })),
  };
}

export async function getContentSections(): Promise<ContentSection[]> {
  return (await getContentManagement()).sections;
}

export async function saveContentSection(content: ContentSection): Promise<void> {
  if (!content.page || !content.section || !content.content_type) throw new Error("Choose a page, section and content type.");
  if (content.status !== "active" && content.status !== "inactive") throw new Error("Choose a content status.");
  if (!content.images.length) throw new Error("Choose an image before saving.");
  const body = new FormData();
  body.append("page", content.page);
  body.append("section", content.section);
  body.append("content_type", content.content_type);
  body.append("status", content.status);
  const manifest = content.images.map((image, index) => {
    if (image.file) {
      const uploadField = `image_${index}`;
      body.append(uploadField, image.file);
      return { upload_field: uploadField, display_order: index + 1 };
    }
    return { id: image.id, display_order: index + 1 };
  });
  body.append("images", JSON.stringify(manifest));
  const response = await apiRequest<ApiResponse<{ section: ContentSection }>>(
    content.id ? `/admin/content-sections/${encodeURIComponent(content.id)}` : "/admin/content-sections",
    { method: content.id ? "PUT" : "POST", portal: "ADMIN", body },
  );
  if (!response.success) throw new Error("Unable to save content. Please try again.");
}