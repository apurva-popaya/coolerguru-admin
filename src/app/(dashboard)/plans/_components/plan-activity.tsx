"use client";

import { useEffect, useState } from "react";

import { BillingStatus } from "@/components/admin/billing-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminBilling, type BillingRecord } from "@/lib/api/admin-billing";

const activationDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function PlanActivity({ planId }: { planId: string }) {
  const [records, setRecords] = useState<BillingRecord[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setRecords(null);
    setError(false);

    async function loadActivity() {
      const allRecords = new Map<number, BillingRecord>();
      let page = 1;
      while (!controller.signal.aborted) {
        const result = await getAdminBilling({ plan_id: Number(planId), page, limit: 100 }, controller.signal);
        for (const record of result.items) {
          // Never include another plan if the API ignores the filter.
          if (String(record.plan.plan_id) !== planId) {
            throw new Error("Unexpected plan in billing response.");
          }
          allRecords.set(record.plan_subscription_id, record);
        }
        if (!result.pagination.hasNextPage) break;
        if (result.pagination.page !== page || result.items.length === 0) {
          throw new Error("Unable to load complete billing history.");
        }
        page += 1;
      }
      if (!controller.signal.aborted) setRecords([...allRecords.values()]);
    }

    void loadActivity().catch(() => {
      if (!controller.signal.aborted) setError(true);
    });
    return () => controller.abort();
  }, [planId, retry]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan activity</CardTitle>
          <CardDescription role="alert">Unable to load seller activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => setRetry((value) => value + 1)}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!records) {
    return <p role="status" className="py-4 text-sm text-muted-foreground">Loading plan activity…</p>;
  }

  const activated = records.filter((record) => {
    const startsAt = record.starts_at ? Date.parse(record.starts_at) : Number.NaN;
    return Number.isFinite(startsAt) && startsAt <= Date.now();
  });
  const active = records.filter((record) => record.subscription_status.toUpperCase() === "ACTIVE");
  const expired = records.filter((record) => record.subscription_status.toUpperCase() === "EXPIRED");
  const metrics = [
    { label: "Sellers activated", value: new Set(activated.map((record) => record.seller.user_id)).size,
      description: "Unique sellers whose access has started" },
    { label: "Active subscriptions", value: active.length, description: "Currently active on this plan" },
    { label: "Expired subscriptions", value: expired.length, description: "Subscriptions that have ended" },
    { label: "Total subscriptions", value: records.length, description: "Includes repeat purchases and pending access" },
  ];
  const recent = [...activated].sort((a, b) => Date.parse(b.starts_at!) - Date.parse(a.starts_at!)).slice(0, 5);

  return (
    <section aria-label="Plan activity" className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">Plan activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">All-time activity for this plan, including free activations.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, description }) => (
          <Card key={label} size="sm">
            <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activations</CardTitle>
          <CardDescription>Latest five subscriptions whose access has started. Sellers may appear more than once.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length ? (
            <ul className="divide-y divide-border">
              {recent.map((record) => (
                <li key={record.plan_subscription_id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{record.company?.name ?? record.seller.name ?? `Seller ${record.seller.user_id}`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Seller #{record.seller.user_id} · Activated {activationDate.format(new Date(record.starts_at!))}</p>
                  </div>
                  <BillingStatus status={record.subscription_status.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())} />
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No sellers have activated this plan yet.</p>}
        </CardContent>
      </Card>
    </section>
  );
}
