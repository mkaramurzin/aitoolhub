import { SubscriptionPlans } from "@prisma/client";

export function planName(plan: SubscriptionPlans) {
  switch (plan) {
    case SubscriptionPlans.FREE:
      return "Free";
    case SubscriptionPlans.ALPHA:
      return "Alpha";
    case SubscriptionPlans.OMEGA:
      return "Omega";
  }
}
