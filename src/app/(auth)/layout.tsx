import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </ConvexClientProvider>
  );
}

function AuthLayoutInner({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — Clerk form */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 px-6 py-12 bg-bg-primary">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="font-serif italic text-2xl text-text-primary tracking-tight">
              WanderEU
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Right panel — quote + decorative dots (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center relative bg-bg-secondary overflow-hidden">
        {/* Decorative dot grid */}
        <DotPattern />

        {/* Quote */}
        <div className="relative z-10 max-w-sm px-10 text-center">
          <p className="font-serif italic text-[1.6rem] leading-[1.45] text-text-primary mb-6">
            &ldquo;The world is a book, and those who do not travel read only
            one page.&rdquo;
          </p>
          <p className="text-sm text-text-secondary font-sans tracking-wide">
            — Saint Augustine
          </p>
        </div>

        {/* Subtle accent circle bottom-right */}
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full opacity-[0.06]"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />
        {/* Subtle accent circle top-left */}
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-[0.05]"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** SVG dot-grid pattern rendered as an absolutely-positioned overlay */
function DotPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="auth-dots"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="var(--border-default)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-dots)" />
    </svg>
  );
}
