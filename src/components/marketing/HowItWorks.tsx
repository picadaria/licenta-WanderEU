"use client";

import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const steps = [
  {
    number: "01",
    title: "Choose Your Destination",
    description:
      "Pick any European city or let our AI suggest somewhere based on your interests and travel style. We cover 200+ cities with real, up-to-date pricing.",
    mockup: (
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4 shadow-sm">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          Where do you want to go?
        </p>
        <div className="flex flex-wrap gap-2">
          {["Barcelona", "Prague", "Lisbon", "Amsterdam", "Vienna", "Porto"].map(
            (city) => (
              <span
                key={city}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium border transition-colors ${
                  city === "Barcelona"
                    ? "bg-accent text-white border-accent"
                    : "bg-bg-secondary border-border-subtle text-text-secondary"
                }`}
              >
                {city}
              </span>
            )
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-text-tertiary font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          200+ cities available
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Set Your Budget & Vibe",
    description:
      "Tell us how much you have to spend and what kind of traveler you are — backpacker, comfort-seeker, or culture lover. We optimize every euro.",
    mockup: (
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4 shadow-sm">
        <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          Your budget
        </p>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[28px] text-text-primary leading-none">
            €400
          </span>
          <span className="text-xs text-text-secondary">/ 5 days</span>
        </div>
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mb-4">
          <div className="h-full w-[68%] bg-accent rounded-full" />
        </div>
        <div className="flex gap-2">
          {["Backpacker", "Balanced", "Comfort"].map((vibe) => (
            <button
              key={vibe}
              className={`flex-1 py-1.5 rounded-[6px] text-xs font-medium border ${
                vibe === "Balanced"
                  ? "bg-accent/8 border-accent/30 text-accent"
                  : "bg-bg-secondary border-border-subtle text-text-secondary"
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Get Your Complete Trip",
    description:
      "Receive a detailed day-by-day plan with transport, accommodation, meals, and activities — all with exact costs and booking links. Student discounts automatically applied.",
    mockup: (
      <div className="rounded-[8px] border border-border-subtle bg-bg-primary p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono text-text-tertiary uppercase tracking-wider">
            Day 1 · Barcelona
          </p>
          <span className="text-[10px] font-mono text-success bg-success-muted px-2 py-0.5 rounded-full">
            Generated in 12s
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { time: "09:00", activity: "Sagrada Família visit", cost: "€26" },
            { time: "12:30", activity: "Mercat de Sant Josep", cost: "€12" },
            { time: "15:00", activity: "Gothic Quarter walk", cost: "Free" },
          ].map((item) => (
            <div
              key={item.time}
              className="flex items-center gap-3 py-1.5 border-b border-border-subtle last:border-0"
            >
              <span className="font-mono text-[10px] text-text-tertiary w-10 shrink-0">
                {item.time}
              </span>
              <span className="text-xs text-text-primary flex-1">
                {item.activity}
              </span>
              <span
                className={`font-mono text-xs font-medium ${
                  item.cost === "Free" ? "text-success" : "text-text-primary"
                }`}
              >
                {item.cost}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-primary py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-16 lg:mb-24"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4">
            How it works
          </p>
          <h2 className="font-serif italic text-[36px] sm:text-[48px] leading-[1.1] text-text-primary max-w-md">
            Three steps to your perfect trip.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div key={i}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1fr] gap-6 lg:gap-12 py-12 lg:py-16 items-center"
              >
                {/* Step number */}
                <div className="hidden lg:block">
                  <span
                    className="font-serif text-[100px] leading-none text-accent/10 select-none"
                    aria-hidden
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 lg:hidden">
                    <span className="font-mono text-xs text-accent font-semibold">
                      {step.number}
                    </span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>
                  <h3 className="text-[22px] font-semibold text-text-primary leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mockup */}
                <div>{step.mockup}</div>
              </motion.div>

              {/* Divider */}
              {i < steps.length - 1 && (
                <div className="h-px bg-border-subtle" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
