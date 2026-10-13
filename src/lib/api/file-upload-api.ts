import { ApiError, type ApiResponse, apiRequest } from "@/lib/api/api-client";
import type { Pagination } from "@/types/pagination";

/* =========================================
   TYPES
========================================= */

export const UPLOAD_CATEGORIES = [
  "company_logo",
  "company_cover",
  "pan_document",
  "gst_certificate",
  "incorporation_certificate",
  "shop_establishment_certificate",
  "company_brochure",
  "company_document",
  "product_image",
  "product_brochure",
  "category_image",
  "user_profile_image",
] as const;

export type UploadCategory = (typeof UPLOAD_CATEGORIES)[number];

export interface UploadedFile {
  fileId: string;
  url: string;
  key: string;
  category: UploadCategory;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
}

export interface UploadedFileRecord extends UploadedFile {
  originalFilename: string | null;
  companyId: number | null;
  productId: number | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
}

type UploadSingleResponse = ApiResponse & UploadedFile;

type UploadBatchResponse = ApiResponse & {
  files: UploadedFile[];
};

type ListFilesResponse = ApiResponse<{
  files: UploadedFileRecord[];
  pagination: Pagination;
}>;

export interface UploadTarget {
  // Only for product categories, when the product already exists.
  productId?: number;
  // Only for category_image, when the category already exists.
  categoryId?: number;
}

export interface ListFilesParams extends UploadTarget {
  category?: UploadCategory;
  page?: number;
  limit?: number;
  // Admin only.
  companyId?: number;
}

/* =========================================
   VALIDATION RULES
   Mirrors the backend. The server validates again.
========================================= */

export const MAX_UPLOAD_SIZE_MB = 10;

export const MAX_FILES_PER_REQUEST = 10;

type UploadKind = "image" | "pdf" | "pdf_or_image";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const PDF_MIME_TYPES = ["application/pdf"];
const PDF_EXTENSIONS = [".pdf"];

const UPLOAD_KINDS: Record<UploadCategory, UploadKind> = {
  company_logo: "image",
  company_cover: "image",
  pan_document: "pdf",
  gst_certificate: "pdf",
  incorporation_certificate: "pdf",
  shop_establishment_certificate: "pdf",
  company_brochure: "pdf",
  company_document: "pdf_or_image",
  product_image: "image",
  product_brochure: "pdf",
  category_image: "image",
  user_profile_image: "image",
};

/* Categories that accept several files in one request (`files` field). */
const MULTI_FILE_CATEGORIES: readonly UploadCategory[] = ["company_document", "product_image"];

function getKindRules(kind: UploadKind) {
  if (kind === "image") {
    return { mimeTypes: IMAGE_MIME_TYPES, extensions: IMAGE_EXTENSIONS, label: "JPG, PNG or WEBP" };
  }

  if (kind === "pdf") {
    return { mimeTypes: PDF_MIME_TYPES, extensions: PDF_EXTENSIONS, label: "PDF" };
  }

  return {
    mimeTypes: [...PDF_MIME_TYPES, ...IMAGE_MIME_TYPES],
    extensions: [...PDF_EXTENSIONS, ...IMAGE_EXTENSIONS],
    label: "PDF, JPG, PNG or WEBP",
  };
}

export function isImageCategory(category: UploadCategory) {
  return UPLOAD_KINDS[category] === "image";
}

export function getMaxFilesPerRequest(category: UploadCategory) {
  return MULTI_FILE_CATEGORIES.includes(category) ? MAX_FILES_PER_REQUEST : 1;
}

/* Value for the `accept` attribute of a file input. */
export function getUploadAccept(category: UploadCategory) {
  const { mimeTypes, extensions } = getKindRules(UPLOAD_KINDS[category]);

  return [...extensions, ...mimeTypes].join(",");
}

/* Short hint such as "PDF up to 10MB". */
export function getUploadHint(category: UploadCategory) {
  return `${getKindRules(UPLOAD_KINDS[category]).label} up to ${MAX_UPLOAD_SIZE_MB}MB`;
}

