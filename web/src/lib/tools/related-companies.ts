import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const relatedCompaniesTool = tool({
  description: `
    Retrieves tickers related to the queried ticker using news data.
    Returns an object with status, request_id, ticker, and an array of related tickers.
  `,
  parameters: z.object({
    ticker: z
      .string()
      .describe(
        "The ticker symbol (e.g., AAPL) to find related companies for.",
      ),
  }),
  execute: async ({ ticker }) => {
    const endpoint = `/v1/related-companies/${ticker}`;
    const data = await polygonApiCall(endpoint);
    return { data };
  },
});
