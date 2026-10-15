"use client";

import { CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface DateRangePickerProps {
  draftDateFrom: string;
  draftDateTo: string;
  setDraftDateFrom: (value: string) => void;
  setDraftDateTo: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function DateRangePicker({
  draftDateFrom,
  draftDateTo,
  setDraftDateFrom,
  setDraftDateTo,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const invalidRange = Boolean(draftDateFrom && draftDateTo && draftDateFrom > draftDateTo);

  return (
    <div
      data-admin-date-picker
      role="dialog"
      aria-labelledby="admin-date-picker-title"
      aria-describedby="admin-date-picker-description"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
      className="absolute right-0 top-[48px] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border bg-accent/40 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <h3 id="admin-date-picker-title" className="font-semibold text-foreground text-admin-15">
              Select Date Range
            </h3>
          </div>

          <p id="admin-date-picker-description" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Choose the period to display.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onCancel}
          className="shrink-0 rounded-full"
          aria-label="Close date picker"
        >
          <X />
        </Button>
      </div>

      <FieldGroup className="gap-4 p-5">
        <Field data-invalid={invalidRange || undefined}>
          <FieldLabel htmlFor="admin-date-from">From date</FieldLabel>

          <Input
            id="admin-date-from"
            type="date"
            autoFocus
            aria-invalid={invalidRange || undefined}
            aria-describedby={invalidRange ? "admin-date-range-error" : undefined}
            value={draftDateFrom}
            max={draftDateTo || undefined}
            onChange={(event) => setDraftDateFrom(event.target.value)}
            className="h-11 rounded-xl px-3"
          />
        </Field>

        <Field data-invalid={invalidRange || undefined}>
          <FieldLabel htmlFor="admin-date-to">To date</FieldLabel>

          <Input
            id="admin-date-to"
            type="date"
            aria-invalid={invalidRange || undefined}
            aria-describedby={invalidRange ? "admin-date-range-error" : undefined}
            value={draftDateTo}
            min={draftDateFrom || undefined}
            onChange={(event) => setDraftDateTo(event.target.value)}
            className="h-11 rounded-xl px-3"
          />
        </Field>
        {invalidRange && (
          <FieldError id="admin-date-range-error">The start date must be on or before the end date.</FieldError>
        )}
      </FieldGroup>

      <div className="flex gap-3 border-t border-border px-5 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 flex-1 rounded-xl"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onApply}
          disabled={!draftDateFrom || !draftDateTo || invalidRange}
          className="h-10 flex-1 rounded-xl"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
