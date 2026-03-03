import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api, internal } from "../../../../../convex/_generated/api";

function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function POST(req: Request) {
  // ─── Verify webhook signature ───────────────────────────────────────────
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // ─── Handle events ──────────────────────────────────────────────────────
  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      if (!email) {
        return new Response("No email address in user.created", { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ") || email;

      // Create user in Convex via internal mutation
      // Note: We use fetch to call the Convex HTTP endpoint for internal mutations
      const userId = await getConvexClient().mutation(api.users.createUserPublic, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url ?? undefined,
      });

      console.log(`Created Convex user for Clerk ID ${id}: ${userId}`);

      return new Response(JSON.stringify({ success: true, userId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

      await getConvexClient().mutation(api.users.updateUserPublic, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url ?? undefined,
      });

      console.log(`Updated Convex user for Clerk ID ${id}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      if (!id) {
        return new Response("No user ID in user.deleted", { status: 400 });
      }

      // Soft-delete: in production you'd mark the user as deleted
      // For now we log it
      console.log(`User deleted in Clerk: ${id}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Acknowledge unhandled events
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`Error handling Clerk webhook ${eventType}:`, err);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
