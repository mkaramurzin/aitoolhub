import { subDays } from "date-fns";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const ingestRouter = createTRPCRouter({
  web: publicProcedure
    .input(
      z.object({
        source: z.enum(["web", "x"]),
        id: z.string().optional(),
        text: z.string(),
        link: z.string().url().optional(),
        date: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingIngestData = await ctx.db.ingestData.findFirst({
        where: {
          link: input.link,
        },
      });

      if (existingIngestData) return {};

      await ctx.db.ingestData.create({
        data: {
          source: input.source,
          text: input.text,
          link: input.link,
          date: input.date,
        },
      });
      return {};
    }),
    webFetchAll: publicProcedure.query(async ({ ctx }) => {
    const twentyFourHoursAgo = subDays(new Date(), 1);

    const webPosts = await ctx.db.ingestData.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    return webPosts;
  }),
  x: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string(),
        url: z.string(),
        twitterUrl: z.string(),
        text: z.string(),
        source: z.string(),
        retweetCount: z.number(),
        replyCount: z.number(),
        likeCount: z.number(),
        quoteCount: z.number(),
        viewCount: z.number(),
        createdAt: z.date(),
        lang: z.string(),
        bookmarkCount: z.number(),
        isReply: z.boolean(),
        inReplyToId: z.string().nullable().optional(),
        conversationId: z.string(),
        inReplyToUserId: z.string().nullable().optional(),
        inReplyToUsername: z.string().nullable().optional(),
        author: z.any(), // Using z.any() for Json fields
        extendedEntities: z.any(), // Using z.any() for Json fields
        card: z.any().nullable().optional(), // Using z.any() for Json fields
        place: z.any(), // Using z.any() for Json fields
        entities: z.any(), // Using z.any() for Json fields
        quoted_tweet: z.any().nullable().optional(), // Using z.any() for Json fields
        retweeted_tweet: z.any().nullable().optional(), // Using z.any() for Json fields
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingIngestXData = await ctx.db.ingestXData.findUnique({
        where: {
          id: input.id,
        },
      });

      if (existingIngestXData) return {};

      await ctx.db.ingestXData.create({
        data: {
          id: input.id,
          type: input.type,
          url: input.url,
          twitterUrl: input.twitterUrl,
          text: input.text,
          source: input.source,
          retweetCount: input.retweetCount,
          replyCount: input.replyCount,
          likeCount: input.likeCount,
          quoteCount: input.quoteCount,
          viewCount: input.viewCount,
          createdAt: input.createdAt,
          lang: input.lang,
          bookmarkCount: input.bookmarkCount,
          isReply: input.isReply,
          inReplyToId: input.inReplyToId,
          conversationId: input.conversationId,
          inReplyToUserId: input.inReplyToUserId,
          inReplyToUsername: input.inReplyToUsername,
          author: input.author,
          extendedEntities: input.extendedEntities,
          card: input.card,
          place: input.place,
          entities: input.entities,
          quoted_tweet: input.quoted_tweet,
          retweeted_tweet: input.retweeted_tweet,
        },
      });
      return {};
    }),
  fetchAll: publicProcedure.query(async ({ ctx }) => {
    const twentyFourHoursAgo = subDays(new Date(), 1);

    const tweets = await ctx.db.ingestXData.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    return tweets;
  }),
  reddit: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        image: z.string().nullable().optional(),
        permalink: z.string(),
        text: z.string().nullable().optional(),
        subreddit: z.string(),
        author: z.string(),
        score: z.number(),
        numComments: z.number(),
        createdAt: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingIngestRedditData = await ctx.db.ingestRedditData.findUnique({
        where: {
          id: input.id,
        },
      });

      if (existingIngestRedditData) return {};

      await ctx.db.ingestRedditData.create({
        data: {
          id: input.id,
          title: input.title,
          image: input.image, 
          permalink: input.permalink,
          text: input.text,
          subreddit: input.subreddit,
          author: input.author,
          score: input.score,
          numComments: input.numComments,
          createdAt: new Date(),
        },
      });
      return {};
    }),
    redditFetchAll: publicProcedure.query(async ({ctx}) => {
      const twentyFourHoursAgo = subDays(new Date(), 1);

      // grab 20 or less ChatGPT subreddit posts (with most likes)
      const chatGPTRedditPosts = await ctx.db.ingestRedditData.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
          subreddit: "ChatGPT", 
        },
        orderBy: {
          score: "desc",
        },
        take: 20,
      })
      const otherRedditPosts = await ctx.db.ingestRedditData.findMany({
        where: {
          createdAt: {
            gte: twentyFourHoursAgo,
          },
          subreddit: {
            in: ["ArtificialInteligence", "singularity"]
          },
        },
        orderBy: {
          score: "desc"
        }
      });

      const combinedPosts = [...chatGPTRedditPosts, ...otherRedditPosts];

      return combinedPosts;
    }),

});
