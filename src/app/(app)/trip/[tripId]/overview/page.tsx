"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Play, Share2, Download, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PIE_COLORS = ["#E8553A", "#C4841D", "#2D7A4F", "#3B6EC4", "#9C9C93"];

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transport",
  accommodation: "Accommodation",
  food: "Food",
  activities: "Activities",
  other: "Other",
};

export default function OverviewPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });
  const activities = useQuery(api.activities.listByTrip, { tripId });
  const updateStatus = useMutation(api.trips.updateStatus);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [mapError, setMapError] = useState(false);
  const [startingTrip, setStartingTrip] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Init Mapbox ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!trip || !activities || mapInstanceRef.current || !mapRef.current) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMapError(true);
      return;
    }

    let map: unknown = null;

    async function initMap() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;

        (mapboxgl as { accessToken: string }).accessToken = token!;

        type ActWithLocation = { location?: { lat?: number; lng?: number }; title: string };
        const allLocations = (activities as ActWithLocation[] ?? [])
          .filter((a) => a.location?.lat && a.location?.lng)
          .map((a) => ({
            lng: a.location!.lng as number,
            lat: a.location!.lat as number,
            title: a.title,
          }));

        const centerLng = trip!.destination.lng;
        const centerLat = trip!.destination.lat;

        type MapboxMap = {
          on: (event: string, cb: () => void) => void;
          remove: () => void;
        };
        type MapboxMarker = {
          setLngLat: (coords: [number, number]) => MapboxMarker;
          addTo: (map: MapboxMap) => MapboxMarker;
        };
        type MapboxPopup = {
          setHTML: (html: string) => MapboxPopup;
          offset?: number;
        };

        const mapInstance = new (
          mapboxgl as unknown as {
            Map: new (opts: object) => MapboxMap;
          }
        ).Map({
          container: mapRef.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [centerLng, centerLat],
          zoom: allLocations.length > 0 ? 11 : 12,
        });

        mapInstanceRef.current = mapInstance;
        map = mapInstance;

        mapInstance.on("load", () => {
          allLocations.forEach(({ lng, lat, title }: { lng: number; lat: number; title: string }) => {
            const el = document.createElement("div");
            el.className =
              "w-3 h-3 rounded-full bg-accent border-2 border-white shadow";

            const popup = new (
              mapboxgl as unknown as { Popup: new (opts: object) => MapboxPopup }
            ).Popup({ offset: 16 }).setHTML(
              `<span style="font-size:12px;font-family:sans-serif">${title}</span>`
            );

            new (
              mapboxgl as unknown as { Marker: new (el: HTMLElement) => MapboxMarker }
            ).Marker(el)
              .setLngLat([lng, lat])
              .addTo(mapInstance);
          });
        });
      } catch {
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (map && (map as { remove?: () => void }).remove) {
        (map as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip, activities]);

  async function handleStartTrip() {
    if (!trip) return;
    setStartingTrip(true);
    try {
      await updateStatus({ tripId, status: "active" });
      router.push(`/trip/${tripId}/live`);
    } catch {
      setStartingTrip(false);
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/trip/${tripId}/share`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (!trip || !activities) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton height={120} borderRadius={8} />
        <Skeleton height={300} borderRadius={8} />
        <Skeleton height={220} borderRadius={8} />
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────
  const totalDays = trip.totalDays;
  const budgetPct =
    trip.budgetTotal > 0
      ? Math.min((trip.actualSpent / trip.budgetTotal) * 100, 100)
      : 0;

  const pieData = Object.entries(trip.budgetBreakdown as Record<string, number>)
    .filter(([, v]) => (v as number) > 0)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key] ?? key,
      value: value as number,
    }));

  const startStr = trip.startDate
    ? format(new Date(trip.startDate), "d MMM yyyy")
    : "—";
  const endStr = trip.endDate
    ? format(new Date(trip.endDate), "d MMM yyyy")
    : "—";

  const daysUntil =
    trip.startDate && trip.status === "planned"
      ? differenceInDays(new Date(trip.startDate), new Date())
      : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Hero Summary Card ───────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
              Destination
            </span>
            <p className="font-serif text-2xl text-text-primary">
              {trip.destination.city}, {trip.destination.country}
            </p>
            <p className="text-sm text-text-secondary">
              {startStr} – {endStr} · {totalDays}{" "}
              {totalDays === 1 ? "day" : "days"}
            </p>
            {daysUntil !== null && daysUntil > 0 && (
              <p className="text-xs text-[#3B6EC4] font-medium mt-0.5">
                {daysUntil} days until departure
              </p>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
              Total Budget
            </span>
            <span className="font-mono text-4xl text-accent font-medium">
              €{trip.budgetTotal.toLocaleString()}
            </span>
            <span className="text-sm text-text-secondary font-mono">
              €{trip.actualSpent.toLocaleString()} spent
            </span>
          </div>
        </div>

        {/* Budget bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>Budget used</span>
            <span className="font-mono">{budgetPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                budgetPct >= 90
                  ? "bg-error"
                  : budgetPct >= 70
                    ? "bg-warning"
                    : "bg-success"
              )}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {trip.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {(trip.tags as string[]).map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-bg-secondary text-text-secondary border border-border-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Map Section ─────────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
          <MapPin size={14} className="text-text-tertiary" />
          <span className="text-sm font-medium text-text-primary">
            Trip Map
          </span>
          <span className="text-xs text-text-tertiary ml-auto">
            {activities.filter((a: { location?: { lat?: number } }) => a.location?.lat).length} locations
          </span>
        </div>

        {mapError ? (
          <div className="h-[280px] md:h-[400px] bg-bg-secondary flex flex-col items-center justify-center gap-3 text-text-tertiary">
            <MapPin size={32} className="opacity-40" />
            <div className="text-center">
              <p className="text-sm font-medium text-text-secondary">
                Map preview
              </p>
              <p className="text-xs mt-0.5">
                Add NEXT_PUBLIC_MAPBOX_TOKEN to enable maps
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={mapRef}
            className="h-[280px] md:h-[400px] w-full bg-bg-secondary"
          />
        )}
      </div>

      {/* ── Budget Breakdown Pie ─────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-5">
        <h2 className="text-sm font-medium text-text-primary mb-4">
          Budget Breakdown
        </h2>

        {pieData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-text-tertiary text-sm">
            No budget data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`€${Number(value).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend
                formatter={(value, entry) => (
                  <span className="text-xs text-text-secondary">
                    {value} — €
                    {(
                      (entry.payload as { value: number }).value ?? 0
                    ).toLocaleString()}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {trip.status !== "active" && trip.status !== "completed" && (
          <button
            onClick={handleStartTrip}
            disabled={startingTrip}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-[8px] border transition-colors",
              "bg-accent border-accent text-white hover:bg-accent-hover",
              "disabled:opacity-60"
            )}
          >
            <Play size={18} />
            <span className="text-xs font-medium">
              {startingTrip ? "Starting…" : "Start Trip"}
            </span>
          </button>
        )}

        {trip.status === "active" && (
          <button
            onClick={() => router.push(`/trip/${tripId}/live`)}
            className="flex flex-col items-center gap-2 p-4 rounded-[8px] border bg-success border-success text-white hover:opacity-90 transition-opacity"
          >
            <Play size={18} />
            <span className="text-xs font-medium">Live Mode</span>
          </button>
        )}

        <button
          onClick={handleShare}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-[8px] border transition-colors",
            "bg-bg-primary border-border-default text-text-primary hover:bg-bg-secondary"
          )}
        >
          <Share2 size={18} className="text-text-secondary" />
          <span className="text-xs font-medium">
            {copied ? "Copied!" : "Share"}
          </span>
        </button>

        <button
          onClick={() => window.print()}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-[8px] border transition-colors",
            "bg-bg-primary border-border-default text-text-primary hover:bg-bg-secondary"
          )}
        >
          <Download size={18} className="text-text-secondary" />
          <span className="text-xs font-medium">Download PDF</span>
        </button>
      </div>
    </div>
  );
}
