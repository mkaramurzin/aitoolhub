import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const emailReviewRouter = createTRPCRouter({
  upsert: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        techCrunchId: z.string(),
        rating: z.number().int().min(1).max(5), // Added rating field with validation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lowerCaseEmail = input.email.toLowerCase();
      return ctx.db.emailReview.upsert({
        where: { email: lowerCaseEmail },
        update: { techCrunchId: input.techCrunchId, rating: input.rating }, // Include rating in update
        create: {
          email: lowerCaseEmail,
          techCrunchId: input.techCrunchId,
          rating: input.rating,
        }, // Include rating in create
      });
    }),
});
