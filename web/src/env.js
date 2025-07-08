import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_URL: z.string().url(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    ZAPIER_FEEDBACK_WEBHOOK_URL: z.string().url().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url(),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_S3_IMAGE_URL: z.string().url(),
    NEXT_PUBLIC_S3_BUCKET_NAME: z.string(),
    NEXT_PUBLIC_S3_BUCKET_ENDPOINT: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_S3_IMAGE_URL: process.env.NEXT_PUBLIC_S3_IMAGE_URL,
    NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    NEXT_PUBLIC_S3_BUCKET_ENDPOINT: process.env.NEXT_PUBLIC_S3_BUCKET_ENDPOINT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ZAPIER_FEEDBACK_WEBHOOK_URL: process.env.ZAPIER_FEEDBACK_WEBHOOK_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
