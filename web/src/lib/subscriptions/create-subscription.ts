import { db } from "@/server/db";
import { SubscriptionPlans } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function createSubscription({ userId }: { userId: string }) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      Subscription: true,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  if (user.Subscription) {
    return { subscription: user.Subscription };
  }

  const subscription = await db.subscription.create({
    data: {
      userId: user.id,
      plan: SubscriptionPlans.FREE,
    },
  });

  return { subscription };
}
