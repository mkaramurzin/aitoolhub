import { env } from "@/env";
import { db } from "@/server/db";
import { SubscriptionPlans } from "@prisma/client";
import Stripe from "stripe";

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.customer_email) {
    console.error(`No customer email found for invoice ${invoice.id}`);
    return;
  }
  const user = await db.user.findUnique({
    where: { email: invoice.customer_email },
  });

  if (!user) {
    console.error(`User not found for invoice ${invoice.id}`);
    return;
  }

  // Get the last line item
  const lineItem = invoice.lines.data[invoice.lines.data.length - 1];

  if (!lineItem) {
    console.error(`No line items found for invoice ${invoice.id}`);
    return;
  }

  if (!lineItem.price) {
    console.error(`No price found for line item ${lineItem.id}`);
    return;
  }

  let plan: SubscriptionPlans = SubscriptionPlans.FREE;

  const planData = {
    [SubscriptionPlans.FREE]: {
      unlimited: false,
      xSentimentAnalysis: false,
    },
    [SubscriptionPlans.ALPHA]: {
      unlimited: true,
      xSentimentAnalysis: false,
    },
    [SubscriptionPlans.OMEGA]: {
      unlimited: true,
      xSentimentAnalysis: true,
    },
  } as const;

  switch (lineItem.price.id) {
    case env.STRIPE_ALPHA_PRICE_ID:
      plan = SubscriptionPlans.ALPHA;
      break;
    case env.STRIPE_OMEGA_PRICE_ID:
      plan = SubscriptionPlans.OMEGA;
      break;
    default:
      console.error(`Unknown price id ${lineItem.price.id}`);
      return;
  }

  if (!invoice.subscription) {
    console.error(`No subscription id found for invoice ${invoice.id}`);
    return;
  }

  const subscriptionId = invoice.subscription as string;

  await db.subscription.upsert({
    where: {
      userId: user.id,
    },
    create: {
      userId: user.id,
      plan,
      unlimitedMessages: planData[plan].unlimited,
      xSentimentAnalysis: planData[plan].xSentimentAnalysis,
      stripeSubscriptionId: subscriptionId,
    },
    update: {
      plan,
      unlimitedMessages: planData[plan].unlimited,
      xSentimentAnalysis: planData[plan].xSentimentAnalysis,
      stripeSubscriptionId: subscriptionId,
    },
  });
}
