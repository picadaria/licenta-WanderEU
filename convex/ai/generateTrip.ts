import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import Anthropic from "@anthropic-ai/sdk";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

function getAnthropicClient() {
  return new Anthropic();
}

const SYSTEM_PROMPT = `You are WanderEU's expert EU student travel planner. You create detailed, realistic, budget-conscious travel itineraries for university students travelling within Europe.

You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no code fences, just raw JSON.

The JSON must follow this exact structure:

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
}

Use real place names and realistic prices. Keep descriptions short. Max 4 activities per day.`;

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

    let user = await ctx.runQuery(api.users.getUser, {
      clerkId: identity.subject,
    });

    if (!user) {
      await ctx.runMutation(api.users.createUserPublic, {
        clerkId: identity.subject,
        email: identity.email ?? "",
        name: identity.name ?? "Traveler",
        imageUrl: identity.pictureUrl ?? undefined,
      });
      user = await ctx.runQuery(api.users.getUser, { clerkId: identity.subject });
      if (!user) throw new Error("Failed to create user");
    }

    const result = await ctx.runAction(internal.ai.generateTrip.generateTripInternal, {
      ...args,
      userId: user._id,
      isStudent: args.isStudent ?? user.isStudent,
      isGroupTrip: args.isGroupTrip ?? false,
    });

    return result;
  },
});

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
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Error: No text response from Claude");
      }
      rawContent = textBlock.text;
    } catch (err) {
      throw new Error(`Claude API error: ${String(err)}`);
    }

    // Extract JSON: try code fences first, then bare braces
    let jsonString: string = rawContent.trim();
    const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonString = fenceMatch[1].trim();
    } else {
      const firstBrace = rawContent.indexOf("{");
      const lastBrace = rawContent.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        jsonString = rawContent.slice(firstBrace, lastBrace + 1);
      }
    }

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
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error(`Failed to parse JSON. Start: ${rawContent.slice(0, 200)} ... End: ${rawContent.slice(-200)}`);
    }

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

      for (const act of day.activities || []) {
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

Generate a day-by-day itinerary. Include outbound travel on Day 1 and return on Day ${args.totalDays}. Max 4 activities per day. Keep all string fields concise (under 20 words each). Omit travelTips, packingList, and emergencyInfo fields entirely.

Return ONLY the raw JSON object, no markdown, no code fences.`;
}
