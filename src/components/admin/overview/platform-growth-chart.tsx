"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { PlatformGrowthPoint } from "@/lib/api/admin-dashboard-api";

import { platformGrowthData } from "./overview-data";

interface PlatformGrowthChartProps {
  data?: PlatformGrowthPoint[];
}

export function PlatformGrowthChart({
  data = platformGrowthData,
}: PlatformGrowthChartProps) {
  /*
   * Format dates for the X-axis.
   *
   * Example:
   * 2026-09-08 -> Sep 08
   * 2026-09-13 -> Sep 13
   */
  const formatDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(date);
  };

  return (
    <div className="w-full rounded-[8px] border border-[#e3e6f3] bg-white p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Title + Legend */}
        <div className="min-w-0">
          <h2 className="font-bold text-[#15136f] text-admin-15 sm:text-admin-16 lg:text-admin-17">
            Platform Growth
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[#5d6280] text-admin-13 sm:text-admin-14">
            <Legend
              color="#2563eb"
              label="Companies"
            />

            <Legend
              color="#7c3aed"
              label="Products"
            />

            <Legend
              color="#0ca76b"
              label="Users"
            />

            <Legend
              color="#f58a00"
              label="Inquiries"
            />
          </div>
        </div>

        {/* Date Filter */}
        <Select defaultValue="30">
          <SelectTrigger className="h-10 w-full shrink-0 text-admin-13 sm:w-[135px] sm:text-admin-14">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="text-admin-14 [&_[data-slot=select-item]]:text-admin-14">
            <SelectItem value="7">
              Last 7 Days
            </SelectItem>

            <SelectItem value="30">
              Last 30 Days
            </SelectItem>

            <SelectItem value="90">
              Last 90 Days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <div className="h-[270px] w-full sm:h-[290px] lg:h-[310px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: -12,
              bottom: 8,
            }}
          >
            <CartesianGrid
              stroke="#eceef5"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              interval="preserveStartEnd"
              minTickGap={35}
              tick={{
                fill: "#5d6280",
                fontSize: 12,
              }}
              tickMargin={10}
              axisLine={{
                stroke: "#e7e8f3",
              }}
              tickLine={false}
              padding={{
                left: 8,
                right: 8,
              }}
            />

            {/* Y Axis */}
            <YAxis
              tick={{
                fill: "#5d6280",
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
              width={38}
              allowDecimals={false}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e3e6f3",
                boxShadow:
                  "0 4px 14px rgba(20,20,80,0.08)",
                fontSize: "13px",
              }}
              labelFormatter={(value) =>
                formatDate(String(value))
              }
            />

            {/* Companies */}
            <Line
              type="monotone"
              dataKey="companies"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{
                r: 2,
                strokeWidth: 1.5,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
              }}
            />

            {/* Products */}
            <Line
              type="monotone"
              dataKey="products"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={{
                r: 2,
                strokeWidth: 1.5,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
              }}
            />

            {/* Users */}
            <Line
              type="monotone"
              dataKey="users"
              stroke="#0ca76b"
              strokeWidth={2.5}
              dot={{
                r: 2,
                strokeWidth: 1.5,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
              }}
            />

            {/* Inquiries */}
            <Line
              type="monotone"
              dataKey="inquiries"
              stroke="#f58a00"
              strokeWidth={2.5}
              dot={{
                r: 2,
                strokeWidth: 1.5,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 4,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      <span className="whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
