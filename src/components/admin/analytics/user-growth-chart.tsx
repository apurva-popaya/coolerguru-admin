"use client";

import * as React from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { UserGrowthPoint } from "@/lib/api/admin-analytics-api";

import { formatChartDate } from "./format-chart-date";

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

type ActiveSeries = "buyers" | "suppliers" | null;

export function UserGrowthChart({
  data,
}: UserGrowthChartProps) {
  const [activeSeries, setActiveSeries] =
    React.useState<ActiveSeries>(null);

  const chartData = data.map((item) => ({
    label: item.label,
    buyers: item.buyers,
    suppliers: item.suppliers,
  }));

  const handleSeriesClick = (
    series: "buyers" | "suppliers",
  ) => {
    setActiveSeries((current) =>
      current === series ? null : series,
    );
  };

  const handleChartClick = () => {
    setActiveSeries(null);
  };

  return (
    <div
      className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      onClick={handleChartClick}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-foreground text-admin-15">
          User Growth
        </h2>

        <div
          className="flex items-center gap-4 text-muted-foreground text-admin-14"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {/* BUYERS */}
          <button
            type="button"
            onClick={() =>
              handleSeriesClick("buyers")
            }
            className={`flex cursor-pointer items-center gap-1.5 transition-opacity ${
              activeSeries === "suppliers"
                ? "opacity-40"
                : "opacity-100"
            }`}
            aria-pressed={activeSeries === "buyers"}
          >
            <span className="size-2 rounded-full bg-primary" />
            Buyers
          </button>

          {/* SUPPLIERS */}
          <button
            type="button"
            onClick={() =>
              handleSeriesClick("suppliers")
            }
            className={`flex cursor-pointer items-center gap-1.5 transition-opacity ${
              activeSeries === "buyers"
                ? "opacity-40"
                : "opacity-100"
            }`}
            aria-pressed={activeSeries === "suppliers"}
          >
            <span className="size-2 rounded-full bg-chart-3" />
            Suppliers
          </button>
        </div>
      </div>

      <div className="h-64 min-w-0 sm:h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 16,
              bottom: 8,
              left: 0,
            }}
            onClick={handleChartClick}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tickFormatter={formatChartDate}
              interval="preserveStartEnd"
              minTickGap={24}
              tickMargin={10}
              height={42}
              padding={{ left: 12, right: 12 }}
              fontSize={13}
              tick={{
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              width={40}
              tick={{
                fontSize: 13,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip labelFormatter={(value) => formatChartDate(String(value))} contentStyle={{ borderRadius: "12px", borderColor: "var(--border)", background: "var(--popover)", color: "var(--popover-foreground)" }} />

            {/* BUYERS LINE */}
            {activeSeries !== "suppliers" && (
              <Line
                type="monotone"
                dataKey="buyers"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false} activeDot={{ r: 4 }}
              />
            )}

            {/* SUPPLIERS LINE */}
            {activeSeries !== "buyers" && (
              <Line
                type="monotone"
                dataKey="suppliers"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false} activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
