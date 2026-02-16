"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/layout/BottomSheet";

interface ScheduleTimePickerProps {
  value: Date | null;
  isImmediate: boolean;
  onScheduleChange: React.Dispatch<React.SetStateAction<{ date: Date | null; isImmediate: boolean }>>;
}

// Generate dates for the next 7 days
const generateDates = (): Date[] => {
  const dates: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    dates.push(startOfDay(addDays(now, i)));
  }
  return dates;
};

// Generate hours (0-23)
const generateHours = (): number[] => Array.from({ length: 24 }, (_, i) => i);

// Generate all minutes (0-59)
const generateMinutes = (): number[] => Array.from({ length: 60 }, (_, i) => i);

const formatDateLabel = (date: Date, index: number): string => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return format(date, "EEE, MMM d");
};

// Wheel column component with snap scrolling
interface WheelColumnProps<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderItem: (item: T, index: number) => string;
  itemHeight: number;
  visibleItems: number;
  disabledIndices?: number[];
}

function WheelColumn<T>({ 
  items, 
  selectedIndex, 
  onSelect, 
  renderItem, 
  itemHeight,
  visibleItems,
  disabledIndices = []
}: WheelColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  const paddingItems = Math.floor(visibleItems / 2);
  const containerHeight = itemHeight * visibleItems;

  // Scroll to selected item
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? "smooth" : "auto"
      });
    }
  }, [itemHeight]);

  // Initial scroll position
  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, []);

  // Handle scroll end - snap to nearest item
  const handleScroll = () => {
    isScrollingRef.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const nearestIndex = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, nearestIndex));
        
        // Skip disabled items
        if (!disabledIndices.includes(clampedIndex)) {
          if (clampedIndex !== selectedIndex) {
            onSelect(clampedIndex);
          }
          scrollToIndex(clampedIndex, true);
        } else {
          // Find nearest non-disabled item
          let nearestValid = clampedIndex;
          for (let offset = 1; offset < items.length; offset++) {
            if (clampedIndex + offset < items.length && !disabledIndices.includes(clampedIndex + offset)) {
              nearestValid = clampedIndex + offset;
              break;
            }
            if (clampedIndex - offset >= 0 && !disabledIndices.includes(clampedIndex - offset)) {
              nearestValid = clampedIndex - offset;
              break;
            }
          }
          onSelect(nearestValid);
          scrollToIndex(nearestValid, true);
        }
      }
    }, 80);
  };

  const handleItemClick = (index: number) => {
    if (!disabledIndices.includes(index)) {
      onSelect(index);
      scrollToIndex(index, true);
    }
  };

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide scroll-smooth"
        onScroll={handleScroll}
        style={{ 
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {/* Top padding */}
        <div style={{ height: paddingItems * itemHeight }} />
        
        {/* Items */}
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const isDisabled = disabledIndices.includes(index);
          const distance = Math.abs(index - selectedIndex);
          
          return (
            <div
              key={index}
              onClick={() => handleItemClick(index)}
              className={cn(
                "flex items-center justify-center cursor-pointer transition-all duration-150 select-none",
                isDisabled && "cursor-not-allowed"
              )}
              style={{ 
                height: itemHeight,
                scrollSnapAlign: "center"
              }}
            >
              <span className={cn(
                "transition-all duration-150",
                isSelected && "text-foreground font-semibold text-lg",
                !isSelected && distance === 1 && "text-foreground/60 text-base",
                !isSelected && distance >= 2 && "text-foreground/30 text-sm",
                isDisabled && "text-foreground/20"
              )}>
                {renderItem(item, index)}
              </span>
            </div>
          );
        })}
        
        {/* Bottom padding */}
        <div style={{ height: paddingItems * itemHeight }} />
      </div>
    </div>
  );
}

// Time Picker Bottom Sheet Content
interface TimePickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date | null;
}

