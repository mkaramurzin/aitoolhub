import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
export const tagsRouter = createTRPCRouter({
  fetchPopular: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.tag.findMany({
      take: 10,
      orderBy: {
        uses: "desc",
      },
    });
    return { tags };
  }),
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const tags = await ctx.db.tag.findMany({
        where: {
          name: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        take: 10,
        orderBy: {
          uses: "desc",
        },
      });

      return { tags };
    }),
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tag = await ctx.db.tag.create({
        data: {
          name: input.name,
        },
      });

      return { tag };
    }),
});
