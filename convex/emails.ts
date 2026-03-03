import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM_EMAIL = "WanderEU <hello@wandereu.app>";

// ─── Log Email ────────────────────────────────────────────────────────────────
async function logEmail(
  ctx: {
    runMutation: (
      fn: unknown,
      args: {
        userId: Id<"users">;
        type: string;
        resendId?: string;
        status: string;
      }
    ) => Promise<unknown>;
  },
  userId: Id<"users">,
  type: string,
  resendId: string | undefined,
  status: string
) {
  await ctx.runMutation(internal.emails.logEmailInternal, {
    userId,
    type,
    resendId,
    status,
  });
}

// ─── Internal: Log email to DB ────────────────────────────────────────────────
export const logEmailInternal = internalAction({
  args: {
    userId: v.id("users"),
    type: v.string(),
    resendId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // We use runMutation to write to the DB from within an action
    // This is a self-referential pattern — use a separate internal mutation in production
    // For now we directly insert via internal mutation
    return args; // Placeholder — actual insert done in the mutation below
  },
});

export const insertEmailLog = internalAction({
  args: {
    userId: v.id("users"),
    type: v.string(),
    resendId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Handled by internal mutation
    return null;
  },
});

// ─── Send Welcome Email ────────────────────────────────────────────────────────
export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [args.email],
        subject: "Welcome to WanderEU — your EU adventure starts now",
        html: buildWelcomeEmailHtml(args.name),
      });

      if (error) throw error;

      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "welcome",
        resendId: data?.id,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (err) {
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "welcome",
        status: "failed",
      });
      console.error("Welcome email failed:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ─── Send Trip Summary ─────────────────────────────────────────────────────────
export const sendTripSummary = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    tripTitle: v.string(),
    tripId: v.id("trips"),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    totalDays: v.number(),
    budgetTotal: v.number(),
    totalActivities: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [args.email],
        subject: `Your WanderEU trip to ${args.destination} is ready!`,
        html: buildTripSummaryEmailHtml(args),
      });

      if (error) throw error;

      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "trip_summary",
        resendId: data?.id,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (err) {
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "trip_summary",
        status: "failed",
      });
      console.error("Trip summary email failed:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ─── Send Budget Alert ─────────────────────────────────────────────────────────
export const sendBudgetAlert = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    tripTitle: v.string(),
    tripId: v.id("trips"),
    budgetTotal: v.number(),
    actualSpent: v.number(),
    percentUsed: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [args.email],
        subject: `Budget alert: You've used ${args.percentUsed}% of your ${args.tripTitle} budget`,
        html: buildBudgetAlertEmailHtml(args),
      });

      if (error) throw error;

      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "budget_alert",
        resendId: data?.id,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (err) {
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "budget_alert",
        status: "failed",
      });
      console.error("Budget alert email failed:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ─── Send Group Invite ─────────────────────────────────────────────────────────
export const sendGroupInvite = internalAction({
  args: {
    userId: v.id("users"),
    inviterEmail: v.string(),
    inviterName: v.string(),
    recipientEmail: v.string(),
    tripTitle: v.string(),
    tripId: v.id("trips"),
    destination: v.string(),
    startDate: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [args.recipientEmail],
        subject: `${args.inviterName} invited you to a WanderEU trip to ${args.destination}`,
        html: buildGroupInviteEmailHtml(args),
      });

      if (error) throw error;

      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "group_invite",
        resendId: data?.id,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (err) {
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "group_invite",
        status: "failed",
      });
      console.error("Group invite email failed:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ─── Send Trip Reminder ────────────────────────────────────────────────────────
export const sendTripReminder = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.string(),
    tripTitle: v.string(),
    tripId: v.id("trips"),
    destination: v.string(),
    startDate: v.string(),
    daysUntilTrip: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [args.email],
        subject: `Your trip to ${args.destination} is in ${args.daysUntilTrip} days!`,
        html: buildTripReminderEmailHtml(args),
      });

      if (error) throw error;

      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "trip_reminder",
        resendId: data?.id,
        status: "sent",
      });

      return { success: true, id: data?.id };
    } catch (err) {
      await ctx.runMutation(internal.emails.insertEmailLogMutation, {
        userId: args.userId,
        type: "trip_reminder",
        status: "failed",
      });
      console.error("Trip reminder email failed:", err);
      return { success: false, error: String(err) };
    }
  },
});

// ─── Internal Mutation for email logging ──────────────────────────────────────
// This lives here but is called via internal.emails.insertEmailLogMutation
// In the Convex model, actions cannot write to DB directly; they use mutations.
import { internalMutation } from "./_generated/server";

