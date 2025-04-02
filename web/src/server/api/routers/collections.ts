import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
export const collectionsRouter = createTRPCRouter({
  upsert: adminProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string().min(1).max(255),
        description: z.string().min(1).max(255),
        image: z.string().url(),
        tools: z.array(
          z.object({
            toolId: z.string().uuid(),
            review: z.object({
              reviewId: z.string().uuid().optional(),
              rating: z.number().min(1).max(5),
              content: z.string(),
            }),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //upsert collection
      const collection = await ctx.db.collection.upsert({
        where: {
          id: input.id ?? "",
        },
        create: {
          slug: slugify(input.name),
          name: input.name,
          description: input.description,
          image: input.image,
        },
        update: {
          slug: slugify(input.name),
          name: input.name,
          description: input.description,
          image: input.image,
        },
      });
      // delete existing collection tools
      await ctx.db.collectionTool.deleteMany({
        where: {
          collectionId: collection.id,
        },
      });

      // delete existing reviews
      await ctx.db.collectionToolReview.deleteMany({
        where: {
          collectionId: collection.id,
        },
      });

      //upsert collection tools
      input.tools.forEach(async (tool) => {
        await ctx.db.collectionTool.upsert({
          where: {
            collectionId_toolId: {
              collectionId: collection.id,
              toolId: tool.toolId,
            },
          },
          create: {
            collectionId: collection.id,
            toolId: tool.toolId,
          },
          update: {},
        });

        //upsert reviews
        const review = await ctx.db.review.upsert({
          where: {
            id: tool.review.reviewId ?? uuidv4(),
          },
          create: {
            userId: ctx.user.id,
            toolId: tool.toolId,
            rating: tool.review.rating,
            content: tool.review.content ?? uuidv4(),
          },
          update: {
            rating: tool.review.rating,
            content: tool.review.content ?? uuidv4(),
          },
        });

        await ctx.db.collectionToolReview.upsert({
          where: {
            collectionId_reviewId: {
              collectionId: collection.id,
              reviewId: review.id,
            },
          },
          create: {
            collectionId: collection.id,
            reviewId: review.id,
          },
          update: {
            collectionId: collection.id,
            reviewId: review.id,
          },
        });
      });
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.collection.delete({
        where: {
          id: input.id,
        },
      });
    }),
  fetchAll: publicProcedure
    .input(
      z.object({
        page: z.number().optional().default(1),
        take: z.number().max(50).optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [collections, totalCount] = await Promise.all([
        ctx.db.collection.findMany({
          include: {
            CollectionTools: {
              include: {
                Tool: true,
              },
            },
            CollectionToolReviews: {
              include: {
                Review: true,
              },
            },
          },
          take: input.take,
          skip: (input.page - 1) * input.take,
        }),
        ctx.db.collection.count({}),
      ]);
      return {
        collections,
        count: totalCount,
      };
    }),
  fetch: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const collection = await ctx.db.collection.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          CollectionTools: {
            include: {
              Tool: {
                include: {
                  ToolTags: {
                    include: {
                      Tag: true,
                    },
                  },
                },
              },
            },
          },
          CollectionToolReviews: {
            include: {
              Review: true,
            },
          },
        },
      });
      return {
        collection,
      };
    }),
  convertToSlug: adminProcedure.mutation(async ({ ctx, input }) => {
    const collections = await ctx.db.collection.findMany({});
    for (const collection of collections) {
      const slug = slugify(collection.name);
      await ctx.db.collection.update({
        where: {
          id: collection.id,
        },
        data: {
          slug,
        },
      });
    }
  }),
});

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}
