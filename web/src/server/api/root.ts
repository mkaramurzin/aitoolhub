import { userRouter } from "@/server/api/routers/users";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { contactUsRouter } from "./routers/contact-us";
import { emailRouter } from "./routers/email";
import { emailReviewRouter } from "./routers/emailReviewRouter";
import { feedbackRouter } from "./routers/feedback";
import { imagesRouter } from "./routers/images";
import { ingestRouter } from "./routers/ingestRouter";
import { keyValueRouter } from "./routers/keyValueStore";
import { parserRouter } from "./routers/parse";
import { reviewsRouter } from "./routers/reviews";
import { tagsRouter } from "./routers/tags";
import { techCrunchRouter } from "./routers/techCrunch";
import { toolsRouter } from "./routers/tools";
import { waitlistRouter } from "./routers/waitlist";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  tags: tagsRouter,
  tools: toolsRouter,
  reviews: reviewsRouter,
  waitlist: waitlistRouter,
  contactUs: contactUsRouter,
  feedback: feedbackRouter,
  images: imagesRouter,
  groomer: parserRouter,
  emails: emailRouter,
  techCrunch: techCrunchRouter,
  ingest: ingestRouter,
  keyValue: keyValueRouter,
  emailReview: emailReviewRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