export const insertEmailLogMutation = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    resendId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      userId: args.userId,
      type: args.type,
      resendId: args.resendId,
      status: args.status,
      sentAt: Date.now(),
    });
  },
});

// ─── Email HTML Builders ───────────────────────────────────────────────────────
const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #faf9f7; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; padding: 0; }
    .header { background-color: #c84b31; padding: 40px 40px 32px; text-align: center; }
    .header h1 { font-family: 'Instrument Serif', Georgia, serif; color: #ffffff; font-size: 28px; font-weight: 400; letter-spacing: -0.5px; }
    .header .logo-sub { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 4px; }
    .body { background: #faf9f7; padding: 40px; }
    .body h2 { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; color: #1a1a1a; margin-bottom: 16px; }
    .body p { font-size: 15px; line-height: 1.6; color: #444; margin-bottom: 14px; }
    .cta-button { display: inline-block; background-color: #c84b31; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0; }
    .card { background: #ffffff; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e8e4df; }
    .stat { display: inline-block; margin-right: 24px; margin-bottom: 12px; }
    .stat-value { font-family: 'Instrument Serif', Georgia, serif; font-size: 24px; color: #c84b31; }
    .stat-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { padding: 24px 40px; text-align: center; background: #f0ede8; }
    .footer p { font-size: 12px; color: #888; line-height: 1.5; }
    .divider { height: 1px; background: #e8e4df; margin: 24px 0; }
    .tip { background: #fff8f5; border-left: 3px solid #c84b31; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; color: #555; }
  </style>`;

const FOOTER_HTML = `
  <div class="footer">
    <p>WanderEU — Budget travel for EU students<br>
    You're receiving this because you have a WanderEU account.<br>
    <a href="#" style="color: #c84b31;">Unsubscribe</a> &nbsp;|&nbsp; <a href="#" style="color: #c84b31;">Privacy Policy</a></p>
  </div>`;

function buildWelcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body><div class="container">
  <div class="header">
    <h1>WanderEU</h1>
    <div class="logo-sub">Budget travel for EU students</div>
  </div>
  <div class="body">
    <h2>Welcome, ${name}!</h2>
    <p>You've just unlocked the smartest way for EU students to plan budget trips across Europe. From Prague to Porto, Budapest to Barcelona — we've got you covered.</p>
    <div class="card">
      <p style="font-weight: 600; margin-bottom: 12px;">Here's what you can do with WanderEU:</p>
      <p>🗺️ <strong>AI-powered itineraries</strong> — Get a full day-by-day plan in seconds, tailored to your budget and interests</p>
      <p>🎓 <strong>Student discounts</strong> — We surface every student deal at your destination automatically</p>
      <p>💶 <strong>Budget tracking</strong> — Log expenses and see exactly where your money goes</p>
      <p>👥 <strong>Group planning</strong> — Invite friends and plan together in real time</p>
    </div>
    <div class="tip">💡 <strong>Pro tip:</strong> Start by planning a weekend trip first. Enter your budget and let our AI build the itinerary — you can tweak everything afterwards.</div>
    <br>
    <a href="https://wandereu.app/plan" class="cta-button">Plan my first trip →</a>
  </div>
  ${FOOTER_HTML}
</div></body></html>`;
}

function buildTripSummaryEmailHtml(args: {
  name: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  budgetTotal: number;
  totalActivities: number;
  tripId: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body><div class="container">
  <div class="header">
    <h1>${args.destination}</h1>
    <div class="logo-sub">Your WanderEU itinerary is ready</div>
  </div>
  <div class="body">
    <h2>${args.tripTitle}</h2>
    <p>Hi ${args.name}, your AI-generated itinerary is ready to explore. Here's a quick summary:</p>
    <div class="card">
      <div class="stat"><div class="stat-value">${args.totalDays}</div><div class="stat-label">Days</div></div>
      <div class="stat"><div class="stat-value">€${args.budgetTotal}</div><div class="stat-label">Budget</div></div>
      <div class="stat"><div class="stat-value">${args.totalActivities}</div><div class="stat-label">Activities</div></div>
      <div class="divider"></div>
      <p><strong>Dates:</strong> ${args.startDate} – ${args.endDate}</p>
      <p><strong>Destination:</strong> ${args.destination}</p>
    </div>
    <p>Your itinerary includes transport, accommodation, meals, and activities — all optimised for your budget with student discounts highlighted.</p>
    <a href="https://wandereu.app/trips/${args.tripId}" class="cta-button">View my itinerary →</a>
    <div class="tip">💡 You can chat with Wanda, your AI travel assistant, to adjust anything in the itinerary.</div>
  </div>
  ${FOOTER_HTML}
</div></body></html>`;
}

function buildBudgetAlertEmailHtml(args: {
  name: string;
  tripTitle: string;
  budgetTotal: number;
  actualSpent: number;
  percentUsed: number;
  tripId: string;
}): string {
  const remaining = args.budgetTotal - args.actualSpent;
  const isOverBudget = remaining < 0;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body><div class="container">
  <div class="header">
    <h1>${isOverBudget ? "Budget Exceeded" : "Budget Alert"}</h1>
    <div class="logo-sub">WanderEU spending update</div>
  </div>
  <div class="body">
    <h2>Hi ${args.name},</h2>
    <p>${isOverBudget
      ? `You've gone over your budget for <strong>${args.tripTitle}</strong>. Here's your current spending breakdown:`
      : `You've used <strong>${args.percentUsed}%</strong> of your budget for <strong>${args.tripTitle}</strong>.`
    }</p>
    <div class="card">
      <div class="stat"><div class="stat-value">€${args.actualSpent.toFixed(0)}</div><div class="stat-label">Spent</div></div>
      <div class="stat"><div class="stat-value">€${args.budgetTotal}</div><div class="stat-label">Total Budget</div></div>
      <div class="stat"><div class="stat-value" style="color: ${isOverBudget ? '#dc2626' : '#16a34a'}">€${Math.abs(remaining).toFixed(0)}</div><div class="stat-label">${isOverBudget ? 'Over budget' : 'Remaining'}</div></div>
    </div>
    ${isOverBudget
      ? `<div class="tip">💡 <strong>Quick saves:</strong> Switch to a supermarket meal (€3-5), take public transport instead of rideshares, or ask Wanda for free activities nearby.</div>`
      : `<div class="tip">💡 You're on track! Keep logging expenses to stay aware of your spending.</div>`
    }
    <a href="https://wandereu.app/trips/${args.tripId}/expenses" class="cta-button">View expenses →</a>
  </div>
  ${FOOTER_HTML}
</div></body></html>`;
}

function buildGroupInviteEmailHtml(args: {
  inviterName: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  inviteCode: string;
  tripId: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body><div class="container">
  <div class="header">
    <h1>${args.destination}</h1>
    <div class="logo-sub">You've been invited to a WanderEU trip</div>
  </div>
  <div class="body">
    <h2>${args.inviterName} wants you to join their trip!</h2>
    <p><strong>${args.inviterName}</strong> is planning a trip to <strong>${args.destination}</strong> starting <strong>${args.startDate}</strong> and has invited you to join via WanderEU.</p>
    <div class="card">
      <p><strong>Trip:</strong> ${args.tripTitle}</p>
      <p><strong>Destination:</strong> ${args.destination}</p>
      <p><strong>Starting:</strong> ${args.startDate}</p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #888;">Invite code: <code style="background: #f0ede8; padding: 2px 8px; border-radius: 4px; font-size: 14px;">${args.inviteCode}</code></p>
    </div>
    <a href="https://wandereu.app/join/${args.inviteCode}" class="cta-button">Join this trip →</a>
    <p style="margin-top: 20px; font-size: 13px; color: #888;">Don't have a WanderEU account? You'll be able to create one for free when you click the button above.</p>
  </div>
  ${FOOTER_HTML}
</div></body></html>`;
}

function buildTripReminderEmailHtml(args: {
  name: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  daysUntilTrip: number;
  tripId: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body><div class="container">
  <div class="header">
    <h1>${args.daysUntilTrip === 1 ? "Tomorrow!" : `${args.daysUntilTrip} Days To Go!`}</h1>
    <div class="logo-sub">Your ${args.destination} adventure is almost here</div>
  </div>
  <div class="body">
    <h2>Ready, ${args.name}?</h2>
    <p>Your trip to <strong>${args.destination}</strong> is just <strong>${args.daysUntilTrip} day${args.daysUntilTrip === 1 ? "" : "s"}</strong> away (${args.startDate}). Here's a quick pre-departure checklist:</p>
    <div class="card">
      <p>✅ Check your passport/ID card is valid for the trip</p>
      <p>✅ Download offline maps (Google Maps, Maps.me)</p>
      <p>✅ Screenshot your accommodation booking references</p>
      <p>✅ Notify your bank of travel dates to avoid card blocks</p>
      <p>✅ Get a local SIM or check roaming costs (EU roaming is often free!)</p>
      <p>✅ Pack your student ID for discounts</p>
    </div>
    <a href="https://wandereu.app/trips/${args.tripId}" class="cta-button">Review my itinerary →</a>
    <div class="tip">💡 EU citizens have free emergency healthcare across the EU with the EHIC card. Make sure yours is valid!</div>
  </div>
  ${FOOTER_HTML}
</div></body></html>`;
}
