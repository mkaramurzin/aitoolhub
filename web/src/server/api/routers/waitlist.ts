import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const waitlistRouter = createTRPCRouter({
  join: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.waitlist.create({
        data: {
          email: input.email,
        },
      });

      return {};
    }),
});
