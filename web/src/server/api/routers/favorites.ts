import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const favoritesRouter = createTRPCRouter({
  fetchAll: authenticatedProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        take: z.number().max(50).optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [favorites, totalCount] = await Promise.all([
        ctx.db.userToolFavorite.findMany({
          where: { userId: ctx.user.id },
          take: input.take,
          skip: (input.page - 1) * input.take,
          include: {
            Tool: { include: { ToolTags: { include: { Tag: true } } } },
          },
        }),
        ctx.db.userToolFavorite.count({
          where: { userId: ctx.user.id },
        }),
      ]);
      return { favorites, count: totalCount };
    }),
  upsert: authenticatedProcedure
    .input(
      z.object({
        toolId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const favorite = await ctx.db.userToolFavorite.upsert({
        where: {
          userId_toolId: {
            userId: ctx.user.id,
            toolId: input.toolId,
          },
        },
        create: {
          userId: ctx.user.id,
          toolId: input.toolId,
        },
        update: {},
      });
      return favorite;
    }),
  fetch: publicProcedure
    .input(z.object({ toolId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return { favorite: null };
      }

      const favorite = await ctx.db.userToolFavorite.findFirst({
        where: {
          userId: ctx.user.id,
          toolId: input.toolId,
        },
      });
      return { favorite };
    }),
  delete: authenticatedProcedure
    .input(z.object({ toolId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedFavorite = await ctx.db.userToolFavorite.delete({
        where: {
          userId_toolId: {
            userId: ctx.user.id,
            toolId: input.toolId,
          },
        },
      });
      return deletedFavorite;
    }),
});
