import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// ─── Create Message ───────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    tripId: v.id("trips"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(
      v.object({
        suggestedChanges: v.optional(v.string()),
        appliedToTrip: v.optional(v.boolean()),
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

    // Verify trip membership
    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) throw new Error("Unauthorized: not a trip member");

    return await ctx.db.insert("chatMessages", {
      tripId: args.tripId,
      userId: user._id,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// ─── Internal Create Message (for AI responses) ───────────────────────────────
export const createInternal = internalMutation({
  args: {
    tripId: v.id("trips"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(
      v.object({
        suggestedChanges: v.optional(v.string()),
        appliedToTrip: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      tripId: args.tripId,
      userId: undefined,
      role: args.role,
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// ─── List Messages by Trip ────────────────────────────────────────────────────
export const listByTrip = query({
  args: {
    tripId: v.id("trips"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()), // createdAt of oldest message loaded
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { messages: [], hasMore: false };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return { messages: [], hasMore: false };

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) return { messages: [], hasMore: false };

    const limit = args.limit ?? 50;

    let messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Apply cursor-based pagination (load older messages)
    if (args.cursor !== undefined) {
      messages = messages.filter((m) => m.createdAt < args.cursor!);
    }

    const sorted = messages.sort((a, b) => a.createdAt - b.createdAt);
    const paginated = sorted.slice(-limit); // Get last N messages

    return {
      messages: paginated,
      hasMore: sorted.length > limit,
    };
  },
});

// ─── Mark suggestion as applied ──────────────────────────────────────────────
export const markSuggestionApplied = mutation({
  args: { messageId: v.id("chatMessages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.messageId, {
      metadata: {
        ...message.metadata,
        appliedToTrip: true,
      },
    });

    return { success: true };
  },
});
