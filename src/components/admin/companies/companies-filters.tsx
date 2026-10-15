"use client";

import type { ColumnFiltersState, ReactTable } from "@tanstack/react-table";
import { RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";
import { type CompanyRow, companyFilterOptions } from "./companies-data";

interface CompaniesFiltersProps {
  table: ReactTable<DataTableFeatures, CompanyRow>;
  activeFilters: ColumnFiltersState;
}

export function CompaniesFilters({ table, activeFilters }: CompaniesFiltersProps) {
  const currentSearch = String(table.getColumn("search")?.getFilterValue() ?? "");
  const [searchText, setSearchText] = useState(currentSearch);
  useEffect(() => {
    setSearchText((previous) => previous.trim() === currentSearch ? previous : currentSearch);
  }, [currentSearch]);

  const filters = [
    { id: "verificationStatus", label: "Verification", all: "All verification", options: companyFilterOptions.verificationStatus.filter((value) => value !== "All") },
    { id: "status", label: "Account status", all: "All account status", options: ["Active", "Inactive"] },
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <FieldGroup className="grid items-center gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem_2.75rem]">
        <Field className="min-w-0 sm:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="company-search" className="sr-only">Search companies</FieldLabel>
          <InputGroup className="h-11 rounded-xl">
            <InputGroupInput id="company-search" value={searchText} onChange={(event) => {
              setSearchText(event.target.value);
              setFilter("search", event.target.value.trim());
            }}
              placeholder="Search companies..." className="h-full" />
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </Field>
        {filters.map((filter) => <Field key={filter.id} className="min-w-0">
          <FieldLabel htmlFor={`company-filter-${filter.id}`} className="sr-only">{filter.label}</FieldLabel>
          <Select value={String(table.getColumn(filter.id)?.getFilterValue() ?? "All")}
            onValueChange={(value) => setFilter(filter.id, value)}>
            <SelectTrigger id={`company-filter-${filter.id}`} className="h-11 w-full min-w-0 rounded-xl px-3"><SelectValue /></SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-admin-15">
              <SelectGroup>
                <SelectItem value="All">{filter.all}</SelectItem>
                {filter.options.map((value) => <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>)}
        <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl"
          onClick={reset} aria-label="Reset filters" title="Reset filters">
          <RotateCcw />
        </Button>
      </FieldGroup>
    </div>
    {active.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      <span className="text-admin-14 text-muted-foreground">Applied filters:</span>
      {active.map(({ id, value }) => <Button key={id} type="button" variant="secondary" className="h-auto min-h-8 rounded-full py-1"
        aria-label={`Remove ${filters.find((filter) => filter.id === id)?.label ?? "search"} filter`}
        onClick={() => setFilter(id, id === "search" ? "" : "All")}>
        {filters.find((filter) => filter.id === id)?.label ?? "Search"}: {String(value)}
        <X data-icon="inline-end" />
      </Button>)}
    </div>}
  </div>;
}
