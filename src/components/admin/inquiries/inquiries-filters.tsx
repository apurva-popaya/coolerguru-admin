"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
  onReset: () => void;
}

const types = [
  { value: "ALL", label: "All inquiry types" },
  { value: "REQUEST_QUOTE", label: "Request Quote" },
  { value: "CONTACT_SUPPLIER", label: "Contact Supplier" },
] as const;

export function InquiriesFilters({ values, onChange, onReset }: InquiriesFiltersProps) {
  function updateValue<K extends keyof InquiryFilterValues>(key: K, value: InquiryFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }
  const chips = [
    { key: "search", label: "Search", value: values.search.trim(), reset: "" },
    { key: "inquiryType", label: "Type", value: values.inquiryType === "ALL" ? "" : types.find((item) => item.value === values.inquiryType)?.label, reset: "ALL" },
  ] as const;

  return <div className="flex flex-col gap-3">
    <div className="rounded-2xl border border-border bg-card p-4">
      <FieldGroup className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_2.75rem] xl:grid-cols-[minmax(0,1fr)_13rem_2.75rem]">
        <Field className="min-w-0 sm:col-span-2 xl:col-span-1">
          <FieldLabel htmlFor="inquiry-search" className="sr-only">Search inquiries</FieldLabel>
          <InputGroup className="h-11 rounded-xl">
            <InputGroupInput id="inquiry-search" value={values.search}
              onChange={(event) => updateValue("search", event.target.value)} placeholder="Search inquiries..." className="h-full" />
            <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </Field>
        <Field className="min-w-0">
          <FieldLabel htmlFor="inquiry-type" className="sr-only">Inquiry type</FieldLabel>
          <Select value={values.inquiryType} onValueChange={(value) => {
            const option = types.find((item) => item.value === value);
            if (option) updateValue("inquiryType", option.value);
          }}>
            <SelectTrigger id="inquiry-type" className="h-11 w-full min-w-0 rounded-xl px-3"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>
              {types.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </Field>
        <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl"
          onClick={onReset} aria-label="Reset filters" title="Reset filters"><RotateCcw /></Button>
      </FieldGroup>
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
