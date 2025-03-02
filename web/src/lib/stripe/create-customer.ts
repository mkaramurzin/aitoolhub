import { db } from "@/server/db";
import Stripe from "stripe";
import { stripe } from "./stripe";

export async function CreateStripeAccount({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  let stripeCustomerAccount: Stripe.Customer | null = null;

  stripeCustomerAccount = await stripe.customers.create({
    email: email,
  });

  const updatedUser = await db.user.update({
    where: {
      id: userId,
      stripeCustomerId: null,
    },
    data: {
      stripeCustomerId: stripeCustomerAccount.id,
    },
  });

  return {
    updatedUser,
  };
}
