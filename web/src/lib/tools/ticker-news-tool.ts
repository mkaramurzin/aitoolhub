import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const tickerNewsTool = tool({
  description: `
    Retrieves recent ticker-related news from Polygon.io.
    
    Expected Response:
      - status: API success (e.g., "OK").
      - request_id: Unique identifier.
      - count: Number of articles.
      - next_url: (Optional) URL for the next results page.
      - results: Array of articles containing:
          • id, title, author, description,
          • article_url, image_url,
          • published_utc, amp_url,
          • publisher (with name, homepage_url, logo_url, favicon_url),
          • tickers.
  `,
  parameters: z.object({
    ticker: z.string().describe("The ticker symbol (e.g., AAPL)."),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of news articles to return (default 10)."),
  }),
  execute: async ({ ticker, limit }) => {
    const endpoint = "/v2/reference/news";
    const queryParams = {
      ticker,
      limit: String(limit),
    };
    const data = await polygonApiCall(endpoint, queryParams);
    return { data };
  },
});
