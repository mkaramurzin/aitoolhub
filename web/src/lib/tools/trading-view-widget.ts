import { tool } from "ai";
import { z } from "zod";

export const tradingViewWidgetTool = tool({
  description:
    "Generates an embedded candlestick chart for a given ticker symbol.",
  parameters: z.object({
    ticker: z
      .string()
      .describe(
        "The ticker symbol in trading view format (e.g., NASDAQ:AAPL for Apple, or FX:EURUSD for EUR/USD, or CRYPTO:BTCUSD for BTCUSD).",
      ),
  }),
  execute: async ({ ticker }) => {
    const props = { ticker: ticker };
    return props;
  },
});
