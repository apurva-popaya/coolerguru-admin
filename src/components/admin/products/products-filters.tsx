"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminProductApprovalStatus, AdminProductStatus, AdminProductStockStatus } from "@/lib/api/admin-products-api";

export interface ProductFilterOption {
  label: string;
  value: string;
}

export interface ProductsFilterValues {
  search: string;
  companyId: string;
  categoryId: string;
  status: AdminProductStatus;
  stockStatus: AdminProductStockStatus;
  approvalStatus: AdminProductApprovalStatus;
}

interface ProductsFiltersProps {
  values: ProductsFilterValues;
  onChange: (values: ProductsFilterValues) => void;
  onReset: () => void;
}

function choices(items: [string, string][]): ProductFilterOption[] {
  return items.map(([value, label]) => ({ value, label }));
}

export function ProductsFilters({ values, onChange, onReset }: ProductsFiltersProps) {
  function updateValue<K extends keyof ProductsFilterValues>(key: K, value: ProductsFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const selectors: { key: Exclude<keyof ProductsFilterValues, "search">; label: string; options: ProductFilterOption[] }[] = [
    { key: "status", label: "Listing status", options: choices([["ALL", "All listing status"], ["ACTIVE", "Active"], ["INACTIVE", "Inactive"], ["DELETED", "Deleted"]]) },
    { key: "approvalStatus", label: "Approval status", options: choices([["ALL", "All approvals"], ["PENDING", "Pending"], ["UNDER_REVIEW", "Under Review"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"]]) },
  ];
  const active = selectors.filter((selector) => values[selector.key] !== "ALL");

  function updateSelect(key: Exclude<keyof ProductsFilterValues, "search">, value: string) {
    if (key === "status") {
      if (value === "ALL" || value === "ACTIVE" || value === "INACTIVE" || value === "DELETED") updateValue(key, value);
    } else if (key === "stockStatus") {
      if (value === "ALL" || value === "IN_STOCK" || value === "LOW_STOCK" || value === "OUT_OF_STOCK") updateValue(key, value);
    } else if (key === "approvalStatus") {
      if (value === "ALL" || value === "PENDING" || value === "UNDER_REVIEW" || value === "APPROVED" || value === "REJECTED") updateValue(key, value);
    } else {
      updateValue(key, value);
    }
  }

  return <div className="flex flex-col gap-3">
    <div className="rounded-2xl border border-border bg-card p-4">
      <FieldGroup className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] xl:grid-cols-[minmax(0,1fr)_11rem_11rem_2.75rem]">
        <Field className="min-w-0 sm:col-span-3 xl:col-span-1">
          <FieldLabel htmlFor="product-search" className="sr-only">Search products</FieldLabel>
          <InputGroup className="h-11 rounded-xl">
            <InputGroupInput id="product-search" value={values.search}
              onChange={(event) => updateValue("search", event.target.value)} placeholder="Search products..." className="h-full" />
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </Field>
        {selectors.map(({ key, label, options }) => <Field key={key} className="min-w-0">
          <FieldLabel htmlFor={`product-filter-${key}`} className="sr-only">{label}</FieldLabel>
          <Select value={values[key]} onValueChange={(value) => updateSelect(key, value)}>
            <SelectTrigger id={`product-filter-${key}`} className="h-11 w-full min-w-0 rounded-xl px-3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>
              {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </Field>)}
        <Button type="button" variant="outline" size="icon" onClick={onReset}
          className="size-11 rounded-xl" aria-label="Reset filters" title="Reset filters"><RotateCcw /></Button>
      </FieldGroup>
    </div>
    {(values.search.trim() || active.length > 0) && <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      <span className="text-admin-14 text-muted-foreground">Applied filters:</span>
      {values.search.trim() && <Button type="button" variant="secondary" className="h-auto min-h-8 rounded-full py-1"
        aria-label="Remove search filter" onClick={() => updateValue("search", "")}>
        Search: {values.search.trim()}<X data-icon="inline-end" />
      </Button>}
      {active.map(({ key, label, options }) => <Button key={key} type="button" variant="secondary" className="h-auto min-h-8 rounded-full py-1"
        aria-label={`Remove ${label} filter`} onClick={() => updateSelect(key, "ALL")}>
        {label}: {options.find((option) => option.value === values[key])?.label ?? values[key]}<X data-icon="inline-end" />
      </Button>)}
    </div>}
  </div>;
}
