import { env } from "@/env";
import { stripe } from "@/lib/stripe/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleStripeEvent } from "../../../../lib/stripe/handler";
export async function POST(req: NextRequest) {
  const headersList = await headers();

  const signature = headersList.get("stripe-signature");

  if (typeof signature !== "string" || !signature)
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });

  const body = await req.text();

  // Get the signature sent by Stripe
  let event: Stripe.Event | undefined;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`);
    return NextResponse.json({ error: "Invalid secret" }, { status: 400 });
  }

  if (typeof event === "undefined")
    return NextResponse.json(
      { error: "Failed to construct webhook event." },
      { status: 400 },
    );

  // Handle the event
  await handleStripeEvent(event);

  return NextResponse.json({}, { status: 200 });
}
