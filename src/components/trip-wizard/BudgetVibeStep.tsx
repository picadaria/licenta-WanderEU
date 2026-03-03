"use client";

import { Tent, Hotel, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BudgetVibeData {
  budget: number;
  travelStyle: "backpacker" | "mid-range" | "comfortable" | null;
  interests: string[];
  dietaryRestrictions: string[];
}

interface BudgetVibeStepProps {
  data: BudgetVibeData;
  onChange: (data: BudgetVibeData) => void;
}

const INTERESTS = [
  "Museums",
  "Nightlife",
  "Nature",
  "Food & Cuisine",
  "History",
  "Art",
  "Beach",
  "Hiking",
  "Shopping",
  "Photography",
  "Architecture",
  "Live Music",
  "Markets",
  "Wine & Beer",
  "Sports",
];

const DIETARY = [
  "None",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
];

const TRAVEL_STYLES = [
  {
    key: "backpacker" as const,
    label: "Backpacker",
    description: "Hostels, street food, public transport",
    icon: Tent,
  },
  {
    key: "mid-range" as const,
    label: "Mid-Range",
    description: "Private rooms, local restaurants, mixed transport",
    icon: Hotel,
  },
  {
    key: "comfortable" as const,
    label: "Comfortable",
    description: "Hotels, dining out, taxis when needed",
    icon: Star,
  },
];

const BUDGET_MIN = 50;
const BUDGET_MAX = 3000;

interface BudgetSegment {
  label: string;
  percent: number;
  color: string;
  colorHex: string;
}

function getBudgetSegments(budget: number): BudgetSegment[] {
  return [
    { label: "Accommodation", percent: 40, color: "bg-[#3B6EC4]", colorHex: "#3B6EC4" },
    { label: "Transport", percent: 25, color: "bg-[#2D7A4F]", colorHex: "#2D7A4F" },
    { label: "Food", percent: 20, color: "bg-[#C4841D]", colorHex: "#C4841D" },
    { label: "Activities", percent: 15, color: "bg-[#9C6EC4]", colorHex: "#9C6EC4" },
  ].map((seg) => ({
    ...seg,
    amount: Math.round((budget * seg.percent) / 100),
  })) as BudgetSegment[];
}

export function BudgetVibeStep({ data, onChange }: BudgetVibeStepProps) {
  function patchData(patch: Partial<BudgetVibeData>) {
    onChange({ ...data, ...patch });
  }

  function toggleInterest(interest: string) {
    const current = data.interests;
    if (current.includes(interest)) {
      patchData({ interests: current.filter((i) => i !== interest) });
    } else {
      patchData({ interests: [...current, interest] });
    }
  }

  function toggleDietary(item: string) {
    if (item === "None") {
      patchData({ dietaryRestrictions: ["None"] });
      return;
    }
    const current = data.dietaryRestrictions.filter((d) => d !== "None");
    if (current.includes(item)) {
      patchData({ dietaryRestrictions: current.filter((d) => d !== item) });
    } else {
      patchData({ dietaryRestrictions: [...current, item] });
    }
  }

  const segments = getBudgetSegments(data.budget);
  const sliderPercent = ((data.budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

  function handleBudgetInput(val: string) {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const clamped = Math.min(Math.max(num, BUDGET_MIN), BUDGET_MAX);
    patchData({ budget: clamped });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-serif text-2xl text-text-primary mb-1">Budget & Vibe</h2>
        <p className="text-sm text-text-secondary">
          Set your budget and tell us how you like to travel.
        </p>
      </div>

      {/* Budget slider */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Total budget</label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-text-tertiary font-mono">€</span>
            <input
              type="number"
              value={data.budget}
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={10}
              onChange={(e) => handleBudgetInput(e.target.value)}
              className="w-20 text-right text-sm font-mono font-semibold text-text-primary bg-bg-secondary border border-border-default rounded-[6px] px-2 py-1 outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Range slider */}
        <div className="relative pt-1">
          <div className="relative h-2 rounded-full bg-bg-tertiary overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-accent transition-all"
              style={{ width: `${sliderPercent}%` }}
            />
          </div>
          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={10}
            value={data.budget}
            onChange={(e) => patchData({ budget: parseInt(e.target.value, 10) })}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
            style={{ top: "4px" }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-text-tertiary font-mono">€{BUDGET_MIN}</span>
            <span className="text-xs text-text-tertiary font-mono">€{BUDGET_MAX}</span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="flex flex-col gap-2 p-4 bg-bg-secondary rounded-[8px] border border-border-subtle">
          <p className="text-xs font-medium text-text-secondary mb-1">Estimated breakdown</p>
          <div className="flex h-6 rounded-[4px] overflow-hidden gap-[2px]">
            {segments.map((seg) => (
              <div
                key={seg.label}
                className={cn("h-full transition-all duration-300", seg.color)}
                style={{ width: `${seg.percent}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {segments.map((seg) => {
              const amount = Math.round((data.budget * seg.percent) / 100);
              return (
                <div key={seg.label} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.colorHex }}
                    />
                    <span className="text-[10px] text-text-tertiary truncate">{seg.label}</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-text-primary">
                    €{amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Travel style */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-primary">Travel style</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRAVEL_STYLES.map((style) => {
            const Icon = style.icon;
            const selected = data.travelStyle === style.key;
            return (
              <button
                key={style.key}
                type="button"
                onClick={() => patchData({ travelStyle: style.key })}
                className={cn(
                  "p-4 rounded-[8px] cursor-pointer transition-all text-left border",
                  selected
                    ? "border-2 border-accent bg-accent-muted"
                    : "border-border-default hover:border-border-strong bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-[6px] flex items-center justify-center mb-3",
                    selected ? "bg-accent/15" : "bg-bg-secondary"
                  )}
                >
                  <Icon
                    size={16}
                    className={selected ? "text-accent" : "text-text-secondary"}
                  />
                </div>
                <p
                  className={cn(
                    "text-sm font-semibold mb-1",
                    selected ? "text-accent" : "text-text-primary"
                  )}
                >
                  {style.label}
                </p>
                <p className="text-xs text-text-secondary leading-snug">{style.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interests */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-primary">
          What interests you?{" "}
          <span className="text-text-tertiary font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const selected = data.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors border",
                  selected
                    ? "bg-accent text-white border-accent"
                    : "border-border-default text-text-secondary hover:border-accent hover:text-accent bg-white"
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary restrictions */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-primary">
          Dietary restrictions{" "}
          <span className="text-text-tertiary font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map((item) => {
            const selected = data.dietaryRestrictions.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleDietary(item)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors border",
                  selected
                    ? "bg-accent text-white border-accent"
                    : "border-border-default text-text-secondary hover:border-accent hover:text-accent bg-white"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function validateBudgetVibe(data: BudgetVibeData): boolean {
  return (
    data.budget >= 50 &&
    data.budget <= 3000 &&
    data.travelStyle !== null
  );
}
