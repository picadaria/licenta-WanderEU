"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const plans = [
  {
    id: "free",
    name: "Explorer",
    badge: null,
    price: "€0",
    period: "/month",
    description: "Perfect for occasional travelers who want a taste of smarter trip planning.",
    cta: "Get Started",
    ctaHref: "/sign-up",
    ctaVariant: "secondary" as const,
    features: [
      "2 trips per month",
      "Basic itinerary generation",
      "Budget breakdown view",
      "Day-by-day schedule",
      "Email support",
    ],
    excluded: [
      "Group trip planning",
      "AI travel assistant",
      "Student discounts database",
      "Offline itinerary",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Wanderer",
    badge: "Most popular",
    price: "€2.99",
    period: "/month",
    description: "For students who travel regularly and want every advantage to stretch their budget.",
    cta: "Start Free Trial",
    ctaHref: "/sign-up",
    ctaVariant: "primary" as const,
    features: [
      "Unlimited trips",
      "Full itinerary generation",
      "Budget breakdown view",
      "Day-by-day schedule",
      "Group trip planning",
      "AI travel assistant",
      "Student discounts database",
      "Offline itinerary",
      "Priority support",
    ],
    excluded: [],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-bg-secondary py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12 lg:mb-16 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4">
            Pricing
          </p>
          <h2 className="font-serif italic text-[36px] sm:text-[48px] leading-[1.1] text-text-primary">
            Simple, student-friendly pricing.
          </h2>
          <p className="mt-4 text-[16px] text-text-secondary max-w-md mx-auto">
            Less than the price of a coffee a month. Cancel anytime — no
            questions asked.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className={`bg-bg-primary rounded-[8px] border flex flex-col overflow-hidden ${
                plan.badge
                  ? "border-accent shadow-md"
                  : "border-border-subtle shadow-sm"
              }`}
            >
              {/* Accent top bar for pro */}
              {plan.badge && (
                <div className="h-[3px] bg-accent w-full shrink-0" />
              )}

              <div className="p-6 flex flex-col gap-6 flex-1">
                {/* Header */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
                      {plan.name}
                    </p>
                    {plan.badge && (
                      <span className="text-[10px] font-mono font-semibold text-accent bg-accent-muted px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-[36px] text-text-primary leading-none">
                      {plan.price}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`flex items-center justify-center h-11 rounded-[6px] text-sm font-medium transition-colors duration-200 ${
                    plan.ctaVariant === "primary"
                      ? "bg-accent hover:bg-accent-hover text-white"
                      : "border border-border-default hover:bg-bg-secondary text-text-primary"
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="h-px bg-border-subtle" />

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check
                        size={14}
                        className="text-success mt-0.5 shrink-0"
                      />
                      <span className="text-[13px] text-text-primary">
                        {feat}
                      </span>
                    </li>
                  ))}
                  {plan.excluded.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 opacity-35"
                    >
                      <Check
                        size={14}
                        className="text-text-tertiary mt-0.5 shrink-0"
                      />
                      <span className="text-[13px] text-text-secondary line-through">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          className="text-center text-[12px] text-text-tertiary mt-8"
        >
          No credit card required for the free plan. 7-day free trial on
          Wanderer. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
