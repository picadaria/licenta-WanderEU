"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Shirt,
  Droplets,
  Laptop,
  Package,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Packing List Definition ────────────────────────────────────────────────────
interface PackingItem {
  id: string;
  label: string;
  essential?: boolean;
}

interface PackingCategory {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: PackingItem[];
}

function buildPackingList(totalDays: number): PackingCategory[] {
  const clothingCount = Math.min(totalDays, 7);
  const clothingItems: PackingItem[] = [
    { id: "tops", label: `T-shirts / tops (${clothingCount})`, essential: true },
    { id: "bottoms", label: `Bottoms – trousers/jeans (${Math.ceil(clothingCount / 2)})`, essential: true },
    { id: "underwear", label: `Underwear (${clothingCount + 1})`, essential: true },
    { id: "socks", label: `Socks (${clothingCount + 1})`, essential: true },
    { id: "shoes-walking", label: "Comfortable walking shoes", essential: true },
    { id: "shoes-casual", label: "Casual/evening shoes" },
    { id: "jacket", label: "Light jacket or hoodie", essential: true },
    { id: "raincoat", label: "Rain jacket / umbrella" },
    { id: "pyjamas", label: "Pyjamas / sleepwear" },
    { id: "swimwear", label: "Swimwear (if applicable)" },
  ];

  return [
    {
      key: "documents",
      label: "Documents & Money",
      icon: FileText,
      items: [
        { id: "passport", label: "Passport / National ID", essential: true },
        { id: "isic", label: "ISIC student card", essential: true },
        { id: "insurance", label: "Travel insurance documents", essential: true },
        { id: "tickets", label: "Flight/train tickets (print or app)", essential: true },
        { id: "hotel-confirm", label: "Hotel/hostel confirmations", essential: true },
        { id: "cash", label: "Cash (local currency)", essential: true },
        { id: "credit-card", label: "Credit/debit card", essential: true },
        { id: "visa", label: "Visa (if required)" },
        { id: "emergency-contacts", label: "Emergency contact list" },
        { id: "health-card", label: "European Health Insurance Card (EHIC)" },
      ],
    },
    {
      key: "clothing",
      label: "Clothing",
      icon: Shirt,
      items: clothingItems,
    },
    {
      key: "toiletries",
      label: "Toiletries",
      icon: Droplets,
      items: [
        { id: "toothbrush", label: "Toothbrush & toothpaste", essential: true },
        { id: "shampoo", label: "Shampoo / conditioner" },
        { id: "deodorant", label: "Deodorant", essential: true },
        { id: "soap", label: "Soap / body wash" },
        { id: "sunscreen", label: "Sunscreen" },
        { id: "razor", label: "Razor" },
        { id: "medications", label: "Prescription medications", essential: true },
        { id: "pain-killers", label: "Pain killers / ibuprofen" },
        { id: "plasters", label: "Plasters / band-aids" },
        { id: "hand-sanitiser", label: "Hand sanitiser" },
        { id: "tissues", label: "Travel tissues" },
      ],
    },
    {
      key: "tech",
      label: "Tech & Gadgets",
      icon: Laptop,
      items: [
        { id: "phone", label: "Phone", essential: true },
        { id: "charger", label: "Phone charger & cable", essential: true },
        { id: "power-adapter", label: `EU power adapter`, essential: true },
        { id: "power-bank", label: "Portable power bank", essential: true },
        { id: "earbuds", label: "Earbuds / headphones" },
        { id: "camera", label: "Camera (if not using phone)" },
        { id: "laptop", label: "Laptop (if needed)" },
        { id: "laptop-charger", label: "Laptop charger" },
        { id: "sd-card", label: "SD card / extra storage" },
      ],
    },
    {
      key: "other",
      label: "Other Essentials",
      icon: Package,
      items: [
        { id: "backpack", label: "Day backpack", essential: true },
        { id: "luggage-lock", label: "Luggage lock" },
        { id: "water-bottle", label: "Reusable water bottle" },
        { id: "guidebook", label: "Guidebook / maps" },
        { id: "snacks", label: "Travel snacks" },
        { id: "neck-pillow", label: "Travel neck pillow (long journeys)" },
        { id: "eye-mask", label: "Eye mask & earplugs" },
        { id: "laundry-bag", label: "Laundry bag" },
        { id: "shopping-bag", label: "Reusable shopping bag" },
        { id: "pen", label: "Pen (for customs forms)" },
      ],
    },
  ];
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PackingPage() {
  const params = useParams();
  const tripId = params.tripId as Id<"trips">;

  const trip = useQuery(api.trips.getById, { tripId });

  const storageKey = `packing-${tripId}`;

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  const categories = trip
    ? buildPackingList(trip.totalDays)
    : buildPackingList(7);

  const allItems = categories.flatMap((c) => c.items);
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => checkedIds.has(i.id)).length;
  const progressPct =
    totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setCheckedIds(new Set(parsed));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist to localStorage on change
  const toggleItem = useCallback(
    (id: string) => {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [storageKey]
  );

  function handleReset() {
    setCheckedIds(new Set());
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-bg-secondary rounded-[6px]" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-bg-secondary rounded-[8px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── Progress header ──────────────────────────────────── */}
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-primary">
            {checkedCount}/{totalCount} items packed
          </p>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border border-border-default text-xs text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <RotateCcw size={11} />
            Reset all
          </button>
        </div>
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressPct >= 90
                ? "bg-success"
                : progressPct >= 50
                  ? "bg-warning"
                  : "bg-accent"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {progressPct === 100 && (
          <p className="text-xs text-success font-medium mt-2">
            All packed! You're ready to go.
          </p>
        )}
      </div>

      {/* ── Packing categories ───────────────────────────────── */}
      {categories.map((category) => {
        const Icon = category.icon;
        const catChecked = category.items.filter((i) =>
          checkedIds.has(i.id)
        ).length;

        return (
          <div
            key={category.key}
            className="rounded-[8px] border border-border-subtle bg-bg-primary overflow-hidden"
          >
            {/* Category header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-text-tertiary" />
                <h3 className="text-sm font-semibold text-text-primary">
                  {category.label}
                </h3>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  catChecked === category.items.length
                    ? "bg-success-muted text-success"
                    : "bg-bg-secondary text-text-tertiary"
                )}
              >
                {catChecked}/{category.items.length}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border-subtle">
              {category.items.map((item) => {
                const checked = checkedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-bg-secondary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 rounded border-border-default accent-accent cursor-pointer"
                    />
                    <span
                      className={cn(
                        "text-sm flex-1 transition-colors",
                        checked
                          ? "line-through text-text-tertiary"
                          : "text-text-primary"
                      )}
                    >
                      {item.label}
                      {item.essential && !checked && (
                        <span className="ml-1.5 text-[10px] font-medium text-accent align-middle">
                          essential
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
