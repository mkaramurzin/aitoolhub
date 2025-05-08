import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const keyValueRouter = createTRPCRouter({
  create: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.keyValueStore.create({
        data: {
          key: input.key,
          value: input.value,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.keyValueStore.findMany();
  }),

  getByKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.keyValueStore.findUnique({
        where: {
          key: input.key,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        key: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.keyValueStore.update({
        where: {
          id: input.id,
        },
        data: {
          key: input.key,
          value: input.value,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.keyValueStore.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
