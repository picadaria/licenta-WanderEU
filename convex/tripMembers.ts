import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roleValidator = v.union(
  v.literal("owner"),
  v.literal("editor"),
  v.literal("viewer")
);

// ─── Add Member ───────────────────────────────────────────────────────────────
export const add = mutation({
  args: {
    tripId: v.id("trips"),
    inviteCode: v.optional(v.string()),
    targetUserId: v.optional(v.id("users")),
    role: v.optional(roleValidator),
    individualBudget: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Determine trip: by direct tripId or via invite code
    let trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");

    // If using invite code, verify it matches
    if (args.inviteCode && trip.inviteCode !== args.inviteCode) {
      throw new Error("Invalid invite code");
    }

    // The user being added — defaults to the authenticated user (joining via invite)
    const memberUserId = args.targetUserId ?? user._id;

    // Only the trip owner can add members directly with a role
    if (args.targetUserId) {
      const requester = await ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      if (!requester || requester.role !== "owner")
        throw new Error("Only the trip owner can add members directly");
    }

    // Check if already a member
    const existing = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), memberUserId))
      .first();

    if (existing) throw new Error("Already a member of this trip");

    return await ctx.db.insert("tripMembers", {
      tripId: args.tripId,
      userId: memberUserId,
      role: args.role ?? "viewer",
      individualBudget: args.individualBudget,
      joinedAt: Date.now(),
    });
  },
});

// ─── Remove Member ────────────────────────────────────────────────────────────
export const remove = mutation({
  args: {
    tripId: v.id("trips"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const requester = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    // Allow: owner removing anyone, or member removing themselves
    if (!requester) throw new Error("Unauthorized");
    if (
      requester.role !== "owner" &&
      args.targetUserId !== user._id
    ) {
      throw new Error("Only trip owner can remove other members");
    }

    // Cannot remove the owner
    const target = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), args.targetUserId))
      .first();

    if (!target) throw new Error("Member not found");
    if (target.role === "owner") throw new Error("Cannot remove the trip owner");

    await ctx.db.delete(target._id);
    return { success: true };
  },
});

// ─── Update Role ──────────────────────────────────────────────────────────────
export const updateRole = mutation({
  args: {
    tripId: v.id("trips"),
    targetUserId: v.id("users"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const requester = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!requester || requester.role !== "owner")
      throw new Error("Only the trip owner can change roles");

    if (args.role === "owner") throw new Error("Cannot assign owner role");

    const target = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), args.targetUserId))
      .first();

    if (!target) throw new Error("Member not found");
    if (target.role === "owner") throw new Error("Cannot change the owner role");

    await ctx.db.patch(target._id, { role: args.role });
    return { success: true };
  },
});

// ─── List Members by Trip ─────────────────────────────────────────────────────
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

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) return [];

    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Hydrate with user data
    const hydrated = await Promise.all(
      members.map(async (m) => {
        const memberUser = await ctx.db.get(m.userId);
        return {
          ...m,
          user: memberUser
            ? {
                name: memberUser.name,
                email: memberUser.email,
                imageUrl: memberUser.imageUrl,
              }
            : null,
        };
      })
    );

    return hydrated.sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return a.joinedAt - b.joinedAt;
    });
  },
});
