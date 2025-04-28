import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
} from "../trpc";

export const techCrunchRouter = createTRPCRouter({
  fetchAll: adminProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        take: z.number().max(50).optional().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const [techCrunchItems, totalCount] = await Promise.all([
        ctx.db.techCrunch.findMany({
          include: {
            TechCrunchSponsor: {
              include: {
                Tool: true,
              },
            },
            TechCrunchSummary: true,
            TechCrunchTool: true,
            TechCrunchBreakingNews: true,
          },
          take: input.take,
          skip: (input.page - 1) * input.take,
          orderBy: {
            createdAt: "desc",
          },
        }),
        ctx.db.techCrunch.count(),
      ]);

      return { techCrunchItems, count: totalCount };
    }),

  fetch: authenticatedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const techCrunch = await ctx.db.techCrunch.findUnique({
        where: { id: input.id },
        include: {
          TechCrunchSponsor: {
            include: {
              Tool: true,
            },
          },
          TechCrunchSummary: true,
          TechCrunchTool: true,
          TechCrunchBreakingNews: true,
        },
      });

      if (!techCrunch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tech Crunch entry not found",
        });
      }

      return { techCrunch };
    }),

  upsert: authenticatedProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string(),
        subject: z.string(),
        status: z.enum(["DRAFT", "PUBLISHED"]),
        sponsors: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              toolId: z.string(),
            }),
          )
          .optional(),
        summaries: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              summary: z.string(),
            }),
          )
          .optional(),
        tools: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              name: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
        breakingNews: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              title: z.string(),
              description: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const techCrunch = await ctx.db.techCrunch.upsert({
        where: { id: input.id ?? "" },
        create: {
          title: input.title,
          subject: input.subject,
          status: input.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        update: {
          title: input.title,
          subject: input.subject,
          status: input.status,
          updatedAt: new Date(),
        },
      });

      if (input.sponsors) {
        await ctx.db.techCrunchSponsor.deleteMany({
          where: { techCrunchId: techCrunch.id },
        });
        for (const sponsor of input.sponsors) {
          await ctx.db.techCrunchSponsor.create({
            data: {
              techCrunchId: techCrunch.id,
              toolId: sponsor.toolId,
            },
          });
        }
      }

      if (input.summaries) {
        await ctx.db.techCrunchSummary.deleteMany({
          where: { techCrunchId: techCrunch.id },
        });
        for (const summary of input.summaries) {
          await ctx.db.techCrunchSummary.create({
            data: {
              techCrunchId: techCrunch.id,
              summary: summary.summary,
            },
          });
        }
      }

      if (input.tools) {
        await ctx.db.techCrunchTool.deleteMany({
          where: { techCrunchId: techCrunch.id },
        });
        for (const tool of input.tools) {
          await ctx.db.techCrunchTool.create({
            data: {
              techCrunchId: techCrunch.id,
              name: tool.name,
              description: tool.description,
            },
          });
        }
      }

      if (input.breakingNews) {
        await ctx.db.techCrunchBreakingNews.deleteMany({
          where: { techCrunchId: techCrunch.id },
        });
        for (const news of input.breakingNews) {
          await ctx.db.techCrunchBreakingNews.create({
            data: {
              techCrunchId: techCrunch.id,
              title: news.title,
              description: news.description,
            },
          });
        }
      }

      return techCrunch;
    }),
});
