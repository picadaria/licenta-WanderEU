import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        {/* Icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-accent-muted">
          <Compass size={64} className="text-accent" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl text-text-primary">
          Looks like you took a wrong turn
        </h1>

        {/* Subtext */}
        <p className="text-text-secondary text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center justify-center h-11 px-6 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Back to Home
        </Link>

        {/* 404 hint */}
        <p className="text-text-tertiary text-sm font-mono">Error 404</p>
      </div>
    </div>
  );
}
