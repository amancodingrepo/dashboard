"use client";

import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { StatCardData } from "@/app/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard(data: StatCardData) {
  const { title, value, change, changeType, trendData } = data;
  const isPositive = changeType === "positive";
  const color = isPositive ? "#10B981" : "#EF4444"; // Green ↑ or Red ↓
  const chartData = trendData.map((val, index) => ({ value: val, index }));

  // Get icon based on title
  const getIconUrl = () => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("spend")) {
      return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=40&h=40&fit=crop&crop=center";
    } else if (titleLower.includes("invoice")) {
      return "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=40&h=40&fit=crop&crop=center";
    } else if (titleLower.includes("document")) {
      return "https://images.unsplash.com/photo-1542435503-956c469947f6?w=40&h=40&fit=crop&crop=center";
    } else if (titleLower.includes("average") || titleLower.includes("value")) {
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=40&h=40&fit=crop&crop=center";
    }
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=40&h=40&fit=crop&crop=center";
  };

  return (
    <Card
      className="rounded-xl border border-[#e5e7eb] bg-[#ffffff] shadow-none transition-all duration-200"
      style={{ backgroundColor: "#ffffff" }}
    >
      <CardContent className="p-6 bg-[#ffffff] rounded-xl">
        <div className="flex items-start justify-between bg-[#ffffff]">
          {/* Left Content */}
          <div className="flex-1 bg-[#ffffff]">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={getIconUrl()}
                alt=""
                className="h-4 w-4 rounded object-cover opacity-70"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                {title}
              </p>
            </div>
            <h3 className="my-2 text-3xl font-semibold text-[#111111]">
              {value}
            </h3>
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color }}
              >
                <path
                  fillRule="evenodd"
                  d={
                    isPositive
                      ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  }
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold" style={{ color }}>
                {change}
              </span>
            </div>
          </div>

          {/* Right Mini Chart */}
          <div className="h-12 w-24 bg-[#ffffff] rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                style={{ backgroundColor: "#ffffff" }}
              >
                {/* Optional gradient removed; bright white fill only */}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={1}
                  fill="#ffffff" // ✅ Bright white fill
                  fillOpacity={1}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
