import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const searchHistoryRouter = createTRPCRouter({
  fetchAll: adminProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        take: z.number().max(50).optional().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [searches, totalCount] = await Promise.all([
        ctx.db.searchHistory.findMany({
          include: {
            User: true,
          },
          take: input.take,
          skip: (input.page - 1) * input.take,
          orderBy: {
            createdAt: "desc",
          },
        }),
        ctx.db.searchHistory.count(),
      ]);

      return { searches, count: totalCount };
    }),
});
