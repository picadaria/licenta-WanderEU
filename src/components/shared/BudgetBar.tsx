"use client";

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface BudgetBreakdown {
  transport?: number;
  accommodation?: number;
  food?: number;
  activities?: number;
  shopping?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface BudgetBarProps {
  breakdown: BudgetBreakdown;
  className?: string;
  /** Show labels below each segment (default: true) */
  showLabels?: boolean;
  /** Show percentage labels on segments (default: false) */
  showPercentages?: boolean;
  /** Total to compute percentages against; if not provided, sum of values is used */
  total?: number;
  /** Height of the bar in pixels (default: 12) */
  height?: number;
}

// ─── Color & label config per category ────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; lightColor: string }
> = {
  transport: {
    label: "Transport",
    color: "#3B6EC4",
    lightColor: "rgba(59,110,196,0.15)",
  },
  accommodation: {
    label: "Stay",
    color: "#C4841D",
    lightColor: "rgba(196,132,29,0.15)",
  },
  food: {
    label: "Food",
    color: "#E8553A",
    lightColor: "rgba(232,85,58,0.15)",
  },
  activities: {
    label: "Activities",
    color: "#2D7A4F",
    lightColor: "rgba(45,122,79,0.15)",
  },
  activity: {
    label: "Activities",
    color: "#2D7A4F",
    lightColor: "rgba(45,122,79,0.15)",
  },
  shopping: {
    label: "Shopping",
    color: "#9C9C93",
    lightColor: "rgba(156,156,147,0.15)",
  },
  other: {
    label: "Other",
    color: "#6B6B63",
    lightColor: "rgba(107,107,99,0.15)",
  },
};

const DEFAULT_COLOR = "#D4D3CF";

// ─── BudgetBar ─────────────────────────────────────────────────────────────────
export function BudgetBar({
  breakdown,
  className,
  showLabels = true,
  showPercentages = false,
  total: externalTotal,
  height = 12,
}: BudgetBarProps) {
  // Filter out zero/undefined entries
  const entries = Object.entries(breakdown).filter(
    ([, v]) => v !== undefined && v > 0
  ) as [string, number][];

  const sum = entries.reduce((s, [, v]) => s + v, 0);
  const total = externalTotal ?? sum;

  if (total === 0 || entries.length === 0) {
    return (
      <div
        className={cn("flex flex-col gap-1", className)}
        aria-label="Budget breakdown: no data"
      >
        <div
          className="rounded-full bg-bg-secondary w-full"
          style={{ height }}
        />
        <p className="text-xs text-text-tertiary">No budget breakdown</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Bar */}
      <div
        className="flex w-full overflow-hidden rounded-full gap-px"
        style={{ height }}
        role="img"
        aria-label={`Budget breakdown: ${entries.map(([k, v]) => `${CATEGORY_CONFIG[k]?.label ?? k} €${v.toLocaleString()}`).join(", ")}`}
      >
        {entries.map(([key, value], i) => {
          const pct = (value / total) * 100;
          const cfg = CATEGORY_CONFIG[key];
          const color = cfg?.color ?? DEFAULT_COLOR;
          const isFirst = i === 0;
          const isLast = i === entries.length - 1;

          return (
            <div
              key={key}
              className="relative group"
              style={{
                width: `${pct}%`,
                backgroundColor: color,
                borderRadius: isFirst
                  ? `${height / 2}px 0 0 ${height / 2}px`
                  : isLast
                    ? `0 ${height / 2}px ${height / 2}px 0`
                    : "0",
                minWidth: pct > 0 ? "4px" : "0",
              }}
              title={`${cfg?.label ?? key}: €${value.toLocaleString()} (${pct.toFixed(1)}%)`}
            >
              {/* Percentage label on segment (only if wide enough) */}
              {showPercentages && pct > 10 && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-white font-mono font-medium"
                  style={{ fontSize: Math.max(height * 0.55, 9) }}
                >
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {entries.map(([key, value]) => {
            const cfg = CATEGORY_CONFIG[key];
            const pct = ((value / total) * 100).toFixed(1);
            const color = cfg?.color ?? DEFAULT_COLOR;
            const label = cfg?.label ?? key;

            return (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-text-secondary">
                  {label}
                </span>
                <span className="font-mono text-[11px] text-text-primary font-medium">
                  €{value.toLocaleString()}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  ({pct}%)
                </span>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-text-tertiary">Total</span>
            <span className="font-mono text-[11px] text-text-primary font-semibold">
              €{total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BudgetBarMini — no labels, just the bar ───────────────────────────────────
export function BudgetBarMini({
  breakdown,
  className,
  height = 6,
}: Pick<BudgetBarProps, "breakdown" | "className" | "height">) {
  return (
    <BudgetBar
      breakdown={breakdown}
      className={className}
      showLabels={false}
      height={height}
    />
  );
}
