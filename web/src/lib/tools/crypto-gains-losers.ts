import { tool } from "ai";
import { z } from "zod";
import { polygonApiCall } from "../polygon-api";

export const cryptoGainersLosersTool = tool({
  description: `
    Retrieves the current top 20 crypto gainers or losers for the day from Polygon.io.
    Top gainers are the tickers with the highest percentage increase since the previous day's close,
    while top losers are those with the highest percentage decrease.
    
    The response includes details such as:
      • The most recent daily bar ("day") with open, high, low, close, volume, and VWAP.
      • The most recent trade ("lastTrade") with trade conditions, trade ID, price, size, timestamp, and exchange ID.
      • The most recent minute bar ("min") with aggregate trade details.
      • The previous day's bar ("prevDay") with trading details.
      • Ticker symbol, today's change in value and percentage, and the last updated timestamp.
  `,
  parameters: z.object({
    direction: z
      .string()
      .describe(
        'The snapshot direction. Use "gainers" to retrieve top gainers or "losers" to retrieve top losers.',
      ),
  }),
  execute: async ({ direction }) => {
    // Construct the endpoint using the provided direction.
    const endpoint = `/v2/snapshot/locale/global/markets/crypto/${direction}`;

    // Execute the API call. No extra query parameters are needed.
    const data = await polygonApiCall(endpoint, {});

    return { data };
  },
});
