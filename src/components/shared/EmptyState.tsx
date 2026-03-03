import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Icon circle */}
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-6"
        style={{ background: "var(--accent-muted)" }}
      >
        <Icon size={28} className="text-accent" />
      </div>

      {/* Text */}
      <h3 className="font-serif text-2xl text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs leading-relaxed mb-8">
        {description}
      </p>

      {/* CTA */}
      <Link
        href={actionHref}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-[6px] bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors duration-150 active:scale-[0.98]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
