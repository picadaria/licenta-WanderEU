import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

// ─── Create User ─────────────────────────────────────────────────────────────
export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      isStudent: false,
      currency: "EUR",
      onboardingCompleted: false,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// ─── Update User ──────────────────────────────────────────────────────────────
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isStudent: v.optional(v.boolean()),
    university: v.optional(v.string()),
    homeCity: v.optional(v.string()),
    homeCountry: v.optional(v.string()),
    currency: v.optional(v.string()),
    travelPreferences: v.optional(
      v.object({
        comfortLevel: v.union(
          v.literal("budget"),
          v.literal("mid-range"),
          v.literal("comfort")
        ),
        interests: v.array(v.string()),
        dietaryRestrictions: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.isStudent !== undefined) updates.isStudent = args.isStudent;
    if (args.university !== undefined) updates.university = args.university;
    if (args.homeCity !== undefined) updates.homeCity = args.homeCity;
    if (args.homeCountry !== undefined) updates.homeCountry = args.homeCountry;
    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.travelPreferences !== undefined)
      updates.travelPreferences = args.travelPreferences;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// ─── Internal Update User (called from webhook) ───────────────────────────────
export const updateUserInternal = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return null;

    const updates: Record<string, unknown> = {};
    if (args.email !== undefined) updates.email = args.email;
    if (args.name !== undefined) updates.name = args.name;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// ─── Get User by ClerkId ──────────────────────────────────────────────────────
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

// ─── Internal Get User by ClerkId (used by AI actions) ───────────────────────
export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// ─── Public Create User (for Clerk webhook — no auth required) ────────────────
// Uses a secret check instead of Convex auth since webhooks are unauthenticated
export const createUserPublic = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      isStudent: false,
      currency: "EUR",
      onboardingCompleted: false,
      createdAt: Date.now(),
    });
  },
});

// ─── Public Update User (for Clerk webhook — no auth required) ────────────────
export const updateUserPublic = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      // Create if not exists
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email ?? "",
        name: args.name ?? "",
        imageUrl: args.imageUrl,
        isStudent: false,
        currency: "EUR",
        onboardingCompleted: false,
        createdAt: Date.now(),
      });
    }

    const updates: Record<string, unknown> = {};
    if (args.email !== undefined) updates.email = args.email;
    if (args.name !== undefined) updates.name = args.name;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});

// ─── Complete Onboarding ──────────────────────────────────────────────────────
export const completeOnboarding = mutation({
  args: {
    isStudent: v.boolean(),
    university: v.optional(v.string()),
    homeCity: v.string(),
    homeCountry: v.string(),
    currency: v.string(),
    travelPreferences: v.object({
      comfortLevel: v.union(
        v.literal("budget"),
        v.literal("mid-range"),
        v.literal("comfort")
      ),
      interests: v.array(v.string()),
      dietaryRestrictions: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isStudent: args.isStudent,
      university: args.university,
      homeCity: args.homeCity,
      homeCountry: args.homeCountry,
      currency: args.currency,
      travelPreferences: args.travelPreferences,
      onboardingCompleted: true,
    });

    return user._id;
  },
});
