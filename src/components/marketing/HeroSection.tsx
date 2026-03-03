"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const floatingCards = [
  {
    city: "Prague",
    days: "4 days",
    budget: "€312",
    emoji: "🏰",
    color: "bg-[#E8F4FD]",
    dotColor: "bg-[#3b6ec4]",
    delay: 0.6,
    rotate: "-2deg",
    top: "8%",
    right: "4%",
  },
  {
    city: "Lisbon",
    days: "5 days",
    budget: "€398",
    emoji: "🌊",
    color: "bg-[#FFF4F2]",
    dotColor: "bg-accent",
    delay: 0.8,
    rotate: "1.5deg",
    top: "38%",
    right: "18%",
  },
  {
    city: "Krakow",
    days: "3 days",
    budget: "€210",
    emoji: "🎭",
    color: "bg-[#F0FDF4]",
    dotColor: "bg-[#2d7a4f]",
    delay: 1.0,
    rotate: "-1deg",
    top: "66%",
    right: "6%",
  },
];

const avatarColors = [
  "bg-[#E8553A]",
  "bg-[#3B6EC4]",
  "bg-[#2D7A4F]",
  "bg-[#C4841D]",
  "bg-[#7C3D8F]",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-bg-primary pt-16">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4d3cf 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
        }}
      />

      {/* Gradient fade on dot grid */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-bg-primary via-transparent to-bg-secondary/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="font-mono text-xs uppercase tracking-widest text-text-secondary"
            >
              Student Travel, Simplified
            </motion.p>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className="font-serif italic text-[48px] sm:text-[56px] lg:text-[72px] leading-[1.05] text-text-primary"
            >
              Travel Europe.
              <br />
              Spend Less.
              <br />
              See More.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
              className="text-[18px] text-text-secondary leading-relaxed max-w-lg font-sans font-normal"
            >
              Tell us your budget and where you want to go. WanderEU builds a
              complete day-by-day itinerary with real prices, student discounts,
              and local tips — in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-6 rounded-[6px] bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors duration-200"
              >
                Plan Your First Trip
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[6px] border border-border-default hover:bg-bg-secondary text-text-primary text-sm font-medium transition-colors duration-200"
              >
                See How It Works
                <ArrowRight size={16} className="text-text-secondary" />
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: EASE }}
              className="flex items-center gap-3"
            >
              {/* Overlapping avatar circles */}
              <div className="flex -space-x-2">
                {avatarColors.map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-bg-primary ${color} flex items-center justify-center`}
                  >
                    <span className="text-white text-[10px] font-semibold select-none">
                      {["A", "J", "M", "S", "K"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-secondary">
                Join{" "}
                <span className="font-semibold text-text-primary">2,400+</span>{" "}
                students traveling smarter
              </p>
            </motion.div>
          </div>

          {/* Right — floating cards */}
          <div className="relative hidden lg:block h-[480px]">
            {/* Abstract background shape */}
            <div className="absolute inset-4 rounded-[8px] bg-bg-secondary border border-border-subtle overflow-hidden">
              {/* Grid lines decoration */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(#e8e7e3 1px, transparent 1px), linear-gradient(90deg, #e8e7e3 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                  opacity: 0.5,
                }}
              />
              {/* Accent dot cluster */}
              <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full bg-accent/8" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-accent/5" />
            </div>

            {/* Floating Trip Cards */}
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotate: card.rotate }}
                animate={{ opacity: 1, y: 0, rotate: card.rotate }}
                transition={{ duration: 0.55, delay: card.delay, ease: EASE }}
                className="absolute z-10"
                style={{ top: card.top, right: card.right }}
              >
                <div
                  className={`${card.color} border border-border-subtle rounded-[8px] px-4 py-3 shadow-md w-44 flex flex-col gap-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                      {card.days}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${card.dotColor}`}
                    />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {card.city}
                  </p>
                  <p className="font-mono text-[15px] font-normal text-text-primary">
                    {card.budget}
                    <span className="text-text-secondary text-[11px] font-sans ml-1">
                      total
                    </span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </section>
  );
}
