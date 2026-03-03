import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

function getAnthropicClient() {
  return new Anthropic();
}

const SYSTEM_PROMPT = `You are WanderEU's expert EU student travel planner. You create detailed, realistic, budget-conscious travel itineraries for university students travelling within Europe.

## Core Rules
1. ALL costs must be in EUR. Convert any local prices accurately.
2. ALWAYS prioritise student discounts (ISIC card, EU student card, NUS, local student IDs). Flag every discount with a "studentDiscount" object.
3. REALISTIC travel times: include walking, waiting, transit times. Never assume teleportation between sites.
4. Budget restaurants first: look for student canteens (menses), local markets, supermarkets for picnic lunches, and budget chains.
5. Include exact opening hours and note when attractions are FREE on certain days/times.
6. Add a 10% buffer into the total budget for unexpected costs.
7. Always suggest at least 2 free alternatives per day (parks, free museums, walking tours, city beaches, etc.).
8. Accommodation: hostels, student dorms, Couchsurfing, budget guesthouses. Never 4-star hotels unless explicitly requested.
9. Transport: trains, buses, low-cost flights (Ryanair/Wizz/easyJet), city transit passes over taxis.
10. Group trips: split costs fairly, note shared accommodation savings.

## Output Format
Return ONLY valid JSON matching this exact structure:

{
  "title": "string",
  "description": "string",
  "coverImageQuery": "string (Unsplash search query for cover photo)",
  "tags": ["string"],
  "budgetBreakdown": {
    "transport": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "other": number
  },
  "days": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD",
      "title": "string",
      "notes": "string",
      "dailyBudget": number,
      "activities": [
        {
          "order": number,
          "type": "transport" | "accommodation" | "food" | "activity" | "free_time" | "flight" | "checkin" | "checkout",
          "title": "string",
          "description": "string",
          "location": {
            "name": "string",
            "address": "string",
            "lat": number,
            "lng": number
          },
          "startTime": "HH:mm",
          "endTime": "HH:mm",
          "duration": number (minutes),
          "estimatedCost": number (EUR),
          "currency": "EUR",
          "studentDiscount": {
            "available": boolean,
            "discountPercent": number | null,
            "details": "string"
          },
          "notes": "string",
          "bookingUrl": "string | null"
        }
      ]
    }
  ],
  "travelTips": ["string"],
  "packingList": ["string"],
  "emergencyInfo": {
    "localEmergencyNumber": "string",
    "nearestHospital": "string",
    "embassyPhone": "string"
  }
}

Be thorough, specific, and practical. Use real place names, realistic prices, and genuine student travel wisdom.`;

interface GenerateTripArgs {
  origin: { city: string; country: string; lat: number; lng: number };
  destination: { city: string; country: string; lat: number; lng: number };
  startDate: string;
  endDate: string;
  totalDays: number;
  budgetTotal: number;
  preferences: {
    comfortLevel: "budget" | "mid-range" | "comfort";
    interests: string[];
    dietaryRestrictions: string[];
  };
  isStudent: boolean;
  isGroupTrip: boolean;
  groupSize?: number;
  generationPrompt?: string;
}

// ─── Public Action (called from client) ───────────────────────────────────────
export const generateTrip = action({
  args: {
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
    preferences: v.object({
      comfortLevel: v.union(
        v.literal("budget"),
        v.literal("mid-range"),
        v.literal("comfort")
      ),
      interests: v.array(v.string()),
      dietaryRestrictions: v.array(v.string()),
    }),
    isStudent: v.optional(v.boolean()),
    isGroupTrip: v.optional(v.boolean()),
    groupSize: v.optional(v.number()),
    generationPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ tripId: Id<"trips"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.runQuery(api.users.getCurrentUser);
    if (!user) throw new Error("User not found");

    const result = await ctx.runAction(internal.ai.generateTrip.generateTripInternal, {
      ...args,
      userId: user._id,
      isStudent: args.isStudent ?? user.isStudent,
      isGroupTrip: args.isGroupTrip ?? false,
    });

    return result;
  },
});

