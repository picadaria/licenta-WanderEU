"use client";

import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TripStatus = "draft" | "planned" | "active" | "completed";

export interface TripCardProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budgetTotal: number;
    actualSpent: number;
    status: TripStatus;
    tags?: string[];
  };
  className?: string;
}

/** Deterministic gradient based on destination string */
function destinationGradient(destination: string): string {
  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = destination.charCodeAt(i) + ((hash << 5) - hash);
  }

  const palettes = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
  ];

  return palettes[Math.abs(hash) % palettes.length];
}

const statusConfig: Record<
  TripStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-bg-secondary text-text-secondary border border-border-default",
  },
  planned: {
    label: "Planned",
    className: "bg-[rgba(59,110,196,0.1)] text-info border border-[rgba(59,110,196,0.2)]",
  },
  active: {
    label: "Active",
    className: "bg-success-muted text-success border border-[rgba(45,122,79,0.2)]",
  },
  completed: {
    label: "Completed",
    className: "bg-accent-muted text-accent border border-[rgba(232,85,58,0.2)]",
  },
};

function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
  } catch {
    return `${startDate} – ${endDate}`;
  }
}

export function TripCard({ trip, className }: TripCardProps) {
  const status = statusConfig[trip.status];
  const budgetPercent =
    trip.budgetTotal > 0
      ? Math.min((trip.actualSpent / trip.budgetTotal) * 100, 100)
      : 0;

  return (
    <Link
      href={`/trip/${trip.id}`}
      className={cn(
        "group flex flex-col rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary",
        "hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
    >
      {/* Cover gradient */}
      <div
        className="h-28 w-full relative"
        style={{ background: destinationGradient(trip.destination) }}
      >
        {/* Status badge */}
        <span
          className={cn(
            "absolute top-2.5 right-2.5 text-[11px] font-medium px-2 py-0.5 rounded-full",
            status.className
          )}
        >
          {status.label}
        </span>

        {/* Tags */}
        {trip.tags && trip.tags.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 flex gap-1 flex-wrap">
            {trip.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-black/20 text-white rounded-full px-2 py-0.5 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3.5">
        <div>
          <p className="font-medium text-sm text-text-primary leading-tight truncate">
            {trip.title}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {trip.destination}
          </p>
        </div>

        {/* Dates */}
        <p className="text-xs text-text-tertiary">
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        {/* Budget */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Budget</span>
            <span className="font-mono text-xs text-text-primary">
              €{trip.actualSpent.toLocaleString()} / €{trip.budgetTotal.toLocaleString()}
            </span>
          </div>
          <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                budgetPercent >= 90 ? "bg-error" : budgetPercent >= 70 ? "bg-warning" : "bg-success"
              )}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
