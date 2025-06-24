// import { tools } from "@/lib/ai_tools";
import { slugify } from "@/lib/slugify";
import { openai } from "@ai-sdk/openai";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { embed, generateText } from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  adminProcedure,
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";
import { collectionsRouter } from "./collections";
import { favoritesRouter } from "./favorites";
import { releasesRouter } from "./releases";
import { searchHistoryRouter } from "./searchHistory";
import { toolAnalyticsRouter } from "./toolAnalytics";

export const toolsRouter = createTRPCRouter({
  collections: collectionsRouter,
  analytics: toolAnalyticsRouter,
  favorites: favoritesRouter,
  searchHistory: searchHistoryRouter,
  releases: releasesRouter,
  fetch: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const tool = await ctx.db.tool.findUnique({
        where: { slug: input.slug },
        include: {
          ToolTags: {
            include: {
              Tag: true,
            },
          },
        },
      });
      if (!tool) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tool not found" });
      }
      return { tool };
    }),
  fetchAll: publicProcedure
    .input(
      z.object({
        tags: z.array(z.string()).optional(),
        query: z.string().max(100).optional(),
        page: z.number().optional().default(1),
        orderBy: z.enum(["trending", "new"]).optional(),
        pricing: z.string().optional(),
        take: z.number().max(50).optional().default(10),
        magicSearch: z.boolean().optional().default(false),
        searchHistory: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.searchHistory) {
        await ctx.db.searchHistory.create({
          data: {
            query: input.query ?? "",
            userId: ctx.user?.id,
            tags: input.tags ?? [],
            pricing: input.pricing ?? "",
          },
        });
      }

      // if magic search
      if (input.magicSearch) {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: `With AI I want to ${input.query}}`,
        });

        // Build dynamic SQL snippets using Prisma.sql helpers
        const pricingCondition = input.pricing
          ? Prisma.sql`AND t.pricing = ${input.pricing}`
          : Prisma.empty;
        const tagsJoin =
          input.tags && input.tags.length > 0
            ? Prisma.sql`JOIN "ToolTags" tt ON t.id = tt."toolId" JOIN "Tag" tg ON tt."tag" = tg.name`
            : Prisma.empty;
        const tagsCondition =
          input.tags && input.tags.length > 0
            ? Prisma.sql`AND t.id IN (
                  SELECT tt."toolId"
                  FROM "ToolTags" tt
                  JOIN "Tag" tg ON tt."tag" = tg.name
                  WHERE tg.name IN (${Prisma.join(input.tags)})
                  GROUP BY tt."toolId"
                  HAVING COUNT(DISTINCT tg.name) = ${input.tags.length}
                )`
            : Prisma.empty;

        // Updated raw query for fetching tool IDs (and their vectors)
        const [results, countResult] = await Promise.all([
          ctx.db.$queryRaw`
            SELECT DISTINCT t.id, t.vector::text, t.vector <=> ${embedding}::vector as distance
            FROM "Tool" t
            ${tagsJoin}
            WHERE t.vector IS NOT NULL
              AND t.vector <=> ${embedding}::vector < 0.5
              AND t."deletedAt" IS NULL
              ${pricingCondition}
              ${tagsCondition}
            ORDER BY distance
            LIMIT ${input.take}
            OFFSET ${(input.page - 1) * input.take}
          ` as Promise<{ id: string; vector: string; distance: number }[]>,
          ctx.db.$queryRaw`
            SELECT COUNT(DISTINCT t.id)::int as count
            FROM "Tool" t
            ${tagsJoin}
            WHERE t.vector IS NOT NULL
              AND t.vector <=> ${embedding}::vector < 0.5
              AND t."deletedAt" IS NULL
              ${pricingCondition}
              ${tagsCondition}
          ` as Promise<{ count: number }[]>,
        ]);
        const totalCount = countResult[0]?.count ?? 0;

        const tools = await ctx.db.tool.findMany({
          where: {
            id: { in: results.map((result) => result.id) },
          },
          include: {
            ToolAnalytics: true,
            ToolTags: {
              include: {
                Tag: true,
              },
            },
            UserToolFavorite: {
              where: {
                userId: ctx.user?.id ?? "",
              },
            },
          },
        });

        return { tools, count: totalCount };
      }

      // Build filters for tags and search query
      const tagFilters = input.tags
        ? input.tags.map((tag) => ({
            ToolTags: { some: { Tag: { name: tag } } },
          }))
        : undefined;

      let where;
      if (tagFilters && input.query) {
        // When both filters and query exist, require that all filters match AND
        // either the name or description contains the query.
        where = {
          OR: [
            {
              AND: [
                ...tagFilters,
                {
                  name: {
                    contains: input.query,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
            {
              AND: [
                ...tagFilters,
                {
                  description: {
                    contains: input.query,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          ],
        };
      } else if (tagFilters) {
        // Only filters provided: all filter conditions must match.
        where = {
          AND: [...tagFilters],
        };
      } else if (input.query) {
        // Only a search query provided: match either name or description.
        where = {
          OR: [
            {
              name: {
                contains: input.query,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: input.query,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        };
      } else {
        // No filters or query provided.
        where = {};
      }

      // NEW: Incorporate pricing filter if provided.
      if (input.pricing) {
        if (Object.keys(where).length === 0) {
          where = { pricing: input.pricing };
        } else {
          where = { AND: [where, { pricing: input.pricing }] };
        }
      }
      // Run both the paginated query and the count query in parallel
      const [tools, totalCount] = await Promise.all([
        ctx.db.tool.findMany({
          where: {
            ...where,
            deletedAt: null,
          },
          include: {
            ToolAnalytics: true,
            ToolTags: {
              include: {
                Tag: true,
              },
            },
            UserToolFavorite: {
              where: {
                userId: ctx.user?.id ?? "",
              },
            },
          },
          take: input.take,
          skip: (input.page - 1) * input.take,
          ...(input.orderBy
            ? {
                orderBy:
                  input.orderBy === "trending"
                    ? { rating: "desc" }
                    : { createdAt: "desc" },
              }
            : {}),
        }),
        ctx.db.tool.count({
          where,
        }),
      ]);

      return { tools, count: totalCount };
    }),
  clarifySearch: publicProcedure
    .input(z.object({ query: z.string().max(100) }))
    .query(async ({ input, ctx }) => {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: `With AI I want to ${input.query}`,
      });

      const closest = (await ctx.db.$queryRaw`
        SELECT vector <=> ${embedding}::vector as distance
        FROM "Tool"
        WHERE vector IS NOT NULL
          AND "deletedAt" IS NULL
        ORDER BY distance
        LIMIT 1
      `) as { distance: number }[];

      const distance = closest[0]?.distance ?? 1;
      const confidence = 1 - distance;

      if (confidence < 0.5) {
        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          maxRetries: 3,
          prompt: `A user searched for "${input.query}". Ask a short clarifying question to better understand the request.`,
        });

        return { confidence, question: text };
      }

      const results = (await ctx.db.$queryRaw`
        SELECT id
        FROM "Tool"
        WHERE vector IS NOT NULL
          AND vector <=> ${embedding}::vector < 0.5
          AND "deletedAt" IS NULL
        ORDER BY vector <=> ${embedding}::vector
        LIMIT 10
      `) as { id: string }[];

      const tools = await ctx.db.tool.findMany({
        where: { id: { in: results.map((r) => r.id) } },
        include: {
          ToolTags: { include: { Tag: true } },
        },
      });

      return { confidence, tools };
    }),
  magicSearch: publicProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.number().optional().default(1),
        take: z.number().max(50).optional().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: `With AI I want to ${input.query}`,
      });

      const results = (await ctx.db.$queryRaw`
              SELECT id, vector::text
              FROM "Tool"
              WHERE vector IS NOT NULL
                AND vector <=> ${embedding}::vector < 0.5
                AND deletedAt IS NULL
              ORDER BY vector <=> ${embedding}::vector
              LIMIT ${input.take}
              OFFSET ${(input.page - 1) * input.take}
          `) as { id: string; vector: string }[];

      const tools = await ctx.db.tool.findMany({
        where: {
          id: {
            in: results.map((result) => result.id),
          },
        },
        include: {
          ToolTags: {
            include: {
              Tag: true,
            },
          },
        },
      });

      return { tools };
    }),
  fetchOwned: authenticatedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const tools = await ctx.db.tool.findMany({
        where: {
          ownerId: ctx.user.id,
          deletedAt: null,
        },
        include: {
          ToolTags: {
            include: {
              Tag: true,
            },
          },
        },
      });
      return { tools };
    }),
  upsert: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().url(),
        tags: z.array(z.string()),
        logoImageUrl: z.string().url(),
        screenshotUrl: z.string().url(),
        pricing: z.string(),
        id: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // check slug
      const existingTool = await ctx.db.tool.findUnique({
        where: {
          slug: slugify(input.name),
        },
      });
      if (existingTool && existingTool.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tool with this name already exists.",
        });
      }

      const tool = await ctx.db.tool.upsert({
        where: {
          id: input.id ?? uuidv4(),
        },
        create: {
          slug: slugify(input.name),
          name: input.name,
          description: input.description,
          url: input.url,
          image: input.logoImageUrl,
          ownerId: ctx.user.id,
          logoImageUrl: input.logoImageUrl,
          screenshotUrl: input.screenshotUrl,
          pricing: input.pricing,
        },
        update: {
          slug: slugify(input.name),
          name: input.name,
          description: input.description,
          url: input.url,
          image: input.logoImageUrl,
          logoImageUrl: input.logoImageUrl,
          screenshotUrl: input.screenshotUrl,
          pricing: input.pricing,
        },
        include: {
          ToolTags: true,
        },
      });

      // Get current tags for the tool from the upsert result
      const existingTags = tool.ToolTags.map((tt) => tt.tag);

      // Identify removed tags and decrement uses + remove association
      const tagsToRemove = existingTags.filter(
        (tag) => !input.tags.includes(tag),
      );
      for (const tag of tagsToRemove) {
        await ctx.db.tag.update({
          where: { name: tag },
          data: { uses: { decrement: 1 } },
        });
        await ctx.db.toolTags.delete({
          where: {
            toolId_tag: { toolId: tool.id, tag },
          },
        });
      }

      // Identify new tags and upsert them, increment uses + create association
      const tagsToAdd = input.tags.filter((tag) => !existingTags.includes(tag));
      for (const tag of tagsToAdd) {
        await ctx.db.tag.upsert({
          where: { name: tag },
          create: {
            name: tag,
            uses: 1,
          },
          update: {
            uses: { increment: 1 },
          },
        });
        await ctx.db.toolTags.upsert({
          where: {
            toolId_tag: {
              tag: tag,
              toolId: tool.id,
            },
          },
          create: {
            tag: tag,
            toolId: tool.id,
          },
          update: {},
        });
      }

      const prompt = `
        Name: ${tool.name};
        Description: ${tool.description};
        Tags: ${tagsToAdd.join(", ")};
        Pricing: ${tool.pricing};
      `;

      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: prompt.trim(),
      });

      await ctx.db.$executeRaw`
        UPDATE "Tool"
        SET vector = ${embedding}::vector
        WHERE id = ${tool.id}
      `;

      return {};
    }),
  // gentoolsandtags: publicProcedure
  //   .input(z.object({}))
  //   .mutation(async ({ ctx }) => {
  //     for (const id in tools) {
  //       // @ts-ignore
  //       const tool = tools[id] as any;

  //       // //create tool
  //       try {
  //         const newTool = await ctx.db.tool.create({
  //           data: {
  //             description: tool.description,
  //             name: tool.tool_name,
  //             url: tool["Link to tool"],
  //             image: tool.logo_url,
  //             pricing: tool.pricing ?? "No data",
  //           },
  //         });
  //         console.log(tool.tool_name);

  //         if (typeof tool.other_tags === "string") continue;
  //         // @ts-ignore
  //         for (const tag of tool.other_tags) {
  //           // console.log(tag);
  //           await ctx.db.tag.upsert({
  //             where: {
  //               name: tag,
  //             },
  //             create: {
  //               name: tag,
  //             },
  //             update: {
  //               uses: {
  //                 increment: 1,
  //               },
  //             },
  //           });
  //           await ctx.db.toolTags.upsert({
  //             where: {
  //               toolId_tag: {
  //                 tag: tag,
  //                 toolId: newTool.id,
  //               },
  //             },
  //             create: {
  //               tag: tag,
  //               toolId: newTool.id,
  //             },
  //             update: {},
  //           });
  //         }
  //       } catch {}
  //     }

  //     return;
  //   }),
  count: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.tool.count();
    return { count };
  }),
  defaultTools: publicProcedure.query(async ({ ctx }) => {
    console.log(ctx.user?.id);
    const newTools = await ctx.db.tool.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        ToolAnalytics: true,
        ToolTags: {
          include: {
            Tag: true,
          },
        },
        UserToolFavorite: {
          where: {
            userId: ctx.user?.id ?? "",
          },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    const trendingTools = await ctx.db.tool.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        ToolAnalytics: true,
        ToolTags: {
          include: {
            Tag: true,
          },
        },
        UserToolFavorite: {
          where: {
            userId: ctx.user?.id ?? "",
          },
        },
      },
      take: 20,
      orderBy: { rating: "desc" },
    });

    return {
      newTools,
      trendingTools,
    };
  }),
  createEmbeddings: adminProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const tools = await ctx.db.tool.findMany({
        include: { ToolTags: true },
        skip: 1000,
      });

      const batchSize = 15; // define desired batch size
      for (let i = 0; i < tools.length; i += batchSize) {
        const batch = tools.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (tool) => {
            const prompt = `
              Name: ${tool.name};
              Description: ${tool.description};
              Tags: ${tool.ToolTags.map((tt) => tt.tag).join(", ")};
              Pricing: ${tool.pricing};
            `;

            const { embedding } = await embed({
              model: openai.embedding("text-embedding-3-small"),
              value: prompt.trim(),
            });

            await ctx.db.$executeRaw`
              UPDATE "Tool"
              SET vector = ${embedding}::vector
              WHERE id = ${tool.id}
            `;
          }),
        );
        console.log(`Batch ${i / batchSize + 1} processed.`);
      }
    }),
  delete: authenticatedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const tool = await ctx.db.tool.findUnique({
        where: { id: input.id, ownerId: ctx.user.id },
      });
      if (!tool) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tool not found" });
      }
      await ctx.db.tool.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });
      return {};
    }),
  adminDelete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tool.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });
      return {};
    }),
  slugify: adminProcedure.mutation(async ({ ctx }) => {
    const tools = await ctx.db.tool.findMany({
      where: {
        slug: null,
      },
    });
    console.log("Tools without slugs: ", tools.length);
    for (const tool of tools) {
      const baseSlug = slugify(tool.name);
      console.log(`${baseSlug}`);
      let newSlug = baseSlug;
      let count = 1;
      // Attempt to find an existing tool with the same slug (ignore self)
      let existing = await ctx.db.tool.findUnique({ where: { slug: newSlug } });
      while (existing && existing.id !== tool.id) {
        newSlug = `${baseSlug}-${count}`;
        count++;
        existing = await ctx.db.tool.findUnique({ where: { slug: newSlug } });
      }
      await ctx.db.tool.update({
        where: {
          id: tool.id,
        },
        data: {
          slug: newSlug,
        },
      });
    }
  }),
});
