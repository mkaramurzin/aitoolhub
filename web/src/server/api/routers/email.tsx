import { env } from "@/env";
import { resend } from "@/lib/resend";
import { TRPCError } from "@trpc/server";
import MarketingEmail from "emails/marketing-email";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { createContact } from "./waitlist";

export const emailRouter = createTRPCRouter({
  send: adminProcedure
    .input(z.object({ techCrunchId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const techCrunch = await ctx.db.techCrunch.findUnique({
        where: { id: input.techCrunchId },
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
          TechCrunchIngestRedditData: { 
            include: { 
              IngestRedditData: true 
            } 
          },
        },
      });

      if (!techCrunch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tech Crunch entry not found",
        });
      }

      const broadcast = await resend.broadcasts.create({
        audienceId: "a7a52ebc-4cb9-4c96-85a1-ac758a2b912a",
        from: "AiToolHub.co <hello@aitoolhub.co>",
        name: techCrunch.title,
        subject: techCrunch.title,
        previewText: techCrunch.subject,
        react: (
          <MarketingEmail
            title={techCrunch.title}
            id={techCrunch.id}
            baseUrl={env.NEXT_PUBLIC_BASE_URL}
            tweets={techCrunch.TechCrunchIngestXData.flatMap(
              (tweet) => tweet.IngestXData,
            ).map((tweet) => ({
              tweetId: tweet.id,
              profilePicture: tweet.author
                ? // @ts-ignore
                  tweet.author.profilePicture
                : "None",
              // @ts-ignore
              author: tweet.author ? tweet.author.name : "None",
              // @ts-ignore
              handle: tweet.author ? tweet.author.userName : "None",
              content: tweet.text,
              url: tweet.url,
              retweetCount: tweet.retweetCount,
              replyCount: tweet.replyCount,
              likeCount: tweet.likeCount,
              image:
                typeof tweet.extendedEntities === "object" &&
                tweet.extendedEntities !== null &&
                "media" in tweet.extendedEntities &&
                Array.isArray((tweet.extendedEntities as any).media) &&
                (tweet.extendedEntities as any).media.length > 0
                  ? (tweet.extendedEntities as any).media[0].media_url_https
                  : undefined,
            }))}
            breakingNews={techCrunch.TechCrunchBreakingNews.map((news) => ({
              id: news.id,
              title: news.title,
              description: news.description,
              url: news.url,
            }))}
            overview={techCrunch.TechCrunchSummary.map(
              (summary) => summary.summary,
            )}
            tools={techCrunch.TechCrunchTool.map((tool) => ({
              id: tool.id,
              name: tool.name,
              description: tool.description,
            }))}
            sponsors={techCrunch.TechCrunchSponsor.map((sponsor) => ({
              name: sponsor.Tool.name,
              logo: sponsor.Tool.image,
              url: sponsor.Tool.url,
            }))}
            redditPosts={techCrunch.TechCrunchIngestRedditData.flatMap(
              (post) => post.IngestRedditData,
            ).map((post) => ({
              id: post.id,
              title: post.title,
              image: post.image,
              permalink: post.permalink,
              subreddit: post.subreddit,
              author: post.author,
              score: post.score,
              numComments: post.numComments,
            }))}
            subject={techCrunch.subject}
            previewText={techCrunch.subject}
          />
        ),
      });

      const broadcastId = broadcast.data?.id;

      if (!broadcastId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create broadcast",
        });
      }

      await resend.broadcasts.send(broadcastId);

      await ctx.db.techCrunch.update({
        where: { id: techCrunch.id },
        data: {
          status: "PUBLISHED",
        },
      });
    }),

  backfill: adminProcedure.mutation(async ({ ctx }) => {
    const emails = await ctx.db.waitlist.findMany({
      where: {},
    });

    console.log(`Found ${emails.length} emails to backfill`);
    let index = 0;
    for (const item of emails) {
      console.log(
        `Creating contact for ${item.email} (${index + 1} of ${emails.length})`,
      );
      await createContact({ email: item.email });
      index = index + 1;
      // Wait for 1 second to avoid hitting the rate limit
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }),

  test: adminProcedure
    .input(z.object({ techCrunchId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const techCrunch = await ctx.db.techCrunch.findUnique({
        where: { id: input.techCrunchId },
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
          TechCrunchIngestRedditData: {
              include: {
              IngestRedditData: true,
            },
          }
        },
      });

      if (!techCrunch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tech Crunch entry not found",
        });
      }

      await resend.emails.send({
        to: [ctx.user.email],
        from: "AiToolHub.co <hello@aitoolhub.co>",
        subject: techCrunch.title,
        react: (
          <MarketingEmail
            title={techCrunch.title}
            id={techCrunch.id}
            baseUrl={env.NEXT_PUBLIC_BASE_URL}
            tweets={techCrunch.TechCrunchIngestXData.flatMap(
              (tweet) => tweet.IngestXData,
            ).map((tweet) => ({
              tweetId: tweet.id,
              profilePicture: tweet.author
                ? // @ts-ignore
                  tweet.author.profilePicture
                : "None",
              // @ts-ignore
              author: tweet.author ? tweet.author.name : "None",
              // @ts-ignore
              handle: tweet.author ? tweet.author.userName : "None",
              content: tweet.text,
              url: tweet.url,
              retweetCount: tweet.retweetCount,
              replyCount: tweet.replyCount,
              likeCount: tweet.likeCount,
              image:
                typeof tweet.extendedEntities === "object" &&
                tweet.extendedEntities !== null &&
                "media" in tweet.extendedEntities &&
                Array.isArray((tweet.extendedEntities as any).media) &&
                (tweet.extendedEntities as any).media.length > 0
                  ? (tweet.extendedEntities as any).media[0].media_url_https
                  : undefined,
            }))}
            breakingNews={techCrunch.TechCrunchBreakingNews.map((news) => ({
              id: news.id,
              title: news.title,
              description: news.description,
              url: news.url,
            }))}
            overview={techCrunch.TechCrunchSummary.map(
              (summary) => summary.summary,
            )}
            tools={techCrunch.TechCrunchTool.map((tool) => ({
              id: tool.id,
              name: tool.name,
              description: tool.description,
            }))}
            sponsors={techCrunch.TechCrunchSponsor.map((sponsor) => ({
              name: sponsor.Tool.name,
              logo: sponsor.Tool.image,
              url: sponsor.Tool.url,
            }))}
            redditPosts={techCrunch.TechCrunchIngestRedditData.flatMap(
              (post) => post.IngestRedditData,
            ).map((post) => ({
              id: post.id,
              title: post.title,
              image: post.image ?? undefined,
              permalink: post.permalink,
              subreddit: post.subreddit,
              author: post.author,
              score: post.score,
              numComments: post.numComments,
            }))}
            subject={techCrunch.subject}
            previewText={techCrunch.subject}
          />
        ),
      });
    }),
});
