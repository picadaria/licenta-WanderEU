"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

interface TripErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TripError({ error, reset }: TripErrorProps) {
  const message = error.message ?? "An unexpected error occurred.";
  const truncated =
    message.length > 200 ? `${message.slice(0, 200)}…` : message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[rgba(196,61,46,0.08)]">
          <AlertTriangle size={48} className="text-error" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-2xl text-text-primary">
          We couldn&apos;t load this trip
        </h1>

        {/* Subtext */}
        <p className="text-text-secondary text-sm leading-relaxed">
          There was a problem loading your trip details. This may be a temporary
          issue.
        </p>

        {/* Error message */}
        {truncated && (
          <p className="text-text-tertiary text-xs font-mono bg-bg-secondary border border-border-subtle rounded-[6px] px-3 py-2 w-full text-left">
            {truncated}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full">
          <button
            onClick={reset}
            className="w-full sm:flex-1 h-10 px-5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:flex-1 h-10 px-5 rounded-[6px] border border-border-default text-sm text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to Trips
          </Link>
        </div>

        {error.digest && (
          <p className="text-text-tertiary text-xs font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
