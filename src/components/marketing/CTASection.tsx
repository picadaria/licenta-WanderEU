"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function CTASection() {
  return (
    <section className="bg-bg-dark py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex flex-col items-center gap-6"
        >
          {/* Eyebrow */}
          <p className="font-mono text-xs uppercase tracking-widest text-text-tertiary">
            Ready to explore?
          </p>

          {/* Heading */}
          <h2 className="font-serif italic text-[36px] sm:text-[52px] lg:text-[64px] leading-[1.05] text-text-inverse max-w-2xl">
            Your next adventure starts here.
          </h2>

          {/* Subtitle */}
          <p className="text-[16px] text-text-secondary max-w-sm leading-relaxed">
            Plan your first trip in under 2 minutes. No credit card required.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-12 px-8 rounded-[6px] bg-text-inverse hover:bg-bg-secondary text-text-primary text-sm font-semibold transition-colors duration-200"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Trust note */}
          <p className="text-[12px] font-mono text-text-tertiary">
            2,400+ students already planning their next trip
          </p>
        </motion.div>

        {/* Decorative element */}
        <div className="absolute left-0 right-0 pointer-events-none overflow-hidden" aria-hidden>
          <div
            className="mx-auto w-64 h-64 rounded-full opacity-5"
            style={{
              background:
                "radial-gradient(circle, #E8553A 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
