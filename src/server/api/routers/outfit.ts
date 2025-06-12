import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { clothingItems, outfitItems, outfits } from "@/server/db/schema";

export const outfitRouter = createTRPCRouter({
	// Get user's outfits
	getAll: protectedProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(50),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(({ ctx, input }) => {
			const { limit = 50, offset = 0 } = input ?? {};

			return ctx.db
				.select()
				.from(outfits)
				.where(eq(outfits.userId, ctx.session.user.id))
				.orderBy(desc(outfits.createdAt))
				.limit(limit)
				.offset(offset);
		}),

	// Get outfit by ID with clothing items
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			const outfit = await ctx.db
				.select()
				.from(outfits)
				.where(
					and(
						eq(outfits.id, input.id),
						eq(outfits.userId, ctx.session.user.id),
					),
				)
				.then((results) => results[0] ?? null);

			if (!outfit) return null;

			const items = await ctx.db
				.select({
					id: clothingItems.id,
					name: clothingItems.name,
					brand: clothingItems.brand,
					color: clothingItems.color,
					size: clothingItems.size,
					categoryId: clothingItems.categoryId,
					season: clothingItems.season,
					imageUrl: clothingItems.imageUrl,
					price: clothingItems.price,
					tags: clothingItems.tags,
				})
				.from(outfitItems)
				.innerJoin(
					clothingItems,
					eq(outfitItems.clothingItemId, clothingItems.id),
				)
				.where(eq(outfitItems.outfitId, input.id));

			return {
				...outfit,
				items,
			};
		}),

	// Create new outfit
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				description: z.string().optional(),
				occasion: z.string().max(100).optional(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				rating: z.number().min(1).max(5).optional(),
				lastWorn: z.date().optional(),
				tags: z.array(z.string()).default([]),
				clothingItemIds: z.array(z.number()),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { clothingItemIds, ...outfitData } = input;

			// Create the outfit
			const [newOutfit] = await ctx.db
				.insert(outfits)
				.values({
					...outfitData,
					userId: ctx.session.user.id,
					lastWorn: outfitData.lastWorn?.toISOString() ?? null,
				})
				.returning();

			if (!newOutfit) {
				throw new Error("Failed to create outfit");
			}

			// Add clothing items to the outfit
			if (clothingItemIds.length > 0) {
				await ctx.db.insert(outfitItems).values(
					clothingItemIds.map((clothingItemId) => ({
						outfitId: newOutfit.id,
						clothingItemId,
					})),
				);
			}

			return newOutfit;
		}),

	// Update outfit
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				occasion: z.string().max(100).optional(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				rating: z.number().min(1).max(5).optional(),
				lastWorn: z.date().optional(),
				tags: z.array(z.string()).optional(),
				clothingItemIds: z.array(z.number()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, clothingItemIds, lastWorn, ...updateData } = input;

			// Update the outfit
			await ctx.db
				.update(outfits)
				.set({
					...updateData,
					lastWorn: lastWorn?.toISOString() ?? null,
				})
				.where(
					and(eq(outfits.id, id), eq(outfits.userId, ctx.session.user.id)),
				);

			// Update clothing items if provided
			if (clothingItemIds !== undefined) {
				// Remove existing outfit items
				await ctx.db.delete(outfitItems).where(eq(outfitItems.outfitId, id));

				// Add new outfit items
				if (clothingItemIds.length > 0) {
					await ctx.db.insert(outfitItems).values(
						clothingItemIds.map((clothingItemId) => ({
							outfitId: id,
							clothingItemId,
						})),
					);
				}
			}

			return { success: true };
		}),

	// Delete outfit
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ ctx, input }) => {
			return ctx.db
				.delete(outfits)
				.where(
					and(
						eq(outfits.id, input.id),
						eq(outfits.userId, ctx.session.user.id),
					),
				);
		}),

	// Get outfits by occasion
	getByOccasion: protectedProcedure
		.input(z.object({ occasion: z.string() }))
		.query(({ ctx, input }) => {
			return ctx.db
				.select()
				.from(outfits)
				.where(
					and(
						eq(outfits.occasion, input.occasion),
						eq(outfits.userId, ctx.session.user.id),
					),
				)
				.orderBy(desc(outfits.createdAt));
		}),

	// Get outfits by season
	getBySeason: protectedProcedure
		.input(
			z.object({
				season: z.enum(["spring", "summer", "fall", "winter", "all"]),
			}),
		)
		.query(({ ctx, input }) => {
			return ctx.db
				.select()
				.from(outfits)
				.where(
					and(
						eq(outfits.season, input.season),
						eq(outfits.userId, ctx.session.user.id),
					),
				)
				.orderBy(desc(outfits.createdAt));
		}),
});
