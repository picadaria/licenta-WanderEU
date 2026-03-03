import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// ─── Create Single Day ────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    tripId: v.id("trips"),
    dayNumber: v.number(),
    date: v.string(),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    dailyBudget: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    return await ctx.db.insert("tripDays", {
      tripId: args.tripId,
      dayNumber: args.dayNumber,
      date: args.date,
      title: args.title,
      notes: args.notes,
      dailyBudget: args.dailyBudget,
      dailySpent: 0,
    });
  },
});

// ─── Create Batch (AI generation) ─────────────────────────────────────────────
export const createBatch = internalMutation({
  args: {
    tripId: v.id("trips"),
    days: v.array(
      v.object({
        dayNumber: v.number(),
        date: v.string(),
        title: v.optional(v.string()),
        notes: v.optional(v.string()),
        dailyBudget: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const dayIds = [];

    for (const day of args.days) {
      const id = await ctx.db.insert("tripDays", {
        tripId: args.tripId,
        dayNumber: day.dayNumber,
        date: day.date,
        title: day.title,
        notes: day.notes,
        dailyBudget: day.dailyBudget,
        dailySpent: 0,
      });
      dayIds.push(id);
    }

    return dayIds;
  },
});

// ─── Update Day ───────────────────────────────────────────────────────────────
export const update = mutation({
  args: {
    dayId: v.id("tripDays"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    dailyBudget: v.optional(v.number()),
    dailySpent: v.optional(v.number()),
    weatherForecast: v.optional(
      v.object({
        temp: v.number(),
        condition: v.string(),
        icon: v.string(),
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

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("Day not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", day.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    const { dayId, ...rest } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(rest)) {
      if (val !== undefined) filtered[key] = val;
    }

    await ctx.db.patch(dayId, filtered);
    return dayId;
  },
});

// ─── Delete Day ───────────────────────────────────────────────────────────────
export const remove = mutation({
  args: { dayId: v.id("tripDays") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const day = await ctx.db.get(args.dayId);
    if (!day) throw new Error("Day not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", day.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    // Delete activities in this day
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_tripDayId", (q) => q.eq("tripDayId", args.dayId))
      .collect();

    for (const act of activities) {
      await ctx.db.delete(act._id);
    }

    await ctx.db.delete(args.dayId);
    return { success: true };
  },
});

// ─── List Days by Trip ────────────────────────────────────────────────────────
export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const trip = await ctx.db.get(args.tripId);
    if (!trip) return [];

    if (!trip.isPublic) {
      const member = await ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      if (!member) return [];
    }

    const days = await ctx.db
      .query("tripDays")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return days.sort((a, b) => a.dayNumber - b.dayNumber);
  },
});
