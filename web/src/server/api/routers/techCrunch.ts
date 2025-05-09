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
            TechCrunchIngestXData: {
              include: {
                IngestXData: true,
              },
            },
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
          TechCrunchIngestXData: {
            include: {
              IngestXData: true,
            },
          },
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
        tweets: z.array(
          z.object({
            tweetId: z.string(),
          }),
        ),
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

      if (input.tweets) {
        await ctx.db.techCrunchIngestXData.deleteMany({
          where: { techCrunchId: techCrunch.id },
        });
        for (const tweet of input.tweets) {
          await ctx.db.techCrunchIngestXData.create({
            data: {
              techCrunchId: techCrunch.id,
              ingestXDataId: tweet.tweetId,
            },
          });
        }
      }

      return techCrunch;
    }),
  generate: authenticatedProcedure.mutation(async ({ ctx }) => {
    const twitterPrompt = await ctx.db.keyValueStore.findUnique({
      where: { key: "twitter-post-selection-prompt" },
    });

    const breakingNewsPrompt = await ctx.db.keyValueStore.findUnique({
      where: { key: "breaking-news-prompt" },
    });

    const metadataPrompt = await ctx.db.keyValueStore.findUnique({
      where: { key: "metadata-prompt" },
    });

    const summariesPrompt = await ctx.db.keyValueStore.findUnique({
      where: { key: "summaries-prompt" },
    });

    if (!breakingNewsPrompt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Breaking news prompt not found",
      });
    }

    if (!twitterPrompt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Twitter prompt not found",
      });
    }

    if (!metadataPrompt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Metadata prompt not found",
      });
    }

    if (!summariesPrompt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Summaries prompt not found",
      });
    }

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
    console.log("Fetched twitterPosts:", twitterPosts.length);

    const ingestData = await ctx.db.ingestData.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 1),
        },
      },
    });
    console.log("Fetched ingestData:", ingestData.length);

    // Breaking News
    const { object: breakingNewsObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      mode: "json",
      schema: z.object({
        articles: z
          .array(
            z.object({
              title: z.string().describe("Creative title of the article"),
              description: z.string(),
            }),
          )
          .min(1)
          .max(5),
      }),
      prompt: `${breakingNewsPrompt.value} Here are the latest data points: ${JSON.stringify(ingestData)}. Here are some popular twitter posts ${JSON.stringify(twitterPosts)}`,
    });
    console.log(
      "Generated breakingNewsObject:",
      breakingNewsObject.articles.length,
    );

    // Trending on X
    const { object: trendingXIdsObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      mode: "json",
      schema: z.object({
        ids: z
          .array(z.string().describe("Post ID"))
          .min(1)
          .max(5)
          .refine(
            (ids) =>
              ids.every((id) => twitterPosts.some((post) => post.id === id)),
            {
              message: "ID must be one of the trending posts",
            },
          )
          .describe("A list of IDs of trending posts on X"),
      }),
      prompt: `${twitterPrompt.value} Here are some popular twitter posts ${JSON.stringify(twitterPosts)}`,
    });
    console.log("Generated trendingXIdsObject:", trendingXIdsObject);

    const selectedPosts = twitterPosts.filter((post) =>
      trendingXIdsObject.ids.includes(post.id),
    );
    console.log("Filtered selectedPosts:", selectedPosts.length);

    // Recap
    const { object: metadataObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      mode: "json",
      schema: z.object({
        title: z.string(),
        subject: z
          .string()
          .describe("A short description of the recap used for Email"),
      }),
      prompt: `${metadataPrompt.value} Here are the latest data points: ${JSON.stringify(ingestData)} Here are some popular twitter posts ${JSON.stringify(twitterPosts)}`,
    });
    console.log("Generated metadataObject:", metadataObject);

    // Summaries
    const { object: summariesObject } = await generateObject({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      mode: "json",
      schema: z.object({
        summaries: z
          .array(
            z.object({
              summary: z.string().max(100),
            }),
          )
          .max(10),
      }),
      prompt: `${summariesPrompt.value} Here are the latest data points: ${JSON.stringify(ingestData)} Here are some popular twitter posts ${JSON.stringify(twitterPosts)}`,
    });
    console.log("Generated summariesObject:", summariesObject.summaries.length);

    const techCrunch = await ctx.db.techCrunch.create({
      data: {
        title: metadataObject.title,
        subject: metadataObject.subject,
        status: "DRAFT",
      },
    });
    console.log("Created techCrunch entry:", techCrunch);

    await ctx.db.techCrunchBreakingNews.createMany({
      data: breakingNewsObject.articles.map((news) => ({
        techCrunchId: techCrunch.id,
        title: news.title,
        description: news.description,
      })),
    });
    console.log("Created techCrunchBreakingNews entries");

    await ctx.db.techCrunchSummary.createMany({
      data: summariesObject.summaries.map((summary) => ({
        techCrunchId: techCrunch.id,
        summary: summary.summary,
      })),
    });
    console.log("Created techCrunchSummary entries");

    await ctx.db.techCrunchIngestXData.createMany({
      data: selectedPosts.map((post) => ({
        techCrunchId: techCrunch.id,
        ingestXDataId: post.id,
      })),
    });
  }),
  delete: authenticatedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const techCrunch = await ctx.db.techCrunch.findUnique({
        where: { id: input.id },
      });

      if (!techCrunch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tech Crunch entry not found",
        });
      }

      await ctx.db.techCrunch.delete({
        where: { id: input.id },
      });

      return techCrunch;
    }),
});
