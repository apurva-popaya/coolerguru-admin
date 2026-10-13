"use client";

import type { ColumnFiltersState, ReactTable } from "@tanstack/react-table";
import { RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { type CompanyRow, companyFilterOptions } from "./companies-data";

interface CompaniesFiltersProps {
  table: ReactTable<DataTableFeatures, CompanyRow>;
  options: { businessTypes: string[]; locations: string[] };
  activeFilters: ColumnFiltersState;
}

function optionLabel(value: string) {
  if (value.toUpperCase() === "OEM") return "OEM";
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CompaniesFilters({ table, options, activeFilters }: CompaniesFiltersProps) {
  const currentSearch = String(table.getColumn("search")?.getFilterValue() ?? "");
  const [searchText, setSearchText] = useState(currentSearch);
  useEffect(() => {
    setSearchText((previous) => previous.trim() === currentSearch ? previous : currentSearch);
  }, [currentSearch]);

  const businessTypes = [...new Set([
    ...companyFilterOptions.businessType.filter((value) => value !== "All").map((value) => value.toUpperCase()),
    ...options.businessTypes.map((value) => value.toUpperCase()),
  ])].sort();
  const filters = [
    { id: "verificationStatus", label: "Verification", all: "All verification statuses", options: companyFilterOptions.verificationStatus.filter((value) => value !== "All") },
    { id: "businessType", label: "Business type", all: "All business types", options: businessTypes },
    { id: "location", label: "Location", all: "All locations", options: options.locations },
    { id: "status", label: "Account status", all: "All account statuses", options: ["Active", "Inactive"] },
    { id: "featured", label: "Featured status", all: "All companies", options: ["Featured", "Not Featured"] },
  ];
  const active = activeFilters;

  function setFilter(id: string, value: string) {
    table.getColumn(id)?.setFilterValue((id !== "search" && value === "All") || !value ? undefined : value);
    table.setPageIndex(0);
    table.setRowSelection({});
  }

  function reset() {
    setSearchText("");
    table.resetColumnFilters();
    table.setPageIndex(0);
    table.setRowSelection({});
  }

  return <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => {
        event.preventDefault();
        setFilter("search", searchText.trim());
      }}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="company-search" className="text-admin-14">Search companies</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="company-search" value={searchText} onChange={(event) => {
              setSearchText(event.target.value);
              setFilter("search", event.target.value.trim());
            }}
              placeholder="Search by company name, ID, location or business type" className="h-10 pl-10" />
          </div>
        </div>
        <Button type="submit" className="h-10 px-5"><Search data-icon="inline-start" />Search</Button>
        <Button type="button" variant="outline" className="h-10" onClick={reset}>
          <RotateCcw data-icon="inline-start" />Reset filters
        </Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {filters.map((filter) => <div key={filter.id} className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={`company-filter-${filter.id}`} className="text-admin-14">{filter.label}</Label>
          <Select value={String(table.getColumn(filter.id)?.getFilterValue() ?? "All")}
            onValueChange={(value) => setFilter(filter.id, value)}>
            <SelectTrigger id={`company-filter-${filter.id}`} className="h-10 w-full min-w-0"><SelectValue /></SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-admin-15">
              <SelectGroup>
                <SelectItem value="All">{filter.all}</SelectItem>
                {filter.options.map((value) => <SelectItem key={value} value={value}>
                  {filter.id === "businessType" ? optionLabel(value) : value}
                </SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>)}
      </div>
    </div>
    {active.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      <span className="text-admin-14 text-muted-foreground">Applied filters:</span>
      {active.map(({ id, value }) => <Button key={id} type="button" variant="secondary" className="h-auto min-h-8 rounded-full py-1"
        aria-label={`Remove ${filters.find((filter) => filter.id === id)?.label ?? "search"} filter`}
        onClick={() => setFilter(id, id === "search" ? "" : "All")}>
        {filters.find((filter) => filter.id === id)?.label ?? "Search"}: {id === "businessType" ? optionLabel(String(value)) : String(value)}
        <X data-icon="inline-end" />
      </Button>)}
    </div>}
  </div>;
}
