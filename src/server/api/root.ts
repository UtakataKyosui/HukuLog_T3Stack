import { authStateRouter } from "@/server/api/routers/auth-state";
import { clothingRouter } from "@/server/api/routers/clothing";
import { notionClothingRouter } from "@/server/api/routers/notion-clothing";
import { notionOutfitRouter } from "@/server/api/routers/notion-outfit";
import { notionSetupRouter } from "@/server/api/routers/notion-setup";
import { outfitRouter } from "@/server/api/routers/outfit";
import { passkeyRouter } from "@/server/api/routers/passkey";
import { postRouter } from "@/server/api/routers/post";
import { subscriptionRouter } from "@/server/api/routers/subscription";
import { universalClothingRouter } from "@/server/api/routers/universal-clothing";
import { universalOutfitRouter } from "@/server/api/routers/universal-outfit";
import { userRouter } from "@/server/api/routers/user";
import { userStorageRouter } from "@/server/api/routers/user-storage";
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
	notionClothing: notionClothingRouter,
	notionOutfit: notionOutfitRouter,
	notionSetup: notionSetupRouter,
	universalClothing: universalClothingRouter,
	universalOutfit: universalOutfitRouter,
	subscription: subscriptionRouter,
	passkey: passkeyRouter,
	user: userRouter,
	userStorage: userStorageRouter,
	authState: authStateRouter,
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
