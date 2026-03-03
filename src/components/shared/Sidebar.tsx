"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Plus,
  Map,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trip/new", label: "New Trip", icon: Plus },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="hidden md:flex flex-col w-[220px] h-screen sticky top-0 border-r border-border-subtle bg-bg-primary shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <Link href="/dashboard" className="inline-block">
          <span className="font-serif italic text-xl text-text-primary tracking-tight">
            WanderEU
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-[6px] transition-colors duration-150",
                isActive
                  ? "bg-accent-muted text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "shrink-0",
                  isActive ? "text-accent" : "text-text-tertiary"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-4 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-secondary shrink-0">
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "User avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-accent-muted text-accent text-xs font-medium">
                  {(user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress[0] ?? "U").toUpperCase()}
                </div>
              )}
            </div>
            {/* Name */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate leading-tight">
                {user.fullName ?? user.firstName ?? "Traveler"}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
