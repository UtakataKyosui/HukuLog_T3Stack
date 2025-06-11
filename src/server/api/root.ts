import { clothingRouter } from "@/server/api/routers/clothing";
import { outfitRouter } from "@/server/api/routers/outfit";
import { passkeyRouter } from "@/server/api/routers/passkey";
import { postRouter } from "@/server/api/routers/post";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	post: postRouter,
	clothing: clothingRouter,
	outfit: outfitRouter,
	subscription: subscriptionRouter,
	passkey: passkeyRouter,
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
