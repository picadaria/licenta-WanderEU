"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Plane,
  Building2,
  Ticket,
  ExternalLink,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type ActivityType =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "free_time"
  | "flight"
  | "checkin"
  | "checkout";

interface BookableActivity {
  _id: Id<"activities">;
  type: ActivityType;
  title: string;
  startTime?: string;
  estimatedCost: number;
  currency: string;
  bookingUrl?: string;
  bookingReference?: string;
  isBooked: boolean;
  tripDayId: Id<"tripDays">;
  tripId: Id<"trips">;
}

// Which types to show in each section
const SECTION_TYPES: Record<string, ActivityType[]> = {
  flights: ["flight"],
  accommodation: ["accommodation", "checkin", "checkout"],
  activities: ["activity", "food", "transport"],
};

const SECTION_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }
> = {
  flights: { label: "Flights", icon: Plane, color: "text-[#3B6EC4]" },
  accommodation: { label: "Accommodation", icon: Building2, color: "text-warning" },
  activities: { label: "Activities & Dining", icon: Ticket, color: "text-success" },
};

// ─── Booking Item ──────────────────────────────────────────────────────────────
function BookingItem({ activity }: { activity: BookableActivity }) {
  const updateActivity = useMutation(api.activities.update);
  const [expanded, setExpanded] = useState(activity.isBooked && !!activity.bookingReference);
  const [refValue, setRefValue] = useState(activity.bookingReference ?? "");
  const [savingRef, setSavingRef] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleToggleBooked() {
    setToggling(true);
    await updateActivity({
      activityId: activity._id,
      isBooked: !activity.isBooked,
    });
    setToggling(false);
    if (!activity.isBooked) setExpanded(true);
  }

  async function handleSaveRef() {
    setSavingRef(true);
    await updateActivity({
      activityId: activity._id,
      bookingReference: refValue.trim() || undefined,
    });
    setSavingRef(false);
  }

  return (
    <div
      className={cn(
        "rounded-[8px] border p-3.5 transition-all duration-150",
        activity.isBooked
          ? "border-success/30 bg-success-muted"
          : "border-border-subtle bg-bg-primary"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox toggle */}
        <button
          onClick={handleToggleBooked}
          disabled={toggling}
          className="mt-0.5 shrink-0 transition-opacity disabled:opacity-50"
          aria-label={activity.isBooked ? "Mark as not booked" : "Mark as booked"}
        >
          {activity.isBooked ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <Circle size={18} className="text-text-tertiary" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  activity.isBooked
                    ? "text-success"
                    : "text-text-primary"
                )}
              >
                {activity.title}
              </p>
              {activity.startTime && (
                <p className="font-mono text-[11px] text-text-tertiary mt-0.5">
                  {activity.startTime}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-sm text-text-primary">
                €{activity.estimatedCost.toFixed(2)}
              </span>

              {/* Book Now link */}
              {activity.bookingUrl && (
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-[#3B6EC4] hover:underline font-medium"
                >
                  <ExternalLink size={12} />
                  Book
                </a>
              )}

              {/* Expand ref input toggle */}
              {activity.isBooked && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  {expanded ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Booking reference input */}
          {activity.isBooked && expanded && (
            <div className="flex gap-2 mt-2.5">
              <input
                value={refValue}
                onChange={(e) => setRefValue(e.target.value)}
                placeholder="Booking reference or confirmation number"
                className="flex-1 px-2.5 py-1.5 rounded-[6px] border border-border-default bg-bg-primary text-xs font-mono text-text-primary focus:outline-none focus:border-success placeholder:text-text-tertiary"
              />
              <button
                onClick={handleSaveRef}
                disabled={savingRef}
                className="px-3 py-1.5 rounded-[6px] bg-success text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {savingRef ? "…" : "Save"}
              </button>
            </div>
          )}

          {/* Existing booking reference display */}
          {activity.isBooked &&
            !expanded &&
            activity.bookingReference && (
              <p className="font-mono text-[11px] text-success mt-1">
                Ref: {activity.bookingReference}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────
function BookingSection({
  sectionKey,
  activities,
}: {
  sectionKey: string;
  activities: BookableActivity[];
}) {
  const cfg = SECTION_CONFIG[sectionKey];
  const Icon = cfg.icon;
  const booked = activities.filter((a) => a.isBooked).length;

  if (activities.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className={cfg.color} />
          <h2 className="text-sm font-semibold text-text-primary">
            {cfg.label}
          </h2>
          <span className="text-xs text-text-tertiary">
            ({activities.length})
          </span>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            booked === activities.length && activities.length > 0
              ? "bg-success-muted text-success"
              : "bg-bg-secondary text-text-secondary"
          )}
        >
          {booked}/{activities.length} booked
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {activities.map((a) => (
          <BookingItem key={a._id} activity={a} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const activities = useQuery(api.activities.listByTrip, { tripId });

  if (!activities) {
    return (
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton width={160} height={20} borderRadius={6} />
            {[1, 2].map((j) => (
              <Skeleton key={j} height={64} borderRadius={8} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const bookable = activities as BookableActivity[];

  const sections = Object.entries(SECTION_TYPES).map(([key, types]) => ({
    key,
    items: bookable
      .filter((a) => types.includes(a.type))
      .sort((a, b) => {
        // Sort: unbooked first, then by startTime
        if (a.isBooked !== b.isBooked) return a.isBooked ? 1 : -1;
        if (a.startTime && b.startTime)
          return a.startTime.localeCompare(b.startTime);
        return 0;
      }),
  }));

  const totalBookable = bookable.length;
  const totalBooked = bookable.filter((a) => a.isBooked).length;

  if (totalBookable === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-bg-secondary flex items-center justify-center">
          <PackageSearch size={24} className="text-text-tertiary" />
        </div>
        <div>
          <p className="font-medium text-text-primary">No bookable activities</p>
          <p className="text-sm text-text-secondary mt-1">
            Add flights, accommodation, and activities to your itinerary to
            manage bookings here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress summary */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-secondary">Booking progress</p>
          <p className="font-mono text-sm font-medium text-text-primary">
            {totalBooked}/{totalBookable} confirmed
          </p>
        </div>
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{
              width: `${totalBookable > 0 ? (totalBooked / totalBookable) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((s) => (
        <BookingSection key={s.key} sectionKey={s.key} activities={s.items} />
      ))}
    </div>
  );
}
