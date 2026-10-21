"use client";

import type { ReactNode } from "react";
import { cn } from "cn";

import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function BillingStatus({ status }: { status: string }) {
  if (["Active", "Captured", "Success"].includes(status)) {
    return <StatusBadge variant="success">{status === "Captured" ? "Success" : status}</StatusBadge>;
  }
  const variant = ["Active", "Captured", "Paid"].includes(status)
    ? "secondary"
    : status === "Failed"
      ? "destructive"
      : "outline";
  return (
    <Badge variant={variant}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

export function BillingSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: (string | { label: string; value: string })[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-9 w-full sm:w-auto sm:min-w-36">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => {
            const entry =
              typeof option === "string"
                ? { value: option, label: option === "All" ? `All ${label.toLowerCase()}` : option }
                : option;
            return (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function BillingTable({
  headers,
  rows,
  empty = "No matching records",
  footer,
  columnWidths,
}: {
  headers: string[];
  rows: { id: string; cells: ReactNode[] }[];
  empty?: string;
  footer?: ReactNode;
  columnWidths?: string[];
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <Table
        className={cn("w-full table-fixed", headers.length <= 4 ? "max-lg:min-w-[640px]" : "max-lg:min-w-[960px]")}
      >
        {columnWidths && (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={headers[index]} style={{ width }} />
            ))}
          </colgroup>
        )}
        <TableHeader className="bg-muted/60">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="h-12 whitespace-normal px-3">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.cells.map((cell, index) => (
                  <TableCell key={headers[index]} className="whitespace-normal break-words px-3 py-4">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headers.length}>
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>{empty}</EmptyTitle>
                    <EmptyDescription>Try another search or clear your filters.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {footer && <div className="border-t px-4 py-3 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function BillingFacts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="mb-1 text-xs text-muted-foreground">{label}</dt>
          <dd className="break-words text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
