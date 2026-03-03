"use client";

import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <div className="flex min-h-screen bg-bg-primary">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </ConvexClientProvider>
  );
}
