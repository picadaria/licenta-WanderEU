"use client";

import Link from "next/link";
import { Twitter, Github, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Destination guides", href: "/guides" },
    { label: "Budget calculator", href: "/calculator" },
    { label: "Student discounts", href: "/discounts" },
    { label: "Travel tips", href: "/tips" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Top row: Logo + links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Logo + tagline */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="font-serif italic text-[20px] text-text-inverse leading-none block mb-3"
            >
              WanderEU
            </Link>
            <p className="text-[13px] text-text-tertiary leading-relaxed max-w-[200px]">
              AI-powered budget travel planning for EU students.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-text-tertiary">
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-text-tertiary hover:text-text-inverse transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/8 my-10" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-mono text-text-tertiary">
            © 2025 WanderEU. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-text-tertiary hover:text-text-inverse transition-colors duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