/* Returns an error message, or null when the file can be uploaded. */
export function validateUploadFile(file: File, category: UploadCategory): string | null {
  const { mimeTypes, extensions, label } = getKindRules(UPLOAD_KINDS[category]);

  const fileName = file.name.toLowerCase();

  const hasValidExtension = extensions.some((extension) => fileName.endsWith(extension));

  // Some browsers leave `type` empty; the extension check still applies.
  const hasValidType = !file.type || mimeTypes.includes(file.type);

  if (!hasValidExtension || !hasValidType) {
    return `${file.name}: only ${label} files are allowed.`;
  }

  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return `${file.name} must be smaller than ${MAX_UPLOAD_SIZE_MB}MB.`;
  }

  return null;
}

/* =========================================
   REQUESTS
   FormData bodies: apiRequest leaves Content-Type unset
   so the browser adds the multipart boundary.
========================================= */

function appendTarget(formData: FormData, target: UploadTarget) {
  if (target.productId !== undefined) {
    formData.append("productId", String(target.productId));
  }

  if (target.categoryId !== undefined) {
    formData.append("categoryId", String(target.categoryId));
  }
}

function toUploadedFile(response: UploadedFile): UploadedFile {
  return {
    fileId: response.fileId,
    url: response.url,
    key: response.key,
    category: response.category,
    mimeType: response.mimeType,
    size: response.size,
    width: response.width ?? null,
    height: response.height ?? null,
  };
}

/* POST /uploads with a single `file` */
export async function uploadFile(file: File, category: UploadCategory, target: UploadTarget = {}) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("category", category);
  appendTarget(formData, target);

  const response = await apiRequest<UploadSingleResponse>("/uploads", {
    method: "POST",
    body: formData,
  });

  return toUploadedFile(response);
}

/*
 * POST /uploads with repeated `files` (company_document / product_image only).
 * All-or-nothing: if any file is invalid, nothing is stored.
 */
export async function uploadFiles(files: File[], category: UploadCategory, target: UploadTarget = {}) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  formData.append("category", category);
  appendTarget(formData, target);

  const response = await apiRequest<UploadBatchResponse>("/uploads", {
    method: "POST",
    body: formData,
  });

  return response.files.map(toUploadedFile);
}

/*
 * PUT /uploads/:fileId
 * Keeps the same fileId and returns a new url. The backend also updates any
 * saved record that pointed at the old url.
 */
export async function replaceFile(fileId: string, file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiRequest<UploadSingleResponse>(`/uploads/${encodeURIComponent(fileId)}`, {
    method: "PUT",
    body: formData,
  });

  return toUploadedFile(response);
}

/* DELETE /uploads/:fileId: the backend clears any saved field that referenced it. */
export function deleteFile(fileId: string) {
  return apiRequest<ApiResponse & { fileId: string }>(`/uploads/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
  });
}

/* GET /uploads */
export async function listFiles(params: ListFilesParams = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();

  const response = await apiRequest<ListFilesResponse>(`/uploads${query ? `?${query}` : ""}`, {
    method: "GET",
  });

  return {
    files: response.data?.files ?? [],
    pagination: response.data?.pagination,
  };
}

/* Fetches every page of GET /uploads for the given filters. */
export async function listAllFiles(params: Omit<ListFilesParams, "page" | "limit"> = {}) {
  const files: UploadedFileRecord[] = [];

  for (let page = 1; ; page++) {
    const result = await listFiles({ ...params, page, limit: 100 });

    files.push(...result.files);

    if (!result.pagination?.hasNextPage) {
      return files;
    }
  }
}

/*
 * Record GETs (company, product, category) return urls only.
 * Use this map to find the fileId behind a saved url.
 */
export function toFileIdMap(files: UploadedFileRecord[]) {
  return new Map(files.map((file) => [file.url, file]));
}

/* =========================================
   HELPERS
========================================= */

export function getUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "A product needs at least one image. Replace this image instead of removing it.";
    }

    if (error.status === 429) {
      return "Too many uploads. Please wait a few minutes and try again.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getFileNameFromUrl(url: string): string {
  const lastSegment = url.split("?")[0].split("/").pop() ?? url;

  return decodeURIComponent(lastSegment);
}
