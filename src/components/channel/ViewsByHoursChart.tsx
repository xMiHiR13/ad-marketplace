"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HourlyViewsSeries } from "@/types/channel";

interface ViewsByHoursChartProps {
  data: HourlyViewsSeries[];
  currentDateRange: string; // e.g., "Jan 27 - Feb 02"
  previousDateRange: string; // e.g., "Jan 20 - Jan 26"
}

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card border border-white/10 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-foreground-muted mb-1">
        {formatHour(label)} UTC
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-foreground-muted">{entry.name}:</span>
          <span className="text-foreground font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ViewsByHoursChart({
  data,
  currentDateRange,
  previousDateRange,
}: ViewsByHoursChartProps) {
  const [showPrevious, setShowPrevious] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);

  // Prepare chart data
  const chartData = data.map((item) => ({
    hour: item.hour,
    hourLabel: formatHour(item.hour),
    current: item.currentWeek,
    previous: item.previousWeek,
  }));

  // Find max value for Y axis
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.currentWeek, d.previousWeek)),
  );

  return (
    <div className="card-surface p-4 space-y-3">
      <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
        Views by Hours (UTC)
      </h3>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(199, 89%, 68%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(199, 89%, 68%)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(210, 100%, 50%)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(210, 100%, 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--foreground-muted))" }}
              tickFormatter={(v) => (v % 4 === 0 ? formatHour(v) : "")}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--foreground-muted))" }}
              domain={[0, Math.ceil(maxValue * 1.1)]}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            {showCurrent && (
              <Area
                type="linear"
                dataKey="current"
                name={currentDateRange}
                stroke="hsl(199, 89%, 68%)"
                strokeWidth={2}
                fill="url(#colorCurrent)"
                dot={false}
              />
            )}
            {showPrevious && (
              <Area
                type="linear"
                dataKey="previous"
                name={previousDateRange}
                stroke="hsl(210, 100%, 50%)"
                strokeWidth={2}
                fill="url(#colorPrevious)"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend/Toggle buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCurrent(!showCurrent)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            showCurrent
              ? "bg-cyan-400/20 border border-cyan-400/30 text-cyan-400"
              : "bg-white/5 border border-white/10 text-foreground-muted"
          }`}
        >
          <i
            className={`ri-check-line text-xs ${showCurrent ? "opacity-100" : "opacity-0"}`}
          />
          {currentDateRange}
        </button>
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            showPrevious
              ? "bg-primary/20 border border-primary/30 text-primary"
              : "bg-white/5 border border-white/10 text-foreground-muted"
          }`}
        >
          <i
            className={`ri-check-line text-xs ${showPrevious ? "opacity-100" : "opacity-0"}`}
          />
          {previousDateRange}
        </button>
      </div>
    </div>
  );
}
