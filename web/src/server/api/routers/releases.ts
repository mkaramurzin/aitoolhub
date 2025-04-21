import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const releasesRouter = createTRPCRouter({
  fetchAll: publicProcedure
    .input(
      z.object({ toolId: z.string(), page: z.number().optional().default(1) }),
    )
    .query(async ({ input, ctx }) => {
      const releases = await ctx.db.toolRelease.findMany({
        where: {
          toolId: input.toolId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { releases };
    }),
});
