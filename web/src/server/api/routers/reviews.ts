import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const reviewsRouter = createTRPCRouter({
  fetchAll: publicProcedure
    .input(
      z.object({ toolId: z.string(), page: z.number().optional().default(1) }),
    )
    .query(async ({ input, ctx }) => {
      const [reviews, count] = await Promise.all([
        ctx.db.review.findMany({
          where: {
            toolId: input.toolId,
          },
          include: {
            User: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            upvotes: "desc",
          },
          take: 5,
          skip: (input.page - 1) * 5,
        }),
        ctx.db.review.count({
          where: {
            toolId: input.toolId,
          },
        }),
      ]);
      return { reviews, count };
    }),
  create: authenticatedProcedure
    .input(
      z.object({
        content: z.string().min(2, {
          message: "Review must be at least 2 characters.",
        }),
        rating: z.number().int().min(1).max(5),
        toolId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingReview = await ctx.db.review.findFirst({
        where: {
          userId: ctx.user.id,
          toolId: input.toolId,
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You've already reviewed this tool.",
        });
      }

      const review = await ctx.db.review.create({
        data: {
          content: input.content,
          rating: input.rating,
          toolId: input.toolId,
          userId: ctx.user.id,
        },
      });

      // Update the tool's rating
      const averageRating = await ctx.db.review.aggregate({
        where: {
          toolId: input.toolId,
        },
        _sum: {
          rating: true,
        },
        _count: true,
      });

      const newRating =
        (averageRating._sum?.rating ?? 0) / (averageRating._count ?? 1);

      await ctx.db.tool.update({
        where: {
          id: input.toolId,
        },
        data: {
          rating: newRating,
        },
      });

      console.log({ averageRating });

      return { review };
    }),
  rate: authenticatedProcedure
    .input(
      z.object({
        reviewId: z.string().uuid(),
        upvote: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const vote = await ctx.db.userVote.findFirst({
        where: {
          userId: ctx.user.id,
          reviewId: input.reviewId,
        },
      });

      let upvoteDelta = 0;
      let downvoteDelta = 0;

      if (!vote) {
        await ctx.db.userVote.create({
          data: {
            reviewId: input.reviewId,
            upvote: input.upvote,
            userId: ctx.user.id,
          },
        });
        upvoteDelta = input.upvote ? 1 : 0;
        downvoteDelta = input.upvote ? 0 : 1;
      } else if (vote.upvote === input.upvote) {
        await ctx.db.userVote.delete({
          where: {
            userId_reviewId: {
              userId: ctx.user.id,
              reviewId: input.reviewId,
            },
          },
        });
        upvoteDelta = vote.upvote ? -1 : 0;
        downvoteDelta = vote.upvote ? 0 : -1;
      } else {
        await ctx.db.userVote.update({
          where: {
            userId_reviewId: {
              userId: ctx.user.id,
              reviewId: input.reviewId,
            },
          },
          data: {
            upvote: input.upvote,
          },
        });
        upvoteDelta = input.upvote ? 1 : -1;
        downvoteDelta = input.upvote ? -1 : 1;
      }

      await ctx.db.review.update({
        where: {
          id: input.reviewId,
        },
        data: {
          upvotes: {
            increment: upvoteDelta,
          },
          downvotes: {
            increment: downvoteDelta,
          },
        },
      });

      return { vote };
    }),
  fetchVotesMadeBySelf: authenticatedProcedure
    .input(z.object({ toolId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const votes = await ctx.db.userVote.findMany({
        where: {
          userId: ctx.user.id,
          Review: {
            toolId: input.toolId,
          },
        },
      });

      return { votes };
    }),
});
