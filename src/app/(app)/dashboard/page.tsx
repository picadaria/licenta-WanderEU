"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { MapPin, PiggyBank, CheckCircle, Map, Plus } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { TripCard } from "@/components/shared/TripCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TripStatus = "draft" | "planned" | "active" | "completed";

interface Trip {
  id: string;
  _id: string;
  title: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  destination: string;
  budgetTotal: number;
  actualSpent: number;
  tags?: string[];
  [key: string]: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const trips = useQuery(api.trips.listByUser, {}) as Trip[] | undefined;

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "Traveler";
  const greeting = getGreeting();

  // Derived values
  const upcomingTrip =
    trips
      ?.filter(
        (t) =>
          (t.status === "planned" || t.status === "active") &&
          new Date(t.startDate) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )[0] ?? null;

  const recentTrips = trips?.filter((t) => t.id !== upcomingTrip?.id) ?? [];

  const countriesCount = new Set(
    trips?.map((t) => t.destination.split(",").pop()?.trim()) ?? []
  ).size;

  const totalSaved =
    trips?.reduce((acc, t) => {
      const saved = (t.budgetTotal ?? 0) - (t.actualSpent ?? 0);
      return acc + (saved > 0 ? saved : 0);
    }, 0) ?? 0;

  const completedCount = trips?.filter((t) => t.status === "completed").length ?? 0;

  const isLoading = trips === undefined;

  if (isLoading) {
    // Let loading.tsx handle skeleton — this won't normally render
    return null;
  }

  const hasTrips = (trips?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-text-primary">
          {greeting},{" "}
          <span className="italic">{firstName}</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {hasTrips
            ? "Here's your travel overview."
            : "Ready to start your next adventure?"}
        </p>
      </div>

      {!hasTrips ? (
        /* ── Empty state ── */
        <div className="relative">
          {/* Decorative geometric shapes */}
          <DecorativeShapes />
          <EmptyState
            icon={Map}
            title="Plan your first European adventure"
            description="Let AI create the perfect budget-friendly itinerary for you in seconds."
            actionLabel="Create Your First Trip"
            actionHref="/trip/new"
          />
        </div>
      ) : (
        <>
          {/* ── Upcoming trip hero ── */}
          {upcomingTrip && (
            <section>
              <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-3">
                Upcoming Trip
              </h2>
              <Link href={`/trip/${upcomingTrip.id}`}>
                <UpcomingHeroCard trip={upcomingTrip} />
              </Link>
            </section>
          )}

          {/* ── Recent trips horizontal scroll ── */}
          {recentTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                  Recent Trips
                </h2>
                <Link
                  href="/trips"
                  className="text-xs text-accent hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {recentTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    className="w-64 min-w-[256px] snap-start"
                  />
                ))}
                {/* Add new trip card */}
                <Link
                  href="/trip/new"
                  className="flex flex-col items-center justify-center w-64 min-w-[256px] snap-start rounded-[8px] border-2 border-dashed border-border-default bg-transparent hover:border-accent hover:bg-accent-muted transition-colors duration-150 h-[216px]"
                >
                  <Plus size={24} className="text-text-tertiary mb-2" />
                  <span className="text-sm text-text-secondary">New trip</span>
                </Link>
              </div>
            </section>
          )}

          {/* ── Quick stats ── */}
          <section>
            <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-3">
              Quick Stats
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={MapPin}
                label="Countries"
                value={countriesCount}
              />
              <StatCard
                icon={PiggyBank}
                label="Saved"
                value={`€${totalSaved.toLocaleString()}`}
              />
              <StatCard
                icon={CheckCircle}
                label="Trips"
                value={completedCount}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ─── Upcoming hero card ────────────────────────────────────────────────────────

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetTotal: number;
  actualSpent: number;
  status: "draft" | "planned" | "active" | "completed";
  tags?: string[];
}

function UpcomingHeroCard({ trip }: { trip: Trip }) {
  const days = daysUntil(trip.startDate);
  const budgetPercent =
    trip.budgetTotal > 0
      ? Math.min((trip.actualSpent / trip.budgetTotal) * 100, 100)
      : 0;

  const countdown =
    days === 0
      ? "Today!"
      : days === 1
      ? "Tomorrow"
      : days > 0
      ? `in ${days} days`
      : `${Math.abs(days)} days ago`;

  return (
    <div
      className={cn(
        "group relative rounded-[8px] border border-border-subtle bg-bg-primary p-5 md:p-6",
        "hover:shadow-md transition-shadow duration-200",
        "border-l-[3px] border-l-accent"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Destination */}
          <p className="font-serif text-3xl md:text-4xl text-text-primary italic truncate">
            {trip.destination}
          </p>
          <p className="text-text-secondary text-sm mt-1 truncate">{trip.title}</p>

          {/* Countdown */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">{countdown}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="shrink-0 text-right">
          <p className="text-xs text-text-tertiary uppercase tracking-wide mb-0.5">
            Dates
          </p>
          <p className="text-sm text-text-primary font-medium">
            {format(new Date(trip.startDate), "d MMM")} –{" "}
            {format(new Date(trip.endDate), "d MMM yyyy")}
          </p>
        </div>
      </div>

      {/* Budget bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-secondary">Budget</span>
          <span className="font-mono text-xs text-text-primary">
            €{trip.actualSpent.toLocaleString()} / €{trip.budgetTotal.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              budgetPercent >= 90
                ? "bg-error"
                : budgetPercent >= 70
                ? "bg-warning"
                : "bg-success"
            )}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {trip.tags && trip.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-bg-secondary text-text-secondary border border-border-subtle capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Decorative shapes ────────────────────────────────────────────────────────

function DecorativeShapes() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
      aria-hidden="true"
    >
      {/* Large circle top-right */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-[0.07]"
        style={{ background: "var(--accent)" }}
      />
      {/* Small circle bottom-left */}
      <div
        className="absolute bottom-8 -left-8 w-40 h-40 rounded-full opacity-[0.05]"
        style={{ background: "var(--accent)" }}
      />
      {/* Diagonal line accent */}
      <svg
        className="absolute top-10 left-1/2 -translate-x-1/2 opacity-[0.06]"
        width="320"
        height="120"
        viewBox="0 0 320 120"
        fill="none"
      >
        <line x1="0" y1="60" x2="320" y2="60" stroke="var(--accent)" strokeWidth="1.5" />
        <line x1="160" y1="0" x2="160" y2="120" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="160" cy="60" r="30" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="160" cy="60" r="55" stroke="var(--accent)" strokeWidth="1" />
      </svg>
    </div>
  );
}
