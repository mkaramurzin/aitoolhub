import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const stockFinancialsTool = tool({
  description: `
    Retrieves historical financial filings for a given ticker from Polygon.io. 
    The response includes status, request_id, count, next_url (if available), and an array of filings (with details like filing datetime, cik, company name, filing and period dates, financial statements, and filing timeframe).
  `,
  parameters: z.object({
    ticker: z.string().describe("The ticker symbol (e.g., AAPL)."),
    filing_date_gte: z
      .string()
      .optional()
      .describe("Filings with filing_date >= this date (YYYY-MM-DD)."),
    filing_date_lt: z
      .string()
      .optional()
      .describe("Filings with filing_date < this date (YYYY-MM-DD)."),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe("Maximum number of filings to return (default is 10)."),
  }),
  execute: async ({ ticker, filing_date_gte, filing_date_lt, limit }) => {
    const endpoint = "/vX/reference/financials";
    const queryParams: Record<string, string> = {
      ticker,
      limit: String(limit),
    };
    if (filing_date_gte) queryParams["filing_date.gte"] = filing_date_gte;
    if (filing_date_lt) queryParams["filing_date.lt"] = filing_date_lt;
    const data = await polygonApiCall(endpoint, queryParams);
    return { data };
  },
});
