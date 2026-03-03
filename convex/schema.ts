import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users ────────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isStudent: v.boolean(),
    university: v.optional(v.string()),
    homeCity: v.optional(v.string()),
    homeCountry: v.optional(v.string()),
    currency: v.string(), // ISO 4217, e.g. "EUR"
    travelPreferences: v.optional(
      v.object({
        comfortLevel: v.union(
          v.literal("budget"),
          v.literal("mid-range"),
          v.literal("comfort")
        ),
        interests: v.array(v.string()),
        dietaryRestrictions: v.array(v.string()),
      })
    ),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  // ─── Trips ────────────────────────────────────────────────────────────────
  trips: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("planned"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
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
    startDate: v.string(), // ISO date string
    endDate: v.string(),
    totalDays: v.number(),
    budgetTotal: v.number(), // EUR
    budgetBreakdown: v.object({
      transport: v.number(),
      accommodation: v.number(),
      food: v.number(),
      activities: v.number(),
      other: v.number(),
    }),
    actualSpent: v.number(),
    aiGenerated: v.boolean(),
    generationPrompt: v.optional(v.string()),
    isGroupTrip: v.boolean(),
    inviteCode: v.optional(v.string()),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_inviteCode", ["inviteCode"])
    .index("by_isPublic", ["isPublic"]),

  // ─── Trip Days ────────────────────────────────────────────────────────────
  tripDays: defineTable({
    tripId: v.id("trips"),
    dayNumber: v.number(),
    date: v.string(), // ISO date string
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    weatherForecast: v.optional(
      v.object({
        temp: v.number(),
        condition: v.string(),
        icon: v.string(),
      })
    ),
    dailyBudget: v.number(),
    dailySpent: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_tripId_dayNumber", ["tripId", "dayNumber"]),

  // ─── Activities ───────────────────────────────────────────────────────────
  activities: defineTable({
    tripDayId: v.id("tripDays"),
    tripId: v.id("trips"),
    order: v.number(),
    type: v.union(
      v.literal("transport"),
      v.literal("accommodation"),
      v.literal("food"),
      v.literal("activity"),
      v.literal("free_time"),
      v.literal("flight"),
      v.literal("checkin"),
      v.literal("checkout")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(
      v.object({
        name: v.string(),
        address: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        googlePlaceId: v.optional(v.string()),
      })
    ),
    startTime: v.optional(v.string()), // "HH:mm"
    endTime: v.optional(v.string()),
    duration: v.optional(v.number()), // minutes
    estimatedCost: v.number(),
    actualCost: v.optional(v.number()),
    currency: v.string(),
    bookingUrl: v.optional(v.string()),
    bookingReference: v.optional(v.string()),
    isBooked: v.boolean(),
    studentDiscount: v.optional(
      v.object({
        available: v.boolean(),
        discountPercent: v.optional(v.number()),
        details: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    aiSuggestion: v.optional(v.boolean()),
  })
    .index("by_tripDayId", ["tripDayId"])
    .index("by_tripId", ["tripId"]),

  // ─── Expenses ─────────────────────────────────────────────────────────────
  expenses: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    activityId: v.optional(v.id("activities")),
    amount: v.number(),
    currency: v.string(),
    amountEur: v.number(),
    category: v.union(
      v.literal("transport"),
      v.literal("accommodation"),
      v.literal("food"),
      v.literal("activity"),
      v.literal("shopping"),
      v.literal("other")
    ),
    description: v.string(),
    date: v.string(),
    receiptUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_userId", ["userId"])
    .index("by_category", ["category"]),

  // ─── Trip Members ─────────────────────────────────────────────────────────
  tripMembers: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("editor"),
      v.literal("viewer")
    ),
    individualBudget: v.optional(v.number()),
    joinedAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_userId", ["userId"]),

  // ─── Chat Messages ────────────────────────────────────────────────────────
  chatMessages: defineTable({
    tripId: v.id("trips"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(
      v.object({
        suggestedChanges: v.optional(v.string()),
        appliedToTrip: v.optional(v.boolean()),
      })
    ),
    createdAt: v.number(),
  }).index("by_tripId", ["tripId"]),

  // ─── Student Discounts ────────────────────────────────────────────────────
  studentDiscounts: defineTable({
    city: v.string(),
    country: v.string(),
    category: v.string(),
    placeName: v.string(),
    normalPrice: v.optional(v.number()),
    studentPrice: v.optional(v.number()),
    discountPercent: v.number(),
    requirements: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    submittedBy: v.optional(v.id("users")),
    isVerified: v.boolean(),
  })
    .index("by_city", ["city"])
    .index("by_country", ["country"]),

  // ─── Email Logs ───────────────────────────────────────────────────────────
  emailLogs: defineTable({
    userId: v.id("users"),
    type: v.string(),
    resendId: v.optional(v.string()),
    status: v.string(),
    sentAt: v.number(),
  }).index("by_userId", ["userId"]),
});
