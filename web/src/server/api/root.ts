import { userRouter } from "@/server/api/routers/users";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { contactUsRouter } from "./routers/contact-us";
import { imagesRouter } from "./routers/images";
import { parserRouter } from "./routers/parse";
import { reviewsRouter } from "./routers/reviews";
import { tagsRouter } from "./routers/tags";
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
  images: imagesRouter,
  groomer: parserRouter,
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
