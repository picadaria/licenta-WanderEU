"use client";

import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

function getDurationDays(start: string, end: string): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  const duration = getDurationDays(startDate, endDate);
  const isInvalid =
    startDate && endDate && new Date(endDate) <= new Date(startDate);

  const inputClass = cn(
    "h-10 border border-border-default rounded-[6px] px-3 text-sm bg-bg-primary",
    "text-text-primary placeholder:text-text-tertiary",
    "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
    "transition-colors"
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        {/* Start date */}
        <input
          type="date"
          value={startDate}
          min={minDate}
          max={endDate || maxDate}
          onChange={(e) => onStartChange(e.target.value)}
          className={cn(inputClass, "flex-1")}
          aria-label="Start date"
        />

        <span className="text-sm text-text-tertiary shrink-0">to</span>

        {/* End date */}
        <input
          type="date"
          value={endDate}
          min={startDate || minDate}
          max={maxDate}
          onChange={(e) => onEndChange(e.target.value)}
          className={cn(
            inputClass,
            "flex-1",
            isInvalid && "border-error focus:border-error focus:ring-error/20"
          )}
          aria-label="End date"
        />

        {/* Duration badge */}
        {duration !== null && (
          <span className="shrink-0 font-mono text-xs bg-accent-muted text-accent border border-accent/20 rounded-full px-2.5 py-1">
            {duration}d
          </span>
        )}
      </div>

      {isInvalid && (
        <p className="text-xs text-error">End date must be after start date.</p>
      )}
    </div>
  );
}
