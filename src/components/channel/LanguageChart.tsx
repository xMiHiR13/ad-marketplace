"use client";

import { useState, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LanguageShare } from "@/types/channel";
import { formatNumber } from "@/lib/formatters";

interface LanguageChartProps {
  data: LanguageShare[];
  totalSubscribers: number;
}

// Telegram-inspired colors for languages
const LANGUAGE_COLORS: Record<string, string> = {
  en: "hsl(210, 100%, 50%)",
  hi: "hsl(199, 89%, 68%)",
  ru: "hsl(142, 71%, 45%)",
  ar: "hsl(27, 100%, 50%)",
  es: "hsl(142, 76%, 36%)",
  id: "hsl(0, 84%, 60%)",
  zh: "hsl(255, 90%, 66%)",
  pt: "hsl(280, 70%, 50%)",
  de: "hsl(45, 100%, 50%)",
  fr: "hsl(180, 70%, 45%)",
  ja: "hsl(330, 80%, 60%)",
  ko: "hsl(0, 0%, 60%)",
};

const getLanguageColor = (code: string, index: number): string => {
  if (LANGUAGE_COLORS[code]) return LANGUAGE_COLORS[code];
  const fallbackColors = [
    "hsl(210, 70%, 55%)",
    "hsl(160, 60%, 45%)",
    "hsl(30, 80%, 55%)",
    "hsl(280, 60%, 55%)",
    "hsl(0, 0%, 50%)",
  ];
  return fallbackColors[index % fallbackColors.length];
};

export function LanguageChart({ data, totalSubscribers }: LanguageChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total and percentages
  const totalPart = data.reduce((sum, lang) => sum + lang.part, 0);

  // Prepare chart data with percentages
  const chartData = data.map((lang, index) => ({
    ...lang,
    percent: totalPart > 0 ? (lang.part / totalPart) * 100 : 0,
    color: getLanguageColor(lang.code, index),
  }));

  // Sort by percentage descending
  chartData.sort((a, b) => b.percent - a.percent);

  // null = reset state (show 100% and x languages)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Handle pie segment click - select this segment
  const handlePieClick = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Handle legend item click
  const handleLegendClick = (index: number) => {
    setActiveIndex(index);
  };

  // Handle click outside to reset
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        chartContainerRef.current &&
        !chartContainerRef.current.contains(event.target as Node)
      ) {
        setActiveIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Determine what to show in center
  const isResetState = activeIndex === null;
  const centerValue = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div ref={chartContainerRef} className="card-surface p-4 space-y-3">
      <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
        Language Distribution
      </h3>

      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={0}
                dataKey="percent"
                onClick={handlePieClick}
                stroke="hsl(var(--background))"
                strokeWidth={chartData.length === 1 ? 0 : 2}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    style={{
                      opacity: isResetState
                        ? 1
                        : activeIndex === index
                          ? 1
                          : 0.4,
                      transition: "opacity 0.2s ease",
                      outline: "none",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {isResetState ? (
              <>
                <span className="text-xl font-bold text-foreground">100%</span>
                <span className="text-[10px] text-foreground-muted mt-0.5">
                  {chartData.length === 1
                    ? "1 language"
                    : `${chartData.length} languages`}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-bold text-foreground">
                  {centerValue?.percent.toFixed(0)}%
                </span>
                <span className="text-[10px] text-foreground-muted mt-0.5">
                  {centerValue?.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1">
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
            {chartData.map((lang, index) => (
              <div
                key={lang.code}
                onClick={() => handleLegendClick(index)}
                className={`flex items-center justify-between text-xs transition-opacity cursor-pointer ${
                  !isResetState && activeIndex !== index ? "opacity-40" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-foreground">{lang.name}</span>
                </div>
                <span className="text-primary font-medium ml-2">
                  {formatNumber(lang.part)}
                </span>
              </div>
            ))}
          </div>
          {chartData.length > 6 && (
            <p className="text-[10px] text-foreground-muted pt-1.5">
              +{chartData.length - 6} more languages
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
