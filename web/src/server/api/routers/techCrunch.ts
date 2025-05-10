import { openai } from "@ai-sdk/openai";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { subDays } from "date-fns";
import { z } from "zod";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
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
              url: z.string().url(),
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
              url: news.url,
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
    console.log("🚀 Starting TechCrunch generation process");

    // Fetch prompts
    console.log("📥 Fetching prompts from database");
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
    console.log("✅ Prompts fetched successfully");

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

    // Fetch Twitter posts
    console.log("📥 Fetching recent Twitter posts (last 24h)");
    const startTwitterFetch = performance.now();
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
    const endTwitterFetch = performance.now();
    console.log(
      `✅ Fetched ${twitterPosts.length} Twitter posts in ${Math.round(endTwitterFetch - startTwitterFetch)}ms`,
    );

    // Fetch ingest data
    console.log("📥 Fetching recent ingest data (last 24h)");
    const startIngestFetch = performance.now();
    const ingestData = await ctx.db.ingestData.findMany({
      where: {
        createdAt: {
          gte: subDays(new Date(), 1),
        },
      },
    });
    const endIngestFetch = performance.now();
    console.log(
      `✅ Fetched ${ingestData.length} ingest data points in ${Math.round(endIngestFetch - startIngestFetch)}ms`,
    );

    // Generate Breaking News
    console.log("🧠 Generating breaking news content");
    const startBreakingNews = performance.now();
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
              id: z.string().describe("ID of the article"),
            }),
          )
          .min(1)
          .max(5),
      }),
      prompt: `${breakingNewsPrompt.value} Here are the latest data points: ${JSON.stringify(ingestData)}}`,
    });
    const endBreakingNews = performance.now();
    console.log(
      `✅ Generated ${breakingNewsObject.articles.length} breaking news articles in ${Math.round(endBreakingNews - startBreakingNews)}ms`,
    );

    // Generate Trending on X
    console.log("🧠 Identifying trending posts on X");
    const startTrendingX = performance.now();
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
    const endTrendingX = performance.now();
    console.log(
      `✅ Identified ${trendingXIdsObject.ids.length} trending X posts in ${Math.round(endTrendingX - startTrendingX)}ms`,
    );

    const selectedPosts = twitterPosts.filter((post) =>
      trendingXIdsObject.ids.includes(post.id),
    );
    console.log(
      `📊 Selected ${selectedPosts.length} posts from ${twitterPosts.length} available posts`,
    );

    // Generate Recap metadata
    console.log("🧠 Generating newsletter metadata");
    const startMetadata = performance.now();
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
    const endMetadata = performance.now();
    console.log(
      `✅ Generated newsletter metadata in ${Math.round(endMetadata - startMetadata)}ms`,
    );
    console.log(`📝 Title: "${metadataObject.title}"`);
    console.log(`📝 Subject: "${metadataObject.subject}"`);

    // Generate Summaries
    console.log("🧠 Generating newsletter summaries");
    const startSummaries = performance.now();
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
    const endSummaries = performance.now();
    console.log(
      `✅ Generated ${summariesObject.summaries.length} summaries in ${Math.round(endSummaries - startSummaries)}ms`,
    );

    // Create database entries
    console.log("💾 Creating TechCrunch database entry");
    const techCrunch = await ctx.db.techCrunch.create({
      data: {
        title: metadataObject.title,
        subject: metadataObject.subject,
        status: "DRAFT",
      },
    });
    console.log(`✅ Created TechCrunch entry with ID: ${techCrunch.id}`);

    console.log("💾 Creating breaking news entries");
    await ctx.db.techCrunchBreakingNews.createMany({
      data: breakingNewsObject.articles.map((news) => {
        const url = ingestData.find((data) => data.id === news.id)?.link;
        const validatedUrl = z.string().url().safeParse(url);

        if (!url) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `URL not found for news ID: ${news.id}`,
          });
        }

        if (!validatedUrl.success) {
          throw new TRPCError({
            code: "PARSE_ERROR",
            message: `Invalid URL for news ID: ${news.id}`,
          });
        }

        return {
          techCrunchId: techCrunch.id,
          title: news.title,
          description: news.description,
          url: validatedUrl.data,
        };
      }),
    });
    console.log(
      `✅ Created ${breakingNewsObject.articles.length} breaking news entries`,
    );

    console.log("💾 Creating summary entries");
    await ctx.db.techCrunchSummary.createMany({
      data: summariesObject.summaries.map((summary) => ({
        techCrunchId: techCrunch.id,
        summary: summary.summary,
      })),
    });
    console.log(
      `✅ Created ${summariesObject.summaries.length} summary entries`,
    );

    console.log("💾 Creating X post entries");
    await ctx.db.techCrunchIngestXData.createMany({
      data: selectedPosts.map((post) => ({
        techCrunchId: techCrunch.id,
        ingestXDataId: post.id,
      })),
    });
    console.log(`✅ Created ${selectedPosts.length} X post entries`);

    console.log(`🎉 TechCrunch generation complete! ID: ${techCrunch.id}`);
    return techCrunch;
  }),
  getLatestIngestTimestamps: publicProcedure.query(async ({ ctx }) => {
    const latestIngestData = await ctx.db.ingestData.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    const latestIngestXData = await ctx.db.ingestXData.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      latestIngestDataUpdatedAt: latestIngestData?.updatedAt,
      latestIngestXDataUpdatedAt: latestIngestXData?.updatedAt,
    };
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
