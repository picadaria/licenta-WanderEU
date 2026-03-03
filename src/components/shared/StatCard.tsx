import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    percent: number;
  };
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-[8px] border border-border-subtle bg-bg-primary">
      {/* Icon */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-[6px]"
        style={{ background: "var(--accent-muted)" }}
      >
        <Icon size={18} className="text-accent" />
      </div>

      {/* Value */}
      <div>
        <p className="font-mono text-2xl font-semibold text-text-primary leading-none mb-1">
          {value}
        </p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>

      {/* Trend */}
      {trend && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.direction === "up" ? "text-success" : "text-error"
          )}
        >
          {trend.direction === "up" ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          <span>
            {trend.direction === "up" ? "+" : "-"}
            {trend.percent}%
          </span>
        </div>
      )}
    </div>
  );
}
