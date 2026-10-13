"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";

import type { AdminDashboardUserDistribution } from "@/lib/api/admin-dashboard-api";

const COLORS = ["#2563eb", "#7c3aed", "#0ca76b"];

interface UserDistributionChartProps {
  data: AdminDashboardUserDistribution;
  totalUsers: number;
}

export function UserDistributionChart({
  data,
  totalUsers,
}: UserDistributionChartProps) {
  const userDistributionData = [
    {
      name: "Buyers",
      value: data.buyers,
      percentage: totalUsers
        ? `${Math.round((data.buyers / totalUsers) * 100)}%`
        : "0%",
    },
    {
      name: "Sellers",
      value: data.sellers,
      percentage: totalUsers
        ? `${Math.round((data.sellers / totalUsers) * 100)}%`
        : "0%",
    },
    {
      name: "Admins",
      value: data.admins,
      percentage: totalUsers
        ? `${Math.round((data.admins / totalUsers) * 100)}%`
        : "0%",
    },
  ];

  return (
    <div className="@container h-full rounded-[8px] border border-[#e3e6f3] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-[#15136f] text-admin-15">
          User Distribution
        </h2>

        <button
          type="button"
          className="font-semibold text-[#2720a8] text-admin-14"
        >
          View Details
        </button>
      </div>

      {/* Chart + Legend */}
      <div className="grid min-h-[250px] grid-cols-1 items-center gap-5 @min-[520px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @min-[520px]:gap-4">
        {/* Pie Chart */}
        <div className="relative mx-auto h-[200px] w-[200px] max-w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={userDistributionData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={0}
                stroke="none"
              >
                {userDistributionData.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index % COLORS.length
                        ]
                      }
                    />
                  ),
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold text-[#15136f] text-admin-25">
              {totalUsers.toLocaleString()}
            </span>

            <span className="text-[#5d6280] text-admin-14">
              Total Users
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full min-w-0 space-y-5">
          {userDistributionData.map(
            (item, index) => (
              <div
                key={item.name}
                className="grid grid-cols-[12px_minmax(0,1fr)_auto_auto] items-center gap-2 text-admin-14"
              >
                {/* Dot */}
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      COLORS[index],
                  }}
                />

                {/* Name */}
                <span className="min-w-0 truncate font-semibold text-[#15136f]">
                  {item.name}
                </span>

                {/* Value */}
                <span className="whitespace-nowrap font-semibold text-[#15136f]">
                  {item.value.toLocaleString()}
                </span>

                {/* Percentage */}
                <span className="whitespace-nowrap text-[#5d6280]">
                  {item.percentage}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}