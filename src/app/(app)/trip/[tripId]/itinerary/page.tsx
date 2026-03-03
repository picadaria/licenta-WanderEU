"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Plus,
  X,
  MapPin,
  ExternalLink,
  Pencil,
  Trash2,
  GripVertical,
  Plane,
  Building2,
  Utensils,
  Camera,
  Clock,
  Car,
  LogIn,
  LogOut,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ActivityType =
  | "transport"
  | "accommodation"
  | "food"
  | "activity"
  | "free_time"
  | "flight"
  | "checkin"
  | "checkout";

interface Activity {
  _id: Id<"activities">;
  tripDayId: Id<"tripDays">;
  tripId: Id<"trips">;
  order: number;
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

interface TripDay {
  _id: Id<"tripDays">;
  tripId: Id<"trips">;
  dayNumber: number;
  date: string;
  title?: string;
  notes?: string;
  dailyBudget: number;
  dailySpent: number;
}

// ─── Activity Type Config ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    label: string;
  }
> = {
  flight: { icon: Plane, color: "text-[#3B6EC4]", label: "Flight" },
  accommodation: { icon: Building2, color: "text-warning", label: "Hotel" },
  food: { icon: Utensils, color: "text-accent", label: "Food" },
  activity: { icon: Camera, color: "text-success", label: "Activity" },
  free_time: { icon: Clock, color: "text-text-tertiary", label: "Free time" },
  transport: { icon: Car, color: "text-[#3B6EC4]", label: "Transport" },
  checkin: { icon: LogIn, color: "text-success", label: "Check-in" },
  checkout: { icon: LogOut, color: "text-error", label: "Check-out" },
};

const ACTIVITY_TYPES: ActivityType[] = [
  "flight",
  "accommodation",
  "food",
  "activity",
  "transport",
  "free_time",
  "checkin",
  "checkout",
];

