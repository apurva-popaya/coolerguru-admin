"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  companies: ProductFilterOption[];
  categories: ProductFilterOption[];
  onChange: (values: ProductsFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
}

function choices(items: [string, string][]): ProductFilterOption[] {
  return items.map(([value, label]) => ({ value, label }));
}

export function ProductsFilters({ values, companies, categories, onChange, onSearch, onReset }: ProductsFiltersProps) {
  function updateValue<K extends keyof ProductsFilterValues>(key: K, value: ProductsFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const selectors: { key: Exclude<keyof ProductsFilterValues, "search">; label: string; options: ProductFilterOption[] }[] = [
    { key: "companyId", label: "Company", options: [{ value: "ALL", label: "All companies" }, ...companies] },
    { key: "categoryId", label: "Category", options: [{ value: "ALL", label: "All categories" }, ...categories] },
    { key: "status", label: "Listing status", options: choices([["ALL", "All listing statuses"], ["ACTIVE", "Active"], ["INACTIVE", "Inactive"]]) },
    { key: "stockStatus", label: "Stock status", options: choices([["ALL", "All stock statuses"], ["IN_STOCK", "In Stock"], ["LOW_STOCK", "Low Stock"], ["OUT_OF_STOCK", "Out of Stock"]]) },
    { key: "approvalStatus", label: "Approval status", options: choices([["ALL", "All approval statuses"], ["PENDING", "Pending"], ["UNDER_REVIEW", "Under Review"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"]]) },
  ];
  const active = selectors.filter((selector) => values[selector.key] !== "ALL");

  function updateSelect(key: Exclude<keyof ProductsFilterValues, "search">, value: string) {
    if (key === "status") {
      if (value === "ALL" || value === "ACTIVE" || value === "INACTIVE") updateValue(key, value);
    } else if (key === "stockStatus") {
      if (value === "ALL" || value === "IN_STOCK" || value === "LOW_STOCK" || value === "OUT_OF_STOCK") updateValue(key, value);
    } else if (key === "approvalStatus") {
      if (value === "ALL" || value === "PENDING" || value === "UNDER_REVIEW" || value === "APPROVED" || value === "REJECTED") updateValue(key, value);
    } else {
      updateValue(key, value);
    }
  }

  return <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="product-search" className="text-admin-14">Search products</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="product-search" value={values.search} onChange={(event) => updateValue("search", event.target.value)}
              placeholder="Search by product name, ID, model, SKU, company or category" className="h-10 pl-10" />
          </div>
        </div>
        <Button type="submit" className="h-10 px-5"><Search data-icon="inline-start" />Search</Button>
        <Button type="button" variant="outline" onClick={onReset} className="h-10"><RotateCcw data-icon="inline-start" />Reset filters</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {selectors.map(({ key, label, options }) => <div key={key} className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={`product-filter-${key}`} className="text-admin-14">{label}</Label>
          <Select value={values[key]} onValueChange={(value) => updateSelect(key, value)}>
            <SelectTrigger id={`product-filter-${key}`} className="h-10 w-full min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-admin-15"><SelectGroup>
              {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </div>)}
      </div>
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
