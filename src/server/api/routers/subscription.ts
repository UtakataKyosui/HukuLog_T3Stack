import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import {
	clothingItems,
	outfits,
	subscriptionPlans,
	userSubscriptions,
} from "@/server/db/schema";

export const subscriptionRouter = createTRPCRouter({
	// Get all available subscription plans
	getPlans: publicProcedure.query(({ ctx }) => {
		return ctx.db.select().from(subscriptionPlans);
	}),

	// Get user's current subscription
	getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
		const subscription = await ctx.db
			.select({
				id: userSubscriptions.id,
				planId: userSubscriptions.planId,
				status: userSubscriptions.status,
				currentPeriodStart: userSubscriptions.currentPeriodStart,
				currentPeriodEnd: userSubscriptions.currentPeriodEnd,
				plan: {
					id: subscriptionPlans.id,
					name: subscriptionPlans.name,
					price: subscriptionPlans.price,
					maxClothingItems: subscriptionPlans.maxClothingItems,
					maxOutfits: subscriptionPlans.maxOutfits,
					canUploadImages: subscriptionPlans.canUploadImages,
					features: subscriptionPlans.features,
				},
			})
			.from(userSubscriptions)
			.innerJoin(
				subscriptionPlans,
				eq(userSubscriptions.planId, subscriptionPlans.id),
			)
			.where(
				and(
					eq(userSubscriptions.userId, ctx.session.user.id),
					eq(userSubscriptions.status, "active"),
					gte(userSubscriptions.currentPeriodEnd, new Date()),
				),
			)
			.then((results) => results[0] ?? null);

		return subscription;
	}),

	// Get user's usage statistics
	getUserUsage: protectedProcedure.query(async ({ ctx }) => {
		const [clothingCount, outfitCount] = await Promise.all([
			ctx.db
				.select({ count: count() })
				.from(clothingItems)
				.where(eq(clothingItems.userId, ctx.session.user.id))
				.then((result) => result[0]?.count ?? 0),
			ctx.db
				.select({ count: count() })
				.from(outfits)
				.where(eq(outfits.userId, ctx.session.user.id))
				.then((result) => result[0]?.count ?? 0),
		]);

		return {
			clothingItemsCount: clothingCount,
			outfitsCount: outfitCount,
		};
	}),

	// Subscribe to a plan (simplified - in real app would integrate with payment processor)
	subscribe: protectedProcedure
		.input(z.object({ planId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			// In a real application, you would:
			// 1. Process payment with Stripe/PayPal
			// 2. Validate payment success
			// 3. Create subscription record

			// For demo purposes, we'll create a subscription directly
			const plan = await ctx.db
				.select()
				.from(subscriptionPlans)
				.where(eq(subscriptionPlans.id, input.planId))
				.then((results) => results[0]);

			if (!plan) {
				throw new Error("Plan not found");
			}

			// Cancel any existing active subscription
			await ctx.db
				.update(userSubscriptions)
				.set({ status: "canceled" })
				.where(
					and(
						eq(userSubscriptions.userId, ctx.session.user.id),
						eq(userSubscriptions.status, "active"),
					),
				);

			// Create new subscription
			const now = new Date();
			const endDate = new Date();
			endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

			await ctx.db.insert(userSubscriptions).values({
				userId: ctx.session.user.id,
				planId: input.planId,
				status: "active",
				currentPeriodStart: now,
				currentPeriodEnd: endDate,
			});

			return { success: true };
		}),

	// Cancel subscription
	cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
		await ctx.db
			.update(userSubscriptions)
			.set({ status: "canceled" })
			.where(
				and(
					eq(userSubscriptions.userId, ctx.session.user.id),
					eq(userSubscriptions.status, "active"),
				),
			);

		return { success: true };
	}),

	// Check if user can perform an action based on their subscription
	checkLimits: protectedProcedure
		.input(
			z.object({
				action: z.enum(["add_clothing", "create_outfit", "upload_image"]),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Get user's current subscription or default to free plan
			const subscription = await ctx.db
				.select({
					plan: {
						maxClothingItems: subscriptionPlans.maxClothingItems,
						maxOutfits: subscriptionPlans.maxOutfits,
						canUploadImages: subscriptionPlans.canUploadImages,
					},
				})
				.from(userSubscriptions)
				.innerJoin(
					subscriptionPlans,
					eq(userSubscriptions.planId, subscriptionPlans.id),
				)
				.where(
					and(
						eq(userSubscriptions.userId, ctx.session.user.id),
						eq(userSubscriptions.status, "active"),
						gte(userSubscriptions.currentPeriodEnd, new Date()),
					),
				)
				.then((results) => results[0]?.plan);

			// Default to free plan limits if no active subscription
			const limits = subscription ?? {
				maxClothingItems: 20,
				maxOutfits: 5,
				canUploadImages: false,
			};

			// Get current usage
			const [clothingCount, outfitCount] = await Promise.all([
				ctx.db
					.select({ count: count() })
					.from(clothingItems)
					.where(eq(clothingItems.userId, ctx.session.user.id))
					.then((result) => result[0]?.count ?? 0),
				ctx.db
					.select({ count: count() })
					.from(outfits)
					.where(eq(outfits.userId, ctx.session.user.id))
					.then((result) => result[0]?.count ?? 0),
			]);

			switch (input.action) {
				case "add_clothing":
					return {
						canPerform:
							limits.maxClothingItems === -1 ||
							clothingCount < limits.maxClothingItems,
						currentCount: clothingCount,
						limit: limits.maxClothingItems,
					};
				case "create_outfit":
					return {
						canPerform:
							limits.maxOutfits === -1 || outfitCount < limits.maxOutfits,
						currentCount: outfitCount,
						limit: limits.maxOutfits,
					};
				case "upload_image":
					return {
						canPerform: limits.canUploadImages,
						currentCount: 0,
						limit: limits.canUploadImages ? -1 : 0,
					};
				default:
					return {
						canPerform: false,
						currentCount: 0,
						limit: 0,
					};
			}
		}),
});