// ─── SortableActivityCard ──────────────────────────────────────────────────────
function SortableActivityCard({
  activity,
  onSelect,
}: {
  activity: Activity;
  onSelect: (a: Activity) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ActivityCardInner
        activity={activity}
        onSelect={onSelect}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ─── ActivityCardInner ─────────────────────────────────────────────────────────
function ActivityCardInner({
  activity,
  onSelect,
  dragHandleProps,
}: {
  activity: Activity;
  onSelect: (a: Activity) => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "group rounded-[8px] border border-border-subtle bg-bg-primary p-3",
        "hover:border-border-default hover:shadow-sm transition-all duration-150 cursor-pointer"
      )}
      onClick={() => onSelect(activity)}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>

        {/* Type icon */}
        <div className={cn("mt-0.5 shrink-0", cfg.color)}>
          <Icon size={14} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Time */}
          {(activity.startTime || activity.endTime) && (
            <p className="font-mono text-[10px] text-text-tertiary mb-0.5">
              {activity.startTime ?? ""}
              {activity.endTime ? ` – ${activity.endTime}` : ""}
            </p>
          )}

          {/* Title */}
          <p className="font-medium text-sm text-text-primary leading-tight truncate">
            {activity.title}
          </p>

          {/* Location */}
          {activity.location?.name && (
            <p className="flex items-center gap-1 text-[11px] text-text-tertiary mt-0.5 truncate">
              <MapPin size={10} />
              {activity.location.name}
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="font-mono text-[11px] bg-bg-secondary rounded px-1.5 py-0.5 text-text-secondary">
              €{activity.estimatedCost.toFixed(2)}
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
            {activity.aiSuggestion && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(59,110,196,0.08)] text-[#3B6EC4] font-medium">
                AI
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Day Column ────────────────────────────────────────────────────────────────
function DayColumn({
  day,
  activities,
  onSelectActivity,
  onAddActivity,
}: {
  day: TripDay;
  activities: Activity[];
  onSelectActivity: (a: Activity) => void;
  onAddActivity: (dayId: Id<"tripDays">) => void;
}) {
  const dateLabel = day.date
    ? format(new Date(day.date), "EEE, d MMM")
    : `Day ${day.dayNumber}`;
  const totalCost = activities.reduce((s, a) => s + a.estimatedCost, 0);

  return (
    <div className="flex flex-col gap-2 w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold text-text-primary">
            Day {day.dayNumber}
          </p>
          <p className="text-[11px] text-text-tertiary">{dateLabel}</p>
        </div>
        <span className="font-mono text-[11px] text-text-secondary bg-bg-secondary rounded px-1.5 py-0.5">
          €{totalCost.toFixed(0)}
        </span>
      </div>

      {/* Sortable activity list */}
      <SortableContext
        items={activities.map((a) => a._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[80px]">
          {activities.map((activity) => (
            <SortableActivityCard
              key={activity._id}
              activity={activity}
              onSelect={onSelectActivity}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add activity button */}
      <button
        onClick={() => onAddActivity(day._id)}
        className={cn(
          "flex items-center justify-center gap-1.5 py-2.5 rounded-[8px]",
          "border border-dashed border-border-default text-text-tertiary text-xs",
          "hover:border-accent hover:text-accent hover:bg-accent-muted transition-colors"
        )}
      >
        <Plus size={13} />
        Add activity
      </button>
    </div>
  );
}

// ─── Activity Detail Panel ─────────────────────────────────────────────────────
function ActivityPanel({
  activity,
  onClose,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onClose: () => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: Id<"activities">) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteActivity = useMutation(api.activities.remove);
  const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.activity;
  const Icon = cfg.icon;

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    await deleteActivity({ activityId: activity._id });
    onDelete(activity._id);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed z-50 bg-bg-primary border-border-default shadow-lg overflow-y-auto",
          // Mobile: bottom sheet
          "bottom-0 left-0 right-0 rounded-t-[16px] max-h-[85vh] border-t",
          // Desktop: right slide panel
          "md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[400px] md:rounded-none md:border-t-0 md:border-l md:max-h-none"
        )}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <span className={cn("mt-0.5", cfg.color)}>
              <Icon size={16} />
            </span>
            <div>
              <p className="text-xs text-text-tertiary">{cfg.label}</p>
              <h3 className="font-medium text-text-primary">{activity.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-text-tertiary hover:bg-bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-4">
          {/* Time */}
          {(activity.startTime || activity.endTime) && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-tertiary font-medium">
                Time
              </span>
              <p className="font-mono text-sm text-text-primary">
                {activity.startTime ?? ""}
                {activity.endTime ? ` – ${activity.endTime}` : ""}
              </p>
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-tertiary font-medium">
                Description
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                {activity.description}
              </p>
            </div>
          )}

          {/* Location */}
          {activity.location?.name && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-tertiary font-medium">
                Location
              </span>
              <div className="flex items-start justify-between gap-2">
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
                {activity.location.name && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activity.location.address ?? activity.location.name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#3B6EC4] hover:underline shrink-0"
                  >
                    <ExternalLink size={11} />
                    Maps
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Cost */}
          <div className="flex items-center justify-between py-2 px-3 rounded-[6px] bg-bg-secondary">
            <span className="text-xs text-text-secondary">Estimated cost</span>
            <span className="font-mono text-sm font-medium text-text-primary">
              €{activity.estimatedCost.toFixed(2)}
            </span>
          </div>

          {/* Student Discount */}
          {activity.studentDiscount?.available && (
            <div className="rounded-[6px] bg-accent-muted border border-[rgba(232,85,58,0.15)] p-3">
              <p className="text-xs font-medium text-accent mb-0.5">
                Student Discount Available
                {activity.studentDiscount.discountPercent
                  ? ` — ${activity.studentDiscount.discountPercent}% off`
                  : ""}
              </p>
              {activity.studentDiscount.details && (
                <p className="text-xs text-text-secondary">
                  {activity.studentDiscount.details}
                </p>
              )}
            </div>
          )}

          {/* Booking URL */}
          {activity.bookingUrl && (
            <a
              href={activity.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 rounded-[6px] border border-[#3B6EC4] text-[#3B6EC4] text-sm font-medium hover:bg-[rgba(59,110,196,0.08)] transition-colors"
            >
              <Ticket size={14} />
              Book Now
              <ExternalLink size={12} />
            </a>
          )}

          {/* Booking Reference */}
          {activity.bookingReference && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-tertiary font-medium">
                Booking Reference
              </span>
              <p className="font-mono text-sm text-text-primary bg-bg-secondary px-2.5 py-1.5 rounded-[6px]">
                {activity.bookingReference}
              </p>
            </div>
          )}

          {/* Notes */}
          {activity.notes && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-text-tertiary font-medium">
                Notes
              </span>
              <p className="text-sm text-text-secondary">{activity.notes}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 p-4 border-t border-border-subtle">
          <button
            onClick={() => onEdit(activity)}
            className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-[6px] border border-border-default text-sm text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={cn(
              "flex items-center gap-1.5 flex-1 justify-center py-2 rounded-[6px] border text-sm transition-colors",
              confirmDelete
                ? "border-error bg-[rgba(196,61,46,0.06)] text-error font-medium"
                : "border-border-default text-error hover:bg-[rgba(196,61,46,0.06)]"
            )}
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : confirmDelete ? "Confirm" : "Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Add / Edit Activity Modal ─────────────────────────────────────────────────
function ActivityModal({
  tripId,
  targetDayId,
  editingActivity,
  existingCount,
  onClose,
}: {
  tripId: Id<"trips">;
  targetDayId: Id<"tripDays">;
  editingActivity: Activity | null;
  existingCount: number;
  onClose: () => void;
}) {
  const createActivity = useMutation(api.activities.create);
  const updateActivity = useMutation(api.activities.update);

  const [form, setForm] = useState({
    type: (editingActivity?.type ?? "activity") as ActivityType,
    title: editingActivity?.title ?? "",
    description: editingActivity?.description ?? "",
    locationName: editingActivity?.location?.name ?? "",
    locationAddress: editingActivity?.location?.address ?? "",
    startTime: editingActivity?.startTime ?? "",
    endTime: editingActivity?.endTime ?? "",
    estimatedCost: editingActivity?.estimatedCost?.toString() ?? "0",
    currency: editingActivity?.currency ?? "EUR",
    bookingUrl: editingActivity?.bookingUrl ?? "",
    notes: editingActivity?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      const location =
        form.locationName.trim()
          ? {
              name: form.locationName.trim(),
              address: form.locationAddress.trim() || undefined,
            }
          : undefined;

      if (editingActivity) {
        await updateActivity({
          activityId: editingActivity._id,
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          location,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          estimatedCost: parseFloat(form.estimatedCost) || 0,
          currency: form.currency,
          bookingUrl: form.bookingUrl.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      } else {
        await createActivity({
          tripDayId: targetDayId,
          tripId,
          order: existingCount,
          type: form.type,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          location,
          startTime: form.startTime || undefined,
          endTime: form.endTime || undefined,
          estimatedCost: parseFloat(form.estimatedCost) || 0,
          currency: form.currency,
          bookingUrl: form.bookingUrl.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      }
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-50 bg-bg-primary border border-border-default shadow-xl overflow-y-auto",
          "bottom-0 left-0 right-0 rounded-t-[16px] max-h-[90vh]",
          "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
          "md:w-[480px] md:max-h-[80vh] md:rounded-[8px]"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-full bg-border-default" />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h3 className="font-medium text-text-primary">
            {editingActivity ? "Edit activity" : "Add activity"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[6px] text-text-tertiary hover:bg-bg-secondary"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 p-4">
          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_CONFIG[t]?.label ?? t}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Title *
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Dinner at Trattoria Romano"
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Optional details…"
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary resize-none"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Location name
              </label>
              <input
                value={form.locationName}
                onChange={(e) => set("locationName", e.target.value)}
                placeholder="Trattoria Romano"
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Address
              </label>
              <input
                value={form.locationAddress}
                onChange={(e) => set("locationAddress", e.target.value)}
                placeholder="Via Roma 12"
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Start time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                End time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Cost + currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Estimated cost
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedCost}
                onChange={(e) => set("estimatedCost", e.target.value)}
                className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm font-mono text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className="px-2 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="RON">RON</option>
                <option value="CZK">CZK</option>
                <option value="PLN">PLN</option>
              </select>
            </div>
          </div>

          {/* Booking URL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Booking URL
            </label>
            <input
              type="url"
              value={form.bookingUrl}
              onChange={(e) => set("bookingUrl", e.target.value)}
              placeholder="https://…"
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary font-medium">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Any notes…"
              className="px-3 py-2 rounded-[6px] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="w-full py-2.5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editingActivity
                ? "Save changes"
                : "Add activity"}
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ItineraryPage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const days = useQuery(api.tripDays.listByTrip, { tripId });
  const activities = useQuery(api.activities.listByTrip, { tripId });
  const reorderActivities = useMutation(api.activities.reorder);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [addingToDayId, setAddingToDayId] = useState<Id<"tripDays"> | null>(
    null
  );
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeMobileDay, setActiveMobileDay] = useState(0);
  const [localActivities, setLocalActivities] = useState<Activity[] | null>(
    null
  );

  // Sync server -> local once loaded
  const displayActivities: Activity[] =
    localActivities ?? (activities as Activity[] | undefined) ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  // Build map: dayId -> sorted activities
  const activitiesByDay = useCallback(
    (dayId: Id<"tripDays">): Activity[] => {
      return displayActivities
        .filter((a) => a.tripDayId === dayId)
        .sort((a, b) => a.order - b.order);
    },
    [displayActivities]
  );

  function getActiveActivity(): Activity | null {
    if (!activeDragId) return null;
    return (
      displayActivities.find((a) => a._id === activeDragId) ?? null
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
    if (!localActivities && activities) {
      setLocalActivities([...activities] as Activity[]);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalActivities((prev) => {
      const list = prev ?? ([...(activities ?? [])] as Activity[]);
      const activeAct = list.find((a) => a._id === active.id);
      const overAct = list.find((a) => a._id === over.id);
      if (!activeAct || !overAct) return list;

      // If dragged to a different day column
      const updated = list.map((a) => {
        if (a._id === activeAct._id) {
          return { ...a, tripDayId: overAct.tripDayId };
        }
        return a;
      });

      // Recompute orders within each day
      const byDay = new Map<string, Activity[]>();
      for (const a of updated) {
        const key = a.tripDayId as string;
        if (!byDay.has(key)) byDay.set(key, []);
        byDay.get(key)!.push(a);
      }

      const result: Activity[] = [];
      for (const [, dayActs] of byDay) {
        const sorted = dayActs.sort((a, b) => a.order - b.order);
        sorted.forEach((a, i) => result.push({ ...a, order: i }));
      }

      return result;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) {
      return;
    }

    const current = localActivities ?? (activities as Activity[]);
    if (!current) return;

    const reorders = current.map((a) => ({
      activityId: a._id,
      order: a.order,
    }));

    try {
      await reorderActivities({ tripId, reorders });
    } catch {
      // Revert on error
      setLocalActivities(activities ? [...activities] as Activity[] : null);
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!days || !activities) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 w-[260px] shrink-0">
            <Skeleton height={40} borderRadius={6} />
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} height={80} borderRadius={8} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center">
        <Clock size={32} className="text-text-tertiary" />
        <div>
          <p className="font-medium text-text-primary">No days planned yet</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Your itinerary will appear here once days are added.
          </p>
        </div>
      </div>
    );
  }

  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const currentDay = sortedDays[activeMobileDay];

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* ── Mobile: single day with day selector ───────────── */}
        <div className="md:hidden flex flex-col gap-4">
          {/* Day selector tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMobileDay((d) => Math.max(0, d - 1))}
              disabled={activeMobileDay === 0}
              className="p-1.5 rounded-[6px] border border-border-subtle text-text-secondary hover:bg-bg-secondary disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="flex-1 overflow-x-auto scrollbar-none">
              <div className="flex gap-1">
                {sortedDays.map((day, i) => (
                  <button
                    key={day._id}
                    onClick={() => setActiveMobileDay(i)}
                    className={cn(
                      "shrink-0 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors",
                      i === activeMobileDay
                        ? "bg-accent text-white"
                        : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                    )}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setActiveMobileDay((d) =>
                  Math.min(sortedDays.length - 1, d + 1)
                )
              }
              disabled={activeMobileDay === sortedDays.length - 1}
              className="p-1.5 rounded-[6px] border border-border-subtle text-text-secondary hover:bg-bg-secondary disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Current day column */}
          {currentDay && (
            <DayColumn
              day={currentDay as TripDay}
              activities={activitiesByDay(currentDay._id as Id<"tripDays">)}
              onSelectActivity={setSelectedActivity}
              onAddActivity={(dayId) => {
                setEditingActivity(null);
                setAddingToDayId(dayId);
              }}
            />
          )}
        </div>

        {/* ── Desktop: horizontal scrolling columns ──────────── */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {sortedDays.map((day) => (
            <DayColumn
              key={day._id}
              day={day as TripDay}
              activities={activitiesByDay(day._id as Id<"tripDays">)}
              onSelectActivity={setSelectedActivity}
              onAddActivity={(dayId) => {
                setEditingActivity(null);
                setAddingToDayId(dayId);
              }}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragId && getActiveActivity() && (
            <div className="rotate-1 scale-105 shadow-lg">
              <ActivityCardInner
                activity={getActiveActivity()!}
                onSelect={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Activity detail panel */}
      {selectedActivity && (
        <ActivityPanel
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onEdit={(a) => {
            setSelectedActivity(null);
            setEditingActivity(a);
            setAddingToDayId(a.tripDayId);
          }}
          onDelete={() => {
            setSelectedActivity(null);
            // Optimistic: remove from localActivities
            setLocalActivities((prev) =>
              (prev ?? (activities as Activity[])).filter(
                (a) => a._id !== selectedActivity._id
              )
            );
          }}
        />
      )}

      {/* Add / Edit modal */}
      {addingToDayId && (
        <ActivityModal
          tripId={tripId}
          targetDayId={addingToDayId}
          editingActivity={editingActivity}
          existingCount={activitiesByDay(addingToDayId).length}
          onClose={() => {
            setAddingToDayId(null);
            setEditingActivity(null);
          }}
        />
      )}
    </>
  );
}
