import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const contactUsRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().nonempty("First name is required"),
        lastName: z.string().nonempty("Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().nonempty("Phone number is required"),
        companyName: z.string().nonempty("Company name is required"),
        // We use a string validation with a refine to enforce one of the specified options.
        reasonForContact: z
          .string()
          .nonempty("Please select a reason for contact")
          .refine(
            (val) =>
              [
                "custom-campaign",
                "sales",
                "support",
                "feedback",
                "events",
                "partnerships",
                "press",
                "other",
              ].includes(val),
            { message: "Please select a valid reason" },
          ),
        message: z.string().nonempty("Message is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.contactUs.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          companyName: input.companyName,
          reasonForContact: input.reasonForContact,
          message: input.message,
        },
      });

      return {
        success: true,
      };
    }),
});
