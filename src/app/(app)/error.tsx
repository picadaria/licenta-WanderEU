"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
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
          Something went wrong
        </h1>

        {/* Error message */}
        <p className="text-text-secondary text-sm leading-relaxed">
          {truncated}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full">
          <button
            onClick={reset}
            className="w-full sm:w-auto flex-1 h-10 px-5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex-1 h-10 px-5 rounded-[6px] border border-border-default text-sm text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors flex items-center justify-center"
          >
            Go to Dashboard
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
