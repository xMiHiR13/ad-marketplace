"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { cn } from "@/lib/utils";

interface DurationSelectorProps {
  value: number; // 1-7 days
  onChange: (days: number) => void;
  disabled?: boolean;
  className?: string;
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 3;

const getDurationLabel = (days: number): string => {
  return days === 1 ? "1 day" : `${days} days`;
};

// Wheel column - reuses the same scroll-snap approach as ScheduleTimePicker
function DurationWheel({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, []);

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const nearestIndex = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(
          0,
          Math.min(DURATION_OPTIONS.length - 1, nearestIndex),
        );
        if (clampedIndex !== selectedIndex) {
          onSelect(clampedIndex);
        }
        scrollToIndex(clampedIndex, true);
      }
    }, 80);
  };

  const handleItemClick = (index: number) => {
    onSelect(index);
    scrollToIndex(index, true);
  };

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {/* Fade gradients */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />

      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide scroll-smooth"
        onScroll={handleScroll}
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />
        {DURATION_OPTIONS.map((days, index) => {
          const isSelected = index === selectedIndex;
          const distance = Math.abs(index - selectedIndex);
          return (
            <div
              key={days}
              onClick={() => handleItemClick(index)}
              className="flex items-center justify-center cursor-pointer transition-all duration-150 select-none"
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            >
              <span
                className={cn(
                  "transition-all duration-150",
                  isSelected && "text-foreground font-semibold text-lg",
                  !isSelected &&
                    distance === 1 &&
                    "text-foreground/60 text-base",
                  !isSelected && distance >= 2 && "text-foreground/30 text-sm",
                )}
              >
                {getDurationLabel(days)}
              </span>
            </div>
          );
        })}
        <div style={{ height: paddingItems * ITEM_HEIGHT }} />
      </div>
    </div>
  );
}

export default function DurationSelector({
  value,
  onChange,
  disabled = false,
  className = "",
}: DurationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempIndex, setTempIndex] = useState(value - 1);

  const handleOpen = () => {
    if (disabled) return;
    setTempIndex(value - 1);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onChange(DURATION_OPTIONS[tempIndex]);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
          "bg-white/5 border-white/10 hover:border-primary/30",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <i className="ri-calendar-2-line text-lg text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {getDurationLabel(value)}
            </p>
            <p className="text-xs text-foreground-muted">
              Ad placement duration
            </p>
          </div>
        </div>
        <i className="ri-arrow-down-s-line text-foreground-muted text-lg" />
      </button>

      {/* Bottom sheet picker */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Duration"
      >
        <div className="pt-4 pb-6">
          {/* Wheel Picker */}
          <div className="relative">
            {/* Selection highlight bar */}
            <div
              className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-12 rounded-xl pointer-events-none z-0"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.1) 2%, hsl(var(--primary)/0.1) 98%, hsl(var(--primary)/0.3) 100%)",
                borderTop: "1px solid hsl(var(--primary)/0.4)",
                borderBottom: "1px solid hsl(var(--primary)/0.4)",
              }}
            />

            <div className="flex relative z-10 justify-center">
              <div className="w-48">
                <DurationWheel
                  selectedIndex={tempIndex}
                  onSelect={setTempIndex}
                />
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <div className="px-4 mt-6">
            <button
              onClick={handleConfirm}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
            >
              {getDurationLabel(DURATION_OPTIONS[tempIndex])}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
