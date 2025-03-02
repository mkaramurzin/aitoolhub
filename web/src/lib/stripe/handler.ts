import Stripe from "stripe";
import { handleInvoicePaid } from "./handle-invoice";
import {
  handleSubscriptionCreated,
  handleSubscriptionDelete,
  handleSubscriptionPause,
  handleSubscriptionResume,
  handleSubscriptionUpdate,
} from "./handle-subscriptions";

export async function handleStripeEvent(event: Stripe.Event) {
  // Handle the event
  switch (event.type) {
    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDelete(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(event.data.object);
      break;
    case "customer.subscription.paused":
      await handleSubscriptionPause(event.data.object);
      break;
    case "customer.subscription.resumed":
      await handleSubscriptionResume(event.data.object);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
}
