import { api } from "@/trpc/server";
import { z } from "zod";

const ingestBodySchema = z.object({
    id: z.string(),
    title: z.string(),
    image: z.string().nullable().optional(),
    permalink: z.string(),
    text: z.string().nullable().optional(),
    subreddit: z.string(),
    author: z.string(),
    score: z.number(),
    numComments: z.number(),
    createdAt: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), {
      message: "Invalid date string",
    })
    .transform((s) => new Date(s)),
});

export async function POST(request: Request) {
    // debugging
    // console.log("Reddit POST function called!");

    // get headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
        return new Response("Missing API key", { status: 401 });
    }

    if (apiKey !== "123") {
        return new Response("Invalid API key", { status: 401 });
    }

    let res;
    try {
        res = await request.json();
        // console.log("📦 Received body:", res);
    } catch {
        // console.log("❌ Failed to parse JSON:", err);
        return new Response("Invalid JSON body", { status: 400 });
    }

    // validate data with schema
    const result = ingestBodySchema.safeParse(res);

    if (!result.success) {
        // console.log("❌ Zod validation failed:", result.error.flatten());
        return new Response(
        JSON.stringify({
            error: "Invalid request",
            issues: result.error.issues,
        }),
        { status: 400 },
        );
    }

    // successful data result will call ingest function 
    await api.ingest.reddit(result.data);

    return Response.json({});
}

export async function GET(request: Request) {
    // debugging
    // console.log("Reddit GET function called!");

    // get headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
        return new Response("Missing API key", { status: 401 });
    }

    if (apiKey !== "123") {
        return new Response("Invalid API key", { status: 401 });
    }

    try {
        const redditPosts = await api.ingest.redditFetchAll();
        return Response.json(redditPosts);
    } catch (err) {
        console.error("Error in GET /api/ingest/reddit:", err);
        return new Response(
        JSON.stringify({
            error: "Internal Server Error",
            message: "Something went wrong while fetching Reddit posts.",
        }),
        { status: 500 },
        );
    }

}