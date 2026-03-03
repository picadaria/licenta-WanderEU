"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Explore", href: "#trip-example" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
          scrolled
            ? "bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif italic text-[22px] text-text-primary leading-none select-none"
          >
            WanderEU
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors duration-200 px-4 py-2 rounded-[6px]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            className="md:hidden flex items-center justify-center w-9 h-9 text-text-primary"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-bg-primary pt-16 flex flex-col"
          >
            <nav className="flex flex-col px-6 py-8 gap-1 border-b border-border-subtle">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[18px] font-medium text-text-primary py-3 border-b border-border-subtle last:border-0"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col px-6 py-6 gap-3">
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 text-sm font-medium text-text-primary border border-border-default rounded-[6px] hover:bg-bg-secondary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-12 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-[6px] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
