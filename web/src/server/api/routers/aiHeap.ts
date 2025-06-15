import { z } from "zod";
import { createTRPCRouter, adminProcedure, publicProcedure } from "../trpc";

export const aiHeapRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const nodes = await ctx.db.aiHeapNode.findMany();
    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const n of nodes) {
      map.set(n.id, { ...n, children: [] });
    }
    for (const n of nodes) {
      const node = map.get(n.id)!;
      if (n.parentId) {
        const parent = map.get(n.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }
    return { nodes: roots };
  }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        parentId: z.string().uuid().optional(),
        url: z.string().url().optional(),
        image: z.string().url().optional(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const node = await ctx.db.aiHeapNode.create({
        data: {
          name: input.name,
          category: input.category,
          parentId: input.parentId,
          url: input.url,
          image: input.image,
          metadata: input.metadata ?? undefined,
        },
      });
      return { node };
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        category: z.string().optional(),
        parentId: z.string().uuid().nullable().optional(),
        url: z.string().url().optional().nullable(),
        image: z.string().url().optional().nullable(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const node = await ctx.db.aiHeapNode.update({
        where: { id: input.id },
        data: {
          name: input.name,
          category: input.category,
          parentId: input.parentId ?? undefined,
          url: input.url ?? undefined,
          image: input.image ?? undefined,
          metadata: input.metadata ?? undefined,
        },
      });
      return { node };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.aiHeapNode.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
