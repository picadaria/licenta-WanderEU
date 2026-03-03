import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ─── Weekly Digest — Every Sunday at 9:00 AM UTC ──────────────────────────────
crons.weekly(
  "weekly-digest",
  { dayOfWeek: "sunday", hourUTC: 9, minuteUTC: 0 },
  internal.cronHandlers.sendWeeklyDigest
);

// ─── Trip Reminders — Daily at 8:00 AM UTC ───────────────────────────────────
// Checks for trips starting in exactly 7 days and 1 day
crons.daily(
  "trip-reminders",
  { hourUTC: 8, minuteUTC: 0 },
  internal.cronHandlers.sendTripReminders
);

// ─── Daily Itinerary Email — Daily at 7:00 AM UTC ─────────────────────────────
// Sends the day's itinerary to users with active trips
crons.daily(
  "daily-itinerary",
  { hourUTC: 7, minuteUTC: 0 },
  internal.cronHandlers.sendDailyItinerary
);

// ─── Budget Alert Check — Every 6 hours ──────────────────────────────────────
// Checks active trips where actualSpent > 80% of budgetTotal
crons.interval(
  "budget-alert-check",
  { hours: 6 },
  internal.cronHandlers.checkBudgetAlerts
);

// ─── Mark Completed Trips — Daily at midnight UTC ────────────────────────────
// Moves "active" trips past their endDate to "completed"
crons.daily(
  "mark-completed-trips",
  { hourUTC: 0, minuteUTC: 5 },
  internal.cronHandlers.markCompletedTrips
);

export default crons;
