// Prototype fixtures only. Purchased terms are snapshots, independent of the plan catalog.
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  durationDays: number | null;
  maxProducts: number;
  maxUsers: number;
  displayOrder: number;
  active: boolean;
}

export const demoPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    slug: "free",
    description: "A simple way to get your business listed.",
    price: 0,
    currency: "INR",
    durationDays: null,
    maxProducts: 5,
    maxUsers: 1,
    displayOrder: 1,
    active: true,
  },
  {
    id: "pro",
    name: "Pro",
    slug: "pro",
    description: "More room for growing cooling businesses.",
    price: 999,
    currency: "INR",
    durationDays: 30,
    maxProducts: 50,
    maxUsers: 5,
    displayOrder: 2,
    active: true,
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "A larger catalog and a team to manage it.",
    price: 1999,
    currency: "INR",
    durationDays: 30,
    maxProducts: 100,
    maxUsers: 10,
    displayOrder: 3,
    active: false,
  },
];

export interface BillingCompany {
  id: string;
  name: string;
  email: string;
  address: string;
  taxId: string | null;
}

export const billingCompanies: BillingCompany[] = [
  { id: "8", name: "Nayan Company", email: "billing@nayan.example", address: "Ahmedabad, Gujarat, India", taxId: null },
  {
    id: "1",
    name: "ABC Cooling Industries",
    email: "accounts@abccooling.example",
    address: "Pune, Maharashtra, India",
    taxId: null,
  },
  {
    id: "19",
    name: "Blue Star",
    email: "billing@bluestar.example",
    address: "Mumbai, Maharashtra, India",
    taxId: null,
  },
  {
    id: "demo-4",
    name: "Breeze Wave",
    email: "hello@breezewave.example",
    address: "Jaipur, Rajasthan, India",
    taxId: null,
  },
];

export interface Subscription {
  id: string;
  companyId: string;
  plan: Plan;
  started: string;
  expires: string | null;
  status: "Active" | "Expired" | "Pending";
  productsUsed: number;
  usersUsed: number;
  paymentId: string | null;
}

export const subscriptions: Subscription[] = [
  {
    id: "sub_1008",
    companyId: "8",
    plan: { ...demoPlans[1] },
    started: "2026-10-17",
    expires: "2026-11-16",
    status: "Active",
    productsUsed: 12,
    usersUsed: 2,
    paymentId: "pay_1008",
  },
  {
    id: "sub_1007",
    companyId: "1",
    plan: { ...demoPlans[1] },
    started: "2026-09-23",
    expires: "2026-10-23",
    status: "Active",
    productsUsed: 28,
    usersUsed: 4,
    paymentId: "pay_1007",
  },
  {
    id: "sub_1006",
    companyId: "19",
    plan: { ...demoPlans[2] },
    started: "2026-10-05",
    expires: "2026-11-04",
    status: "Active",
    productsUsed: 64,
    usersUsed: 6,
    paymentId: "pay_1006",
  },
  {
    id: "sub_1005",
    companyId: "demo-4",
    plan: { ...demoPlans[0] },
    started: "2026-09-01",
    expires: null,
    status: "Active",
    productsUsed: 3,
    usersUsed: 1,
    paymentId: null,
  },
  {
    id: "sub_1004",
    companyId: "8",
    plan: { ...demoPlans[1] },
    started: "2026-09-17",
    expires: "2026-10-17",
    status: "Expired",
    productsUsed: 9,
    usersUsed: 2,
    paymentId: "pay_1004",
  },
  {
    id: "sub_1003",
    companyId: "1",
    plan: { ...demoPlans[1] },
    started: "2026-08-24",
    expires: "2026-09-23",
    status: "Expired",
    productsUsed: 20,
    usersUsed: 3,
    paymentId: "pay_1003",
  },
  {
    id: "sub_1002",
    companyId: "demo-4",
    plan: { ...demoPlans[1] },
    started: "2026-10-19",
    expires: null,
    status: "Pending",
    productsUsed: 0,
    usersUsed: 0,
    paymentId: "pay_1002",
  },
];

export interface Payment {
  id: string;
  companyId: string;
  planName: string;
  amount: number;
  currency: "INR";
  status: "Captured" | "Pending" | "Failed" | "Refunded";
  date: string;
  method: string;
  orderId: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  capturedAt: string | null;
  failureReason: string | null;
  refund: { reference: string; amount: number; date: string } | null;
}

export const payments: Payment[] = [
  ...subscriptions
    .filter((s) => s.paymentId)
    .map(
      (s): Payment => ({
        id: s.paymentId!,
        companyId: s.companyId,
        planName: s.plan.name,
        amount: s.plan.price,
        currency: "INR",
        status: s.status === "Pending" ? "Pending" : "Captured",
        date: s.started,
        method: s.status === "Pending" ? "Awaiting payment" : "UPI",
        orderId: `ord_${s.id.slice(4)}`,
        gatewayOrderId: `order_demo_${s.id.slice(4)}`,
        gatewayPaymentId: s.status === "Pending" ? null : `pay_demo_${s.id.slice(4)}`,
        capturedAt: s.status === "Pending" ? null : `${s.started}T10:30:00+05:30`,
        failureReason: null,
        refund: null,
      }),
    ),
  {
    id: "pay_1001",
    companyId: "demo-4",
    planName: "Pro",
    amount: 999,
    currency: "INR",
    status: "Failed",
    date: "2026-10-18",
    method: "Card",
    orderId: "ord_1001",
    gatewayOrderId: "order_demo_1001",
    gatewayPaymentId: null,
    capturedAt: null,
    failureReason: "The payment was declined by the issuing bank.",
    refund: null,
  },
  {
    id: "pay_1000",
    companyId: "19",
    planName: "Business",
    amount: 1999,
    currency: "INR",
    status: "Refunded",
    date: "2026-09-04",
    method: "Net banking",
    orderId: "ord_1000",
    gatewayOrderId: "order_demo_1000",
    gatewayPaymentId: "pay_demo_1000",
    capturedAt: "2026-09-04T11:00:00+05:30",
    failureReason: null,
    refund: { reference: "rfnd_demo_1000", amount: 1999, date: "2026-09-05" },
  },
];

export interface Invoice {
  id: string;
  number: string | null;
  paymentId: string;
  companyId: string;
  planName: string;
  issued: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: "Paid" | "Refunded" | "Generating";
  documentReady: boolean;
}

export const invoices: Invoice[] = payments
  .filter((p) => p.status === "Captured" || p.status === "Refunded")
  .map((p, index) => ({
    id: `inv_${p.id.slice(4)}`,
    number: p.id === "pay_1006" ? null : `INV-2026-${String(index + 1).padStart(3, "0")}`,
    paymentId: p.id,
    companyId: p.companyId,
    planName: p.planName,
    issued: p.id === "pay_1006" ? null : p.date,
    subtotal: p.amount,
    tax: 0,
    total: p.amount,
    status: p.id === "pay_1006" ? "Generating" : p.status === "Refunded" ? "Refunded" : "Paid",
    documentReady: p.id !== "pay_1006",
  }));

export const DEMO_TODAY = "2026-10-19";
export const DEMO_SOON = "2026-10-26";
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
export const billingDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value))
    : "No expiry";
export const companyFor = (id: string) => billingCompanies.find((company) => company.id === id);
export const expiringSoon = (s: Subscription) =>
  s.status === "Active" && !!s.expires && s.expires >= DEMO_TODAY && s.expires <= DEMO_SOON;
