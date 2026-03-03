"use client";

import { useState } from "react";
import {
  Plane,
  Building2,
  Utensils,
  Camera,
  Clock,
  Car,
  LogIn,
  LogOut,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ActivityType =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "free_time"
  | "flight"
  | "checkin"
  | "checkout";

export interface ActivityData {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  location?: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  startTime?: string;
  endTime?: string;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  bookingUrl?: string;
  bookingReference?: string;
  isBooked: boolean;
  studentDiscount?: {
    available: boolean;
    discountPercent?: number;
    details?: string;
  };
  notes?: string;
  aiSuggestion?: boolean;
}

// ─── Icon & color map ──────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  flight: {
    icon: Plane,
    color: "text-[#3B6EC4]",
    bgColor: "bg-[rgba(59,110,196,0.08)]",
    label: "Flight",
  },
  accommodation: {
    icon: Building2,
    color: "text-warning",
    bgColor: "bg-warning-muted",
    label: "Accommodation",
  },
  food: {
    icon: Utensils,
    color: "text-accent",
    bgColor: "bg-accent-muted",
    label: "Food & Drink",
  },
  activity: {
    icon: Camera,
    color: "text-success",
    bgColor: "bg-success-muted",
    label: "Activity",
  },
  free_time: {
    icon: Clock,
    color: "text-text-tertiary",
    bgColor: "bg-bg-secondary",
    label: "Free time",
  },
  transport: {
    icon: Car,
    color: "text-[#3B6EC4]",
    bgColor: "bg-[rgba(59,110,196,0.08)]",
    label: "Transport",
  },
  checkin: {
    icon: LogIn,
    color: "text-success",
    bgColor: "bg-success-muted",
    label: "Check-in",
  },
  checkout: {
    icon: LogOut,
    color: "text-error",
    bgColor: "bg-[rgba(196,61,46,0.08)]",
    label: "Check-out",
  },
};