function TimePickerSheet({
  isOpen,
  onClose,
  onConfirm,
  initialDate,
}: TimePickerSheetProps) {
  const dates = generateDates();
  const hours = generateHours();
  const minutes = generateMinutes();
  const now = new Date();

  // Initialize with current time rounded to next minute
  const getInitialTime = () => {
    if (initialDate && initialDate > now) return initialDate;
    const initialTime = new Date(now);
    initialTime.setMinutes(now.getMinutes() + 1, 0, 0);
    return initialTime;
  };

  const initialTime = getInitialTime();

  const [selectedDateIndex, setSelectedDateIndex] = useState(() => {
    const idx = dates.findIndex(d => isSameDay(d, initialTime));
    return idx >= 0 ? idx : 0;
  });
  const [selectedHourIndex, setSelectedHourIndex] = useState(initialTime.getHours());
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(initialTime.getMinutes());

  // Calculate disabled hours/minutes for today
  const getDisabledHours = (): number[] => {
    if (selectedDateIndex !== 0) return [];
    const currentHour = now.getHours();
    return hours.filter(h => h < currentHour);
  };

  const getDisabledMinutes = (): number[] => {
    if (selectedDateIndex !== 0) return [];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    if (selectedHourIndex > currentHour) return [];
    if (selectedHourIndex < currentHour) return minutes.map((_, i) => i);
    // Disable all minutes up to and including current minute
    return minutes.filter((m) => m <= currentMinute).map((m) => m);
  };

  // Update the selected date when user scrolls
  const handleDateChange = (index: number) => {
    setSelectedDateIndex(index);
    if (index === 0) {
      const currentHour = now.getHours();
      if (selectedHourIndex < currentHour) {
        setSelectedHourIndex(currentHour);
      }
      if (selectedHourIndex === currentHour) {
        const nextMinute = now.getMinutes() + 1;
        if (selectedMinuteIndex <= now.getMinutes()) {
          setSelectedMinuteIndex(Math.min(nextMinute, 59));
        }
      }
    }
  };

  // Build final date
  const getSelectedDate = (): Date => {
    const selectedDate = dates[selectedDateIndex];
    const hour = hours[selectedHourIndex];
    const minute = minutes[selectedMinuteIndex];
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hour, minute, 0, 0);
    return finalDate;
  };

  const handleConfirm = () => {
    const date = getSelectedDate();
    onConfirm(date);
    onClose();
  };

  const selectedDate = getSelectedDate();
  const formattedButtonText = selectedDateIndex === 0 
    ? `Schedule for today at ${format(selectedDate, "HH:mm")}`
    : `Schedule for ${format(selectedDate, "MMM d")} at ${format(selectedDate, "HH:mm")}`;

  const itemHeight = 48;
  const visibleItems = 3;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Schedule Post">
      <div className="pt-4 pb-6">
        {/* Wheel Picker */}
        <div className="relative">
          {/* Selection highlight bar */}
          <div 
            className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-12 rounded-xl pointer-events-none z-0"
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)/0.3) 0%, hsl(var(--primary)/0.1) 2%, hsl(var(--primary)/0.1) 98%, hsl(var(--primary)/0.3) 100%)",
              borderTop: "1px solid hsl(var(--primary)/0.4)",
              borderBottom: "1px solid hsl(var(--primary)/0.4)"
            }}
          />
          
          <div className="flex relative z-10">
            {/* Date column */}
            <div className="flex-1">
              <WheelColumn
                items={dates}
                selectedIndex={selectedDateIndex}
                onSelect={handleDateChange}
                renderItem={(date, index) => formatDateLabel(date, index)}
                itemHeight={itemHeight}
                visibleItems={visibleItems}
              />
            </div>

            {/* Hour column */}
            <div className="w-20">
              <WheelColumn
                items={hours}
                selectedIndex={selectedHourIndex}
                onSelect={setSelectedHourIndex}
                renderItem={(hour) => hour.toString().padStart(2, "0")}
                itemHeight={itemHeight}
                visibleItems={visibleItems}
                disabledIndices={getDisabledHours()}
              />
            </div>

            {/* Minute column */}
            <div className="w-20">
              <WheelColumn
                items={minutes}
                selectedIndex={selectedMinuteIndex}
                onSelect={setSelectedMinuteIndex}
                renderItem={(minute) => minute.toString().padStart(2, "0")}
                itemHeight={itemHeight}
                visibleItems={visibleItems}
                disabledIndices={getDisabledMinutes()}
              />
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="px-4 mt-6">
          <button
            onClick={handleConfirm}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            {formattedButtonText}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

export function ScheduleTimePicker({
  value,
  isImmediate,
  onScheduleChange,
}: ScheduleTimePickerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleImmediateSelect = () => {
    onScheduleChange({ date: null, isImmediate: true });
  };

  const handleScheduleSelect = () => {
    setIsSheetOpen(true);
  };

  const handleScheduleConfirm = (date: Date) => {
    onScheduleChange({ date, isImmediate: false });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
        <i className="ri-calendar-schedule-line" />
        <span>Post Schedule</span>
      </div>

      {/* Immediate option */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleImmediateSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleImmediateSelect();
        }}
        className={cn(
          "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer",
          isImmediate
            ? "bg-primary/10 border-primary/30"
            : "bg-white/5 border-white/10 hover:border-white/20"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isImmediate ? "bg-primary/20" : "bg-white/5"
        )}>
          <i className={cn(
            "ri-flashlight-line text-lg",
            isImmediate ? "text-primary" : "text-foreground-muted"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium",
            isImmediate ? "text-primary" : "text-foreground"
          )}>
            Post Immediately
          </p>
          <p className="text-xs text-foreground-muted">
            Bot will post right after payment
          </p>
        </div>
        {isImmediate && (
          <i className="ri-check-line text-primary text-lg flex-shrink-0" />
        )}
      </div>

      {/* Schedule option */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleScheduleSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleScheduleSelect();
        }}
        className={cn(
          "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer",
          !isImmediate
            ? "bg-primary/10 border-primary/30"
            : "bg-white/5 border-white/10 hover:border-white/20"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          !isImmediate ? "bg-primary/20" : "bg-white/5"
        )}>
          <i className={cn(
            "ri-calendar-line text-lg",
            !isImmediate ? "text-primary" : "text-foreground-muted"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium",
            !isImmediate ? "text-primary" : "text-foreground"
          )}>
            Schedule for Later
          </p>
          <p className="text-xs text-foreground-muted">
            {!isImmediate && value ? format(value, "MMM d, yyyy hh:mm a") : "Choose date & time"}
          </p>
        </div>
        {!isImmediate && (
          <i className="ri-check-line text-primary text-lg flex-shrink-0" />
        )}
      </div>

      {/* Time Picker Bottom Sheet */}
      <TimePickerSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onConfirm={handleScheduleConfirm}
        initialDate={value}
      />
    </div>
  );
}
