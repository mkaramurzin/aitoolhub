import { tools } from "@/lib/ai_tools";
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

// Helper functions for smart clarification
function isExploratoryQuery(query: string): boolean {
  const exploratoryTerms = [
    'ai tools', 'tools', 'show me everything', 'find me anything', 'discover all'
  ];
  const normalizedQuery = query.toLowerCase().trim();
  return exploratoryTerms.some(term => normalizedQuery === term) || 
         normalizedQuery.length < 5; // More permissive threshold
}

async function generateConversationalResponse(
  query: string, 
  tools: any[], 
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []
): Promise<{ response: string; suggestedRefinements: string[] } | null> {
  // Handle no tools found case
  if (tools.length === 0) {
    const systemPrompt = `You are a helpful AI assistant that helps users find AI tools. The user searched for "${query}" but no tools were found.

Your role:
- Be empathetic and acknowledge their search didn't return results
- Ask clarifying questions to better understand what they need
- Suggest they try different keywords, broader terms, or describe their specific use case
- Keep it conversational and helpful (1-2 sentences max)
- Don't just say "no results" - guide them toward a solution`;

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        maxRetries: 3,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: query }
        ],
        temperature: 0.7,
      });

      // For no results, suggest common refinement categories
      const commonRefinements = [
        "automation", "design", "writing", "analytics", "productivity", 
        "development", "marketing", "image generation", "video editing"
      ];

      return {
        response: text,
        suggestedRefinements: commonRefinements.slice(0, 4)
      };
    } catch (error) {
      console.error('Error generating no-tools response:', error);
      return {
        response: "I couldn't find any tools matching that search. Could you describe what you're trying to accomplish in more detail?",
        suggestedRefinements: ["automation", "design", "writing", "analytics"]
      };
    }
  }

  // Extract common themes from returned tools
  const allTags = tools.flatMap(tool => 
    tool.ToolTags.map((tt: any) => tt.Tag.name)
  );
  const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  // Get top tool categories for context
  const topCategories = Object.entries(tagCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([tag]) => tag);

  // Get sample tool names for context
  const sampleTools = tools.slice(0, 3).map(tool => tool.name);

  const isInitialMessage = conversationHistory.length === 0;
  
  // Create context for the AI
  const systemPrompt = `You are a helpful AI assistant that helps users find the perfect AI tools. You have access to a database of AI tools and their categories.

Current search context:
- User's query: "${query}"
- Number of tools found: ${tools.length}
- Top categories found: ${topCategories.join(', ')}
- Sample tools: ${sampleTools.join(', ')}

Your role:
- Be conversational, friendly, and helpful
- Keep responses concise (1-2 sentences max)
- ${isInitialMessage ? 'Acknowledge their search intent and offer to help refine it' : 'Continue the conversation naturally'}
- Suggest specific refinements when appropriate
- Don't just list categories - engage in dialogue

${isInitialMessage ? 
  'This is the user\'s initial search. Acknowledge what they\'re looking for and offer to help them find more specific tools.' : 
  'Continue the conversation based on the history provided.'
}`;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: query }
      ],
      temperature: 0.7,
    });

    // Generate suggested refinements based on categories
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    const suggestedRefinements = topCategories
      .filter(tag => {
        const normalizedTag = tag.toLowerCase();
        return !queryWords.some(word => 
          normalizedTag.includes(word) || 
          word.includes(normalizedTag)
        );
      })
      .slice(0, 3);

    return {
      response: text,
      suggestedRefinements
    };
  } catch (error) {
    console.error('Error generating conversational response:', error);
    return null;
  }
}

