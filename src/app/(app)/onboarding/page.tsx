"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Tent, Hotel, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden",
];

const TRAVEL_STYLES = [
  {
    id: "backpacker",
    label: "Backpacker",
    subtitle: "Hostels, night trains & street food",
    icon: Tent,
  },
  {
    id: "midrange",
    label: "Mid-Range",
    subtitle: "Comfortable hotels, local restaurants",
    icon: Hotel,
  },
  {
    id: "comfortable",
    label: "Comfortable",
    subtitle: "Quality stays, curated experiences",
    icon: Star,
  },
] as const;

type TravelStyle = (typeof TRAVEL_STYLES)[number]["id"];

const INTERESTS = [
  "museums", "nightlife", "nature", "food", "history",
  "art", "beach", "hiking", "shopping", "photography",
];

const DIETARY = [
  "None", "Vegetarian", "Vegan", "Halal",
  "Kosher", "Gluten-free", "Lactose-free",
];

const TOTAL_STEPS = 4;

// ─── Animation variants ────────────────────────────────────────────────────────

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const };

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — location
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // Step 2 — travel style
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);

  // Step 3 — interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 4 — dietary
  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);

  function goNext() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function toggleDietary(item: string) {
    if (item === "None") {
      setDietaryNeeds(["None"]);
      return;
    }
    setDietaryNeeds((prev) => {
      const withoutNone = prev.filter((d) => d !== "None");
      return withoutNone.includes(item)
        ? withoutNone.filter((d) => d !== item)
        : [...withoutNone, item];
    });
  }

  async function handleFinish() {
    setIsSubmitting(true);
    const comfortMap: Record<string, "budget" | "mid-range" | "comfort"> = {
      backpacker: "budget",
      midrange: "mid-range",
      comfortable: "comfort",
    };
    try {
      await completeOnboarding({
        isStudent: true,
        homeCity: city,
        homeCountry: country,
        currency: "EUR",
        travelPreferences: {
          comfortLevel: comfortMap[travelStyle ?? "midrange"] ?? "budget",
          interests: selectedInterests,
          dietaryRestrictions: dietaryNeeds.filter((d) => d !== "None"),
        },
      });
      router.push("/dashboard");
    } catch {
      setIsSubmitting(false);
    }
  }

  const canProceed =
    (step === 1 && city.trim().length > 0 && country.length > 0) ||
    (step === 2 && travelStyle !== null) ||
    (step === 3 && selectedInterests.length > 0) ||
    step === 4;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Progress bar */}
      <div className="h-0.5 bg-bg-secondary w-full fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
        <span className="font-serif italic text-xl text-text-primary">
          WanderEU
        </span>
        <span className="text-xs text-text-tertiary font-mono">
          {step} / {TOTAL_STEPS}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-hidden">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 1 && (
                <StepLocation
                  city={city}
                  country={country}
                  onCityChange={setCity}
                  onCountryChange={setCountry}
                />
              )}
              {step === 2 && (
                <StepTravelStyle
                  selected={travelStyle}
                  onSelect={setTravelStyle}
                />
              )}
              {step === 3 && (
                <StepInterests
                  selected={selectedInterests}
                  onToggle={toggleInterest}
                />
              )}
              {step === 4 && (
                <StepDietary
                  selected={dietaryNeeds}
                  onToggle={toggleDietary}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-6 pb-8 md:px-10 gap-4">
        <button
          onClick={goBack}
          className={cn(
            "px-5 py-2.5 rounded-[6px] text-sm font-medium text-text-secondary border border-border-default hover:border-border-strong transition-colors duration-150",
            step === 1 && "invisible pointer-events-none"
          )}
        >
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={goNext}
            disabled={!canProceed}
            className="px-6 py-2.5 rounded-[6px] text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-[6px] text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? "Setting up…" : "Start exploring"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

function StepLocation({
  city,
  country,
  onCityChange,
  onCountryChange,
}: {
  city: string;
  country: string;
  onCityChange: (v: string) => void;
  onCountryChange: (v: string) => void;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-2">
        Where are you based?
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        We'll use this to find travel deals close to you.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="city"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide"
          >
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="e.g. Bucharest"
            className="w-full px-3.5 py-2.5 rounded-[6px] border border-border-default bg-bg-primary text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors duration-150"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide"
          >
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[6px] border border-border-default bg-bg-primary text-text-primary text-sm focus:outline-none focus:border-accent transition-colors duration-150 appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select your country
            </option>
            {EU_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepTravelStyle({
  selected,
  onSelect,
}: {
  selected: TravelStyle | null;
  onSelect: (s: TravelStyle) => void;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-2">
        What's your travel style?
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        This helps us tailor budget estimates and accommodation picks.
      </p>

      <div className="space-y-3">
        {TRAVEL_STYLES.map(({ id, label, subtitle, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-[8px] border-2 text-left transition-all duration-150 active:scale-[0.99]",
              selected === id
                ? "border-accent bg-accent-muted"
                : "border-border-default bg-bg-primary hover:border-border-strong"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-[6px] shrink-0",
                selected === id ? "bg-accent text-white" : "bg-bg-secondary text-text-secondary"
              )}
            >
              <Icon size={20} />
            </span>
            <span>
              <span
                className={cn(
                  "block text-sm font-medium",
                  selected === id ? "text-accent" : "text-text-primary"
                )}
              >
                {label}
              </span>
              <span className="block text-xs text-text-secondary mt-0.5">
                {subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInterests({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (interest: string) => void;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-2">
        What do you love?
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Pick as many as you like — we'll factor these into your itinerary.
      </p>

      <div className="flex flex-wrap gap-2.5">
        {INTERESTS.map((interest) => {
          const isActive = selected.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => onToggle(interest)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition-all duration-150 active:scale-[0.97]",
                isActive
                  ? "bg-accent text-white"
                  : "border border-border-default text-text-secondary hover:border-accent hover:text-text-primary bg-bg-primary"
              )}
            >
              {interest}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDietary({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl text-text-primary mb-2">
        Any dietary needs?
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        We'll surface restaurants and food options that work for you.
      </p>

      <div className="flex flex-wrap gap-2.5">
        {DIETARY.map((item) => {
          const isActive = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => onToggle(item)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97]",
                isActive
                  ? "bg-accent text-white"
                  : "border border-border-default text-text-secondary hover:border-accent hover:text-text-primary bg-bg-primary"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
