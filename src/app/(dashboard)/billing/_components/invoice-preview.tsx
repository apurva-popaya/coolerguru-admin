"use client";

import { Download } from "lucide-react";

import { BillingFacts, BillingStatus } from "@/components/admin/billing-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingInvoice } from "@/lib/api/admin-billing";

import { billingDate, billingMoney, billingStatus } from "./billing-format";

export function InvoicePreview({ invoice, sellerName }: { invoice: BillingInvoice; sellerName: string }) {
  const url = invoice.invoice_url;
  const downloadable = !!url && /^https?:\/\//i.test(url);
  return (
    <Card>
      <CardHeader><div className="flex flex-wrap items-start justify-between gap-3">
        <CardTitle>{invoice.invoice_number ?? "Invoice " + invoice.plan_invoice_id}</CardTitle>
        <div className="flex items-center gap-3">
          <BillingStatus status={billingStatus(invoice.status)} />
          {downloadable ? <Button asChild><a href={url ?? undefined} target="_blank" rel="noopener noreferrer">
            <Download data-icon="inline-start" />Download invoice
          </a></Button> : <Button disabled title="The invoice document is not available yet">
            <Download data-icon="inline-start" />Download invoice
          </Button>}
        </div>
      </div></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <BillingFacts items={[
          ["Billed to", sellerName], ["Plan", invoice.plan?.name ?? "Not available"],
          ["Issue date", billingDate(invoice.issued_at, "Not issued yet")], ["Currency", invoice.currency],
          ["Total", billingMoney(invoice.amount_minor / 100, invoice.currency)],
          ["Amount refunded", billingMoney(invoice.refunded_amount_minor / 100, invoice.currency)],
          ["Payment reference", invoice.plan_payment_id ?? "Not available"],
        ]} />
        {!downloadable && <p className="text-sm text-muted-foreground">The invoice document is not available yet.</p>}
      </CardContent>
    </Card>
  );
}
