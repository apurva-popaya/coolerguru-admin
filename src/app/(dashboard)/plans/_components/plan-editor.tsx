
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

import {
  createAdminPlan,
  getAdminPlanById,
  getAdminPlans,
  updateAdminPlan,
  type AdminPlan,
  type AdminPlanPayload,
} from "@/lib/api/admin-plans";
import { BillingSelect } from "@/components/admin/billing-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "@/lib/billing-demo";

import { PlanPreview } from "./plan-preview";

const blank: Plan = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  currency: "INR",
  durationDays: 30,
  maxProducts: 5,
  maxUsers: 1,
  displayOrder: 0,
  active: true,
};

function toPlanView(plan: AdminPlan): Plan {
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

function toApiPayload(plan: Plan): AdminPlanPayload {
  return {
    name: plan.name.trim(),
    slug: plan.slug.trim(),
    description: plan.description.trim(),
    price: plan.price,
    currency: "INR",
    duration_days: plan.durationDays,
    max_products: plan.maxProducts,
    max_users: plan.maxUsers,
    is_active: plan.active,
    sort_order: plan.displayOrder,
  };
}

export function PlanEditor({ planId }: { planId?: string }) {
  const [initial, setInitial] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);
      setLoadError("");

      try {
        const listResponse = await getAdminPlans();
        const existingPlans = (listResponse.data?.plans ?? []).map(toPlanView);

        let selectedPlan: Plan = blank;

        if (planId) {
          const detailResponse = await getAdminPlanById(planId);

          if (!detailResponse.data?.plan) {
            throw new Error("The requested plan was not returned by the server.");
          }

          selectedPlan = toPlanView(detailResponse.data.plan);
        }

        if (cancelled) return;

        setPlans(existingPlans);
        setInitial(selectedPlan);
      } catch (error) {
        if (cancelled) return;

        setLoadError(
          error instanceof Error ? error.message : "Unable to load plan details.",
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [planId]);

  if (!ready) {
    return (
      <p role="status" className="py-8 text-sm text-muted-foreground">
        Loading plan settings…
      </p>
    );
  }

  if (loadError || !initial) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-xl font-semibold">
          {planId ? "Unable to load plan" : "Unable to load plans"}
        </h1>
        <p role="alert" className="text-sm text-destructive">
          {loadError || "Plan data is unavailable."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button asChild>
            <Link href="/plans">Back to Manage Plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PlanForm
      key={`${planId ?? "new"}-${initial.id}`}
      initial={initial}
      plans={plans}
      editing={!!planId}
      onSave={async (plan) => {
        const payload = toApiPayload(plan);

        if (planId) {
          await updateAdminPlan(planId, payload);
          toast.success("Plan updated successfully.");
        } else {
          await createAdminPlan(payload);
          toast.success("Plan created successfully.");
        }
      }}
    />
  );
}

function PlanForm({
  initial,
  plans,
  onSave,
  editing,
}: {
  initial: Plan;
  plans: Plan[];
  onSave: (plan: Plan) => Promise<void>;
  editing: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Plan, string>>>({});
  const [saving, setSaving] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [saveError, setSaveError] = useState("");

  const update = <K extends keyof Plan>(key: K, value: Plan[K]) => {
    setPlan((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError("");
  };

  const savePlan = async () => {
    if (saving) return;

    setSaving(true);
    setSaveError("");

    try {
      await onSave({
        ...plan,
        name: plan.name.trim(),
        slug: plan.slug.trim(),
        description: plan.description.trim(),
      });

      router.push("/plans");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save the plan.";

      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
      setConfirmStatus(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof Plan, string>> = {};

    if (!plan.name.trim()) {
      nextErrors.name = "Enter a plan name.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug.trim())) {
      nextErrors.slug = "Use lowercase letters, numbers, and single hyphens.";
    }

    if (
      plans.some(
        (existing) =>
          existing.id !== plan.id &&
          existing.slug.toLowerCase() === plan.slug.trim().toLowerCase(),
      )
    ) {
      nextErrors.slug = "This slug is already used by another plan.";
    }

    if (!plan.description.trim()) {
      nextErrors.description = "Add a short description.";
    }

    if (
      !Number.isFinite(plan.price) ||
      plan.price < 0 ||
      Math.abs(Math.round(plan.price * 100) - plan.price * 100) > 0.000001
    ) {
      nextErrors.price = "Enter a non-negative amount with up to two decimal places.";
    }

    if (
      plan.durationDays !== null &&
      (!Number.isInteger(plan.durationDays) || plan.durationDays < 1)
    ) {
      nextErrors.durationDays = "Enter a whole number of at least 1 day.";
    }

    for (const key of ["maxProducts", "maxUsers", "displayOrder"] as const) {
      if (
        !Number.isInteger(plan[key]) ||
        plan[key] < (key === "displayOrder" ? 0 : 1)
      ) {
        nextErrors[key] =
          key === "displayOrder"
            ? "Enter a whole number of 0 or more."
            : "Enter a whole number of at least 1.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }

    if (editing && initial.active !== plan.active) {
      setConfirmStatus(true);
    } else {
      void savePlan();
    }
  };

  const textFields: {
    key: "name" | "slug";
    label: string;
    hint: string;
  }[] = [
    { key: "name", label: "Plan name", hint: "e.g. Pro" },
    { key: "slug", label: "Plan slug", hint: "e.g. pro-monthly" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/plans"
        className="flex w-fit items-center gap-2 text-sm text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Manage Plans
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {editing ? "Edit Plan" : "Create Plan"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define pricing and seller allowances. All fields are required.
        </p>
      </div>

      {saveError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 p-3 text-sm text-destructive"
        >
          {saveError}
        </div>
      )}

      <form
        onSubmit={submit}
        noValidate
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Plan details</CardTitle>
              <CardDescription>
                Information shown in the seller plan catalog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  {textFields.map(({ key, label, hint }) => (
                    <Field key={key} data-invalid={!!errors[key]}>
                      <FieldLabel htmlFor={key}>{label}</FieldLabel>
                      <Input
                        id={key}
                        value={plan[key]}
                        placeholder={hint}
                        aria-invalid={!!errors[key]}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                        onChange={(event) => update(key, event.target.value)}
                        maxLength={key === "name" ? 80 : 100}
                      />
                      {errors[key] && (
                        <FieldError id={`${key}-error`}>
                          {errors[key]}
                        </FieldError>
                      )}
                    </Field>
                  ))}
                </FieldGroup>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={plan.description}
                    onChange={(event) => update("description", event.target.value)}
                    placeholder="Who is this plan for?"
                    maxLength={400}
                    aria-invalid={!!errors.description}
                    aria-describedby={
                      errors.description ? "description-error" : undefined
                    }
                  />
                  {errors.description && (
                    <FieldError id="description-error">
                      {errors.description}
                    </FieldError>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing &amp; duration</CardTitle>
              <CardDescription>
                Plans are purchased individually, with no automatic renewal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.price}>
                  <FieldLabel htmlFor="price">Price</FieldLabel>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isNaN(plan.price) ? "" : plan.price}
                    onChange={(event) =>
                      update("price", event.target.valueAsNumber)
                    }
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? "price-error" : undefined}
                  />
                  {errors.price && (
                    <FieldError id="price-error">{errors.price}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="currency">Currency</FieldLabel>
                  <Input id="currency" value="INR — Indian rupee" readOnly />
                  <FieldDescription>Current catalog currency.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Duration type</FieldLabel>
                  <BillingSelect
                    label="Duration type"
                    value={
                      plan.durationDays === null ? "No expiry" : "Fixed duration"
                    }
                    options={["Fixed duration", "No expiry"]}
                    onChange={(value) =>
                      update(
                        "durationDays",
                        value === "No expiry" ? null : 30,
                      )
                    }
                  />
                </Field>

                {plan.durationDays !== null && (
                  <Field data-invalid={!!errors.durationDays}>
                    <FieldLabel htmlFor="durationDays">
                      Duration (days)
                    </FieldLabel>
                    <Input
                      id="durationDays"
                      type="number"
                      min={1}
                      step={1}
                      value={
                        Number.isNaN(plan.durationDays)
                          ? ""
                          : plan.durationDays
                      }
                      onChange={(event) =>
                        update("durationDays", event.target.valueAsNumber)
                      }
                      aria-invalid={!!errors.durationDays}
                      aria-describedby={
                        errors.durationDays ? "duration-error" : undefined
                      }
                    />
                    {errors.durationDays && (
                      <FieldError id="duration-error">
                        {errors.durationDays}
                      </FieldError>
                    )}
                  </Field>
                )}
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limits &amp; availability</CardTitle>
              <CardDescription>
                Control what sellers can use and where this plan appears.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["maxProducts", "Maximum products"],
                    ["maxUsers", "Maximum users"],
                    ["displayOrder", "Display order"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} data-invalid={!!errors[key]}>
                    <FieldLabel htmlFor={key}>{label}</FieldLabel>
                    <Input
                      id={key}
                      type="number"
                      min={key === "displayOrder" ? 0 : 1}
                      step={1}
                      value={Number.isNaN(plan[key]) ? "" : plan[key]}
                      onChange={(event) =>
                        update(key, event.target.valueAsNumber)
                      }
                      aria-invalid={!!errors[key]}
                      aria-describedby={
                        errors[key] ? `${key}-error` : undefined
                      }
                    />
                    {errors[key] && (
                      <FieldError id={`${key}-error`}>
                        {errors[key]}
                      </FieldError>
                    )}
                  </Field>
                ))}

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <BillingSelect
                    label="Status"
                    value={plan.active ? "Active" : "Inactive"}
                    options={["Active", "Inactive"]}
                    onChange={(value) =>
                      update("active", value === "Active")
                    }
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" asChild disabled={saving}>
              <Link href="/plans">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save data-icon="inline-start" />
              {saving
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Create Plan"}
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-5">
          <PlanPreview plan={plan} />

          <Alert>
            <AlertTitle>
              {editing ? "Future purchases only" : "Plan creation"}
            </AlertTitle>
            <AlertDescription>
              {editing
                ? "Changes apply to future purchases. Existing subscriptions and invoices keep their original prices and limits."
                : "The plan will be saved to the backend and become available according to its active status."}
            </AlertDescription>
          </Alert>
        </aside>
      </form>

      <AlertDialog
        open={confirmStatus}
        onOpenChange={(open) => {
          if (!saving) setConfirmStatus(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {plan.active ? "Activate" : "Deactivate"} {plan.name} and save?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plan.active
                ? "This plan will be available for new purchases. Existing subscriptions and invoices keep their original terms."
                : "This plan will no longer accept new purchases. Existing subscriptions continue under their purchased terms until expiry."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                void savePlan();
              }}
            >
              {saving ? "Saving…" : "Confirm and save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
