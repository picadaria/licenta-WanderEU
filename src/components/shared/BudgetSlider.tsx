"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const TICKS = [250, 500, 1000, 2000];

export function BudgetSlider({
  value,
  onChange,
  min = 50,
  max = 3000,
  step = 10,
  className,
}: BudgetSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const percent = ((value - min) / (max - min)) * 100;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Value display + manual input */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-semibold text-text-primary">
          €{value.toLocaleString()}
        </span>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleManual}
          aria-label="Budget amount"
          className={cn(
            "w-24 h-8 border border-border-default rounded-[6px] px-2 text-sm font-mono",
            "bg-bg-primary text-text-primary",
            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
            "transition-colors"
          )}
        />
      </div>

      {/* Slider */}
      <div className="relative flex flex-col gap-1">
        <div className="relative h-2">
          {/* Track background */}
          <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-bg-tertiary" />
          {/* Filled track */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
          {/* Range input */}
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSlider}
            aria-label="Budget slider"
            className={cn(
              "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              "appearance-none"
            )}
            style={{ zIndex: 1 }}
          />
          {/* Thumb visual */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-white shadow-md pointer-events-none"
            style={{ left: `calc(${percent}% - 8px)` }}
          />
        </div>

        {/* Tick marks */}
        <div className="relative h-4">
          {TICKS.map((tick) => {
            const tickPercent = ((tick - min) / (max - min)) * 100;
            if (tickPercent < 0 || tickPercent > 100) return null;
            return (
              <div
                key={tick}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${tickPercent}%`, transform: "translateX(-50%)" }}
              >
                <div className="w-px h-1.5 bg-border-default" />
                <span className="text-[10px] text-text-tertiary font-mono mt-0.5">
                  €{tick >= 1000 ? `${tick / 1000}k` : tick}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-xs text-text-tertiary font-mono">
        <span>€{min}</span>
        <span>€{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
