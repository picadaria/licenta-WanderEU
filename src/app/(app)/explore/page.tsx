"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Search,
  Filter,
  X,
  Star,
  Globe,
  Users,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Static data ─────────────────────────────────────────────────────────────

const POPULAR_DESTINATIONS = [
  { city: "Paris", country: "France", from: 420 },
  { city: "Barcelona", country: "Spain", from: 350 },
  { city: "Amsterdam", country: "Netherlands", from: 380 },
  { city: "Prague", country: "Czech Republic", from: 280 },
  { city: "Lisbon", country: "Portugal", from: 310 },
  { city: "Berlin", country: "Germany", from: 320 },
  { city: "Rome", country: "Italy", from: 390 },
  { city: "Vienna", country: "Austria", from: 340 },
  { city: "Budapest", country: "Hungary", from: 250 },
];

const BUDGET_PICKS = [
  { city: "Budapest", country: "Hungary", from: 250, rating: 4.8 },
  { city: "Prague", country: "Czech Republic", from: 280, rating: 4.7 },
  { city: "Krakow", country: "Poland", from: 220, rating: 4.6 },
  { city: "Bucharest", country: "Romania", from: 180, rating: 4.4 },
  { city: "Sofia", country: "Bulgaria", from: 160, rating: 4.3 },
  { city: "Riga", country: "Latvia", from: 200, rating: 4.5 },
];

const WARM_GRADIENTS = [
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
];

