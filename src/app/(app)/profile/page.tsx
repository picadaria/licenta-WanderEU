"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  MapPin,
  Globe,
  PiggyBank,
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InterestTags } from "@/components/shared/InterestTags";

// ─── Constants ────────────────────────────────────────────────────────────────

const COMFORT_LEVELS = [
  {
    id: "budget" as const,
    label: "Backpacker",
    emoji: "🎒",
    desc: "Hostels, street food, free activities",
  },
  {
    id: "mid-range" as const,
    label: "Mid-Range",
    emoji: "🏨",
    desc: "Budget hotels, local restaurants",
  },
  {
    id: "comfort" as const,
    label: "Comfortable",
    emoji: "✨",
    desc: "Nice hotels, experiences worth paying for",
  },
];

const INTEREST_OPTIONS = [
  "Museums",
  "Nature",
  "Food",
  "Nightlife",
  "Beach",
  "History",
  "Architecture",
  "Markets",
  "Hiking",
  "Art",
  "Sports",
  "Festivals",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Halal",
  "Kosher",
  "Dairy-free",
  "Nut-free",
  "No restrictions",
];

const CURRENCIES = [
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "SEK", label: "Swedish Krona (SEK)" },
  { code: "NOK", label: "Norwegian Krone (NOK)" },
  { code: "DKK", label: "Danish Krone (DKK)" },
  { code: "PLN", label: "Polish Zloty (PLN)" },
  { code: "CZK", label: "Czech Koruna (CZK)" },
  { code: "HUF", label: "Hungarian Forint (HUF)" },
  { code: "RON", label: "Romanian Leu (RON)" },
];

type ComfortLevel = "budget" | "mid-range" | "comfort";

// ─── Input component ─────────────────────────────────────────────────────────

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 border border-border-default rounded-[6px] px-3 text-sm",
          "bg-bg-primary text-text-primary placeholder:text-text-tertiary",
          "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
          "transition-colors"
        )}
      />
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-muted",
        enabled ? "bg-accent" : "bg-bg-tertiary border border-border-default"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200",
          enabled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-b border-border-subtle pb-8 mb-8 last:border-b-0 last:mb-0 last:pb-0",
        className
      )}
    >
      <h2 className="font-serif text-xl text-text-primary mb-5">{title}</h2>
      {children}
    </section>
  );
}

// ─── Delete account dialog ────────────────────────────────────────────────────

function DeleteAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-bg-primary rounded-[8px] border border-border-default shadow-lg p-6 w-full max-w-md flex flex-col gap-4">
        <div className="flex items-center gap-3 text-error">
          <AlertCircle size={24} />
          <h3 className="font-serif text-lg">Delete Account?</h3>
        </div>
        <p className="text-sm text-text-secondary">
          This will permanently delete your account, all trips, and associated
          data. This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className={cn(
              "flex-1 h-10 rounded-[6px] border border-border-default text-sm text-text-secondary",
              "hover:border-border-strong hover:text-text-primary transition-colors"
            )}
          >
            Cancel
          </button>
          <button
            className={cn(
              "flex-1 h-10 rounded-[6px] bg-error text-white text-sm font-medium",
              "hover:bg-[#a83325] transition-colors"
            )}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser, {});
  const userTrips = useQuery(api.trips.listByUser, {});
  const updateUser = useMutation(api.users.updateUser);

  // Preferences state
  const [homeCity, setHomeCity] = useState("");
  const [homeCountry, setHomeCountry] = useState("");
  const [comfortLevel, setComfortLevel] = useState<ComfortLevel>("mid-range");
  const [interests, setInterests] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Student verification
  const [isicNumber, setIsicNumber] = useState("");

  // Notification toggles
  const [notifTripReminders, setNotifTripReminders] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(false);
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(true);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Populate from Convex
  useEffect(() => {
    if (!convexUser) return;
    if (convexUser.homeCity) setHomeCity(convexUser.homeCity);
    if (convexUser.homeCountry) setHomeCountry(convexUser.homeCountry);
    if (convexUser.currency) setCurrency(convexUser.currency);
    if (convexUser.travelPreferences) {
      setComfortLevel(convexUser.travelPreferences.comfortLevel);
      setInterests(convexUser.travelPreferences.interests);
      setDietary(convexUser.travelPreferences.dietaryRestrictions);
    }
  }, [convexUser]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        homeCity,
        homeCountry,
        currency,
        travelPreferences: {
          comfortLevel,
          interests,
          dietaryRestrictions: dietary,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  type TripEntry = {
    _id: string;
    destination: { city: string; country: string };
    budgetTotal: number;
    actualSpent: number;
    status: string;
    title: string;
    totalDays: number;
    tags?: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trips: TripEntry[] = (userTrips?.trips ?? []) as any;
  const uniqueCountries = new Set(trips.map((t: TripEntry) => t.destination.country)).size;
  const totalTrips = trips.length;
  const totalSaved = trips.reduce((acc: number, t: TripEntry) => {
    const saved = t.budgetTotal - t.actualSpent;
    return saved > 0 ? acc + saved : acc;
  }, 0);

  const completedTrips = trips.filter((t: TripEntry) => t.status === "completed");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-border-default border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DeleteAccountDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* ── User Info ── */}
        <Section title="Profile">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              {clerkUser?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName ?? "User"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-border-subtle"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-accent-muted flex items-center justify-center border-2 border-border-subtle">
                  <User size={28} className="text-accent" />
                </div>
              )}
            </div>
            {/* Name / email */}
            <div className="flex flex-col gap-0.5">
              <h1 className="font-serif text-2xl text-text-primary">
                {clerkUser?.fullName ?? "Your Name"}
              </h1>
              <p className="text-text-secondary text-sm">
                {clerkUser?.primaryEmailAddress?.emailAddress}
              </p>
              {convexUser?.isStudent && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs text-success bg-success-muted border border-success/20 rounded-full px-2.5 py-0.5 w-fit">
                  <CheckCircle size={11} />
                  Student Verified
                </span>
              )}
            </div>
            {/* Edit profile link */}
            <a
              href="/user-profile"
              className={cn(
                "ml-auto flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-border-default",
                "text-sm text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors"
              )}
            >
              Edit Profile
              <ChevronRight size={14} />
            </a>
          </div>
        </Section>

        {/* ── Travel Preferences ── */}
        <Section title="Travel Preferences">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Home City"
                value={homeCity}
                onChange={setHomeCity}
                placeholder="e.g. Berlin"
              />
              <FormInput
                label="Home Country"
                value={homeCountry}
                onChange={setHomeCountry}
                placeholder="e.g. Germany"
              />
            </div>

            {/* Comfort level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Comfort Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {COMFORT_LEVELS.map((level) => {
                  const active = comfortLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setComfortLevel(level.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-[8px] border text-center transition-all",
                        active
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border-default text-text-secondary hover:border-border-strong"
                      )}
                    >
                      <span className="text-xl">{level.emoji}</span>
                      <span className="text-xs font-medium">{level.label}</span>
                      <span className="text-[10px] text-text-tertiary leading-tight">
                        {level.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Interests
              </label>
              <InterestTags
                options={INTEREST_OPTIONS}
                selected={interests}
                onChange={setInterests}
              />
            </div>

            {/* Dietary */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Dietary Restrictions
              </label>
              <InterestTags
                options={DIETARY_OPTIONS}
                selected={dietary}
                onChange={setDietary}
              />
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "px-5 h-10 rounded-[6px] bg-accent text-white text-sm font-medium",
                  "hover:bg-accent-hover transition-colors",
                  isSaving && "opacity-60 cursor-not-allowed"
                )}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle size={15} />
                  Saved!
                </span>
              )}
            </div>
          </div>
        </Section>

        {/* ── Travel Stats ── */}
        <Section title="Travel Stats">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: MapPin,
                label: "Countries Visited",
                value: uniqueCountries,
              },
              { icon: Globe, label: "Total Trips", value: totalTrips },
              {
                icon: PiggyBank,
                label: "Total Saved",
                value: `€${totalSaved.toLocaleString()}`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-3 p-4 rounded-[8px] border border-border-subtle bg-bg-primary"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-[6px] bg-accent-muted">
                  <stat.icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-semibold text-text-primary leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-text-secondary">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Student Verification ── */}
        <Section title="Student Verification">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {convexUser?.isStudent ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-success bg-success-muted border border-success/20 rounded-full px-3 py-1">
                  <CheckCircle size={14} />
                  Verified Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary bg-bg-secondary border border-border-default rounded-full px-3 py-1">
                  <Shield size={14} />
                  Not Verified
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              Student verification unlocks exclusive discounts at museums,
              transport, and more.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={isicNumber}
                onChange={(e) => setIsicNumber(e.target.value)}
                placeholder="ISIC Card Number"
                className={cn(
                  "flex-1 h-10 border border-border-default rounded-[6px] px-3 text-sm",
                  "bg-bg-primary text-text-primary placeholder:text-text-tertiary",
                  "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
                  "transition-colors"
                )}
              />
              <button
                disabled={!isicNumber.trim()}
                className={cn(
                  "px-4 h-10 rounded-[6px] bg-accent text-white text-sm font-medium",
                  "hover:bg-accent-hover transition-colors",
                  !isicNumber.trim() && "opacity-40 cursor-not-allowed"
                )}
              >
                Verify
              </button>
            </div>
          </div>
        </Section>

        {/* ── Past Trips ── */}
        {completedTrips.length > 0 && (
          <Section title="Past Trips">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {completedTrips.slice(0, 6).map((trip: TripEntry, idx: number) => {
                const gradients = [
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
                ];
                return (
                  <div
                    key={trip._id}
                    className="flex flex-col rounded-[8px] border border-border-subtle overflow-hidden"
                  >
                    <div
                      className="h-24 w-full relative"
                      style={{
                        background: gradients[idx % gradients.length],
                      }}
                    >
                      <span className="absolute top-2 right-2 text-[10px] bg-black/25 text-white backdrop-blur rounded-full px-2 py-0.5">
                        Completed
                      </span>
                    </div>
                    <div className="p-3 flex flex-col gap-1">
                      <p className="font-medium text-sm text-text-primary truncate">
                        {trip.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {trip.destination.city}, {trip.destination.country}
                      </p>
                      <p className="font-mono text-xs text-accent">
                        €{trip.budgetTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {completedTrips.length > 6 && (
              <a
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                View All Trips
                <ChevronRight size={14} />
              </a>
            )}
          </Section>
        )}

        {/* ── Settings ── */}
        <Section title="Settings">
          <div className="flex flex-col gap-6">
            {/* Notifications */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Bell size={15} />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              {[
                {
                  label: "Trip reminders",
                  desc: "Get notified before your trips",
                  value: notifTripReminders,
                  onChange: setNotifTripReminders,
                },
                {
                  label: "Weekly digest",
                  desc: "Weekly summary of travel deals",
                  value: notifWeeklyDigest,
                  onChange: setNotifWeeklyDigest,
                },
                {
                  label: "Budget alerts",
                  desc: "Alert when you approach your budget",
                  value: notifBudgetAlerts,
                  onChange: setNotifBudgetAlerts,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-tertiary">{item.desc}</p>
                  </div>
                  <Toggle enabled={item.value} onChange={item.onChange} />
                </div>
              ))}
            </div>

            {/* Currency */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={cn(
                  "h-10 border border-border-default rounded-[6px] px-3 text-sm",
                  "bg-bg-primary text-text-primary",
                  "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted",
                  "transition-colors"
                )}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-border-subtle flex flex-col gap-3">
              <p className="text-sm font-medium text-error">Danger Zone</p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className={cn(
                  "flex items-center gap-2 px-4 h-10 rounded-[6px] border border-error/30 text-error text-sm",
                  "hover:bg-error/5 transition-colors w-fit"
                )}
              >
                <Trash2 size={15} />
                Delete Account
              </button>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