// ─── Internal Action (does the actual generation + storage) ───────────────────
export const generateTripInternal = internalAction({
  args: {
    userId: v.id("users"),
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
    preferences: v.object({
      comfortLevel: v.union(
        v.literal("budget"),
        v.literal("mid-range"),
        v.literal("comfort")
      ),
      interests: v.array(v.string()),
      dietaryRestrictions: v.array(v.string()),
    }),
    isStudent: v.boolean(),
    isGroupTrip: v.boolean(),
    groupSize: v.optional(v.number()),
    generationPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ tripId: Id<"trips"> }> => {
    const userPrompt = buildUserPrompt(args as GenerateTripArgs);

    let rawContent: string;
    try {
      const message = await getAnthropicClient().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }
      rawContent = textBlock.text;
    } catch (err) {
      throw new Error(`Claude API error: ${String(err)}`);
    }

    // Extract JSON from the response (Claude sometimes wraps in markdown)
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)```/) ||
      rawContent.match(/```\s*([\s\S]*?)```/) ||
      [null, rawContent];

    let parsed: {
      title: string;
      description: string;
      tags: string[];
      budgetBreakdown: {
        transport: number;
        accommodation: number;
        food: number;
        activities: number;
        other: number;
      };
      days: Array<{
        dayNumber: number;
        date: string;
        title: string;
        notes: string;
        dailyBudget: number;
        activities: Array<{
          order: number;
          type: string;
          title: string;
          description: string;
          location?: {
            name: string;
            address?: string;
            lat?: number;
            lng?: number;
          };
          startTime?: string;
          endTime?: string;
          duration?: number;
          estimatedCost: number;
          currency: string;
          studentDiscount?: {
            available: boolean;
            discountPercent?: number;
            details?: string;
          };
          notes?: string;
          bookingUrl?: string;
        }>;
      }>;
    };

    try {
      parsed = JSON.parse(jsonMatch[1]?.trim() ?? rawContent.trim());
    } catch {
      throw new Error("Failed to parse Claude's JSON response");
    }

    // Validate budget breakdown sums make sense
    const breakdownTotal = Object.values(parsed.budgetBreakdown).reduce(
      (a, b) => a + b,
      0
    );
    const correctionFactor =
      breakdownTotal > 0 ? args.budgetTotal / breakdownTotal : 1;

    const normalizedBreakdown = {
      transport: Math.round(parsed.budgetBreakdown.transport * correctionFactor),
      accommodation: Math.round(
        parsed.budgetBreakdown.accommodation * correctionFactor
      ),
      food: Math.round(parsed.budgetBreakdown.food * correctionFactor),
      activities: Math.round(
        parsed.budgetBreakdown.activities * correctionFactor
      ),
      other: Math.round(parsed.budgetBreakdown.other * correctionFactor),
    };

    // Create the trip
    const tripId: Id<"trips"> = await ctx.runMutation(
      internal.trips.createInternal,
      {
        userId: args.userId,
        title: parsed.title,
        description: parsed.description,
        origin: args.origin,
        destination: args.destination,
        startDate: args.startDate,
        endDate: args.endDate,
        totalDays: args.totalDays,
        budgetTotal: args.budgetTotal,
        budgetBreakdown: normalizedBreakdown,
        isGroupTrip: args.isGroupTrip,
        isPublic: false,
        tags: parsed.tags ?? [],
        aiGenerated: true,
        generationPrompt: args.generationPrompt,
      }
    );

    // Create trip days and activities
    const dayInputs = parsed.days.map((d) => ({
      dayNumber: d.dayNumber,
      date: d.date,
      title: d.title,
      notes: d.notes,
      dailyBudget: d.dailyBudget,
    }));

    const dayIds: Id<"tripDays">[] = await ctx.runMutation(
      internal.tripDays.createBatch,
      { tripId, days: dayInputs }
    );

    // Create activities for each day
    const allActivities: Array<{
      tripDayId: Id<"tripDays">;
      tripId: Id<"trips">;
      order: number;
      type:
        | "transport"
        | "accommodation"
        | "food"
        | "activity"
        | "free_time"
        | "flight"
        | "checkin"
        | "checkout";
      title: string;
      description?: string;
      location?: {
        name: string;
        address?: string;
        lat?: number;
        lng?: number;
        googlePlaceId?: string;
      };
      startTime?: string;
      endTime?: string;
      duration?: number;
      estimatedCost: number;
      currency: string;
      bookingUrl?: string;
      isBooked?: boolean;
      studentDiscount?: {
        available: boolean;
        discountPercent?: number;
        details?: string;
      };
      notes?: string;
      aiSuggestion?: boolean;
    }> = [];

    const validTypes = new Set([
      "transport",
      "accommodation",
      "food",
      "activity",
      "free_time",
      "flight",
      "checkin",
      "checkout",
    ]);

    for (let i = 0; i < parsed.days.length; i++) {
      const day = parsed.days[i];
      const dayId = dayIds[i];

      for (const act of day.activities) {
        const actType = validTypes.has(act.type)
          ? (act.type as
              | "transport"
              | "accommodation"
              | "food"
              | "activity"
              | "free_time"
              | "flight"
              | "checkin"
              | "checkout")
          : "activity";

        allActivities.push({
          tripDayId: dayId,
          tripId,
          order: act.order,
          type: actType,
          title: act.title,
          description: act.description || undefined,
          location: act.location
            ? {
                name: act.location.name,
                address: act.location.address || undefined,
                lat: act.location.lat || undefined,
                lng: act.location.lng || undefined,
              }
            : undefined,
          startTime: act.startTime || undefined,
          endTime: act.endTime || undefined,
          duration: act.duration || undefined,
          estimatedCost: act.estimatedCost ?? 0,
          currency: "EUR",
          bookingUrl: act.bookingUrl || undefined,
          isBooked: false,
          studentDiscount: act.studentDiscount
            ? {
                available: act.studentDiscount.available,
                discountPercent: act.studentDiscount.discountPercent ?? undefined,
                details: act.studentDiscount.details ?? undefined,
              }
            : undefined,
          notes: act.notes || undefined,
          aiSuggestion: true,
        });
      }
    }

    if (allActivities.length > 0) {
      await ctx.runMutation(internal.activities.createBatch, {
        activities: allActivities,
      });
    }

    return { tripId };
  },
});

// ─── Build User Prompt ─────────────────────────────────────────────────────────
function buildUserPrompt(args: GenerateTripArgs): string {
  const interests =
    args.preferences.interests.length > 0
      ? args.preferences.interests.join(", ")
      : "general sightseeing, local culture, food";

  const dietary =
    args.preferences.dietaryRestrictions.length > 0
      ? `Dietary restrictions: ${args.preferences.dietaryRestrictions.join(", ")}.`
      : "";

  const groupNote = args.isGroupTrip
    ? `This is a GROUP TRIP with ${args.groupSize ?? 2} people. Calculate shared accommodation costs per person. Note group discounts where available.`
    : "This is a SOLO trip.";

  const customNote = args.generationPrompt
    ? `\n\nAdditional requirements from the traveller: "${args.generationPrompt}"`
    : "";

  return `Plan a ${args.totalDays}-day trip from ${args.origin.city}, ${args.origin.country} to ${args.destination.city}, ${args.destination.country}.

DATES: ${args.startDate} to ${args.endDate}
TOTAL BUDGET: €${args.budgetTotal} EUR (all-inclusive, per person)
COMFORT LEVEL: ${args.preferences.comfortLevel}
IS STUDENT: ${args.isStudent ? "YES – use all available student discounts" : "NO – but still budget-focused"}
INTERESTS: ${interests}
${dietary}
${groupNote}${customNote}

Generate a complete, day-by-day itinerary. Include the outbound journey from ${args.origin.city} on Day 1 and the return journey on Day ${args.totalDays}. Be specific about transport (exact train/bus/flight options with prices), accommodation (real hostels/guesthouses with realistic prices), meals (specific restaurants or food markets), and attractions (with opening hours, entry fees, and any student discounts).

Return only the JSON object as specified.`;
}
