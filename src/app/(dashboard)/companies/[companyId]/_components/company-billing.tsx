import Link from "next/link";
import { ArrowUpRight, CreditCard } from "lucide-react";

import { BillingFacts, BillingStatus, BillingTable } from "@/components/admin/billing-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { billingDate, expiringSoon, invoices, money, payments, subscriptions } from "@/lib/billing-demo";

export function CompanyBilling({ companyId }: { companyId: string }) {
  const history = subscriptions.filter((s) => s.companyId === companyId);
  const current = history.find((s) => s.status === "Active");
  const recentPayments = payments.filter((p) => p.companyId === companyId).slice(0, 3);
  const recentInvoices = invoices.filter((i) => i.companyId === companyId).slice(0, 3);
  const href = `/billing?company=${encodeURIComponent(companyId)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>
            <span className="flex items-center gap-2">
              <CreditCard className="size-4 text-primary" />
              Plan & Billing
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Sample data</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href={href}>
                View all billing
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <CardDescription>Current access, purchased allowances, and recent billing activity.</CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-5">
        {current ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{current.plan.name}</h3>
                <BillingStatus status={current.status} />
                {expiringSoon(current) && <Badge variant="outline">Expires soon</Badge>}
              </div>
              <p className="font-semibold">
                {money(current.plan.price)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {current.plan.durationDays ? `/ ${current.plan.durationDays} days` : "· No expiry"}
                </span>
              </p>
            </div>
            <BillingFacts
              items={[
                ["Started", billingDate(current.started)],
                ["Expires", billingDate(current.expires)],
                ["Product allowance", `${current.productsUsed} of ${current.plan.maxProducts} used`],
                ["User allowance", `${current.usersUsed} of ${current.plan.maxUsers} used`],
              ]}
            />
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No sample subscription for this company</EmptyTitle>
              <EmptyDescription>Billing data will appear here after backend integration.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {!!history.length && (
          <section className="flex min-w-0 flex-col gap-3" aria-label="Recent subscription history">
            <h3 className="text-sm font-semibold">Recent subscriptions</h3>
            <BillingTable
              headers={["Plan", "Started", "Expires", "Subscription status"]}
              rows={history
                .slice(0, 3)
                .map((s) => ({
                  id: s.id,
                  cells: [
                    s.plan.name,
                    billingDate(s.started),
                    s.status === "Pending" ? "Awaiting activation" : billingDate(s.expires),
                    <BillingStatus key="status" status={s.status} />,
                  ],
                }))}
            />
          </section>
        )}
        {!!recentPayments.length && (
          <section className="flex min-w-0 flex-col gap-3" aria-label="Recent payments">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Recent payments</h3>
              <Link href={`${href}&tab=payments`} className="text-sm text-primary underline-offset-4 hover:underline">
                View payments
              </Link>
            </div>
            <BillingTable
              headers={["Reference", "Plan", "Amount", "Payment status"]}
              rows={recentPayments.map((p) => ({
                id: p.id,
                cells: [p.id, p.planName, money(p.amount), <BillingStatus key="status" status={p.status} />],
              }))}
            />
          </section>
        )}
        {!!recentInvoices.length && (
          <section className="flex min-w-0 flex-col gap-3" aria-label="Recent invoices">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Recent invoices</h3>
              <Link href={`${href}&tab=invoices`} className="text-sm text-primary underline-offset-4 hover:underline">
                View invoices
              </Link>
            </div>
            <BillingTable
              headers={["Invoice", "Issued", "Total", "Invoice status"]}
              rows={recentInvoices.map((i) => ({
                id: i.id,
                cells: [
                  i.number ?? "Invoice being generated",
                  i.issued ? billingDate(i.issued) : "Not issued yet",
                  money(i.total),
                  <BillingStatus key="status" status={i.status} />,
                ],
              }))}
            />
          </section>
        )}
      </CardContent>
    </Card>
  );
}
