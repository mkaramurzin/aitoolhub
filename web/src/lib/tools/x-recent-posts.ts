import { tool } from "ai";
import { z } from "zod";
import { twitterClient } from "../x";

export const twitterRecentSearchTool = tool({
  description: `
    Performs a recent search on Twitter (also known as X) and returns the ten most recent tweets. Can be used for sentiment analysis, trend analysis, market research, current news, and more.
  `,
  parameters: z.object({
    query: z.string().describe("The search query."),
  }),
  execute: async ({ query }) => {
    try {
      const response = await twitterClient.tweets.tweetsRecentSearch({
        query,
        max_results: 10,
        sort_order: "relevancy",
      });

      return { data: response.data };
    } catch (error) {
      return { error: error };
    }
  },
});
