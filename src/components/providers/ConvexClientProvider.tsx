"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#E8553A",
          colorText: "#1A1A18",
          colorTextSecondary: "#6B6B63",
          colorBackground: "#FAFAF8",
          colorInputBackground: "#FAFAF8",
          colorInputText: "#1A1A18",
          borderRadius: "6px",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
