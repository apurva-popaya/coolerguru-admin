"use client";

import { Building2, CalendarClock, CreditCard, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { BillingStatus, BillingTable } from "@/components/admin/billing-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminBilling, type BillingData, type BillingRecord } from "@/lib/api/admin-billing";

import { BillingDetails } from "./billing-details";
import { BillingFilters } from "./billing-filters";
import { billingDate, billingMoney, billingStatus } from "./billing-format";

export function BillingDashboard({ initialSearch, initialTab }: { initialSearch: string; initialTab?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [plan, setPlan] = useState("All");
  const [status, setStatus] = useState("All");
  const [soon, setSoon] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selection, setSelection] = useState<BillingRecord | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      void getAdminBilling({
        page, limit: 20, search: search.trim() || undefined,
        plan_id: plan === "All" ? undefined : Number(plan),
        billing_status: status === "All" ? "ALL" : status.toUpperCase(),
        expiring_soon: soon, expiring_within_days: 7,
      }, controller.signal).then((result) => {
        if (!controller.signal.aborted) setData(result);
      }).catch((failure: unknown) => {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load billing.");
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [page, search, plan, status, soon, retry]);

  const updateFilter = (setValue: (value: string) => void) => (value: string) => { setValue(value); setPage(1); };
  const summary = data?.summary;
  const summaries = [
    { title: "Active subscriptions", value: summary?.active_subscriptions, description: "Current access across sellers", icon: CreditCard },
    { title: "Expiring soon", value: summary?.expiring_soon, description: "Expiry within the next " + (summary?.expiring_within_days ?? 7) + " days", icon: CalendarClock },
    { title: "Successful payments", value: summary ? billingMoney(summary.captured_amount_minor / 100, summary.currency) : undefined,
      description: "Successful total - excludes refunded payments", icon: Wallet },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div><h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track seller subscriptions, payment activity, and invoices in one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {summaries.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}><CardHeader><div className="flex items-center justify-between gap-2">
            <CardTitle>{title}</CardTitle><Icon aria-hidden="true" className="size-4 text-primary" />
          </div></CardHeader><CardContent>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{value ?? "--"}</p>
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          </CardContent></Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Summary figures cover all billing records. Filters apply to the table.</p>
      <BillingFilters search={search} onSearch={updateFilter(setSearch)} plan={plan} onPlan={updateFilter(setPlan)}
        status={status} onStatus={updateFilter(setStatus)} planOptions={data?.plan_options ?? []}
        soon={soon} onSoon={() => { setSoon(!soon); setPage(1); }} onReset={() => {
          setSearch(""); setPlan("All"); setStatus("All"); setSoon(false); setPage(1);
        }} />
      {error && <Alert variant="destructive"><AlertTitle>Unable to load billing</AlertTitle>
        <AlertDescription>{error}<Button variant="outline" size="sm" onClick={() => setRetry(retry + 1)}>Retry</Button></AlertDescription>
      </Alert>}
      {loading ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading billing records...</p> : !error && data && (
        <BillingTable headers={["Company / seller", "Plan / amount", "Date / expiry", "Subscription", "Payment", "Invoice", "Actions"]}
          columnWidths={["20%", "12%", "17%", "13%", "12%", "17%", "9%"]}
          footer={<div className="flex flex-wrap items-center justify-between gap-3">
            <span>{data.pagination.totalItems} billing records</span>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={!data.pagination.hasPreviousPage} onClick={() => setPage(page - 1)}>Previous</Button>
              <span>Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}</span>
              <Button variant="outline" size="sm" disabled={!data.pagination.hasNextPage} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>}
          rows={data.items.map((row) => ({ id: String(row.plan_subscription_id), cells: [
            <div key="company" className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted"><Building2 aria-hidden="true" className="size-4 text-muted-foreground" /></span>
              <div className="min-w-0"><p className="font-medium">{row.company?.name ?? row.seller.name ?? row.seller.email ?? "Seller " + row.seller.user_id}</p>
                <p className="mt-1 text-xs text-muted-foreground">Seller ID: {row.seller.user_id}</p></div>
            </div>,
            <div key="plan"><p className="font-medium">{row.plan.name}</p><p className="mt-1 text-xs text-muted-foreground">{billingMoney(Number(row.price), row.currency)}</p></div>,
            <div key="date">{billingDate(row.starts_at, "Not started")}<p className="mt-1 text-xs text-muted-foreground">
              {row.expires_at ? "Expires: " + billingDate(row.expires_at) : row.starts_at ? "No expiry" : "Awaiting activation"}
            </p></div>,
            <BillingStatus key="subscription" status={billingStatus(row.subscription_status)} />,
            row.latest_payment ? <BillingStatus key="payment" status={billingStatus(row.latest_payment.status)} /> : row.price === 0 ? "No payment required" : "No payment",
            row.invoice ? <div key="invoice"><BillingStatus status={billingStatus(row.invoice.status)} /><p className="mt-1 text-xs text-muted-foreground">{row.invoice.invoice_number ?? "Being generated"}</p></div> : "No invoice",
            <Button key="view" variant="outline" size="sm" onClick={() => setSelection(row)}>View</Button>,
          ] }))} />
      )}
      <BillingDetails key={selection?.seller.user_id ?? "closed"} selection={selection} onClose={() => setSelection(null)} initialTab={initialTab} />
    </div>
  );
}
