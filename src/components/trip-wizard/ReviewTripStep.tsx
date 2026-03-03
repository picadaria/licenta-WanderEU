"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface Activity {
  type: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  estimatedCost: number;
  location?: { name: string; address?: string };
  notes?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
  dailyBudget: number;
  activities: Activity[];
}

interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  other: number;
}

export interface GeneratedTripData {
  tripId: string;
  title: string;
  description: string;
  budgetBreakdown: BudgetBreakdown;
  tips: string[];
  days: Day[];
}

interface ReviewTripStepProps {
  data: GeneratedTripData;
  budgetTotal: number;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  onRegenerate: () => void;
}

const PIE_COLORS = ["#E8553A", "#C4841D", "#2D7A4F", "#3B6EC4", "#9C9C93"];

const PIE_LABELS = ["Transport", "Accommodation", "Food", "Activities", "Other"];

function getActivityIcon(type: string) {
  switch (type) {
    case "flight":
      return Plane;
    case "accommodation":
    case "checkin":
    case "checkout":
      return Hotel;
    case "food":
      return Utensils;
    case "activity":
      return Camera;
    case "transport":
      return Plane;
    case "free_time":
    default:
      return Clock;
  }
}

function getActivityIconColor(type: string): string {
  switch (type) {
    case "flight":
    case "transport":
      return "text-[#2D7A4F]";
    case "accommodation":
    case "checkin":
    case "checkout":
      return "text-[#3B6EC4]";
    case "food":
      return "text-[#C4841D]";
    case "activity":
      return "text-accent";
    case "free_time":
    default:
      return "text-text-tertiary";
  }
}

function EditableTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <h1
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent ?? value)}
      className="font-serif text-2xl sm:text-3xl text-text-primary outline-none border-b-2 border-transparent hover:border-border-default focus:border-accent transition-colors cursor-text pb-0.5"
      role="heading"
      aria-label="Trip title (click to edit)"
    />
  );
}

