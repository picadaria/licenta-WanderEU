import Link from "next/link";
import { Compass } from "lucide-react";

export default function TripNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center">
        <Compass size={32} className="text-text-tertiary" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl text-text-primary">
          Trip not found
        </h1>
        <p className="text-text-secondary text-base max-w-sm">
          This trip doesn&apos;t exist, was deleted, or you don&apos;t have
          access to it.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
