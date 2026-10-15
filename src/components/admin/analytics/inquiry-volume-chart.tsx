"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { InquiryVolumePoint } from "@/lib/api/admin-analytics-api";

import { formatChartDate } from "./format-chart-date";

interface InquiryVolumeChartProps {
  data: InquiryVolumePoint[];

  totalInquiries: number;
}

export function InquiryVolumeChart({
  data,
  totalInquiries,
}: InquiryVolumeChartProps) {
  const chartData = data.map((item) => ({
    label: item.label,
    inquiries: item.count,
  }));

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-foreground text-admin-15">
          Inquiry Volume
        </h2>

        <span className="text-muted-foreground text-admin-14">
          Total{" "}
          {totalInquiries.toLocaleString("en-IN")} inquiries
        </span>
      </div>

      <div className="h-64 min-w-0 sm:h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              bottom: 0,
              left: -20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickFormatter={formatChartDate}
              interval="preserveStartEnd" minTickGap={32}
              tick={{
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip labelFormatter={(value) => formatChartDate(String(value))} contentStyle={{ borderRadius: "12px", borderColor: "var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} />

            <Bar
              dataKey="inquiries"
              fill="var(--primary)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}