function DaySection({ day, index }: { day: Day; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const dailyTotal = day.activities.reduce((sum, a) => sum + (a.estimatedCost ?? 0), 0);
  let formattedDate = day.date;
  try {
    formattedDate = format(parseISO(day.date), "MMM d");
  } catch {
    // keep original
  }

  return (
    <div className="border border-border-subtle rounded-[8px] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-mono font-bold text-accent">{day.dayNumber}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-tertiary font-mono">{formattedDate}</span>
              <span className="text-sm font-medium text-text-primary">{day.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono text-text-secondary hidden sm:block">
            €{dailyTotal}
          </span>
          {expanded ? (
            <ChevronUp size={15} className="text-text-tertiary" />
          ) : (
            <ChevronDown size={15} className="text-text-tertiary" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-border-subtle">
          {day.notes && (
            <div className="px-4 py-2.5 bg-warning-muted">
              <p className="text-xs text-warning leading-relaxed">{day.notes}</p>
            </div>
          )}
          {day.activities.map((activity, actIdx) => {
            const Icon = getActivityIcon(activity.type);
            const iconColor = getActivityIconColor(activity.type);

            return (
              <div key={actIdx} className="flex gap-3 px-4 py-3 hover:bg-bg-secondary/50">
                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                  <div className={cn("w-6 h-6 flex items-center justify-center", iconColor)}>
                    <Icon size={14} />
                  </div>
                  {actIdx < day.activities.length - 1 && (
                    <div className="w-px flex-1 bg-border-subtle min-h-[16px]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {activity.startTime && (
                        <span className="font-mono text-xs text-text-tertiary block mb-0.5">
                          {activity.startTime}
                          {activity.endTime ? ` – ${activity.endTime}` : ""}
                        </span>
                      )}
                      <p className="text-sm font-medium text-text-primary leading-snug">
                        {activity.title}
                      </p>
                      {activity.location?.name && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-text-tertiary flex-shrink-0" />
                          <span className="text-xs text-text-secondary truncate">
                            {activity.location.name}
                          </span>
                        </div>
                      )}
                      {activity.description && (
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                      )}
                      {activity.notes && (
                        <p className="text-xs text-text-tertiary mt-1 italic">{activity.notes}</p>
                      )}
                    </div>
                    {activity.estimatedCost > 0 && (
                      <span className="font-mono text-xs bg-bg-secondary rounded px-2 py-0.5 text-text-secondary flex-shrink-0 whitespace-nowrap">
                        €{activity.estimatedCost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary/50">
            <span className="text-xs text-text-secondary">Daily total</span>
            <span className="font-mono text-sm font-semibold text-text-primary">
              €{dailyTotal}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewTripStep({
  data,
  budgetTotal,
  destination,
  origin,
  startDate,
  endDate,
  onRegenerate,
}: ReviewTripStepProps) {
  const router = useRouter();
  const [title, setTitle] = useState(data.title);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [showRegenerateTooltip, setShowRegenerateTooltip] = useState(false);

  const updateTrip = useMutation(api.trips.update);
  const updateStatus = useMutation(api.trips.updateStatus);

  const pieData = [
    { name: "Transport", value: data.budgetBreakdown.transport },
    { name: "Accommodation", value: data.budgetBreakdown.accommodation },
    { name: "Food", value: data.budgetBreakdown.food },
    { name: "Activities", value: data.budgetBreakdown.activities },
    { name: "Other", value: data.budgetBreakdown.other },
  ].filter((d) => d.value > 0);

  const totalEstimated = Object.values(data.budgetBreakdown).reduce((a, b) => a + b, 0);

  let formattedStart = startDate;
  let formattedEnd = endDate;
  try {
    formattedStart = format(parseISO(startDate), "MMM d, yyyy");
    formattedEnd = format(parseISO(endDate), "MMM d, yyyy");
  } catch {
    // keep originals
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateTrip({
        tripId: data.tripId as never,
        title,
      });
      await updateStatus({
        tripId: data.tripId as never,
        status: "planned",
      });
      setSaved(true);
      setTimeout(() => {
        router.push(`/trip/${data.tripId}`);
      }, 800);
    } catch (err) {
      console.error("Failed to save trip:", err);
    } finally {
      setSaving(false);
    }
  }, [data.tripId, title, updateTrip, updateStatus, router]);

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 block">
          Click to edit trip name
        </label>
        <EditableTitle value={title} onChange={setTitle} />
      </div>

      {/* Overview card */}
      <div className="p-4 rounded-[8px] border border-border-default bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-tertiary mb-1">Destination</p>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-accent flex-shrink-0" />
              <p className="text-sm font-medium text-text-primary">{destination}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">From</p>
            <p className="text-sm font-medium text-text-primary">{origin}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">Dates</p>
            <p className="text-xs text-text-secondary">
              {formattedStart} – {formattedEnd}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary mb-1">Estimated cost</p>
            <p className="font-mono text-xl font-bold text-accent">€{totalEstimated}</p>
            {totalEstimated < budgetTotal && (
              <p className="text-xs text-success mt-0.5">
                €{budgetTotal - totalEstimated} under budget
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Budget chart */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-[8px] border border-border-subtle bg-bg-secondary/50">
        <div className="w-full sm:w-auto flex justify-center" style={{ maxWidth: 280 }}>
          <ResponsiveContainer width={240} height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`€${value}`, ""] as any}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #d4d3cf",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {pieData.map((entry, idx) => (
            <div key={entry.name} className="flex items-center gap-2 min-w-[120px]">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
              />
              <div>
                <p className="text-xs text-text-secondary">{entry.name}</p>
                <p className="font-mono text-sm font-semibold text-text-primary">
                  €{entry.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day timeline */}
      <div>
        <h3 className="font-serif text-lg text-text-primary mb-3">Day-by-Day Itinerary</h3>
        <div className="flex flex-col gap-2">
          {data.days.map((day, idx) => (
            <DaySection key={day.dayNumber} day={day} index={idx} />
          ))}
        </div>
      </div>

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <div className="border border-border-subtle rounded-[8px] overflow-hidden">
          <button
            type="button"
            onClick={() => setTipsExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-4 py-3 bg-warning-muted hover:bg-warning/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={15} className="text-warning" />
              <span className="text-sm font-medium text-text-primary">
                Tips & Notes ({data.tips.length})
              </span>
            </div>
            {tipsExpanded ? (
              <ChevronUp size={15} className="text-text-tertiary" />
            ) : (
              <ChevronDown size={15} className="text-text-tertiary" />
            )}
          </button>
          {tipsExpanded && (
            <div className="px-4 py-3 space-y-2">
              {data.tips.map((tip, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-mono text-xs text-text-tertiary mt-0.5 flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] text-sm font-semibold transition-all",
            saved
              ? "bg-success text-white"
              : "bg-accent text-white hover:bg-accent-hover",
            (saving || saved) && "opacity-80 cursor-not-allowed"
          )}
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              Saved! Redirecting...
            </>
          ) : saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <PackageCheck size={16} />
              Save Trip
            </>
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={onRegenerate}
            onMouseEnter={() => setShowRegenerateTooltip(true)}
            onMouseLeave={() => setShowRegenerateTooltip(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-[6px] text-sm font-medium border border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary bg-white transition-colors"
          >
            <AlertCircle size={14} className="text-warning" />
            Regenerate
          </button>
          {showRegenerateTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-text-primary text-white text-xs rounded-[6px] px-3 py-2 text-center pointer-events-none z-10">
              This will discard the current itinerary and generate a new one
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
