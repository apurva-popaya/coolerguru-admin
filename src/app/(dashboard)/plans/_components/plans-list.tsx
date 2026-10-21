"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Eye, MoreHorizontal, Pencil, Plus, Power, Search } from "lucide-react";
import { toast } from "sonner";

import {
  getAdminPlans,
  updateAdminPlan,
  type AdminPlan,
  type AdminPlanStatus,
} from "@/lib/api/admin-plans";
import {
  BillingFacts,
  BillingSelect,
  BillingStatus,
  BillingTable,
} from "@/components/admin/billing-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Plan } from "@/lib/billing-demo";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PlanActivity } from "./plan-activity";
import { PlanPreview } from "./plan-preview";

type PlanView = Plan & {
  id: string;
};

function toPlanView(plan: AdminPlan): PlanView {
  return {
    id: String(plan.plan_id),
    name: plan.name,
    slug: plan.slug,
    description: plan.description ?? "",
    price: Number(plan.price),
    currency: plan.currency,
    durationDays: plan.duration_days,
    maxProducts: plan.max_products,
    maxUsers: plan.max_users,
    displayOrder: plan.sort_order,
    active: plan.is_active,
  };
}

export function PlansList() {
  const [plans, setPlans] = useState<PlanView[]>([]);
  const [summary, setSummary] = useState({
    total_plans: 0,
    available_for_purchase: 0,
    inactive_plans: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminPlanStatus>("ALL");
  const [selected, setSelected] = useState<PlanView | null>(null);
  const [confirmation, setConfirmation] = useState<PlanView | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchPlans = useCallback(
    async (searchValue: string, statusValue: AdminPlanStatus) => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getAdminPlans({
          search: searchValue,
          status: statusValue,
        });

        const data = response.data;

        if (!data) {
          throw new Error("The server did not return plan data.");
        }

        const mappedPlans = (data.plans ?? [])
          .map(toPlanView)
          .sort((a, b) => a.displayOrder - b.displayOrder);

        setPlans(mappedPlans);
        setSummary(
          data.summary ?? {
            total_plans: mappedPlans.length,
            available_for_purchase: mappedPlans.filter((plan) => plan.active)
              .length,
            inactive_plans: mappedPlans.filter((plan) => !plan.active).length,
          },
        );

        // Keep an open preview in sync with the latest API data.
        setSelected((current) =>
          current
            ? (mappedPlans.find((plan) => plan.id === current.id) ?? null)
            : null,
        );

        setConfirmation((current) =>
          current
            ? (mappedPlans.find((plan) => plan.id === current.id) ?? null)
            : null,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load plans.";

        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce search to avoid making an API request for every keystroke.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPlans(search, status);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search, status, fetchPlans]);

  const handleStatusChange = async () => {
    if (!confirmation || updatingStatus) return;

    const plan = confirmation;
    const nextActive = !plan.active;

    setUpdatingStatus(true);

    try {
      await updateAdminPlan(plan.id, {
        is_active: nextActive,
      });

      toast.success(
        `${plan.name} ${nextActive ? "activated" : "deactivated"} successfully.`,
      );

      setConfirmation(null);

      // Refetch so the table and summary reflect backend state.
      await fetchPlans(search, status);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the plan status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Manage Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the plans, pricing, and limits offered to sellers.
          </p>
        </div>

        <Button asChild>
          <Link href="/plans/create">
            <Plus data-icon="inline-start" />
            Create Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total plans", summary.total_plans],
          ["Available for purchase", summary.available_for_purchase],
          ["Inactive plans", summary.inactive_plans],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {loading ? "—" : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search
            aria-hidden="true"
            className="absolute top-2.5 left-3 size-4 text-muted-foreground"
          />
          <Input
            aria-label="Search plans"
            placeholder="Search plans by name or slug…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <BillingSelect
          label="Statuses"
          value={
            status === "ALL"
              ? "All"
              : status === "ACTIVE"
                ? "Active"
                : "Inactive"
          }
          options={["All", "Active", "Inactive"]}
          onChange={(value) =>
            setStatus(
              value === "All"
                ? "ALL"
                : value === "Active"
                  ? "ACTIVE"
                  : "INACTIVE",
            )
          }
        />

        {(search || status !== "ALL") && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setStatus("ALL");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 p-4 text-sm"
        >
          <p>{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchPlans(search, status)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <p role="status" className="py-3 text-sm text-muted-foreground">
          Loading plans…
        </p>
      )}

      <div
        className="min-w-0 [&_table]:min-w-[960px] [&_th]:whitespace-nowrap [&_th]:px-5 [&_th]:text-center [&_td]:px-5 [&_td]:text-center [&_th:last-child]:pr-10 [&_td:last-child]:pr-10"
      >
        <BillingTable
          headers={[
            "Plan",
            "Price",
            "Duration",
            "Product limit",
            "User limit",
            "Status",
            "Actions",
          ]}
          columnWidths={["14%", "16%", "15%", "15%", "13%", "15%", "12%"]}
          footer={`${plans.length} plan${plans.length === 1 ? "" : "s"} returned`}
          rows={plans.map((plan) => ({
            id: plan.id,
            cells: [
              <div key="name" className="flex min-w-0 flex-col gap-1">
                <p className="font-semibold break-words">{plan.name}</p>
                <p className="text-xs text-muted-foreground break-words">/{plan.slug}</p>
              </div>,
              <div key="price" className="flex flex-col gap-1 whitespace-nowrap font-medium tabular-nums">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: plan.currency || "INR",
                  maximumFractionDigits: 2,
                }).format(plan.price)}
                <p className="text-xs text-muted-foreground">{plan.currency}</p>
              </div>,
              plan.durationDays === null
                ? "No expiry"
                : `${plan.durationDays} ${plan.durationDays === 1 ? "day" : "days"}`,
              <span key="products" className="tabular-nums">{plan.maxProducts.toLocaleString("en-IN")}</span>,
              <span key="users" className="tabular-nums">{plan.maxUsers.toLocaleString("en-IN")}</span>,
              <BillingStatus
                key="status"
                status={plan.active ? "Active" : "Inactive"}
              />,

              <div key="actions" className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label={`Actions for ${plan.name}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    className="w-48"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onSelect={() => setSelected(plan)}
                        className="flex cursor-pointer items-center gap-2 py-2.5"
                      >
                        <Eye />
                        <span>View</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href={`/plans/${plan.id}/edit`}
                          className="flex cursor-pointer items-center gap-2 py-2.5"
                        >
                          <Pencil />
                          <span>Edit</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => setConfirmation(plan)}
                        className="flex cursor-pointer items-center gap-2 py-2.5"
                      >
                        <Power />
                        <span>{plan.active ? "Deactivate" : "Activate"}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>,
            ],
          }))}
        />
      </div>

      {!loading && !loadError && plans.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No plans found. Try changing your search or filters.
        </p>
      )}

      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-4xl">
          <SheetHeader className="pr-12">
            <SheetTitle>{selected?.name} plan</SheetTitle>
            <SheetDescription>
              Plan details, seller preview, and subscription activity.
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="grid min-w-0 items-start gap-6 px-4 pb-6 sm:grid-cols-2 sm:px-6">
              <PlanPreview plan={selected} />

              <div className="flex min-w-0 flex-col gap-6">
                <BillingFacts
                  items={[
                    ["Plan ID", selected.id],
                    ["Slug", selected.slug],
                    ["Display order", selected.displayOrder],
                    ["Billing", "One-time purchase"],
                  ]}
                />

                <Button asChild>
                  <Link href={`/plans/${selected.id}/edit`}>
                    Edit plan
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
              <div className="min-w-0 sm:col-span-2">
                <PlanActivity key={selected.id} planId={selected.id} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open && !updatingStatus) setConfirmation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmation?.active ? "Deactivate" : "Activate"}{" "}
              {confirmation?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.active
                ? "This plan will no longer be available for new purchases. Existing subscriptions continue under their purchased terms until expiry."
                : "This plan will become available for new purchases. Existing subscriptions and invoices will remain unchanged."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingStatus}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updatingStatus}
              onClick={(event) => {
                event.preventDefault();
                void handleStatusChange();
              }}
            >
              {updatingStatus
                ? "Saving…"
                : `Confirm ${confirmation?.active ? "deactivation" : "activation"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
