import { tools } from "@/lib/ai_tools";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { authenticatedProcedure, createTRPCRouter } from "../trpc";

// Maximum number of concurrent requests to process at once
const MAX_CONCURRENT_REQUESTS = 5;

export const parserRouter = createTRPCRouter({
  parse: authenticatedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      // Create an array of tool IDs to process
      const toolIds = Object.keys(tools);
      // Process tools in batches to limit concurrency
      for (let i = 0; i < toolIds.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = toolIds.slice(i, i + MAX_CONCURRENT_REQUESTS);

        // Process each batch concurrently
        await Promise.all(
          batch.map(async (id) => {
            // Get the tool object to parse
            const tool = tools[id as keyof typeof tools];

            if (tool["Link to tool"]?.includes("theresanaiforthat")) {
              console.log(
                `Skipping ${tool.tool_name} because it is from theresanaiforthat.com`,
              );
              return; // Skip this tool
            }

            let parsedTool;
            try {
              // Generate parsed object using AI with a schema
              const results = await generateObject({
                maxRetries: 3,
                model: openai("gpt-4o-mini"),
                system: `You are an AI agent that parses scraped data from the web and generates a json object to be put inside a database. Summarize the data and make it more readable. Do not include the name of the tool in the description. If the pricing does not clearly match free, paid, or free-paid, set it to "free-paid".`,
                prompt: `Please parse this data: ${JSON.stringify(tool)}`,
                schema: z.object({
                  name: z.string().describe("The name of the tool."),
                  url: z.string().describe("The URL link to the tool."),
                  logo_url: z.string().describe("The URL link to the logo."),
                  link_to_tool: z.string().describe("The link to the tool."),
                  tags: z
                    .array(z.string())
                    .max(3)
                    .describe("The tags of the tool."),
                  pricing: z
                    .enum(["free", "paid", "free-paid"])
                    .describe("The pricing of the tool."),
                  excerpt: z.string().describe("The excerpt of the tool."),
                  description: z
                    .string()
                    .describe(
                      "The description of the tool. Do not include the name of the tool.",
                    ),
                }),
              });

              parsedTool = results.object;
            } catch (error) {
              // Log the error but continue processing
              console.error(
                `Error parsing tool ${tool.tool_name || id}:`,
                error,
              );
              // Skip this tool since we couldn't parse it
              return;
            }

            try {
              const upsertInput = {
                name: parsedTool.name,
                description: parsedTool.description || parsedTool.excerpt,
                url: parsedTool.link_to_tool || parsedTool.url,
                tags: parsedTool.tags,
                pricing: parsedTool.pricing,
                logoImageUrl: parsedTool.logo_url,
              };

              // Upsert the tool in the database
              const toolRecord = await ctx.db.tool.create({
                data: {
                  name: upsertInput.name,
                  description: upsertInput.description,
                  url: upsertInput.url,
                  ownerId: ctx.user.id,
                  logoImageUrl: upsertInput.logoImageUrl,
                  pricing: upsertInput.pricing,
                  image: upsertInput.logoImageUrl,
                },
              });

              for (const tag of parsedTool.tags) {
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
                      toolId: toolRecord.id,
                      tag: tag,
                    },
                  },
                  create: {
                    tag: tag,
                    toolId: toolRecord.id,
                  },
                  update: {},
                });
              }
            } catch (error) {
              // Log database errors but continue processing other tools
              console.error(
                `Error saving tool ${parsedTool.name} to database:`,
                error,
              );
            }
          }),
        );
      }

      return { success: true };
    }),
});
