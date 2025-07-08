import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { env } from "@/env";

const feedbackCategories = [
  "general",
  "bug-report", 
  "feature-request",
  "ui-ux",
  "performance",
  "content",
  "other"
] as const;

export const feedbackRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        message: z.string().min(1, "Message is required").max(1000, "Message too long"),
        rating: z.number().int().min(1).max(5).optional(),
        category: z.enum(feedbackCategories).optional(),
        email: z.string().email("Invalid email address").optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const feedbackEntry = await ctx.db.feedback.create({
        data: {
          message: input.message,
          rating: input.rating,
          category: input.category,
          email: input.email,
          userId: ctx.user?.id, // Will be null for anonymous users
        },
        include: {
          User: {
            select: {
              name: true,
            },
          },
        },
      });

      // Send feedback to Zapier webhook
      console.log(env.ZAPIER_FEEDBACK_WEBHOOK_URL);

      if (env.ZAPIER_FEEDBACK_WEBHOOK_URL) {
        const payload = {
          "Feedback ID": feedbackEntry.id,
          User: feedbackEntry.User?.name ?? feedbackEntry.email ?? undefined,
          Type: feedbackEntry.category ?? "General Feedback",
          "Feedback text": feedbackEntry.message,
          Rating: feedbackEntry.rating,
          "Created At": feedbackEntry.createdAt,
          Action: "New",
        };

        try {
          await fetch(env.ZAPIER_FEEDBACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (error) {
          console.error("Failed to send feedback webhook:", error);
        }
      }

      return {
        success: true,
        id: feedbackEntry.id,
      };
    }),

  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        category: z.enum(feedbackCategories).optional(),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const where = {
        ...(input.category && { category: input.category }),
        ...(input.rating && { rating: input.rating }),
      };

      const [feedback, total] = await Promise.all([
        ctx.db.feedback.findMany({
          where,
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.db.feedback.count({ where }),
      ]);

      return {
        feedback,
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),

  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [
        totalFeedback,
        averageRating,
        categoryStats,
        recentCount,
      ] = await Promise.all([
        ctx.db.feedback.count(),
        ctx.db.feedback.aggregate({
          _avg: {
            rating: true,
          },
        }),
        ctx.db.feedback.groupBy({
          by: ['category'],
          _count: {
            id: true,
          },
        }),
        ctx.db.feedback.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

      return {
        total: totalFeedback,
        averageRating: averageRating._avg.rating,
        byCategory: categoryStats,
        recentCount,
      };
    }),
});
