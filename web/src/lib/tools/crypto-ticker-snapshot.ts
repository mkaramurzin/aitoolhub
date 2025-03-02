import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const cryptoTickerSnapshotTool = tool({
  description: `
    Retrieves the latest snapshot for a cryptocurrency ticker from Polygon.io.
    The snapshot data includes:
      • Current minute aggregate ("min"): open, high, low, close, volume, number of transactions, timestamp, and volume weighted average price.
      • Current day aggregate ("day"): open, high, low, close, volume, and volume weighted average price.
      • Previous day aggregate ("prevDay"): open, high, low, close, volume, and volume weighted average price.
      • Last trade information ("lastTrade"): trade ID, price, size, conditions, timestamp, and exchange ID.
      • Additional details such as the ticker symbol, today's change in value and percentage, and the last updated timestamp.
    
    Use this tool when you need the latest market snapshot data for a crypto symbol.
  `,
  parameters: z.object({
    ticker: z
      .string()
      .describe("The cryptocurrency ticker symbol (e.g., X:BTCUSD)."),
  }),
  execute: async ({ ticker }) => {
    // Construct the endpoint using the provided ticker symbol.
    const endpoint = `/v2/snapshot/locale/global/markets/crypto/tickers/${ticker}`;

    // Make the API call. No additional query parameters are needed unless your implementation requires them.
    const data = await polygonApiCall(endpoint, {});

    return { data };
  },
});
