import { env } from "@/env";
import { Resend } from "resend"; // adjust import if necessary

const createResendClient = () => new Resend(env.RESEND_API_KEY);

const globalForResend = globalThis as unknown as {
  resend: ReturnType<typeof createResendClient> | undefined;
};

export const resend = globalForResend.resend ?? createResendClient();

if (env.NODE_ENV !== "production") globalForResend.resend = resend;
