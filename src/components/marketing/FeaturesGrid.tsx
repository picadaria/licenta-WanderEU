"use client";

import {
  TrendingDown,
  Users,
  MessageCircle,
  GraduationCap,
  Receipt,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const features = [
  {
    icon: TrendingDown,
    title: "Smart Budget Optimizer",
    description:
      "Our AI automatically finds the best value options for transport, accommodation, and food — so every euro works harder for you.",
  },
  {
    icon: Users,
    title: "Group Trip Planning",
    description:
      "Split costs fairly across your friend group, coordinate different budgets, and plan one trip that works for everyone.",
  },
  {
    icon: MessageCircle,
    title: "AI Travel Assistant",
    description:
      "Ask anything — visa requirements, packing tips, local customs, restaurant recommendations. Get instant, accurate answers.",
  },
  {
    icon: GraduationCap,
    title: "Student Discounts Database",
    description:
      "Access our curated database of 10,000+ student discounts across Europe. From museums to hostels to transport passes.",
  },
  {
    icon: Receipt,
    title: "Expense Tracking",
    description:
      "Log your spending in real-time and see exactly where your money is going. Stay on budget, every day of the trip.",
  },
  {
    icon: Download,
    title: "Offline Itinerary",
    description:
      "Download your full trip plan before you go. No roaming charges, no internet needed — your itinerary works anywhere.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-bg-primary py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-12 lg:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-4">
            Everything you need
          </p>
          <h2 className="font-serif italic text-[36px] sm:text-[48px] leading-[1.1] text-text-primary max-w-lg">
            Built for students who travel on a budget.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.07,
                  ease: EASE,
                }}
                className="group p-6 border border-border-subtle rounded-[8px] bg-bg-primary hover:shadow-sm transition-shadow duration-200 flex flex-col gap-4"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-[6px] bg-accent-muted flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-[15px] font-semibold text-text-primary leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
