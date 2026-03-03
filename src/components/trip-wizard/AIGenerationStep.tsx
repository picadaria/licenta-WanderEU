"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Hotel,
  MapPin,
  PiggyBank,
  Sparkles,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { cn } from "@/lib/utils";
import type { WhereWhenData } from "./WhereWhenStep";
import type { BudgetVibeData } from "./BudgetVibeStep";
import { differenceInDays, parseISO } from "date-fns";

export interface GenerationResult {
  tripId: string;
  title: string;
  description: string;
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
  };
  tips: string[];
  days: GeneratedDay[];
}

export interface GeneratedDay {
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
  dailyBudget: number;
  activities: GeneratedActivity[];
}

export interface GeneratedActivity {
  type: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  estimatedCost: number;
  location?: { name: string; address?: string };
  notes?: string;
}

interface AIGenerationStepProps {
  whereWhen: WhereWhenData;
  budgetVibe: BudgetVibeData;
  onSuccess: (result: GenerationResult) => void;
  onError?: (error: string) => void;
}

interface ProgressStep {
  icon: React.ElementType;
  label: string;
  delay: number;
}

const PROGRESS_STEPS: ProgressStep[] = [
  { icon: Search, label: "Finding the best routes...", delay: 2000 },
  { icon: Hotel, label: "Searching for accommodation...", delay: 2000 },
  { icon: MapPin, label: "Building your itinerary...", delay: 3000 },
  { icon: PiggyBank, label: "Optimizing for your budget...", delay: 2000 },
  { icon: Sparkles, label: "Adding the finishing touches...", delay: 1000 },
];

// Map wizard travel style to Convex comfort level
function mapTravelStyle(
  style: "backpacker" | "mid-range" | "comfortable" | null
): "budget" | "mid-range" | "comfort" {
  switch (style) {
    case "backpacker":
      return "budget";
    case "comfortable":
      return "comfort";
    default:
      return "mid-range";
  }
}

