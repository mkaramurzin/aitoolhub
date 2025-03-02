import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const tickerSnapshotTool = tool({
  description: `
    Retrieves a market snapshot for a given stock ticker, with data 15-minutes delayed during market hours.
    
    Response includes:
      - status: Success indicator ("OK").
      - request_id: Unique ID.
      - ticker: Nested data containing:
          • day: Daily bar (o, h, l, c, v, vw, otc).
          • lastQuote: Latest quote (P, S, p, s, t).
          • lastTrade: Most recent trade (c, i, p, s, t, x).
          • min: Minute bar.
          • prevDay: Previous day's bar (o, h, l, c, v, vw, ticker, todaysChange, todaysChangePerc, updated).
  `,
  parameters: z.object({
    ticker: z.string().describe("The ticker symbol (e.g., AAPL)."),
  }),
  execute: async ({ ticker }) => {
    const endpoint = `/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`;
    const data = await polygonApiCall(endpoint);
    return { data };
  },
});
