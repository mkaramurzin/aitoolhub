import { api } from "@/trpc/server";
import { z } from "zod";

const ingestBodySchema = z.object({
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
  createdAt: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), {
      message: "Invalid date string",
    })
    .transform((s) => new Date(s)),
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
});

export async function POST(request: Request) {
  // get headers
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return new Response("Missing API key", { status: 401 });
  }

  if (apiKey !== "123") {
    return new Response("Invalid API key", { status: 401 });
  }

  const res = await request.json();
  // validate body
  const result = ingestBodySchema.safeParse(res);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        issues: result.error.issues,
      }),
      { status: 400 },
    );
  }
  await api.ingest.x(result.data);
  return Response.json({});
}

export async function GET(request: Request) {
    // debugging
    // console.log("Twitter GET function called!");

    // get headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
        return new Response("Missing API key", { status: 401 });
    }

    if (apiKey !== "123") {
        return new Response("Invalid API key", { status: 401 });
    }

    try {
        const tweets = await api.ingest.fetchAll();
        return Response.json(tweets);
    } catch (err) {
        console.error("Error in GET /api/ingest/x:", err);
        return new Response(
        JSON.stringify({
            error: "Internal Server Error",
            message: "Something went wrong while fetching tweets.",
        }),
        { status: 500 },
        );
    }

}