const INTEREST_OPTIONS = [
  "Museums",
  "Nature",
  "Food",
  "Nightlife",
  "Beach",
  "History",
];
const SEASON_OPTIONS = ["Spring", "Summer", "Fall", "Winter"];
const DURATION_OPTIONS = [
  { label: "1–3 days", value: "short" },
  { label: "4–7 days", value: "medium" },
  { label: "7+ days", value: "long" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function gradientForIndex(index: number): string {
  return WARM_GRADIENTS[index % WARM_GRADIENTS.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={11} className="fill-warning text-warning" />
      <span className="font-mono text-xs text-text-secondary">{rating}</span>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface FiltersState {
  budgetMin: string;
  budgetMax: string;
  duration: string;
  interests: string[];
  season: string[];
}

interface FilterSidebarProps {
  filters: FiltersState;
  onChange: (f: FiltersState) => void;
  onClose: () => void;
}

function FilterSidebar({ filters, onChange, onClose }: FilterSidebarProps) {
  const set = <K extends keyof FiltersState>(key: K, val: FiltersState[K]) =>
    onChange({ ...filters, [key]: val });

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const clear = () =>
    onChange({
      budgetMin: "",
      budgetMax: "",
      duration: "",
      interests: [],
      season: [],
    });

  return (
    <aside className="w-64 shrink-0 border-r border-border-subtle p-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto hidden lg:flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-text-primary">Filters</h3>
        <button
          onClick={onClose}
          className="text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close filters"
        >
          <X size={16} />
        </button>
      </div>

      {/* Budget range */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Budget range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min €"
            value={filters.budgetMin}
            onChange={(e) => set("budgetMin", e.target.value)}
            className={cn(
              "w-full h-9 border border-border-default rounded-[6px] px-2.5 text-sm",
              "bg-bg-primary text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted"
            )}
          />
          <span className="text-text-tertiary text-sm shrink-0">–</span>
          <input
            type="number"
            placeholder="Max €"
            value={filters.budgetMax}
            onChange={(e) => set("budgetMax", e.target.value)}
            className={cn(
              "w-full h-9 border border-border-default rounded-[6px] px-2.5 text-sm",
              "bg-bg-primary text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted"
            )}
          />
        </div>
      </div>

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Duration
        </label>
        <div className="flex flex-col gap-1.5">
          {DURATION_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="duration"
                value={opt.value}
                checked={filters.duration === opt.value}
                onChange={() => set("duration", opt.value)}
                className="accent-accent w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
          {filters.duration && (
            <button
              onClick={() => set("duration", "")}
              className="text-xs text-text-tertiary hover:text-accent transition-colors text-left"
            >
              Clear duration
            </button>
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Interests
        </label>
        <div className="flex flex-wrap gap-1.5">
          {INTEREST_OPTIONS.map((interest) => {
            const active = filters.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() =>
                  set("interests", toggleArr(filters.interests, interest))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "border border-border-default text-text-secondary hover:border-accent hover:text-text-primary"
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Season
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SEASON_OPTIONS.map((season) => {
            const active = filters.season.includes(season);
            return (
              <button
                key={season}
                onClick={() =>
                  set("season", toggleArr(filters.season, season))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-accent text-white"
                    : "border border-border-default text-text-secondary hover:border-accent hover:text-text-primary"
                )}
              >
                {season}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <button
          className={cn(
            "w-full h-9 rounded-[6px] bg-accent text-white text-sm font-medium",
            "hover:bg-accent-hover transition-colors"
          )}
        >
          Apply Filters
        </button>
        <button
          onClick={clear}
          className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Clear all
        </button>
      </div>
    </aside>
  );
}

// ─── Community Trip Card ──────────────────────────────────────────────────────

interface CommunityTrip {
  _id: string;
  title: string;
  destination: { city: string; country: string };
  totalDays: number;
  budgetTotal: number;
  description?: string;
  tags?: string[];
}

function CommunityTripCard({
  trip,
  index,
}: {
  trip: CommunityTrip;
  index: number;
}) {
  return (
    <div className="flex flex-col rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary hover:shadow-md transition-shadow">
      {/* Gradient cover */}
      <div
        className="h-28 w-full relative"
        style={{ background: gradientForIndex(index + 3) }}
      >
        <div className="absolute top-2.5 right-2.5">
          <span className="flex items-center gap-1 text-[10px] bg-black/25 text-white backdrop-blur rounded-full px-2 py-0.5">
            <Users size={9} />
            Community
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <p className="font-medium text-sm text-text-primary truncate">
          {trip.title}
        </p>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <MapPin size={11} />
          <span>
            {trip.destination.city}, {trip.destination.country}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-mono text-xs text-accent">
            €{trip.budgetTotal.toLocaleString()}
          </span>
          <span className="text-xs text-text-tertiary">
            {trip.totalDays} day{trip.totalDays !== 1 ? "s" : ""}
          </span>
        </div>
        {trip.description && (
          <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">
            {trip.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    budgetMin: "",
    budgetMax: "",
    duration: "",
    interests: [],
    season: [],
  });

  const publicTrips = useQuery(api.trips.listPublic, { limit: 6 });

  const filteredDestinations = useMemo(() => {
    if (!search.trim()) return POPULAR_DESTINATIONS;
    const q = search.toLowerCase();
    return POPULAR_DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Filter sidebar */}
      {showFilters && (
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 text-center pt-4">
          <div className="flex items-center gap-2 text-accent text-sm font-medium">
            <Globe size={16} />
            <span>EU Student Travel Planner</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary">
            Discover Your Next Destination
          </h1>
          <p className="text-text-secondary text-base max-w-md">
            Find budget-friendly destinations across Europe, tailored for
            students.
          </p>
          {/* Search */}
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cities, countries..."
              className={cn(
                "w-full h-14 pl-12 pr-4 text-base rounded-[8px]",
                "border border-border-default bg-bg-primary",
                "text-text-primary placeholder:text-text-tertiary",
                "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
                "shadow-sm transition-colors"
              )}
            />
            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5",
                "border rounded-[6px] text-sm text-text-secondary transition-colors lg:hidden",
                showFilters
                  ? "border-accent text-accent"
                  : "border-border-default hover:border-accent"
              )}
            >
              <Filter size={14} />
              Filters
            </button>
          </div>
          {/* Filter toggle desktop */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "hidden lg:flex items-center gap-2 px-3 py-1.5 border rounded-[6px] text-sm transition-colors",
              showFilters
                ? "border-accent text-accent bg-accent-muted"
                : "border-border-default text-text-secondary hover:border-accent"
            )}
          >
            <Filter size={14} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl text-text-primary">
              Popular Destinations
            </h2>
            {search && filteredDestinations.length === 0 && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
              <Search size={32} className="text-text-tertiary" />
              <p className="text-text-secondary">
                No destinations found for &ldquo;{search}&rdquo;
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-sm text-accent hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.map((dest, idx) => (
                <div
                  key={dest.city}
                  className="relative h-[200px] rounded-[8px] overflow-hidden cursor-pointer group"
                  style={{ background: gradientForIndex(idx) }}
                >
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  {/* Scale on hover */}
                  <div
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ background: gradientForIndex(idx) }}
                    aria-hidden
                  />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-lg leading-tight">
                          {dest.city}
                        </p>
                        <p className="text-white/80 text-sm">{dest.country}</p>
                      </div>
                      <span className="font-mono bg-white/20 backdrop-blur rounded px-2 py-0.5 text-white text-xs shrink-0">
                        From €{dest.from}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Budget-Friendly Picks */}
        <section>
          <h2 className="font-serif text-2xl text-text-primary mb-5">
            Budget-Friendly Picks
          </h2>
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 -mx-1 px-1">
            {BUDGET_PICKS.map((pick, idx) => (
              <div
                key={pick.city}
                className="w-48 flex-shrink-0 snap-start flex flex-col rounded-[8px] border border-border-subtle overflow-hidden bg-bg-primary hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Mini gradient cover */}
                <div
                  className="h-24 w-full"
                  style={{ background: gradientForIndex(idx + 5) }}
                />
                <div className="p-3 flex flex-col gap-1.5">
                  <p className="font-semibold text-sm text-text-primary">
                    {pick.city}
                  </p>
                  <p className="text-xs text-text-secondary">{pick.country}</p>
                  <span className="font-mono text-sm text-accent font-medium">
                    From €{pick.from}
                  </span>
                  <StarRating rating={pick.rating} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Trips */}
        <section>
          <h2 className="font-serif text-2xl text-text-primary mb-5">
            Community Trips
          </h2>

          {publicTrips === undefined ? (
            // Loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-[8px] border border-border-subtle overflow-hidden animate-pulse"
                >
                  <div className="h-28 bg-bg-tertiary" />
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="h-4 bg-bg-tertiary rounded w-3/4" />
                    <div className="h-3 bg-bg-tertiary rounded w-1/2" />
                    <div className="h-3 bg-bg-tertiary rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : publicTrips.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center border border-dashed border-border-default rounded-[8px]">
              <Globe size={32} className="text-text-tertiary" />
              <p className="font-serif text-lg text-text-primary">
                No community trips yet
              </p>
              <p className="text-text-secondary text-sm max-w-xs">
                Be the first to share your trip with the WanderEU community by
                making a trip public.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(publicTrips as CommunityTrip[]).map((trip: CommunityTrip, idx: number) => (
                <CommunityTripCard
                  key={trip._id}
                  trip={{
                    _id: trip._id,
                    title: trip.title,
                    destination: trip.destination,
                    totalDays: trip.totalDays,
                    budgetTotal: trip.budgetTotal,
                    description: trip.description,
                    tags: trip.tags,
                  }}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