function FloatingDots() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-accent/10"
          style={{
            width: `${(i % 3) * 2 + 3}px`,
            height: `${(i % 3) * 2 + 3}px`,
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 29 + 17) % 100}%`,
            animation: `float-dot ${4 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 4}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-dot {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.35; }
          50% { transform: translateY(-18px) scale(1.15); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

export function AIGenerationStep({
  whereWhen,
  budgetVibe,
  onSuccess,
  onError,
}: AIGenerationStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [status, setStatus] = useState<"running" | "success" | "error">("running");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedTripId, setGeneratedTripId] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // After we have a tripId, query for the trip data, days, and activities
  const tripData = useQuery(
    api.trips.getById,
    generatedTripId ? { tripId: generatedTripId as never } : "skip"
  );

  const tripDays = useQuery(
    api.tripDays.listByTrip,
    generatedTripId ? { tripId: generatedTripId as never } : "skip"
  );

  const tripActivities = useQuery(
    api.activities.listByTrip,
    generatedTripId ? { tripId: generatedTripId as never } : "skip"
  );

  const generateTrip = useAction(api.ai.generateTrip.generateTrip);

  // Once trip data is loaded, build the result and call onSuccess
  useEffect(() => {
    if (
      status === "success" &&
      generatedTripId &&
      tripData &&
      tripDays &&
      tripActivities
    ) {
      type TripDay = { _id: string; dayNumber: number; date: string; title?: string; notes?: string; dailyBudget: number };
      type TripActivity = { tripDayId: string; order: number; type: string; title: string; description?: string; startTime?: string; endTime?: string; estimatedCost: number; location?: { name: string; address?: string }; notes?: string };
      const days: GeneratedDay[] = (tripDays as TripDay[]).map((day) => {
        const dayActivities = (tripActivities as TripActivity[])
          .filter((a) => a.tripDayId === day._id)
          .sort((a, b) => a.order - b.order)
          .map((act) => ({
            type: act.type,
            title: act.title,
            description: act.description,
            startTime: act.startTime,
            endTime: act.endTime,
            estimatedCost: act.estimatedCost,
            location: act.location
              ? { name: act.location.name, address: act.location.address }
              : undefined,
            notes: act.notes,
          }));
        return {
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title ?? `Day ${day.dayNumber}`,
          notes: day.notes,
          dailyBudget: day.dailyBudget,
          activities: dayActivities,
        };
      });

      const result: GenerationResult = {
        tripId: generatedTripId,
        title: tripData.title,
        description: tripData.description ?? "",
        budgetBreakdown: tripData.budgetBreakdown,
        tips: [],
        days,
      };

      onSuccess(result);
    }
  }, [status, generatedTripId, tripData, tripDays, tripActivities, onSuccess]);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const runGeneration = useCallback(async () => {
    if (!whereWhen.destination || !whereWhen.origin) return;

    clearTimers();
    setStatus("running");
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setErrorMessage(null);
    setGeneratedTripId(null);

    // Animate through steps while API call runs
    let stepIdx = 0;
    const advance = () => {
      const step = PROGRESS_STEPS[stepIdx];
      if (!step) return;
      const t = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, stepIdx]);
        stepIdx++;
        if (stepIdx < PROGRESS_STEPS.length) {
          setCurrentStepIndex(stepIdx);
          advance();
        }
      }, step.delay);
      timerRefs.current.push(t);
    };
    advance();

    const totalDays =
      differenceInDays(parseISO(whereWhen.endDate), parseISO(whereWhen.startDate)) + 1;

    try {
      const result = await generateTrip({
        origin: {
          city: whereWhen.origin.city,
          country: whereWhen.origin.country,
          lat: whereWhen.origin.lat,
          lng: whereWhen.origin.lng,
        },
        destination: {
          city: whereWhen.destination.city,
          country: whereWhen.destination.country,
          lat: whereWhen.destination.lat,
          lng: whereWhen.destination.lng,
        },
        startDate: whereWhen.startDate,
        endDate: whereWhen.endDate,
        totalDays,
        budgetTotal: budgetVibe.budget,
        preferences: {
          comfortLevel: mapTravelStyle(budgetVibe.travelStyle),
          interests: budgetVibe.interests,
          dietaryRestrictions: budgetVibe.dietaryRestrictions.filter((d) => d !== "None"),
        },
        isStudent: true,
        isGroupTrip: false,
      });

      // Complete all remaining step animations
      clearTimers();
      setCompletedSteps(PROGRESS_STEPS.map((_, i) => i));
      setGeneratedTripId(result.tripId as string);
      setStatus("success");
    } catch (err) {
      clearTimers();
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
      setStatus("error");
      onError?.(msg);
    }
  }, [whereWhen, budgetVibe, generateTrip, clearTimers, onError]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    runGeneration();
    return () => clearTimers();
  }, [runGeneration, clearTimers]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[380px] py-8">
      <FloatingDots />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {status === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <AlertCircle size={28} className="text-error" />
              </div>
              <div>
                <p className="font-serif text-xl text-text-primary mb-1">Something went wrong</p>
                <p className="text-sm text-text-secondary max-w-xs">
                  {errorMessage ?? "We couldn't generate your trip. Please try again."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  hasStarted.current = false;
                  runGeneration();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-[6px] text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              className="flex flex-col items-center gap-2 w-full"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    animate={status === "running" ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={28} className="text-accent" />
                  </motion.div>
                </div>
                <h2 className="font-serif text-2xl text-text-primary mb-1">
                  {status === "success"
                    ? "Your trip is ready!"
                    : "Building your perfect trip..."}
                </h2>
                <p className="text-sm text-text-secondary">
                  {status === "success"
                    ? "Loading your itinerary..."
                    : `Planning a trip to ${whereWhen.destination?.city ?? "your destination"}`}
                </p>
              </motion.div>

              {/* Steps */}
              <div className="w-full space-y-2.5">
                {PROGRESS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(idx);
                  const isCurrent = currentStepIndex === idx && !isCompleted && status === "running";

                  // Only show steps up to current + 1 ahead (reveal progressively)
                  if (idx > currentStepIndex + 1 && !isCompleted) return null;

                  return (
                    <AnimatePresence key={idx}>
                      {(isCompleted || isCurrent || idx <= currentStepIndex) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-[8px] transition-colors",
                            isCompleted && "bg-success-muted",
                            isCurrent && "bg-accent-muted border border-accent/20",
                            !isCompleted && !isCurrent && "opacity-40"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              isCompleted && "bg-success/15",
                              isCurrent && "bg-accent/15",
                              !isCompleted && !isCurrent && "bg-bg-tertiary"
                            )}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                <CheckCircle size={16} className="text-success" />
                              </motion.div>
                            ) : (
                              <Icon
                                size={15}
                                className={cn(
                                  isCurrent ? "text-accent" : "text-text-tertiary"
                                )}
                              />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isCompleted && "text-success",
                              isCurrent && "text-accent",
                              !isCompleted && !isCurrent && "text-text-tertiary"
                            )}
                          >
                            {step.label}
                          </span>
                          {isCurrent && (
                            <motion.div
                              className="ml-auto flex gap-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {[0, 1, 2].map((dot) => (
                                <motion.div
                                  key={dot}
                                  className="w-1.5 h-1.5 rounded-full bg-accent"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: dot * 0.25,
                                  }}
                                />
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full mt-5">
                <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(completedSteps.length / PROGRESS_STEPS.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-text-tertiary text-center mt-2">
                  {completedSteps.length} of {PROGRESS_STEPS.length} steps completed
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