async function generateRefinedSearchQuery(
  originalQuery: string,
  userMessage: string,
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
  availableTools: any[]
): Promise<string> {
  // Extract available tool categories for context
  const allTags = availableTools.flatMap(tool => 
    tool.ToolTags.map((tt: any) => tt.Tag.name)
  );
  const uniqueTags = [...new Set(allTags)];
  
  // Get sample tool names and descriptions for better context
  const toolContext = availableTools.slice(0, 5).map(tool => 
    `${tool.name}: ${tool.ToolTags.map((tt: any) => tt.Tag.name).join(', ')}`
  ).join('; ');

  const systemPrompt = `You are an AI search query optimizer. Your job is to analyze a conversation about AI tool discovery and generate an optimized search query that will find the most relevant tools.

Context:
- Original search query: "${originalQuery}"
- User's latest message: "${userMessage}"
- Available tool categories: ${uniqueTags.slice(0, 20).join(', ')}
- Sample tools: ${toolContext}

Instructions:
1. Extract the core intent from the original query
2. Identify specific requirements, features, or use cases mentioned in the conversation
3. Remove conversational fluff (like "I want", "something that", "can you help me")
4. Combine relevant keywords with category tags that match available tools
5. Output only a clean, searchable query (2-8 words max)
6. Focus on tool functionality and use cases, not conversational elements

Examples:
- Original: "build a website", User: "I need something for e-commerce" → "website builder e-commerce"
- Original: "design tool", User: "specifically for logos and branding" → "logo design branding"
- Original: "automate tasks", User: "for my accounting workflow" → "accounting automation workflow"

Generate only the refined search query:`;

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      maxRetries: 3,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-4), // Include recent context
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3, // Lower temperature for more focused output
    });

    // Clean and validate the response
    const refinedQuery = text.trim()
      .replace(/['"]/g, '') // Remove quotes
      .replace(/\.$/, '') // Remove trailing period
      .toLowerCase();

    // Fallback to original + key terms if AI response is invalid
    if (!refinedQuery || refinedQuery.length < 2 || refinedQuery.length > 50) {
      // Create a simple fallback by combining original with key terms from message
      const messageKeywords = userMessage.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !['the', 'and', 'for', 'with', 'can', 'you', 'help', 'find', 'need', 'want', 'something'].includes(word))
        .slice(0, 2)
        .join(' ');
      
      const fallbackQuery = messageKeywords 
        ? `${originalQuery} ${messageKeywords}`.trim()
        : originalQuery;
      
      return fallbackQuery;
    }

    return refinedQuery;
  } catch (error) {
    console.error('Error generating refined search query:', error);
    // Fallback: return original query if AI fails
    return originalQuery;
  }
}
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
        originalQuery: z.string().max(100).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Track search history for analytics (only for actual queries)
      if (input.searchHistory && input.query && input.query.trim().length > 0) {
        await ctx.db.searchHistory.create({
          data: {
            query: input.query,
            userId: ctx.user?.id,
            originalQuery: input.originalQuery,
            refinedQuery: input.originalQuery ? input.query : undefined,
            tags: input.tags ?? [],
            pricing: input.pricing ?? "",
          },
        });
      }

      // Use semantic vector search for meaningful queries
      if (input.magicSearch && input.query && input.query.trim().length > 2) {
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: `With AI I want to ${input.query.trim()}`,
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

        // Calculate confidence and provide suggestions
        const avgDistance = results.length > 0 ? results.reduce((sum, r) => sum + r.distance, 0) / results.length : 1;
        const confidence = Math.max(0, 1 - avgDistance);
        
        // Determine if we should suggest clarification
        // For no results or low confidence, always provide conversational guidance
        const shouldSuggestClarification = 
          tools.length === 0 || // Always help when no tools found
          (confidence < 0.7 && tools.length > 0 && tools.length < 10 && !isExploratoryQuery(input.query));

        const conversationalData = shouldSuggestClarification 
          ? await generateConversationalResponse(input.query, tools)
          : null;

        return { 
          tools, 
          count: totalCount, 
          confidence: Math.round(confidence * 100),
          conversationResponse: conversationalData?.response || null,
          conversationRefinements: conversationalData?.suggestedRefinements || null,
          // Keep legacy fields for backward compatibility during transition
          clarificationSuggestion: conversationalData?.response || null,
          clarificationTags: conversationalData?.suggestedRefinements || null
        };
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
            where: {
              ...where,
              deletedAt: null,
            },
          }),
        ]);

              // For regular search, calculate basic confidence based on result count and query specificity
        const confidence = input.query 
          ? Math.min(95, Math.max(60, (tools.length / Math.max(1, totalCount * 0.1)) * 100))
          : 85; // High confidence for browsing/filtering

        const shouldSuggestClarification = 
          !!input.query && (
            tools.length === 0 || // Always help when no tools found
            (confidence < 80 && tools.length > 0 && tools.length < 15 && !isExploratoryQuery(input.query))
          );

        const conversationalData = shouldSuggestClarification && input.query
          ? await generateConversationalResponse(input.query, tools)
          : null;

        return { 
          tools, 
          count: totalCount, 
          confidence: Math.round(confidence),
          conversationResponse: conversationalData?.response || null,
          conversationRefinements: conversationalData?.suggestedRefinements || null,
          // Keep legacy fields for backward compatibility during transition
          clarificationSuggestion: conversationalData?.response || null,
          clarificationTags: conversationalData?.suggestedRefinements || null
        };
    }),
  continueConversation: publicProcedure
    .input(z.object({ 
      originalQuery: z.string().max(100),
      message: z.string().max(200),
      conversationHistory: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })).optional().default([])
    }))
    .mutation(async ({ input, ctx }) => {
      // Get tools based on the original query context for ongoing conversation
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: `With AI I want to ${input.originalQuery.trim()}`,
      });

      const results = (await ctx.db.$queryRaw`
        SELECT DISTINCT t.id, t.vector::text, t.vector <=> ${embedding}::vector as distance
        FROM "Tool" t
        WHERE t.vector IS NOT NULL
          AND t.vector <=> ${embedding}::vector < 0.6
          AND t."deletedAt" IS NULL
        ORDER BY distance
        LIMIT 20
      `) as { id: string; vector: string; distance: number }[];

      const tools = await ctx.db.tool.findMany({
        where: {
          id: { in: results.map((result) => result.id) },
        },
        include: {
          ToolTags: {
            include: {
              Tag: true,
            },
          },
        },
      });

      const conversationalData = await generateConversationalResponse(
        input.message, 
        tools, 
        input.conversationHistory
      );

      // Intelligently generate a refined search query based on the conversation
      const refinedSearchQuery = await generateRefinedSearchQuery(
        input.originalQuery,
        input.message,
        input.conversationHistory,
        tools
      );

      return {
        response: conversationalData?.response || "I'm not sure how to help with that. Could you be more specific?",
        suggestedRefinements: conversationalData?.suggestedRefinements || [],
        searchSuggestion: refinedSearchQuery,
        toolCount: tools.length
      };
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
          prompt: `A user searched for an AI tool capable of "${input.query}". Ask a short clarifying question to better understand the request, and guide the user to the most relevant tool.`,
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
