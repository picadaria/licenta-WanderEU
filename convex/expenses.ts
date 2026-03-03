import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const categoryValidator = v.union(
  v.literal("transport"),
  v.literal("accommodation"),
  v.literal("food"),
  v.literal("activity"),
  v.literal("shopping"),
  v.literal("other")
);

// ─── Create Expense ───────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    tripId: v.id("trips"),
    activityId: v.optional(v.id("activities")),
    amount: v.number(),
    currency: v.string(),
    amountEur: v.number(),
    category: categoryValidator,
    description: v.string(),
    date: v.string(),
    receiptUrl: v.optional(v.string()),
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

    const expenseId = await ctx.db.insert("expenses", {
      tripId: args.tripId,
      userId: user._id,
      activityId: args.activityId,
      amount: args.amount,
      currency: args.currency,
      amountEur: args.amountEur,
      category: args.category,
      description: args.description,
      date: args.date,
      receiptUrl: args.receiptUrl,
      createdAt: Date.now(),
    });

    // Update the trip's actualSpent field
    const allExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const totalSpent = allExpenses.reduce((sum, e) => sum + e.amountEur, 0);
    await ctx.db.patch(args.tripId, {
      actualSpent: totalSpent,
      updatedAt: Date.now(),
    });

    return expenseId;
  },
});

// ─── Delete Expense ───────────────────────────────────────────────────────────
export const remove = mutation({
  args: { expenseId: v.id("expenses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const expense = await ctx.db.get(args.expenseId);
    if (!expense) throw new Error("Expense not found");

    // Only the expense creator or trip owner can delete
    if (expense.userId !== user._id) {
      const trip = await ctx.db.get(expense.tripId);
      if (!trip || trip.userId !== user._id) {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.delete(args.expenseId);

    // Recalculate actualSpent
    const remaining = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", expense.tripId))
      .collect();

    const totalSpent = remaining.reduce((sum, e) => sum + e.amountEur, 0);
    await ctx.db.patch(expense.tripId, {
      actualSpent: totalSpent,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ─── List Expenses by Trip ────────────────────────────────────────────────────
export const listByTrip = query({
  args: {
    tripId: v.id("trips"),
    category: v.optional(categoryValidator),
  },
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

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const filtered = args.category
      ? expenses.filter((e) => e.category === args.category)
      : expenses;

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ─── Get Total by Category ────────────────────────────────────────────────────
export const getTotalByCategory = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const member = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (!member) return null;

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const totals: Record<string, number> = {
      transport: 0,
      accommodation: 0,
      food: 0,
      activity: 0,
      shopping: 0,
      other: 0,
    };

    for (const expense of expenses) {
      totals[expense.category] = (totals[expense.category] ?? 0) + expense.amountEur;
    }

    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

    return { ...totals, total: grandTotal };
  },
});

// ─── Get Daily Spending ────────────────────────────────────────────────────────
export const getDailySpending = query({
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

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const byDate: Record<string, number> = {};
    for (const expense of expenses) {
      byDate[expense.date] = (byDate[expense.date] ?? 0) + expense.amountEur;
    }

    return Object.entries(byDate)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
