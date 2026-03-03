import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// ─── Send Weekly Digest ───────────────────────────────────────────────────────
export const sendWeeklyDigest = internalAction({
  args: {},
  handler: async (ctx): Promise<{ processed: number; sent: number }> => {
    // Fetch all users who have opted into digest emails
    const users: any[] = await ctx.runQuery(internal.cronHandlers.getUsersForDigest);

    let sent = 0;
    for (const user of users) {
      try {
        const trips = await ctx.runQuery(
          internal.cronHandlers.getUserActiveTrips,
          { userId: user._id }
        );

        if (trips.length === 0) continue;

        // For now: send a simple notification. In production, build a real digest.
        await ctx.runMutation(internal.emails.insertEmailLogMutation, {
          userId: user._id,
          type: "weekly_digest",
          status: "skipped_no_template",
        });

        sent++;
      } catch (err) {
        console.error(`Digest failed for user ${user._id}:`, err);
      }
    }

    console.log(`Weekly digest: processed ${users.length} users, sent ${sent}`);
    return { processed: users.length, sent };
  },
});

// ─── Send Trip Reminders ──────────────────────────────────────────────────────
export const sendTripReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number }> => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // 7-day reminder
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // 1-day reminder
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const trips7 = await ctx.runQuery(
      internal.cronHandlers.getTripsByStartDate,
      { startDate: in7Days }
    );

    const trips1 = await ctx.runQuery(
      internal.cronHandlers.getTripsByStartDate,
      { startDate: tomorrow }
    );

    let sent = 0;

    for (const trip of [...trips7, ...trips1]) {
      const daysUntilTrip = trip.startDate === in7Days ? 7 : 1;
      const user = await ctx.runQuery(internal.cronHandlers.getUserById, {
        userId: trip.userId,
      });

      if (!user) continue;

      const result = await ctx.runAction(internal.emails.sendTripReminder, {
        userId: user._id,
        email: user.email,
        name: user.name,
        tripTitle: trip.title,
        tripId: trip._id,
        destination: `${trip.destination.city}, ${trip.destination.country}`,
        startDate: trip.startDate,
        daysUntilTrip,
      });

      if (result.success) sent++;
    }

    console.log(
      `Trip reminders: sent ${sent} for dates ${in7Days} and ${tomorrow}`
    );
    return { sent };
  },
});

// ─── Send Daily Itinerary ──────────────────────────────────────────────────────
export const sendDailyItinerary = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number; date: string }> => {
    const today = new Date().toISOString().split("T")[0];

    const activeTrips = await ctx.runQuery(
      internal.cronHandlers.getActiveTripsForDate,
      { date: today }
    );

    let sent = 0;

    for (const tripData of activeTrips) {
      const user = await ctx.runQuery(internal.cronHandlers.getUserById, {
        userId: tripData.userId,
      });

      if (!user) continue;

      // Log it (the actual daily email would be built with today's activities)
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: user._id,
        type: "daily_itinerary",
        status: "queued",
      });

      sent++;
    }

    console.log(`Daily itinerary: queued ${sent} emails for ${today}`);
    return { sent, date: today };
  },
});

// ─── Check Budget Alerts ───────────────────────────────────────────────────────
export const checkBudgetAlerts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number }> => {
    const tripsOverThreshold = await ctx.runQuery(
      internal.cronHandlers.getTripsOverBudgetThreshold,
      { thresholdPercent: 80 }
    );

    let sent = 0;

    for (const trip of tripsOverThreshold) {
      const user = await ctx.runQuery(internal.cronHandlers.getUserById, {
        userId: trip.userId,
      });

      if (!user) continue;

      const percentUsed =
        trip.budgetTotal > 0
          ? Math.round((trip.actualSpent / trip.budgetTotal) * 100)
          : 0;

      // Check if we already sent an alert for this trip recently (within 12h)
      const recentAlerts = await ctx.runQuery(
        internal.cronHandlers.getRecentEmailLogs,
        { userId: user._id, type: "budget_alert", withinMs: 12 * 60 * 60 * 1000 }
      );

      if (recentAlerts.length > 0) continue;

      const result = await ctx.runAction(internal.emails.sendBudgetAlert, {
        userId: user._id,
        email: user.email,
        name: user.name,
        tripTitle: trip.title,
        tripId: trip._id,
        budgetTotal: trip.budgetTotal,
        actualSpent: trip.actualSpent,
        percentUsed,
      });

      if (result.success) sent++;
    }

    console.log(`Budget alerts: sent ${sent}`);
    return { sent };
  },
});

// ─── Mark Completed Trips ─────────────────────────────────────────────────────
export const markCompletedTrips = internalAction({
  args: {},
  handler: async (ctx): Promise<{ marked: number }> => {
    const today = new Date().toISOString().split("T")[0];

    const expiredTrips = await ctx.runQuery(
      internal.cronHandlers.getActiveTripsEndedBefore,
      { date: today }
    );

    let marked = 0;

    for (const trip of expiredTrips) {
      await ctx.runMutation(internal.cronHandlers.setTripCompleted, {
        tripId: trip._id,
      });
      marked++;
    }

    console.log(`Marked ${marked} trips as completed`);
    return { marked };
  },
});

// ─── Internal Queries used by cron handlers ───────────────────────────────────
import { internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const getUsersForDigest = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserActiveTrips = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "planned"))
      )
      .collect();
  },
});

export const getTripsByStartDate = internalQuery({
  args: { startDate: v.string() },
  handler: async (ctx, args) => {
    const allTrips = await ctx.db.query("trips").collect();
    return allTrips.filter(
      (t) =>
        t.startDate === args.startDate &&
        (t.status === "planned" || t.status === "draft")
    );
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getActiveTripsForDate = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const allTrips = await ctx.db.query("trips").collect();
    return allTrips.filter(
      (t) =>
        t.status === "active" &&
        t.startDate <= args.date &&
        t.endDate >= args.date
    );
  },
});

export const getTripsOverBudgetThreshold = internalQuery({
  args: { thresholdPercent: v.number() },
  handler: async (ctx, args) => {
    const allTrips = await ctx.db.query("trips").collect();
    return allTrips.filter(
      (t) =>
        t.status === "active" &&
        t.budgetTotal > 0 &&
        t.actualSpent / t.budgetTotal >= args.thresholdPercent / 100
    );
  },
});

export const getRecentEmailLogs = internalQuery({
  args: {
    userId: v.id("users"),
    type: v.string(),
    withinMs: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.withinMs;
    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return logs.filter(
      (l) => l.type === args.type && l.sentAt >= cutoff && l.status === "sent"
    );
  },
});

export const getActiveTripsEndedBefore = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const allTrips = await ctx.db.query("trips").collect();
    return allTrips.filter(
      (t) => t.status === "active" && t.endDate < args.date
    );
  },
});

// ─── Internal Mutations used by cron handlers ─────────────────────────────────
export const setTripCompleted = internalMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tripId, {
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});
