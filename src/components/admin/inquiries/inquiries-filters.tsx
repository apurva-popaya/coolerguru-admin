"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminInquiryType } from "@/lib/api/admin-inquiries-api";

export interface InquiryFilterValues {
  search: string;
  inquiryType: "ALL" | AdminInquiryType;
  dateFrom: string;
  dateTo: string;
}

interface InquiriesFiltersProps {
  values: InquiryFilterValues;
  onChange: (values: InquiryFilterValues) => void;
  onSearch: () => void;
  onReset: () => void;
}

const types = [
  { value: "ALL", label: "All inquiry types" },
  { value: "REQUEST_QUOTE", label: "Request Quote" },
  { value: "CONTACT_SUPPLIER", label: "Contact Supplier" },
] as const;

export function InquiriesFilters({ values, onChange, onSearch, onReset }: InquiriesFiltersProps) {
  function updateValue<K extends keyof InquiryFilterValues>(key: K, value: InquiryFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }
  const invalidDates = Boolean(values.dateFrom && values.dateTo && values.dateFrom > values.dateTo);
  const chips = [
    { key: "search", label: "Search", value: values.search.trim(), reset: "" },
    { key: "inquiryType", label: "Type", value: values.inquiryType === "ALL" ? "" : types.find((item) => item.value === values.inquiryType)?.label, reset: "ALL" },
    { key: "dateFrom", label: "From", value: values.dateFrom, reset: "" },
    { key: "dateTo", label: "To", value: values.dateTo, reset: "" },
  ] as const;

  return <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => {
        event.preventDefault();
        if (!invalidDates) onSearch();
      }}>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Label htmlFor="inquiry-search" className="text-admin-14">Search inquiries</Label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="inquiry-search" value={values.search} onChange={(event) => updateValue("search", event.target.value)}
              placeholder="Search by inquiry ID, buyer, company or product" className="h-10 pl-10" />
          </div>
        </div>
        <Button type="submit" className="h-10 px-5" disabled={invalidDates}><Search data-icon="inline-start" />Search</Button>
        <Button type="button" variant="outline" className="h-10" onClick={onReset}><RotateCcw data-icon="inline-start" />Reset filters</Button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="inquiry-type" className="text-admin-14">Inquiry type</Label>
          <Select value={values.inquiryType} onValueChange={(value) => {
            const option = types.find((item) => item.value === value);
            if (option) updateValue("inquiryType", option.value);
          }}><SelectTrigger id="inquiry-type" className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent className="[&_[data-slot=select-item]]:text-admin-15"><SelectGroup>
              {types.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="inquiry-date-from" className="text-admin-14">From date</Label>
          <Input id="inquiry-date-from" type="date" value={values.dateFrom} max={values.dateTo || undefined}
            aria-invalid={invalidDates} aria-describedby={invalidDates ? "inquiry-date-error" : undefined}
            onChange={(event) => updateValue("dateFrom", event.target.value)} className="h-10 w-full" />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="inquiry-date-to" className="text-admin-14">To date</Label>
          <Input id="inquiry-date-to" type="date" value={values.dateTo} min={values.dateFrom || undefined}
            aria-invalid={invalidDates} aria-describedby={invalidDates ? "inquiry-date-error" : undefined}
            onChange={(event) => updateValue("dateTo", event.target.value)} className="h-10 w-full" />
        </div>
      </div>
      {invalidDates && <p id="inquiry-date-error" role="alert" className="text-admin-14 text-destructive">From date must be on or before To date.</p>}
    </div>
    {chips.some((chip) => chip.value) && <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      <span className="text-admin-14 text-muted-foreground">Applied filters:</span>
      {chips.filter((chip) => chip.value).map((chip) => <Button key={chip.key} type="button" variant="secondary"
        className="h-auto min-h-8 rounded-full py-1" aria-label={`Remove ${chip.label} filter`}
        onClick={() => onChange({ ...values, [chip.key]: chip.reset })}>
        {chip.label}: {chip.value}<X data-icon="inline-end" />
      </Button>)}
    </div>}
  </div>;
}
