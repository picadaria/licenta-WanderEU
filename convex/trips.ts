import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── Create Trip ──────────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    origin: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    destination: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    startDate: v.string(),
    endDate: v.string(),
    totalDays: v.number(),
    budgetTotal: v.number(),
    budgetBreakdown: v.object({
      transport: v.number(),
      accommodation: v.number(),
      food: v.number(),
      activities: v.number(),
      other: v.number(),
    }),
    isGroupTrip: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    aiGenerated: v.optional(v.boolean()),
    generationPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const isGroupTrip = args.isGroupTrip ?? false;
    const now = Date.now();

    const tripId = await ctx.db.insert("trips", {
      userId: user._id,
      status: "draft",
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
      origin: args.origin,
      destination: args.destination,
      startDate: args.startDate,
      endDate: args.endDate,
      totalDays: args.totalDays,
      budgetTotal: args.budgetTotal,
      budgetBreakdown: args.budgetBreakdown,
      actualSpent: 0,
      aiGenerated: args.aiGenerated ?? false,
      generationPrompt: args.generationPrompt,
      isGroupTrip,
      inviteCode: isGroupTrip ? generateInviteCode() : undefined,
      isPublic: args.isPublic ?? false,
      tags: args.tags ?? [],
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner member
    await ctx.db.insert("tripMembers", {
      tripId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });

    return tripId;
  },
});

// ─── Internal Create Trip (used by AI generation) ─────────────────────────────
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    origin: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    destination: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    startDate: v.string(),
    endDate: v.string(),
    totalDays: v.number(),
    budgetTotal: v.number(),
    budgetBreakdown: v.object({
      transport: v.number(),
      accommodation: v.number(),
      food: v.number(),
      activities: v.number(),
      other: v.number(),
    }),
    isGroupTrip: v.boolean(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    aiGenerated: v.boolean(),
    generationPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tripId = await ctx.db.insert("trips", {
      userId: args.userId,
      status: "draft",
      title: args.title,
      description: args.description,
      origin: args.origin,
      destination: args.destination,
      startDate: args.startDate,
      endDate: args.endDate,
      totalDays: args.totalDays,
      budgetTotal: args.budgetTotal,
      budgetBreakdown: args.budgetBreakdown,
      actualSpent: 0,
      aiGenerated: args.aiGenerated,
      generationPrompt: args.generationPrompt,
      isGroupTrip: args.isGroupTrip,
      inviteCode: args.isGroupTrip ? generateInviteCode() : undefined,
      isPublic: args.isPublic,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("tripMembers", {
      tripId,
      userId: args.userId,
      role: "owner",
      joinedAt: now,
    });

    return tripId;
  },
});

// ─── Update Trip ──────────────────────────────────────────────────────────────
export const update = mutation({
  args: {
    tripId: v.id("trips"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    origin: v.optional(
      v.object({
        city: v.string(),
        country: v.string(),
        lat: v.number(),
        lng: v.number(),
      })
    ),
    destination: v.optional(
      v.object({
        city: v.string(),
        country: v.string(),
        lat: v.number(),
        lng: v.number(),
      })
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    totalDays: v.optional(v.number()),
    budgetTotal: v.optional(v.number()),
    budgetBreakdown: v.optional(
      v.object({
        transport: v.number(),
        accommodation: v.number(),
        food: v.number(),
        activities: v.number(),
        other: v.number(),
      })
    ),
    isPublic: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== user._id) throw new Error("Unauthorized");

    const { tripId, ...updates } = args;
    const filteredUpdates: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) filteredUpdates[key] = val;
    }
    filteredUpdates.updatedAt = Date.now();

    await ctx.db.patch(tripId, filteredUpdates);
    return tripId;
  },
});

// ─── Remove Trip ──────────────────────────────────────────────────────────────
export const remove = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== user._id) throw new Error("Unauthorized");

    // Cascade: delete trip days, activities, expenses, members, chat messages
    const tripDays = await ctx.db
      .query("tripDays")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    for (const day of tripDays) {
      const acts = await ctx.db
        .query("activities")
        .withIndex("by_tripDayId", (q) => q.eq("tripDayId", day._id))
        .collect();
      for (const act of acts) {
        await ctx.db.delete(act._id);
      }
      await ctx.db.delete(day._id);
    }

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();
    for (const expense of expenses) {
      await ctx.db.delete(expense._id);
    }

    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.tripId);
    return { success: true };
  },
});

// ─── Get Trip by ID ───────────────────────────────────────────────────────────
export const getById = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    // Allow access if public or if user is a member
    if (trip.isPublic) return trip;

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) return null;

    return trip;
  },
});

// ─── List Trips by User ───────────────────────────────────────────────────────
export const listByUser = query({
  args: {
    numItems: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("planned"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { trips: [], hasMore: false };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { trips: [], hasMore: false };

    const allTrips = await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const filtered = args.status
      ? allTrips.filter((t) => t.status === args.status)
      : allTrips;

    const limit = args.numItems ?? 20;
    const sorted = filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    const trips = sorted.slice(0, limit);

    return {
      trips,
      hasMore: sorted.length > limit,
    };
  },
});

// ─── List Public Trips ────────────────────────────────────────────────────────
export const listPublic = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
      .collect();

    return trips
      .filter((t) => t.status === "completed" || t.status === "planned")
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
});

// ─── Update Status ────────────────────────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    tripId: v.id("trips"),
    status: v.union(
      v.literal("draft"),
      v.literal("planned"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
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

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    if (trip.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.tripId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.tripId;
  },
});

// ─── Update Actual Spent ──────────────────────────────────────────────────────
export const updateActualSpent = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) throw new Error("Unauthorized");

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const totalSpent = expenses.reduce((sum, e) => sum + e.amountEur, 0);

    await ctx.db.patch(args.tripId, {
      actualSpent: totalSpent,
      updatedAt: Date.now(),
    });

    return totalSpent;
  },
});

// ─── Get Trip by Invite Code ──────────────────────────────────────────────────
export const getByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});
