"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  onSearch: () => void;
  onReset: () => void;
}

const roles = [
  { value: "ALL", label: "All roles" },
  { value: "BUYER", label: "Buyer" },
  { value: "SELLER", label: "Supplier" },
  { value: "ADMIN", label: "Admin" },
] as const;
const accountTypes = [
  { value: "ALL", label: "All account types" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "COMPANY", label: "Company" },
] as const;
const statuses = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export function UsersFilters({ values, onChange, onSearch, onReset }: UsersFiltersProps) {
  function updateValue<K extends keyof UsersFilterValues>(key: K, value: UsersFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }
  const chips = [
    { key: "search", label: "Search", value: values.search.trim(), reset: "" },
    { key: "role", label: "Role", value: values.role === "ALL" ? "" : roles.find((item) => item.value === values.role)?.label, reset: "ALL" },
    { key: "accountType", label: "Account type", value: values.accountType === "ALL" ? "" : accountTypes.find((item) => item.value === values.accountType)?.label, reset: "ALL" },
    { key: "status", label: "Status", value: values.status === "ALL" ? "" : statuses.find((item) => item.value === values.status)?.label, reset: "ALL" },
  ] as const;

  return (
    <div className="flex flex-col gap-3">
      <form className="rounded-lg border border-border bg-card p-4 sm:p-5" onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}>
        <FieldGroup>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="user-search">Search users</FieldLabel>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="user-search" value={values.search} onChange={(event) => updateValue("search", event.target.value)}
                  placeholder="Search by name, email, mobile or company" className="h-10 pl-10" />
              </div>
            </Field>
            <Button type="submit" className="h-10 px-5"><Search data-icon="inline-start" />Search</Button>
            <Button type="button" variant="outline" className="h-10" onClick={onReset}>
              <RotateCcw data-icon="inline-start" />Reset filters
            </Button>
          </div>
          <FieldGroup className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FilterSelect id="user-role" label="Role" value={values.role} options={roles}
              onChange={(value) => updateValue("role", value)} />
            <FilterSelect id="user-account-type" label="Account type" value={values.accountType} options={accountTypes}
              onChange={(value) => updateValue("accountType", value)} />
            <FilterSelect id="user-status" label="Status" value={values.status} options={statuses}
              onChange={(value) => updateValue("status", value)} />
          </FieldGroup>
        </FieldGroup>
      </form>
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
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={(nextValue) => {
        const option = options.find((item) => item.value === nextValue);
        if (option) onChange(option.value);
      }}>
        <SelectTrigger id={id} className="w-full data-[size=default]:h-10"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectGroup></SelectContent>
      </Select>
    </Field>
  );
}
