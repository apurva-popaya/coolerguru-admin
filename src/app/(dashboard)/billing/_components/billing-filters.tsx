"use client";

import { CalendarClock, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BillingPlan } from "@/lib/api/admin-billing";

interface BillingFiltersProps {
  planOptions: BillingPlan[];
  search: string;
  onSearch: (value: string) => void;
  plan: string;
  onPlan: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  soon: boolean;
  onSoon: () => void;
  onReset: () => void;
}

export function BillingFilters({
  planOptions, search, onSearch, plan, onPlan, status, onStatus, soon, onSoon, onReset,
}: BillingFiltersProps) {
  const filters = [
    {
      id: "plan", label: "Plan", all: "All plans", value: plan, onChange: onPlan,
      options: planOptions.map((plan) => ({ value: String(plan.plan_id), label: plan.name })),
    },
    {
      id: "status", label: "Billing status", all: "All billing statuses", value: status, onChange: onStatus,
      options: ["Active", "Expired", "Cancelled", "Pending", "Created", "Authorized", "Captured", "Failed", "Refunded", "Paid", "Generating"].map((value) => ({ value, label: value === "Captured" ? "Success" : value })),
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <FieldGroup className="grid items-center gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_12rem_auto_2.75rem]">
        <Field className="min-w-0 sm:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="billing-search" className="sr-only">Search billing records</FieldLabel>
          <InputGroup className="h-11 rounded-xl">
            <InputGroupInput
              id="billing-search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search companies or billing references..."
              className="h-full"
            />
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </Field>
        {filters.map((filter) => (
          <Field key={filter.id} className="min-w-0">
            <FieldLabel htmlFor={`billing-filter-${filter.id}`} className="sr-only">
              {filter.label}
            </FieldLabel>
            <Select value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger id={`billing-filter-${filter.id}`} className="h-11 w-full min-w-0 rounded-xl px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="[&_[data-slot=select-item]]:text-admin-15">
                <SelectGroup>
                  <SelectItem value="All">{filter.all}</SelectItem>
                  {filter.options.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        ))}
        <Button
          type="button"
          variant={soon ? "secondary" : "outline"}
          className="h-11 rounded-xl"
          aria-pressed={soon}
          onClick={onSoon}
        >
          <CalendarClock data-icon="inline-start" />
          Expiring soon
        </Button>
        <Button
          type="button" variant="outline" size="icon" className="size-11 rounded-xl"
          onClick={onReset} aria-label="Reset filters" title="Reset filters"
        >
          <RotateCcw />
        </Button>
      </FieldGroup>
    </div>
  );
}
