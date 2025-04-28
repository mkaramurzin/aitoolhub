import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";

export const emailRouter = createTRPCRouter({
  send: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // await resend.emails.send({
      //   from: "AiToolHub.co <hello@aitoolhub.co>",
      //   to: input.email,
      //   subject: "Hello from AI Tool Hub!",
      //   react: <MarketingEmail />,
      // });
    }),
});
