import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// ─── List Discounts by City ───────────────────────────────────────────────────
export const listByCity = query({
  args: {
    city: v.string(),
    category: v.optional(v.string()),
    verifiedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const discounts = await ctx.db
      .query("studentDiscounts")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();

    let filtered = discounts;

    if (args.verifiedOnly) {
      filtered = filtered.filter((d) => d.isVerified);
    }

    if (args.category) {
      filtered = filtered.filter((d) => d.category === args.category);
    }

    return filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  },
});

// ─── List Discounts by Country ────────────────────────────────────────────────
export const listByCountry = query({
  args: {
    country: v.string(),
    category: v.optional(v.string()),
    verifiedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const discounts = await ctx.db
      .query("studentDiscounts")
      .withIndex("by_country", (q) => q.eq("country", args.country))
      .collect();

    let filtered = discounts;

    if (args.verifiedOnly) {
      filtered = filtered.filter((d) => d.isVerified);
    }

    if (args.category) {
      filtered = filtered.filter((d) => d.category === args.category);
    }

    return filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  },
});

// ─── Submit Discount ──────────────────────────────────────────────────────────
export const submit = mutation({
  args: {
    city: v.string(),
    country: v.string(),
    category: v.string(),
    placeName: v.string(),
    normalPrice: v.optional(v.number()),
    studentPrice: v.optional(v.number()),
    discountPercent: v.number(),
    requirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check for duplicate
    const existing = await ctx.db
      .query("studentDiscounts")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) =>
        q.and(
          q.eq(q.field("placeName"), args.placeName),
          q.eq(q.field("category"), args.category)
        )
      )
      .first();

    if (existing) throw new Error("Discount for this place already exists");

    return await ctx.db.insert("studentDiscounts", {
      city: args.city,
      country: args.country,
      category: args.category,
      placeName: args.placeName,
      normalPrice: args.normalPrice,
      studentPrice: args.studentPrice,
      discountPercent: args.discountPercent,
      requirements: args.requirements,
      submittedBy: user._id,
      isVerified: false,
    });
  },
});

// ─── Verify Discount (admin action) ──────────────────────────────────────────
export const verify = mutation({
  args: {
    discountId: v.id("studentDiscounts"),
    isVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // In production you'd check for an admin role here
    const discount = await ctx.db.get(args.discountId);
    if (!discount) throw new Error("Discount not found");

    await ctx.db.patch(args.discountId, {
      isVerified: args.isVerified,
      verifiedAt: args.isVerified ? Date.now() : undefined,
    });

    return { success: true };
  },
});

// ─── Seed Discounts (internal — run once) ────────────────────────────────────
export const seedDiscounts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const seedData = [
      {
        city: "Prague",
        country: "Czech Republic",
        category: "museums",
        placeName: "National Museum Prague",
        normalPrice: 12,
        studentPrice: 6,
        discountPercent: 50,
        requirements: "Valid student ID",
        isVerified: true,
      },
      {
        city: "Budapest",
        country: "Hungary",
        category: "transport",
        placeName: "BKK Public Transport",
        normalPrice: 30,
        studentPrice: 7.5,
        discountPercent: 75,
        requirements: "European student card (ISIC)",
        isVerified: true,
      },
      {
        city: "Vienna",
        country: "Austria",
        category: "museums",
        placeName: "Kunsthistorisches Museum",
        normalPrice: 21,
        studentPrice: 10,
        discountPercent: 52,
        requirements: "Valid student ID under 26",
        isVerified: true,
      },
      {
        city: "Krakow",
        country: "Poland",
        category: "food",
        placeName: "Bar Mleczny (Milk Bars)",
        normalPrice: 8,
        studentPrice: 4,
        discountPercent: 50,
        requirements: "No ID required – subsidised canteens",
        isVerified: true,
      },
      {
        city: "Berlin",
        country: "Germany",
        category: "transport",
        placeName: "BVG Semester Ticket",
        normalPrice: 90,
        studentPrice: 29,
        discountPercent: 68,
        requirements: "Enrolled student at Berlin university",
        isVerified: true,
      },
    ];

    for (const item of seedData) {
      await ctx.db.insert("studentDiscounts", {
        ...item,
        verifiedAt: Date.now(),
      });
    }

    return { seeded: seedData.length };
  },
});
