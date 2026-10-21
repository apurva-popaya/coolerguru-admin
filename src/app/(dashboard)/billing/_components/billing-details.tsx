"use client";

import { useEffect, useState } from "react";

import { BillingFacts, BillingStatus } from "@/components/admin/billing-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSellerBilling, type BillingRecord, type SellerBilling } from "@/lib/api/admin-billing";

import { billingDate, billingMoney, billingStatus } from "./billing-format";
import { InvoicePreview } from "./invoice-preview";

function NoRecords({ label }: { label: string }) {
  return <Empty><EmptyHeader><EmptyTitle>No {label}</EmptyTitle>
    <EmptyDescription>This seller has no {label} records.</EmptyDescription>
  </EmptyHeader></Empty>;
}

export function BillingDetails({ selection, onClose, initialTab }: {
  selection: BillingRecord | null;
  onClose: () => void;
  initialTab?: string;
}) {
  const [billing, setBilling] = useState<SellerBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const sellerId = selection?.seller.user_id;

  useEffect(() => {
    if (sellerId === undefined) return;
    const controller = new AbortController();
    setLoading(true); setBilling(null); setError("");
    void getSellerBilling(sellerId, controller.signal).then((result) => {
      if (!controller.signal.aborted) setBilling(result);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load seller billing.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [sellerId, retry]);

  const name = billing?.company?.name ?? selection?.company?.name ?? billing?.seller.name ?? selection?.seller.name ?? "Seller " + sellerId;
  return (
    <Sheet open={!!selection} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-4xl">
        <SheetHeader className="pr-12"><SheetTitle>Company billing details</SheetTitle>
          <SheetDescription>{name} - All subscriptions, payments, and invoices</SheetDescription>
        </SheetHeader>
        {loading && <p role="status" className="px-6 text-muted-foreground">Loading billing details...</p>}
        {error && <div className="px-6"><Alert variant="destructive"><AlertTitle>Unable to load details</AlertTitle>
          <AlertDescription>{error}<Button variant="outline" onClick={() => setRetry(retry + 1)}>Retry</Button></AlertDescription>
        </Alert></div>}
        {!loading && billing && <Tabs defaultValue={["subscriptions", "payments", "invoices"].includes(initialTab ?? "") ? initialTab : "subscriptions"}
          className="min-w-0 gap-5 px-4 pb-6 sm:px-6">
          <TabsList className="h-auto w-full flex-wrap">
            <TabsTrigger value="subscriptions">Subscriptions ({billing.counts.subscriptions})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({billing.counts.payments})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({billing.counts.invoices})</TabsTrigger>
          </TabsList>
          <TabsContent value="subscriptions" className="flex min-w-0 flex-col gap-4">
            {!billing.subscriptions.length && <NoRecords label="subscription" />}
            {[...billing.subscriptions].sort((a, b) => Number(b.plan_subscription_id === selection?.plan_subscription_id) - Number(a.plan_subscription_id === selection?.plan_subscription_id)).map((subscription) => (
              <Card key={subscription.plan_subscription_id}>
                <CardHeader><div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>{subscription.plan.name} - {subscription.plan_subscription_id}</CardTitle>
                  <BillingStatus status={billingStatus(subscription.status)} />
                </div></CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <BillingFacts items={[
                    ["Company / seller", name], ["Plan at purchase", subscription.plan.name],
                    ["Started", billingDate(subscription.starts_at, "Not started")],
                    ["Expires", billingDate(subscription.expires_at, subscription.starts_at ? "No expiry" : "Awaiting activation")],
                    ["Purchased price", billingMoney(Number(subscription.price), subscription.currency)],
                    ["Duration", subscription.duration_days === null ? "No expiry" : subscription.duration_days + (subscription.duration_days === 1 ? " day" : " days")],
                    ["Product allowance", subscription.max_products], ["User allowance", subscription.max_users],
                  ]} />
                  <Alert><AlertTitle>Purchased terms</AlertTitle><AlertDescription>
                    These prices and limits are the terms at purchase. Later catalog changes do not alter this subscription.
                  </AlertDescription></Alert>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="payments" className="flex min-w-0 flex-col gap-4">
            {!billing.payments.length && <NoRecords label="payment" />}
            {billing.payments.map((payment) => (
              <Card key={payment.plan_payment_id}>
                <CardHeader><div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Payment {payment.plan_payment_id}</CardTitle><BillingStatus status={billingStatus(payment.status)} />
                </div></CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <BillingFacts items={[
                    ["Company / seller", name], ["Plan", payment.plan?.name ?? "Not available"],
                    ["Amount", billingMoney(payment.amount_minor / 100, payment.currency)], ["Currency", payment.currency],
                    ["Payment method", payment.method ?? "Not available"], ["Payment date", billingDate(payment.created_at)],
                    ["Internal payment ID", payment.plan_payment_id], ["Receipt", payment.receipt ?? "Not available"],
                    ["Razorpay order ID", payment.provider_order_id ?? "Not available"],
                    ["Razorpay payment ID", payment.provider_payment_id ?? "Not available"],
                    ["Payment completed at", payment.paid_at ? new Date(payment.paid_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST" : "Not completed"],
                  ]} />
                  {(payment.error_description || payment.error_code) && <Alert variant="destructive"><AlertTitle>Payment failed</AlertTitle>
                    <AlertDescription>{payment.error_description ?? payment.error_code}</AlertDescription></Alert>}
                  {(payment.refunded_amount_minor > 0 || payment.provider_refund_id) && <BillingFacts items={[
                    ["Refund reference", payment.provider_refund_id ?? "Not available"],
                    ["Amount refunded", billingMoney(payment.refunded_amount_minor / 100, payment.currency)],
                    ["Refunded on", billingDate(payment.refunded_at)],
                  ]} />}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="invoices" className="flex min-w-0 flex-col gap-5">
            {!billing.invoices.length && <NoRecords label="invoice" />}
            {billing.invoices.map((invoice) => <InvoicePreview key={invoice.plan_invoice_id} invoice={invoice} sellerName={name} />)}
          </TabsContent>
        </Tabs>}
      </SheetContent>
    </Sheet>
  );
}
