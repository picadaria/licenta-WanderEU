"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    className:
      "bg-bg-secondary text-text-secondary border border-border-default",
  },
  planned: {
    label: "Planned",
    className:
      "bg-[rgba(59,110,196,0.1)] text-[#3B6EC4] border border-[rgba(59,110,196,0.2)]",
  },
  active: {
    label: "Active Now",
    className:
      "bg-success-muted text-success border border-[rgba(45,122,79,0.2)]",
  },
  completed: {
    label: "Completed",
    className:
      "bg-accent-muted text-accent border border-[rgba(232,85,58,0.2)]",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-[rgba(196,61,46,0.08)] text-error border border-[rgba(196,61,46,0.2)]",
  },
} as const;

const TABS = [
  { label: "Overview", path: "overview" },
  { label: "Itinerary", path: "itinerary" },
  { label: "Budget", path: "budget" },
  { label: "Bookings", path: "bookings" },
  { label: "Packing", path: "packing" },
  { label: "Share", path: "share" },
] as const;

export default function TripLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });
  const removeTrip = useMutation(api.trips.remove);

  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const activeTab = TABS.find((t) => pathname.includes(`/${t.path}`));

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      await removeTrip({ tripId });
      router.push("/dashboard");
    } catch {
      setDeleting(false);
    }
  }

  // Loading state
  if (trip === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton width={280} height={36} borderRadius={6} />
            <Skeleton width={200} height={20} borderRadius={4} />
          </div>
          <Skeleton width={32} height={32} borderRadius={6} />
        </div>
        <div className="flex gap-1 border-b border-border-subtle pb-0">
          {TABS.map((t) => (
            <Skeleton key={t.path} width={80} height={36} borderRadius={6} />
          ))}
        </div>
        <div className="mt-2">
          <Skeleton height={200} borderRadius={8} />
        </div>
      </div>
    );
  }

  // Not found
  if (trip === null) {
    router.replace(`/trip/${tripId}/not-found`);
    return null;
  }

  const statusCfg = STATUS_CONFIG[trip.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
  const startFormatted = trip.startDate
    ? format(new Date(trip.startDate), "d MMM")
    : "";
  const endFormatted = trip.endDate
    ? format(new Date(trip.endDate), "d MMM yyyy")
    : "";

  return (
    <div className="flex flex-col gap-0">
      {/* ── Trip Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pb-5">
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Destination */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-3xl text-text-primary leading-tight">
              {trip.destination.city}
            </h1>
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0",
                statusCfg.className
              )}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-text-tertiary" />
              {trip.destination.city}, {trip.destination.country}
            </span>
            <span className="text-border-default">·</span>
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-text-tertiary" />
              {startFormatted} – {endFormatted}
            </span>
            <span className="text-border-default">·</span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-text-tertiary" />
              {trip.totalDays} {trip.totalDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => {
              setMenuOpen((o) => !o);
              setDeleteConfirm(false);
            }}
            className={cn(
              "p-2 rounded-[6px] border border-border-subtle bg-bg-primary",
              "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
              "transition-colors duration-150"
            )}
            aria-label="Trip actions"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-bg-primary border border-border-default rounded-[8px] shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/trip/${tripId}/edit`);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <Pencil size={14} className="text-text-tertiary" />
                Edit trip
              </button>
              <div className="border-t border-border-subtle" />
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm transition-colors",
                  deleteConfirm
                    ? "text-error font-medium bg-[rgba(196,61,46,0.06)] hover:bg-[rgba(196,61,46,0.1)]"
                    : "text-error hover:bg-[rgba(196,61,46,0.06)]"
                )}
              >
                <Trash2 size={14} />
                {deleting
                  ? "Deleting…"
                  : deleteConfirm
                    ? "Confirm delete"
                    : "Delete trip"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────── */}
      <div className="flex items-end gap-0.5 border-b border-border-subtle overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {TABS.map((tab) => {
          const href = `/trip/${tripId}/${tab.path}`;
          const isActive = activeTab?.path === tab.path;

          return (
            <Link
              key={tab.path}
              href={href}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2 -mb-px",
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
            </Link>
          );
        })}

        {/* Live tab only when active */}
        {trip.status === "active" && (
          <Link
            href={`/trip/${tripId}/live`}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5",
              pathname.includes("/live")
                ? "border-success text-success"
                : "border-transparent text-success/70 hover:text-success"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </Link>
        )}
      </div>

      {/* ── Page Content ─────────────────────────────────────── */}
      <div className="pt-6">{children}</div>
    </div>
  );
}
