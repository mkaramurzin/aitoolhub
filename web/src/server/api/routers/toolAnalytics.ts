import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const toolAnalyticsRouter = createTRPCRouter({
  increment: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        views: z.boolean().optional().default(false),
        shareClicks: z.boolean().optional().default(false),
        tryItNowClicks: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.toolAnalytics.upsert({
        where: { toolId: input.id },
        create: {
          toolId: input.id,
          views: input.views ? 1 : 0,
          shareClicks: input.shareClicks ? 1 : 0,
          tryItNowClicks: input.tryItNowClicks ? 1 : 0,
        },
        update: {
          ...(input.views && { views: { increment: 1 } }),
          ...(input.shareClicks && { shareClicks: { increment: 1 } }),
          ...(input.tryItNowClicks && { tryItNowClicks: { increment: 1 } }),
        },
      });
    }),
});
