"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { WhereWhenStep, validateWhereWhen } from "@/components/trip-wizard/WhereWhenStep";
import type { WhereWhenData } from "@/components/trip-wizard/WhereWhenStep";
import { BudgetVibeStep, validateBudgetVibe } from "@/components/trip-wizard/BudgetVibeStep";
import type { BudgetVibeData } from "@/components/trip-wizard/BudgetVibeStep";
import { AIGenerationStep } from "@/components/trip-wizard/AIGenerationStep";
import type { GenerationResult } from "@/components/trip-wizard/AIGenerationStep";
import { ReviewTripStep } from "@/components/trip-wizard/ReviewTripStep";
import type { GeneratedTripData } from "@/components/trip-wizard/ReviewTripStep";
import { differenceInDays, parseISO } from "date-fns";

// ─── Step config ─────────────────────────────────────────────────────────────
const STEP_LABELS = ["Where & When", "Budget & Vibe", "Generating", "Review"];

// ─── Slide variants ───────────────────────────────────────────────────────────
function getSlideVariants(direction: "forward" | "back") {
  const offset = direction === "forward" ? 40 : -40;
  return {
    initial: { opacity: 0, x: offset },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -offset },
  };
}

// ─── Progress indicator ───────────────────────────────────────────────────────
function WizardProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={idx} className="flex items-center">
            {/* Dot */}
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                isCompleted && "bg-accent",
                isCurrent && "ring-2 ring-accent ring-offset-2 bg-accent/30 scale-110",
                !isCompleted && !isCurrent && "bg-border-default"
              )}
            />
            {/* Connector line */}
            {idx < totalSteps - 1 && (
              <div className="w-12 sm:w-16 h-px mx-1 transition-colors duration-500">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isCompleted ? "bg-accent" : "bg-border-default"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Wizard page ──────────────────────────────────────────────────────────────
export default function NewTripPage() {
  const currentUser = useQuery(api.users.getCurrentUser, {});

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [whereWhen, setWhereWhen] = useState<WhereWhenData>({
    destination: null,
    origin: null,
    startDate: "",
    endDate: "",
  });

  const [budgetVibe, setBudgetVibe] = useState<BudgetVibeData>({
    budget: 500,
    travelStyle: null,
    interests: [],
    dietaryRestrictions: [],
  });

  const [generatedTrip, setGeneratedTrip] = useState<GenerationResult | null>(null);

  const createTrip = useMutation(api.trips.create);

  // ─── Validation per step ────────────────────────────────────────────────────
  function isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return validateWhereWhen(whereWhen);
      case 1:
        return validateBudgetVibe(budgetVibe);
      case 2:
        return false; // AI step auto-advances
      case 3:
        return generatedTrip !== null;
      default:
        return false;
    }
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────
  function goNext() {
    if (currentStep >= STEP_LABELS.length - 1) return;
    setDirection("forward");
    setCurrentStep((s) => s + 1);
  }

  function goBack() {
    if (currentStep === 0) return;
    setDirection("back");
    // If on review step and going back, skip AI step back to budget
    setCurrentStep((s) => (s === 3 ? 1 : s - 1));
  }

  // ─── Save draft ─────────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    if (!whereWhen.destination || !whereWhen.origin || !whereWhen.startDate || !whereWhen.endDate) {
      return;
    }

    setIsSavingDraft(true);
    try {
      const totalDays =
        differenceInDays(parseISO(whereWhen.endDate), parseISO(whereWhen.startDate)) + 1;

      const breakdown = {
        transport: Math.round(budgetVibe.budget * 0.25),
        accommodation: Math.round(budgetVibe.budget * 0.40),
        food: Math.round(budgetVibe.budget * 0.20),
        activities: Math.round(budgetVibe.budget * 0.15),
        other: 0,
      };

      await createTrip({
        title: `Trip to ${whereWhen.destination.city}`,
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
        budgetBreakdown: breakdown,
        tags: budgetVibe.interests.slice(0, 5),
        aiGenerated: false,
      });

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSavingDraft(false);
    }
  }, [whereWhen, budgetVibe, createTrip]);

  // ─── AI generation success ──────────────────────────────────────────────────
  function handleGenerationSuccess(result: GenerationResult) {
    setGeneratedTrip(result);
    setDirection("forward");
    setCurrentStep(3);
  }

  // ─── Regenerate ─────────────────────────────────────────────────────────────
  function handleRegenerate() {
    setGeneratedTrip(null);
    setDirection("back");
    setCurrentStep(2);
  }

  const slideVariants = getSlideVariants(direction);

  const canSaveDraft = whereWhen.destination !== null && whereWhen.origin !== null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-88px)] md:min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Step {currentStep + 1} of {STEP_LABELS.length}
          </span>
          <span className="text-sm font-medium text-text-secondary">
            {STEP_LABELS[currentStep]}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <WizardProgress currentStep={currentStep} totalSteps={STEP_LABELS.length} />

          {/* Save as draft */}
          {canSaveDraft && currentStep < 2 && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className={cn(
                "text-xs font-medium transition-colors px-3 py-1.5 rounded-[6px] border",
                draftSaved
                  ? "border-success text-success bg-success-muted"
                  : "border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
              )}
            >
              {isSavingDraft ? "Saving..." : draftSaved ? "Draft saved" : "Save as Draft"}
            </button>
          )}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={slideVariants.initial}
            animate={slideVariants.animate}
            exit={slideVariants.exit}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {currentStep === 0 && (
              <WhereWhenStep
                data={whereWhen}
                onChange={setWhereWhen}
                homeCity={currentUser?.homeCity}
              />
            )}

            {currentStep === 1 && (
              <BudgetVibeStep data={budgetVibe} onChange={setBudgetVibe} />
            )}

            {currentStep === 2 && (
              <AIGenerationStep
                whereWhen={whereWhen}
                budgetVibe={budgetVibe}
                onSuccess={handleGenerationSuccess}
              />
            )}

            {currentStep === 3 && generatedTrip && (
              <ReviewTripStep
                data={generatedTrip}
                budgetTotal={budgetVibe.budget}
                destination={whereWhen.destination?.city ?? ""}
                origin={whereWhen.origin?.city ?? ""}
                startDate={whereWhen.startDate}
                endDate={whereWhen.endDate}
                onRegenerate={handleRegenerate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar (hidden on AI generation step) */}
      {currentStep !== 2 && (
        <div className="sticky bottom-0 bg-bg-primary/95 backdrop-blur-sm border-t border-border-subtle py-4 mt-8 -mx-4 md:-mx-8 px-4 md:px-8">
          <div className="max-w-[1000px] mx-auto flex items-center justify-between">
            {/* Back button */}
            <div>
              {currentStep > 0 && currentStep !== 3 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[6px] text-sm font-medium text-text-secondary border border-border-default hover:border-border-strong hover:text-text-primary transition-colors"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              )}
            </div>

            {/* Continue button */}
            <div>
              {currentStep === 0 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isStepValid(0)}
                  className={cn(
                    "px-6 py-2.5 rounded-[6px] text-sm font-semibold transition-all",
                    isStepValid(0)
                      ? "bg-accent text-white hover:bg-accent-hover shadow-sm"
                      : "bg-bg-secondary text-text-tertiary cursor-not-allowed"
                  )}
                >
                  Continue
                </button>
              )}

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!isStepValid(1)}
                  className={cn(
                    "px-6 py-2.5 rounded-[6px] text-sm font-semibold transition-all",
                    isStepValid(1)
                      ? "bg-accent text-white hover:bg-accent-hover shadow-sm"
                      : "bg-bg-secondary text-text-tertiary cursor-not-allowed"
                  )}
                >
                  Generate My Trip
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
