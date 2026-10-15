"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminUserAccountType, AdminUserRole, AdminUserStatus } from "@/lib/api/admin-users-api";

export interface UsersFilterValues {
  search: string;
  role: "ALL" | AdminUserRole;
  accountType: "ALL" | AdminUserAccountType;
  status: "ALL" | AdminUserStatus;
}

interface UsersFiltersProps {
  values: UsersFilterValues;
  onChange: (values: UsersFilterValues) => void;
  onReset: () => void;
}

const roles = [
  { value: "ALL", label: "All roles" },
  { value: "BUYER", label: "Buyer" },
  { value: "SELLER", label: "Supplier" },
  { value: "ADMIN", label: "Admin" },
] as const;
const statuses = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export function UsersFilters({ values, onChange, onReset }: UsersFiltersProps) {
  function updateValue<K extends keyof UsersFilterValues>(key: K, value: UsersFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }
  const chips = [
    { key: "search", label: "Search", value: values.search.trim(), reset: "" },
    { key: "role", label: "Role", value: values.role === "ALL" ? "" : roles.find((item) => item.value === values.role)?.label, reset: "ALL" },
    { key: "status", label: "Status", value: values.status === "ALL" ? "" : statuses.find((item) => item.value === values.status)?.label, reset: "ALL" },
  ] as const;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <FieldGroup className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem] xl:grid-cols-[minmax(0,1fr)_11rem_11rem_2.75rem]">
          <Field className="min-w-0 sm:col-span-3 xl:col-span-1">
            <FieldLabel htmlFor="user-search" className="sr-only">Search users</FieldLabel>
            <InputGroup className="h-11 rounded-xl">
              <InputGroupInput id="user-search" value={values.search} onChange={(event) => updateValue("search", event.target.value)}
                placeholder="Search users..." className="h-full" />
              <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
            </InputGroup>
          </Field>
          <FilterSelect id="user-role" label="Role" value={values.role} options={roles} onChange={(value) => updateValue("role", value)} />
          <FilterSelect id="user-status" label="Status" value={values.status} options={statuses} onChange={(value) => updateValue("status", value)} />
          <Button type="button" variant="outline" size="icon" className="size-11 rounded-xl" onClick={onReset}
            aria-label="Reset filters" title="Reset filters"><RotateCcw /></Button>
        </FieldGroup>
      </div>
      {chips.some((chip) => chip.value) && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
          <span className="text-admin-14 text-muted-foreground">Applied filters:</span>
          {chips.filter((chip) => chip.value).map((chip) => (
            <Button key={chip.key} type="button" variant="secondary" className="h-auto min-h-8 rounded-full py-1"
              aria-label={`Remove ${chip.label} filter`} onClick={() => onChange({ ...values, [chip.key]: chip.reset })}>
              <span className="max-w-64 truncate">{chip.label}: {chip.value}</span><X data-icon="inline-end" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({ id, label, value, options, onChange }: {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor={id} className="sr-only">{label}</FieldLabel>
      <Select value={value} onValueChange={(nextValue) => {
        const option = options.find((item) => item.value === nextValue);
        if (option) onChange(option.value);
      }}>
        <SelectTrigger id={id} className="w-full min-w-0 rounded-xl px-3 data-[size=default]:h-11"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectGroup></SelectContent>
      </Select>
    </Field>
  );
}
