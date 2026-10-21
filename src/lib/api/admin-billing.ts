import { apiRequest, type ApiResponse } from "@/lib/api/api-client";

export interface BillingPlan {
  plan_id: number;
  name: string;
  slug: string;
}

export interface BillingSeller {
  user_id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
}

export interface BillingCompany {
  company_id: number;
  name: string;
  slug: string;
  company_logo_url: string | null;
}

export interface BillingInvoice {
  plan_invoice_id: number;
  invoice_number: string | null;
  status: string;
  amount_minor: number;
  refunded_amount_minor: number;
  currency: string;
  issued_at: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  plan?: BillingPlan;
  plan_payment_id?: number;
  payment_status?: string;
}

export interface BillingPayment {
  plan_payment_id: number;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_refund_id: string | null;
  receipt: string | null;
  amount_minor: number;
  refunded_amount_minor: number;
  currency: string;
  status: string;
  method: string | null;
  error_code: string | null;
  error_description: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  invoice: BillingInvoice | null;
  plan?: BillingPlan;
  plan_subscription_id?: number;
}

export interface BillingSubscription {
  plan_subscription_id: number;
  plan: BillingPlan;
  price: number;
  currency: string;
  duration_days: number | null;
  max_products: number;
  max_users: number;
  status: string;
  stored_status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingRecord extends Omit<BillingSubscription, "status" | "stored_status" | "updated_at"> {
  seller: BillingSeller;
  company: BillingCompany | null;
  subscription_status: string;
  stored_subscription_status: string;
  latest_payment: BillingPayment | null;
  invoice: BillingInvoice | null;
}

export interface BillingData {
  summary: {
    active_subscriptions: number;
    expiring_soon: number;
    expiring_within_days: number;
    captured_amount_minor: number;
    currency: string;
  };
  plan_options: (BillingPlan & { is_active: boolean })[];
  items: BillingRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SellerBilling {
  seller: BillingSeller;
  company: BillingCompany | null;
  counts: { subscriptions: number; payments: number; invoices: number };
  subscriptions: BillingSubscription[];
  payments: BillingPayment[];
  invoices: BillingInvoice[];
}

export interface BillingQuery {
  search?: string;
  plan_id?: number;
  billing_status?: string;
  subscription_status?: string;
  payment_status?: string;
  expiring_soon?: boolean;
  expiring_within_days?: number;
  page?: number;
  limit?: number;
}

async function readBilling<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const response = await apiRequest<ApiResponse<T>>(endpoint, { method: "GET", portal: "ADMIN", signal });
  if (!response.success || !response.data) {
    throw new Error(response.message || "Unable to load billing data.");
  }
  return response.data;
}

export function getAdminBilling(query: BillingQuery = {}, signal?: AbortSignal): Promise<BillingData> {
  const params = new URLSearchParams({ page: String(query.page ?? 1), limit: String(query.limit ?? 20) });
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && String(value).trim() !== "") params.set(key, String(value).trim());
  }
  return readBilling<BillingData>(`/admin/billing?${params}`, signal);
}

export async function getSellerBilling(userId: number, signal?: AbortSignal): Promise<SellerBilling> {
  const data = await readBilling<{ billing: SellerBilling }>(`/admin/billing/sellers/${userId}`, signal);
  return data.billing;
}
