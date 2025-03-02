import { env } from "@/env";
import { Client } from "twitter-api-sdk";

const createTwitterClient = () => new Client(env.X_BEARER_TOKEN);

const globalForTwitter = globalThis as unknown as {
  twitter: ReturnType<typeof createTwitterClient> | undefined;
};

export const twitterClient = globalForTwitter.twitter ?? createTwitterClient();

if (env.NODE_ENV !== "production") globalForTwitter.twitter = twitterClient;
