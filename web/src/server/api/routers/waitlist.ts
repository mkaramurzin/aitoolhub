import { resend } from "@/lib/resend";
import { db } from "@/server/db";
import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const waitlistRouter = createTRPCRouter({
  join: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingEmail = await ctx.db.waitlist.findFirst({
        where: {
          email: {
            mode: "insensitive",
            equals: input.email,
          },
        },
      });

      if (existingEmail) {
        if (!existingEmail.isContact)
          await createContact({ email: input.email });
      }

      const waitlistEntry = await ctx.db.waitlist.create({
        data: {
          email: input.email.toLowerCase(),
        },
      });

      await createContact({ email: input.email });

      return {};
    }),
  check: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingEmail = await ctx.db.waitlist.findFirst({
        where: {
          email: {
            mode: "insensitive",
            equals: input.email.toLowerCase(),
          },
        },
      });
      if (existingEmail) return { subscribed: true };

      return {
        subscribed: false,
      };
    }),
  leave: authenticatedProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingEmail = await ctx.db.waitlist.findFirst({
        where: {
          email: {
            mode: "insensitive",
            equals: ctx.user.email,
          },
        },
      });

      if (existingEmail) {
        await removeContact({ email: ctx.user.email });
        await ctx.db.waitlist.delete({
          where: {
            id: existingEmail.id,
          },
        });
      }

      return {};
    }),
});

async function createContact({ email }: { email: string }) {
  await resend.contacts.create({
    audienceId: "a7a52ebc-4cb9-4c96-85a1-ac758a2b912a",
    email,
  });

  const contact = await db.waitlist.updateMany({
    where: {
      email: {
        mode: "insensitive",
        equals: email,
      },
    },
    data: {
      isContact: true,
    },
  });
  return { contact };
}

async function removeContact({ email }: { email: string }) {
  await resend.contacts.remove({
    audienceId: "a7a52ebc-4cb9-4c96-85a1-ac758a2b912a",
    email,
  });

  const contact = await db.waitlist.updateMany({
    where: {
      email: {
        mode: "insensitive",
        equals: email,
      },
    },
    data: {
      isContact: false,
    },
  });
  return { contact };
}
