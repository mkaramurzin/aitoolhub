import { db } from "@/server/db";
import { SubscriptionPlans } from "@prisma/client";
import Stripe from "stripe";

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
) {}

export async function handleSubscriptionPause(
  subscription: Stripe.Subscription,
) {}

export async function handleSubscriptionResume(
  subscription: Stripe.Subscription,
) {}

export async function handleSubscriptionDelete(
  subscription: Stripe.Subscription,
) {
  await db.subscription.updateMany({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      plan: SubscriptionPlans.FREE,
      unlimitedMessages: false,
      stripeSubscriptionId: null,
    },
  });
}

export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
) {}
