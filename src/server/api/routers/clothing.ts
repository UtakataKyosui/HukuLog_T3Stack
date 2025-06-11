import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { clothingCategories, clothingItems } from "@/server/db/schema";

export const clothingRouter = createTRPCRouter({
	// Get all clothing categories
	getCategories: publicProcedure.query(({ ctx }) => {
		return ctx.db.select().from(clothingCategories);
	}),

	// Create new clothing category
	createCategory: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				type: z.string().max(50),
			}),
		)
		.mutation(({ ctx, input }) => {
			return ctx.db.insert(clothingCategories).values(input);
		}),

	// Get user's clothing items
	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.db
			.select()
			.from(clothingItems)
			.where(eq(clothingItems.userId, ctx.session.user.id))
			.orderBy(desc(clothingItems.createdAt));
	}),

	// Get clothing item by ID
	getById: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(({ ctx, input }) => {
			return ctx.db
				.select()
				.from(clothingItems)
				.where(
					and(
						eq(clothingItems.id, input.id),
						eq(clothingItems.userId, ctx.session.user.id),
					),
				)
				.then((results) => results[0] ?? null);
		}),

	// Create new clothing item
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255),
				brand: z.string().max(255).optional(),
				color: z.string().max(100).optional(),
				size: z.string().max(50).optional(),
				categoryId: z.number(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				imageUrl: z.string().max(500).optional(),
				price: z.number().optional(),
				purchaseDate: z.date().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).default([]),
			}),
		)
		.mutation(({ ctx, input }) => {
			return ctx.db.insert(clothingItems).values({
				...input,
				userId: ctx.session.user.id,
				purchaseDate: input.purchaseDate?.toISOString() ?? null,
			});
		}),

	// Update clothing item
	update: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).max(255).optional(),
				brand: z.string().max(255).optional(),
				color: z.string().max(100).optional(),
				size: z.string().max(50).optional(),
				categoryId: z.number().optional(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				imageUrl: z.string().max(500).optional(),
				price: z.number().optional(),
				purchaseDate: z.date().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.mutation(({ ctx, input }) => {
			const { id, purchaseDate, ...updateData } = input;
			return ctx.db
				.update(clothingItems)
				.set({
					...updateData,
					purchaseDate: purchaseDate?.toISOString() ?? null,
				})
				.where(
					and(
						eq(clothingItems.id, id),
						eq(clothingItems.userId, ctx.session.user.id),
					),
				);
		}),

	// Delete clothing item
	delete: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ ctx, input }) => {
			return ctx.db
				.delete(clothingItems)
				.where(
					and(
						eq(clothingItems.id, input.id),
						eq(clothingItems.userId, ctx.session.user.id),
					),
				);
		}),

	// Get clothing items by category
	getByCategory: protectedProcedure
		.input(z.object({ categoryId: z.number() }))
		.query(({ ctx, input }) => {
			return ctx.db
				.select()
				.from(clothingItems)
				.where(
					and(
						eq(clothingItems.categoryId, input.categoryId),
						eq(clothingItems.userId, ctx.session.user.id),
					),
				)
				.orderBy(desc(clothingItems.createdAt));
		}),

	// Get clothing items by season
	getBySeason: protectedProcedure
		.input(
			z.object({
				season: z.enum(["spring", "summer", "fall", "winter", "all"]),
			}),
		)
		.query(({ ctx, input }) => {
			return ctx.db
				.select()
				.from(clothingItems)
				.where(
					and(
						eq(clothingItems.season, input.season),
						eq(clothingItems.userId, ctx.session.user.id),
					),
				)
				.orderBy(desc(clothingItems.createdAt));
		}),
});
