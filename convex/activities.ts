import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

const activityTypeValidator = v.union(
  v.literal("transport"),
  v.literal("accommodation"),
  v.literal("food"),
  v.literal("activity"),
  v.literal("free_time"),
  v.literal("flight"),
  v.literal("checkin"),
  v.literal("checkout")
);

const locationValidator = v.optional(
  v.object({
    name: v.string(),
    address: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    googlePlaceId: v.optional(v.string()),
  })
);

const studentDiscountValidator = v.optional(
  v.object({
    available: v.boolean(),
    discountPercent: v.optional(v.number()),
    details: v.optional(v.string()),
  })
);

// ─── Create Activity ──────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    tripDayId: v.id("tripDays"),
    tripId: v.id("trips"),
    order: v.number(),
    type: activityTypeValidator,
    title: v.string(),
    description: v.optional(v.string()),
    location: locationValidator,
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    estimatedCost: v.number(),
    currency: v.string(),
    bookingUrl: v.optional(v.string()),
    bookingReference: v.optional(v.string()),
    isBooked: v.optional(v.boolean()),
    studentDiscount: studentDiscountValidator,
    notes: v.optional(v.string()),
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

    return await ctx.db.insert("activities", {
      tripDayId: args.tripDayId,
      tripId: args.tripId,
      order: args.order,
      type: args.type,
      title: args.title,
      description: args.description,
      location: args.location,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: args.duration,
      estimatedCost: args.estimatedCost,
      actualCost: undefined,
      currency: args.currency,
      bookingUrl: args.bookingUrl,
      bookingReference: args.bookingReference,
      isBooked: args.isBooked ?? false,
      studentDiscount: args.studentDiscount,
      notes: args.notes,
      aiSuggestion: false,
    });
  },
});

// ─── Create Batch (AI generation) ─────────────────────────────────────────────
export const createBatch = internalMutation({
  args: {
    activities: v.array(
      v.object({
        tripDayId: v.id("tripDays"),
        tripId: v.id("trips"),
        order: v.number(),
        type: activityTypeValidator,
        title: v.string(),
        description: v.optional(v.string()),
        location: locationValidator,
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        duration: v.optional(v.number()),
        estimatedCost: v.number(),
        currency: v.string(),
        bookingUrl: v.optional(v.string()),
        isBooked: v.optional(v.boolean()),
        studentDiscount: studentDiscountValidator,
        notes: v.optional(v.string()),
        aiSuggestion: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];

    for (const act of args.activities) {
      const id = await ctx.db.insert("activities", {
        tripDayId: act.tripDayId,
        tripId: act.tripId,
        order: act.order,
        type: act.type,
        title: act.title,
        description: act.description,
        location: act.location,
        startTime: act.startTime,
        endTime: act.endTime,
        duration: act.duration,
        estimatedCost: act.estimatedCost,
        actualCost: undefined,
        currency: act.currency,
        bookingUrl: act.bookingUrl,
        bookingReference: undefined,
        isBooked: act.isBooked ?? false,
        studentDiscount: act.studentDiscount,
        notes: act.notes,
        aiSuggestion: act.aiSuggestion ?? true,
      });
      ids.push(id);
    }

    return ids;
  },
});

// ─── Update Activity ──────────────────────────────────────────────────────────
export const update = mutation({
  args: {
    activityId: v.id("activities"),
    order: v.optional(v.number()),
    type: v.optional(activityTypeValidator),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: locationValidator,
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    duration: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    currency: v.optional(v.string()),
    bookingUrl: v.optional(v.string()),
    bookingReference: v.optional(v.string()),
    isBooked: v.optional(v.boolean()),
    studentDiscount: studentDiscountValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", activity.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    const { activityId, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined) filtered[key] = val;
    }

    await ctx.db.patch(activityId, filtered);
    return activityId;
  },
});

// ─── Delete Activity ──────────────────────────────────────────────────────────
export const remove = mutation({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("Activity not found");

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", activity.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    await ctx.db.delete(args.activityId);
    return { success: true };
  },
});

// ─── Reorder Activities ───────────────────────────────────────────────────────
export const reorder = mutation({
  args: {
    tripId: v.id("trips"),
    reorders: v.array(
      v.object({
        activityId: v.id("activities"),
        order: v.number(),
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

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member || member.role === "viewer") throw new Error("Unauthorized");

    for (const { activityId, order } of args.reorders) {
      const activity = await ctx.db.get(activityId);
      if (!activity) continue;
      if (activity.tripId !== args.tripId)
        throw new Error("Activity does not belong to this trip");
      await ctx.db.patch(activityId, { order });
    }

    return { success: true };
  },
});

// ─── List Activities by Day ────────────────────────────────────────────────────
export const listByDay = query({
  args: { tripDayId: v.id("tripDays") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const day = await ctx.db.get(args.tripDayId);
    if (!day) return [];

    const trip = await ctx.db.get(day.tripId);
    if (!trip) return [];

    if (!trip.isPublic) {
      const member = await ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", day.tripId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      if (!member) return [];
    }

    const acts = await ctx.db
      .query("activities")
      .withIndex("by_tripDayId", (q) => q.eq("tripDayId", args.tripDayId))
      .collect();

    return acts.sort((a, b) => a.order - b.order);
  },
});

// ─── List Activities by Trip ───────────────────────────────────────────────────
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

    const acts = await ctx.db
      .query("activities")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return acts.sort((a, b) => a.order - b.order);
  },
});