// ─── Compact variant ───────────────────────────────────────────────────────────
function ActivityCardCompact({
  activity,
  onClick,
}: {
  activity: ActivityData;
  onClick?: (a: ActivityData) => void;
}) {
  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity;
  const Icon = cfg.icon;

  return (
    <div
      onClick={() => onClick?.(activity)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => e.key === "Enter" && onClick(activity)
          : undefined
      }
      className={cn(
        "flex items-start gap-2.5 rounded-[8px] border border-border-subtle bg-bg-primary p-3",
        onClick &&
          "hover:border-border-default hover:shadow-sm transition-all cursor-pointer"
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          "w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0",
          cfg.bgColor
        )}
      >
        <Icon size={14} className={cfg.color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {(activity.startTime || activity.endTime) && (
          <p className="font-mono text-[10px] text-text-tertiary mb-0.5">
            {activity.startTime}
            {activity.endTime ? ` – ${activity.endTime}` : ""}
          </p>
        )}
        <p className="text-sm font-medium text-text-primary leading-tight truncate">
          {activity.title}
        </p>
        {activity.location?.name && (
          <p className="flex items-center gap-1 text-[11px] text-text-tertiary mt-0.5 truncate">
            <MapPin size={10} />
            {activity.location.name}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="font-mono text-[11px] bg-bg-secondary rounded px-1.5 py-0.5 text-text-secondary">
            {activity.currency === "EUR" ? "€" : activity.currency}
            {activity.estimatedCost.toFixed(2)}
          </span>
          {activity.isBooked && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-muted text-success font-medium">
              Booked
            </span>
          )}
          {activity.studentDiscount?.available && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-muted text-accent font-medium">
              Student
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Expanded variant ──────────────────────────────────────────────────────────
function ActivityCardExpanded({ activity }: { activity: ActivityData }) {
  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity;
  const Icon = cfg.icon;

  return (
    <div className="rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={cn(
            "w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0",
            cfg.bgColor
          )}
        >
          <Icon size={16} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-text-tertiary">{cfg.label}</p>
              <h3 className="font-medium text-text-primary">{activity.title}</h3>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-medium text-text-primary">
                {activity.currency === "EUR" ? "€" : activity.currency}
                {activity.estimatedCost.toFixed(2)}
              </p>
              {activity.actualCost !== undefined && (
                <p
                  className={cn(
                    "font-mono text-[11px]",
                    activity.actualCost > activity.estimatedCost
                      ? "text-error"
                      : "text-success"
                  )}
                >
                  actual: €{activity.actualCost.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Time */}
          {(activity.startTime || activity.endTime) && (
            <p className="font-mono text-xs text-text-tertiary mt-1">
              {activity.startTime}
              {activity.endTime ? ` – ${activity.endTime}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      {(activity.description ||
        activity.location?.name ||
        activity.notes) && (
        <div className="flex flex-col gap-3 px-4 pb-4 border-t border-border-subtle pt-3">
          {activity.description && (
            <p className="text-sm text-text-secondary leading-relaxed">
              {activity.description}
            </p>
          )}

          {activity.location?.name && (
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5">
                <MapPin size={13} className="text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-primary">
                    {activity.location.name}
                  </p>
                  {activity.location.address && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {activity.location.address}
                    </p>
                  )}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activity.location.address ?? activity.location.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#3B6EC4] hover:underline flex items-center gap-1 shrink-0"
              >
                <ExternalLink size={11} />
                Maps
              </a>
            </div>
          )}

          {activity.notes && (
            <p className="text-xs text-text-tertiary italic">
              {activity.notes}
            </p>
          )}
        </div>
      )}

      {/* Footer badges + book button */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 bg-bg-secondary border-t border-border-subtle">
        {activity.isBooked && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-success-muted text-success font-medium border border-success/20">
            Booked
          </span>
        )}
        {activity.studentDiscount?.available && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-muted text-accent font-medium border border-accent/20">
            Student discount {activity.studentDiscount.discountPercent
              ? `(${activity.studentDiscount.discountPercent}% off)`
              : "available"}
          </span>
        )}
        {activity.aiSuggestion && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(59,110,196,0.08)] text-[#3B6EC4] font-medium border border-[rgba(59,110,196,0.15)]">
            AI suggested
          </span>
        )}

        {activity.bookingUrl && (
          <a
            href={activity.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs text-[#3B6EC4] font-medium hover:underline"
          >
            <Ticket size={12} />
            Book now
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main ActivityCard Component ───────────────────────────────────────────────
export interface ActivityCardProps {
  activity: ActivityData;
  variant?: "compact" | "expanded" | "collapsible";
  onClick?: (activity: ActivityData) => void;
  className?: string;
}

export function ActivityCard({
  activity,
  variant = "compact",
  onClick,
  className,
}: ActivityCardProps) {
  const [open, setOpen] = useState(false);
  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity;

  if (variant === "compact") {
    return (
      <div className={className}>
        <ActivityCardCompact activity={activity} onClick={onClick} />
      </div>
    );
  }

  if (variant === "expanded") {
    return (
      <div className={className}>
        <ActivityCardExpanded activity={activity} />
      </div>
    );
  }

  // Collapsible
  return (
    <div
      className={cn(
        "rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 w-full px-3.5 py-3 text-left hover:bg-bg-secondary transition-colors"
      >
        <div
          className={cn(
            "w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0",
            cfg.bgColor
          )}
        >
          <cfg.icon size={14} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {activity.title}
          </p>
          {!open && activity.startTime && (
            <p className="font-mono text-[10px] text-text-tertiary">
              {activity.startTime}
              {activity.endTime ? ` – ${activity.endTime}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs text-text-secondary bg-bg-secondary rounded px-1.5 py-0.5">
            €{activity.estimatedCost.toFixed(2)}
          </span>
          {open ? (
            <ChevronUp size={14} className="text-text-tertiary" />
          ) : (
            <ChevronDown size={14} className="text-text-tertiary" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border-subtle">
          <ActivityCardExpanded activity={activity} />
        </div>
      )}
    </div>
  );
}
