import { Check, Package, Users } from "lucide-react";

import { BillingStatus } from "@/components/admin/billing-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { money, type Plan } from "@/lib/billing-demo";

export function PlanPreview({ plan }: { plan: Plan }) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Seller preview</span>
          <BillingStatus status={plan.active ? "Active" : "Inactive"} />
        </div>
        <CardTitle>{plan.name || "Plan name"}</CardTitle>
        <CardDescription>{plan.description || "Add a short description of this plan."}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="text-3xl font-semibold tracking-tight">{money(plan.price || 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.durationDays ? `for ${plan.durationDays} days` : "No expiry"}
          </p>
        </div>
        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-center gap-2">
            <Package className="size-4 text-primary" />
            Up to {plan.maxProducts || 0} products
          </li>
          <li className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Up to {plan.maxUsers || 0} users
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 text-primary" />
            One-time purchase
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
