import { tools } from "@/lib/ai_tools";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const toolsRouter = createTRPCRouter({
  fetch: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const tool = await ctx.db.tool.findUnique({
        where: { id: input.id },
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
        query: z.string().optional(),
        page: z.number().optional().default(1),
        orderBy: z.enum(["trending", "new"]).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Build filters for tags and search query
      const filters = input.tags
        ? input.tags.map((tag) => ({
            ToolTags: { some: { Tag: { name: tag } } },
          }))
        : undefined;

      let where;
      if (filters && input.query) {
        // When both filters and query exist, require that all filters match AND
        // either the name or description contains the query.
        where = {
          OR: [
            {
              AND: [
                ...filters,
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
                ...filters,
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
      } else if (filters) {
        // Only filters provided: all filter conditions must match.
        where = {
          AND: [...filters],
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

      // Run both the paginated query and the count query in parallel
      const [tools, totalCount] = await Promise.all([
        ctx.db.tool.findMany({
          where,
          include: {
            ToolTags: {
              include: {
                Tag: true,
              },
            },
          },
          take: 10,
          skip: (input.page - 1) * 10,
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
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const tools = await ctx.db.tool.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: {
          name: "asc",
        },
      });
      return { tools };
    }),
  seed: publicProcedure.mutation(async ({ ctx }) => {
    const tags = [
      "productivity",
      "design",
      "development",
      "web",
      "mobile",
      "api",
      "database",
      "security",
      "testing",
      "deployment",
      "accessibility",
      "agile",
      "analytics",
      "angular",
      "architecture",
      "artificial intelligence",
      "automation",
      "aws",
      "azure",
      "backend",
      "big data",
      "blockchain",
      "caching",
      "cd",
      "ci",
      "cloud",
      "cms",
      "containers",
      "continuous integration",
      "continuous delivery",
      "cross platform",
      "css",
      "data science",
      "debugging",
      "devops",
      "docker",
      "encryption",
      "express",
      "firewall",
      "firebase",
      "frontend",
      "fullstack",
      "git",
      "github actions",
      "google cloud",
      "graphql",
      "helm",
      "html",
      "iot",
      "java",
      "javascript",
      "jest",
      "jwt",
      "kotlin",
      "kubernetes",
      "lambda",
      "linux",
      "linting",
      "logging",
      "machine learning",
      "microfrontends",
      "microservices",
      "monitoring",
      "node",
      "npm",
      "oauth",
      "openapi",
      "performance",
      "pipeline",
      "pnpm",
      "postgres",
      "python",
      "react",
      "react native",
      "redis",
      "refactoring",
      "rest",
      "ruby",
      "rust",
      "sass",
      "scalability",
      "serverless",
      "selenium",
      "seo",
      "svelte",
      "swagger",
      "swift",
      "typescript",
      "ui",
      "ux",
      "version control",
      "virtualization",
      "vue",
      "webassembly",
      "webdriver",
      "webpack",
      "wordpress",
      "xcode",
      "yaml",
      "zuul",
    ];

    // Seed the Tag table
    await ctx.db.tag.createMany({
      data: tags.map((name) => ({
        name,
        uses: 0,
      })),
      skipDuplicates: true,
    });

    // Create 100 tools with random associated tags (1-3 per tool)
    for (let i = 0; i < 100; i++) {
      const numTags = Math.floor(Math.random() * 3) + 1;
      const toolTags: string[] = [];
      const usedIndices = new Set<number>();

      while (toolTags.length < numTags) {
        const idx = Math.floor(Math.random() * tags.length);
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx);
          toolTags.push(tags[idx]!);
        }
      }

      await ctx.db.tool.create({
        data: {
          id: crypto.randomUUID(),
          name: `Tool ${i + 1}`,
          description: `This is a description for Tool ${i + 1}.`,
          url: `https://example.com/tool${i + 1}`,
          image: `https://picsum.photos/seed/tool${i + 1}/200/200`,
          ToolTags: {
            create: toolTags.map((tagName) => ({
              Tag: { connect: { name: tagName } },
            })),
          },
        },
      });
    }
    return { success: true };
  }),
  fetchOwned: authenticatedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      const tools = await ctx.db.tool.findMany({
        where: {
          ownerId: ctx.user.id,
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
      const tool = await ctx.db.tool.upsert({
        where: {
          id: input.id ?? uuidv4(),
        },
        create: {
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

      return {};
    }),
  gentoolsandtags: publicProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      for (const id in tools) {
        // @ts-ignore
        const tool = tools[id] as any;

        // //create tool
        try {
          const newTool = await ctx.db.tool.create({
            data: {
              description: tool.description,
              name: tool.tool_name,
              url: tool["Link to tool"],
              image: tool.logo_url,
              pricing: tool.pricing ?? "No data",
            },
          });
          console.log(tool.tool_name);

          if (typeof tool.other_tags === "string") continue;
          // @ts-ignore
          for (const tag of tool.other_tags) {
            // console.log(tag);
            await ctx.db.tag.upsert({
              where: {
                name: tag,
              },
              create: {
                name: tag,
              },
              update: {
                uses: {
                  increment: 1,
                },
              },
            });
            await ctx.db.toolTags.upsert({
              where: {
                toolId_tag: {
                  tag: tag,
                  toolId: newTool.id,
                },
              },
              create: {
                tag: tag,
                toolId: newTool.id,
              },
              update: {},
            });
          }
        } catch {}
      }

      return;
    }),
  count: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.tool.count();
    return { count };
  }),
  defaultTools: publicProcedure.query(async ({ ctx }) => {
    const newTools = await ctx.db.tool.findMany({
      include: {
        ToolTags: {
          include: {
            Tag: true,
          },
        },
      },
      take: 12,
      orderBy: { createdAt: "desc" },
    });

    const trendingTools = await ctx.db.tool.findMany({
      include: {
        ToolTags: {
          include: {
            Tag: true,
          },
        },
      },
      take: 5,
      orderBy: { rating: "desc" },
    });

    return {
      newTools,
      trendingTools,
    };
  }),
});
