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
      const existingEmail = await ctx.db.waitlist.findFirst({
        where: {
          email: input.email,
        },
      });
      if (existingEmail) return {};

      await ctx.db.waitlist.create({
        data: {
          email: input.email,
        },
      });

      return {};
    }),
  check: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingEmail = await ctx.db.waitlist.findFirst({
        where: {
          email: input.email,
        },
      });
      if (existingEmail) return { subscribed: true };

      return {
        subscribed: false,
      };
    }),
});
