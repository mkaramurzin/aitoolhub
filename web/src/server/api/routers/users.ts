import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  self: publicProcedure.query(async ({ input, ctx }) => {
    return { user: ctx.user, session: ctx.session };
  }),
});
