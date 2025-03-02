import { tool } from "ai";
import { z } from "zod";

export const dexscreenerTool = tool({
  description:
    "Provide real-time crypto token data, news, technical analysis, and concise trading insights.",
  parameters: z.object({
    tokenQuery: z
      .string()
      .optional()
      .describe(
        "The token to query the https://dexscreener.com/api for current market data.",
      ),
  }),
  execute: async ({ tokenQuery }) => {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${tokenQuery}`,
      {
        method: "GET",
        headers: {},
      },
    );
    const data = await response.json();
    return { data };
  },
});
