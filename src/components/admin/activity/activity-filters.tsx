"use client";

import type { ReactTable } from "@tanstack/react-table";
import { CalendarDays, Search } from "lucide-react";

import { FilterBar } from "@/components/common/filter-bar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataTableFeatures } from "@/lib/data-table-features";

import { type ActivityRow, activityFilterOptions } from "./activity-data";

interface ActivityFiltersProps {
  table: ReactTable<DataTableFeatures, ActivityRow>;
}

export function ActivityFilters({ table }: ActivityFiltersProps) {
  const searchValue = (table.getColumn("search")?.getFilterValue() as string | undefined) ?? "";

  function getValue(columnId: string) {
    return (table.getColumn(columnId)?.getFilterValue() as string | undefined) ?? "All";
  }

  function setFilter(columnId: string, value: string) {
    table.getColumn(columnId)?.setFilterValue(value === "All" ? undefined : value);

    table.setPageIndex(0);
  }

  return (
    <FilterBar>
      <div className="min-w-0 w-full sm:min-w-[210px] sm:w-auto">
        <label className="mb-2 block font-semibold text-foreground text-admin-14">User Type</label>

        <Select value={getValue("userType")} onValueChange={(value) => setFilter("userType", value)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="text-admin-15 [&_[data-slot=select-item]]:text-admin-15">
            {activityFilterOptions.userTypes.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "All" ? "All Users" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 w-full sm:min-w-[230px] sm:w-auto">
        <label className="mb-2 block font-semibold text-foreground text-admin-14">Activity Type</label>

        <Select value={getValue("activity")} onValueChange={(value) => setFilter("activity", value)}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="text-admin-15 [&_[data-slot=select-item]]:text-admin-15">
            {activityFilterOptions.activityTypes.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "All" ? "All Activity Types" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 w-full sm:min-w-[220px] sm:w-auto">
        <label className="mb-2 block font-semibold text-foreground text-admin-14">Date Range</label>

        <div className="relative">
          <CalendarDays className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input value="All Time" readOnly className="h-10 pl-10" />
        </div>
      </div>

      <div className="min-w-0 w-full sm:min-w-[310px] sm:w-auto flex-1">
        <label className="mb-2 block font-semibold text-admin-14 text-transparent">Search</label>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchValue}
            onChange={(event) => {
              table.getColumn("search")?.setFilterValue(event.target.value || undefined);

              table.setPageIndex(0);
            }}
            placeholder="Search by user name, company or item..."
            className="h-10 pl-10"
          />
        </div>
      </div>
    </FilterBar>
  );
}
