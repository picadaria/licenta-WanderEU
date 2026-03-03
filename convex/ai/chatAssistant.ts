import { v } from "convex/values";
import { action } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";
import { api, internal } from "../_generated/api";

function getAnthropicClient() {
  return new Anthropic();
}

const CHAT_SYSTEM_PROMPT = `You are Wanda, WanderEU's friendly AI travel assistant for EU student trips. You have deep knowledge of European travel on a student budget.

## Your personality
- Warm, enthusiastic, and practical
- You speak like a well-travelled friend, not a corporate travel agent
- Use occasional travel emojis but don't overdo it
- Address the student by name when you know it

## Your capabilities
- Suggest alternatives when something doesn't fit the budget
- Find student discounts, free entry days, and budget-friendly options
- Recommend local food (avoiding tourist traps)
- Help with transport routing (trains, buses, rideshares)
- Advise on safety, cultural norms, and local customs
- Suggest what to pack for the destination and season
- Help adjust the itinerary based on weather or preferences
- Answer questions about visa requirements for EU/EEA students
- Calculate budget splits for group trips

## When suggesting itinerary changes
If the user wants to modify their trip, provide your suggestion as a structured JSON block wrapped in:
<suggestion>
{ ... }
</suggestion>

The JSON should contain the specific changes (day modifications, activity replacements, etc.) matching the trip schema.

## Context
You have access to the current trip details. Always refer to the actual trip data when answering questions about their specific itinerary.

## Constraints
- Always quote prices in EUR
- Prioritise student-friendly options
- Be honest about limitations (you can't book things for them, prices may vary)
- If you don't know something specific, say so and suggest how to find it`;

// ─── Chat with Trip Context ───────────────────────────────────────────────────
export const chat = action({
  args: {
    tripId: v.id("trips"),
    message: v.string(),
    conversationHistory: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    // Fetch trip context
    const trip = await ctx.runQuery(api.trips.getById, { tripId: args.tripId });
    if (!trip) throw new Error("Trip not found");

    const days = await ctx.runQuery(api.tripDays.listByTrip, {
      tripId: args.tripId,
    });

    const activities = await ctx.runQuery(api.activities.listByTrip, {
      tripId: args.tripId,
    });

    const expenses = await ctx.runQuery(api.expenses.listByTrip, {
      tripId: args.tripId,
    });

    // Build trip context string
    const tripContext = buildTripContext(trip, days, activities, expenses, user);

    // Save the user's message to DB
    await ctx.runMutation(internal.chatMessages.createInternal, {
      tripId: args.tripId,
      role: "user",
      content: args.message,
    });

    // Build conversation history for Claude
    const history = (args.conversationHistory ?? []).slice(-10); // Last 10 messages for context

    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `[TRIP CONTEXT]\n${tripContext}\n\n[USER NAME]: ${user.name}\n\n---\n\n${args.message}`,
      },
    ];

    // Add prior conversation (skip the first injection above for subsequent messages)
    if (history.length > 0) {
      const priorMessages: Anthropic.MessageParam[] = history.map((h) => ({
        role: h.role,
        content: h.content,
      }));

      // Insert trip context only in the first user message
      messages.splice(
        0,
        1,
        ...priorMessages,
        { role: "user", content: args.message } as Anthropic.MessageParam
      );

      // Prepend context to the very first user message
      if (messages[0].role === "user") {
        messages[0] = {
          role: "user",
          content: `[TRIP CONTEXT]\n${tripContext}\n\n[USER NAME]: ${user.name}\n\n---\n\n${
            typeof messages[0].content === "string"
              ? messages[0].content
              : args.message
          }`,
        };
      }
    }

    let assistantResponse: string;
    try {
      const response = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: CHAT_SYSTEM_PROMPT,
        messages,
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }
      assistantResponse = textBlock.text;
    } catch (err) {
      throw new Error(`Claude API error: ${String(err)}`);
    }

    // Extract any structured suggestion from the response
    const suggestionMatch = assistantResponse.match(
      /<suggestion>([\s\S]*?)<\/suggestion>/
    );
    const suggestedChanges = suggestionMatch ? suggestionMatch[1].trim() : undefined;

    // Save assistant response to DB
    await ctx.runMutation(internal.chatMessages.createInternal, {
      tripId: args.tripId,
      role: "assistant",
      content: assistantResponse,
      metadata: suggestedChanges
        ? { suggestedChanges, appliedToTrip: false }
        : undefined,
    });

    return {
      response: assistantResponse,
      suggestedChanges: suggestedChanges ?? null,
    };
  },
});

// ─── Build Trip Context ────────────────────────────────────────────────────────
function buildTripContext(
  trip: {
    title: string;
    origin: { city: string; country: string };
    destination: { city: string; country: string };
    startDate: string;
    endDate: string;
    totalDays: number;
    budgetTotal: number;
    actualSpent: number;
    budgetBreakdown: {
      transport: number;
      accommodation: number;
      food: number;
      activities: number;
      other: number;
    };
    status: string;
    isGroupTrip: boolean;
  },
  days: Array<{
    dayNumber: number;
    date: string;
    title?: string;
    dailyBudget: number;
    dailySpent: number;
  }>,
  activities: Array<{
    tripDayId: string;
    type: string;
    title: string;
    startTime?: string;
    estimatedCost: number;
    studentDiscount?: { available: boolean; discountPercent?: number };
  }>,
  expenses: Array<{
    category: string;
    amountEur: number;
    date: string;
    description: string;
  }>,
  user: { name: string; isStudent: boolean; currency: string }
): string {
  const remainingBudget = trip.budgetTotal - trip.actualSpent;
  const budgetUsedPercent =
    trip.budgetTotal > 0
      ? Math.round((trip.actualSpent / trip.budgetTotal) * 100)
      : 0;

  const daysSummary = days
    .slice(0, 5) // First 5 days to keep context manageable
    .map((d) => {
      const dayActs = activities
        .filter((a) => a.tripDayId === (d as { _id?: string } & typeof d)._id)
        .slice(0, 3);
      return `Day ${d.dayNumber} (${d.date}): ${d.title ?? "Untitled"} — Budget: €${d.dailyBudget}. Activities: ${dayActs.map((a) => a.title).join(", ") || "none yet"}`;
    })
    .join("\n");

  return `Trip: "${trip.title}"
Route: ${trip.origin.city}, ${trip.origin.country} → ${trip.destination.city}, ${trip.destination.country}
Dates: ${trip.startDate} to ${trip.endDate} (${trip.totalDays} days)
Status: ${trip.status}
Group trip: ${trip.isGroupTrip ? "Yes" : "No"}
Student: ${user.isStudent ? "Yes" : "No"}

Budget: €${trip.budgetTotal} total | Spent: €${trip.actualSpent} (${budgetUsedPercent}%) | Remaining: €${remainingBudget}
Budget breakdown: Transport €${trip.budgetBreakdown.transport} | Accommodation €${trip.budgetBreakdown.accommodation} | Food €${trip.budgetBreakdown.food} | Activities €${trip.budgetBreakdown.activities} | Other €${trip.budgetBreakdown.other}

Itinerary overview (first 5 days):
${daysSummary}

Total activities: ${activities.length}
Total expenses logged: ${expenses.length} (€${expenses.reduce((s, e) => s + e.amountEur, 0).toFixed(2)} EUR)`;
}
