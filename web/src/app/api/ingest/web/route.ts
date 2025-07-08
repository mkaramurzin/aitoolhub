import { api } from "@/trpc/server";
import { z } from "zod";

const ingestBodySchema = z.object({
  source: z.enum(["web", "x"]),
  id: z.string().optional(),
  text: z.string(),
  link: z.string().url().optional(),
  date: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), {
      message: "Invalid date string",
    })
    .transform((s) => new Date(s)),
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
  await api.ingest.web(result.data);
  return Response.json({});
}

export async function GET(request: Request) {
    // debugging
    console.log("Web GET function called!");

    // get headers
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
        return new Response("Missing API key", { status: 401 });
    }

    if (apiKey !== "123") {
        return new Response("Invalid API key", { status: 401 });
    }

    try {
        const webPosts = await api.ingest.webFetchAll();
        return Response.json(webPosts);
    } catch (err) {
        console.error("Error in GET /api/ingest/web:", err);
        return new Response(
        JSON.stringify({
            error: "Internal Server Error",
            message: "Something went wrong while fetching web sources.",
        }),
        { status: 500 },
        );
    }

}
