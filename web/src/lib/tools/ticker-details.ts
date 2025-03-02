import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const tickerDetailsTool = tool({
  description: `
    Retrieves detailed ticker info from Polygon.io.
    Response includes status, request_id, and a tickerobject with:
      • active, address, branding, cik, composite_figi,
      • currency_name, description, homepage_url,
      • list_date, market_cap, name, primary_exchange,
      • ticker, total_employees.
    
    Use this tool when detailed company profile data is needed.
  `,
  parameters: z.object({
    ticker: z.string().describe("The ticker symbol (e.g., AAPL)."),
    date: z
      .string()
      .optional()
      .describe(
        "Optional date (YYYY-MM-DD) for historical details; defaults to the latest data.",
      ),
  }),
  execute: async ({ ticker, date }) => {
    const endpoint = `/v3/reference/tickers/${ticker}`;
    const queryParams: Record<string, string> = {};
    if (date) {
      queryParams.date = date;
    }
    const data = await polygonApiCall(endpoint, queryParams);
    return { data };
  },
});
