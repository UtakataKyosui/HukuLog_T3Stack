import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const universalClothingRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(50),
				cursor: z.string().optional(),
				categoryFilter: z.string().optional(),
				seasonFilter: z.string().optional(),
				searchText: z.string().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// ユーザーのストレージ設定を取得
			const user = await ctx.db
				.select({
					storageType: users.storageType,
					notionAccessToken: users.notionAccessToken,
					notionClothingDatabaseId: users.notionClothingDatabaseId,
					notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
				})
				.from(users)
				.where(eq(users.id, ctx.session.user.id))
				.limit(1);

			const userConfig = user[0];

			if (!userConfig || userConfig.storageType === "postgresql") {
				// PostgreSQLから取得
				const { clothingRouter } = await import("./clothing");
				const clothingCaller = clothingRouter.createCaller(ctx);
				return await clothingCaller.getAll(input);
			} else if (userConfig.storageType === "notion") {
				// Notionから取得
				if (
					!userConfig.notionAccessToken ||
					!userConfig.notionClothingDatabaseId
				) {
					console.error("Notion configuration is incomplete.", userConfig);
					throw new Error("Notion設定が不完全です");
				}

				const { notionClothingRouter } = await import("./notion-clothing");
				const notionCaller = notionClothingRouter.createCaller(ctx);
				return await notionCaller.getAll({
					...input,
					notionAccessToken: userConfig.notionAccessToken,
				});
			}

			throw new Error("不明なストレージタイプです");
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				brand: z.string().optional(),
				color: z.string().optional(),
				size: z.string().optional(),
				categoryId: z.number().optional(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				imageUrl: z.string().url().optional(),
				price: z.number().int().positive().optional(),
				purchaseDate: z.date().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).default([]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// ユーザーのストレージ設定を取得
			const user = await ctx.db
				.select({
					storageType: users.storageType,
					notionAccessToken: users.notionAccessToken,
					notionClothingDatabaseId: users.notionClothingDatabaseId,
					notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
				})
				.from(users)
				.where(eq(users.id, ctx.session.user.id))
				.limit(1);

			const userConfig = user[0];

			if (!userConfig || userConfig.storageType === "postgresql") {
				// PostgreSQLに保存
				const { clothingRouter } = await import("./clothing");
				const clothingCaller = clothingRouter.createCaller(ctx);
				return await clothingCaller.create(input);
			} else if (userConfig.storageType === "notion") {
				// Notionに保存
				if (
					!userConfig.notionAccessToken ||
					!userConfig.notionClothingDatabaseId
				) {
					console.error("Notion configuration is incomplete.", userConfig);
					throw new Error("Notion設定が不完全です");
				}

				const { notionClothingRouter } = await import("./notion-clothing");
				const notionCaller = notionClothingRouter.createCaller(ctx);
				return await notionCaller.create({
					...input,
					notionAccessToken: userConfig.notionAccessToken,
				});
			}

			throw new Error("不明なストレージタイプです");
		}),

	getById: protectedProcedure
		.input(
			z.object({
				id: z.union([z.string(), z.number()]),
			}),
		)
		.query(async ({ input, ctx }) => {
			// ユーザーのストレージ設定を取得
			const user = await ctx.db
				.select({
					storageType: users.storageType,
					notionAccessToken: users.notionAccessToken,
					notionClothingDatabaseId: users.notionClothingDatabaseId,
					notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
				})
				.from(users)
				.where(eq(users.id, ctx.session.user.id))
				.limit(1);

			const userConfig = user[0];

			if (!userConfig || userConfig.storageType === "postgresql") {
				// PostgreSQLから取得
				const { clothingRouter } = await import("./clothing");
				const clothingCaller = clothingRouter.createCaller(ctx);
				return await clothingCaller.getById({ id: Number(input.id) });
			} else if (userConfig.storageType === "notion") {
				// Notionから取得 - 個別取得はgetAllで代替
				throw new Error("Notionモードでは個別取得は未対応です");
			}

			throw new Error("不明なストレージタイプです");
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.union([z.string(), z.number()]),
				name: z.string().min(1).optional(),
				brand: z.string().optional(),
				color: z.string().optional(),
				size: z.string().optional(),
				categoryId: z.number().optional(),
				season: z
					.enum(["spring", "summer", "fall", "winter", "all"])
					.optional(),
				imageUrl: z.string().url().optional(),
				price: z.number().int().positive().optional(),
				purchaseDate: z.date().optional(),
				notes: z.string().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// ユーザーのストレージ設定を取得
			const user = await ctx.db
				.select({
					storageType: users.storageType,
					notionAccessToken: users.notionAccessToken,
					notionClothingDatabaseId: users.notionClothingDatabaseId,
					notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
				})
				.from(users)
				.where(eq(users.id, ctx.session.user.id))
				.limit(1);

			const userConfig = user[0];
			const { id, ...updateData } = input;

			if (!userConfig || userConfig.storageType === "postgresql") {
				// PostgreSQLで更新
				const { clothingRouter } = await import("./clothing");
				const clothingCaller = clothingRouter.createCaller(ctx);
				return await clothingCaller.update({ id: Number(id), ...updateData });
			} else if (userConfig.storageType === "notion") {
				// Notionで更新
				if (
					!userConfig.notionAccessToken ||
					!userConfig.notionClothingDatabaseId
				) {
					console.error("Notion configuration is incomplete.", userConfig);
					throw new Error("Notion設定が不完全です");
				}

				const { notionClothingRouter } = await import("./notion-clothing");
				const notionCaller = notionClothingRouter.createCaller(ctx);
				return await notionCaller.update({
					notionPageId: String(id),
					notionAccessToken: userConfig.notionAccessToken,
					...updateData,
				});
			}

			throw new Error("不明なストレージタイプです");
		}),

	delete: protectedProcedure
		.input(
			z.object({
				id: z.union([z.string(), z.number()]),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// ユーザーのストレージ設定を取得
			const user = await ctx.db
				.select({
					storageType: users.storageType,
					notionAccessToken: users.notionAccessToken,
					notionClothingDatabaseId: users.notionClothingDatabaseId,
					notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
				})
				.from(users)
				.where(eq(users.id, ctx.session.user.id))
				.limit(1);

			const userConfig = user[0];

			if (!userConfig || userConfig.storageType === "postgresql") {
				// PostgreSQLで削除
				const { clothingRouter } = await import("./clothing");
				const clothingCaller = clothingRouter.createCaller(ctx);
				return await clothingCaller.delete({ id: Number(input.id) });
			} else if (userConfig.storageType === "notion") {
				// Notionで削除
				if (
					!userConfig.notionAccessToken ||
					!userConfig.notionClothingDatabaseId
				) {
					console.error("Notion configuration is incomplete.", userConfig);
					throw new Error("Notion設定が不完全です");
				}

				const { notionClothingRouter } = await import("./notion-clothing");
				const notionCaller = notionClothingRouter.createCaller(ctx);
				return await notionCaller.delete({
					notionPageId: String(input.id),
					notionAccessToken: userConfig.notionAccessToken,
				});
			}

			throw new Error("不明なストレージタイプです");
		}),
});
