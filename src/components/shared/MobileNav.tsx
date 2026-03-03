"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Plus, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home, isCenter: false },
  { href: "/explore", label: "Explore", icon: Compass, isCenter: false },
  { href: "/trip/new", label: "New", icon: Plus, isCenter: true },
  { href: "/trips", label: "Trips", icon: Map, isCenter: false },
  { href: "/profile", label: "Profile", icon: User, isCenter: false },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around bg-bg-primary border-t border-border-subtle px-2 pb-safe md:hidden">
      {tabs.map(({ href, label, icon: Icon, isCenter }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        if (isCenter) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex flex-col items-center -translate-y-2"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-md active:scale-95 transition-transform duration-100">
                <Icon size={22} />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-3 px-3 text-[10px] font-medium transition-colors duration-150",
              isActive ? "text-accent" : "text-text-tertiary"
            )}
          >
            <Icon
              size={20}
              className={isActive ? "text-accent" : "text-text-tertiary"}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
