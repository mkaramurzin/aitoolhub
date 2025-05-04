import { openai } from "@ai-sdk/openai";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { subDays } from "date-fns";
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
  generate: authenticatedProcedure.mutation(async ({ ctx }) => {
    const twitterPosts = await ctx.db.ingestXData.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 1),
        },
      },
      select: {
        id: true,
        viewCount: true,
        likeCount: true,
        retweetCount: true,
        bookmarkCount: true,
        text: true,
        author: true,
      },
    });

    const ingestData = await ctx.db.ingestData.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 1),
        },
      },
    });

    // Breaking News
    const { object: breakingNewsObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        recipe: z.array(
          z.object({
            title: z.string().describe("Title of the recipe"),
            description: z.string(),
          }),
        ),
      }),
      prompt: `You are a tech news generator. Generate a list of breaking news articles based on the latest data collected. Here are the latest data points: ${JSON.stringify(ingestData)}. Here are some popular twitter posts ${JSON.stringify(twitterPosts)} The articles should be relevant to the tech industry and should be engaging for readers. Each article should have a title and a description.`,
    });

    // Trending on X
    const { object: trendingXIds } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z
        .array(z.string().describe("Post ID"))
        .refine(
          (ids) =>
            ids.every((id) => twitterPosts.some((post) => post.id === id)),
          {
            message: "ID must be one of the trending posts",
          },
        )
        .describe("A list of IDs of trending posts on X"),
      prompt: `You are a tech news generator. Select IDs trending posts on X (formerly Twitter) based on the latest data collected. Here are some popular twitter posts ${JSON.stringify(
        twitterPosts,
      )} The posts should be relevant to the tech industry and should be engaging for readers. Select engaging posts. Avoid lists or tweets without context.`,
    });

    const selectedPosts = twitterPosts.filter((post) =>
      trendingXIds.includes(post.id),
    );

    // tool hub picks & new
    // rate us and our socials
    // related posts

    // Recap
    const { object: recapObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({ name: z.string(), amount: z.string() }),
          ),
          steps: z.array(z.string()),
        }),
      }),
      prompt: "Generate a lasagna recipe.",
    });
  }),
});
