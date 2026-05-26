"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TripCard } from "@/components/shared/TripCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Map } from "lucide-react";

type TripStatus = "draft" | "planned" | "active" | "completed";

interface RawTrip {
  _id: string;
  id?: string;
  title: string;
  destination: { city: string; country: string } | string;
  startDate: string;
  endDate: string;
  budgetTotal: number;
  actualSpent: number;
  status: TripStatus;
  tags?: string[];
}

export default function TripsPage() {
  const result = useQuery(api.trips.listByUser, {});
  const rawTrips = result?.trips as RawTrip[] | undefined;

  const trips = rawTrips?.map((t) => ({
    ...t,
    id: t._id,
    destination:
      typeof t.destination === "object"
        ? `${t.destination.city}, ${t.destination.country}`
        : t.destination,
  }));

  if (trips === undefined) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-text-primary">All Trips</h1>
        <Link
          href="/trip/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={15} />
          New trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No trips yet"
          description="Create your first trip and let AI plan it for you."
          actionLabel="Create Your First Trip"
          actionHref="/trip/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
