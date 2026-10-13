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

import type { InquiryVolumePoint } from "../../../lib/api/admin-analytics-api";

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
    <div className="min-h-[300px] rounded-[10px] border border-border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[#15136f] text-admin-15">
          Inquiry Volume
        </h2>

        <span className="text-[#5d6280] text-admin-14">
          Total{" "}
          {totalInquiries.toLocaleString("en-IN")} inquiries
        </span>
      </div>

      <div className="h-[220px] sm:h-[260px]">
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

            <Tooltip />

            <Bar
              dataKey="inquiries"
              fill="#8b85f5"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}