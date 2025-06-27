import {
	type AuthStatus,
	type UserAuthData,
	analyzeAuthStatus,
	calculateAuthUpdate,
} from "@/lib/auth-state";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { passkeys, users } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const authStateRouter = createTRPCRouter({
	/**
	 * 現在の認証状態を取得
	 */
	getAuthStatus: protectedProcedure.query(
		async ({ ctx }): Promise<AuthStatus> => {
			const userId = ctx.session.user.id;

			// ユーザー情報とパスキーの有無を取得
			const [userResult, passkeyResult] = await Promise.all([
				ctx.db.select().from(users).where(eq(users.id, userId)).limit(1),
				ctx.db
					.select({ count: passkeys.id })
					.from(passkeys)
					.where(eq(passkeys.userId, userId))
					.limit(1),
			]);

			const user = userResult[0];
			if (!user) {
				throw new Error("ユーザーが見つかりません");
			}

			const hasPasskey = passkeyResult.length > 0;

			const authData: UserAuthData = {
				passkeyEnabled: hasPasskey,
				notionEnabled: user.notionEnabled,
				notionAccessToken: user.notionAccessToken,
				notionClothingDatabaseId: user.notionClothingDatabaseId,
				notionOutfitsDatabaseId: user.notionOutfitsDatabaseId,
				authLevel: user.authLevel,
			};

			return analyzeAuthStatus(authData);
		},
	),

	/**
	 * パスキー有効化の更新
	 */
	updatePasskeyStatus: protectedProcedure
		.input(
			z.object({
				passkeyEnabled: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// 現在の認証状態を取得
			const userResult = await ctx.db
				.select()
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);
			const user = userResult[0];
			if (!user) {
				throw new Error("ユーザーが見つかりません");
			}

			const currentAuth: UserAuthData = {
				passkeyEnabled: user.passkeyEnabled,
				notionEnabled: user.notionEnabled,
				notionAccessToken: user.notionAccessToken,
				notionClothingDatabaseId: user.notionClothingDatabaseId,
				notionOutfitsDatabaseId: user.notionOutfitsDatabaseId,
				authLevel: user.authLevel,
			};

			// 更新データを計算
			const updateData = calculateAuthUpdate(currentAuth, {
				passkeyEnabled: input.passkeyEnabled,
			});

			// データベースを更新
			await ctx.db
				.update(users)
				.set({
					passkeyEnabled: updateData.passkeyEnabled,
					authLevel: updateData.authLevel,
					...(updateData.authCompletedAt && {
						authCompletedAt: updateData.authCompletedAt,
					}),
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId));

			return { success: true };
		}),

	/**
	 * Notion設定の更新
	 */
	updateNotionStatus: protectedProcedure
		.input(
			z.object({
				notionAccessToken: z.string().optional(),
				notionClothingDatabaseId: z.string().optional(),
				notionOutfitsDatabaseId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// 現在の認証状態を取得
			const userResult = await ctx.db
				.select()
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);
			const user = userResult[0];
			if (!user) {
				throw new Error("ユーザーが見つかりません");
			}

			const currentAuth: UserAuthData = {
				passkeyEnabled: user.passkeyEnabled,
				notionEnabled: user.notionEnabled,
				notionAccessToken: user.notionAccessToken,
				notionClothingDatabaseId: user.notionClothingDatabaseId,
				notionOutfitsDatabaseId: user.notionOutfitsDatabaseId,
				authLevel: user.authLevel,
			};

			// Notion設定の完全性をチェック
			const notionComplete = !!(
				input.notionAccessToken &&
				input.notionClothingDatabaseId &&
				input.notionOutfitsDatabaseId
			);

			// 更新データを計算
			const updateData = calculateAuthUpdate(currentAuth, {
				notionEnabled: notionComplete,
				notionAccessToken: input.notionAccessToken,
				notionClothingDatabaseId: input.notionClothingDatabaseId,
				notionOutfitsDatabaseId: input.notionOutfitsDatabaseId,
			});

			// データベースを更新
			await ctx.db
				.update(users)
				.set({
					notionEnabled: updateData.notionEnabled,
					notionAccessToken: updateData.notionAccessToken,
					notionClothingDatabaseId: updateData.notionClothingDatabaseId,
					notionOutfitsDatabaseId: updateData.notionOutfitsDatabaseId,
					authLevel: updateData.authLevel,
					...(updateData.authCompletedAt && {
						authCompletedAt: updateData.authCompletedAt,
					}),
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId));

			return { success: true };
		}),

	/**
	 * 優先認証方法の設定
	 */
	setPreferredAuthMethod: protectedProcedure
		.input(
			z.object({
				method: z.enum(["passkey", "google", "notion"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db
				.update(users)
				.set({
					preferredAuthMethod: input.method,
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId));

			return { success: true };
		}),

	/**
	 * 認証完了度の統計を取得（管理用）
	 */
	getAuthStatistics: protectedProcedure.query(async ({ ctx }) => {
		const stats = await ctx.db
			.select({
				authLevel: users.authLevel,
				passkeyEnabled: users.passkeyEnabled,
				notionEnabled: users.notionEnabled,
			})
			.from(users);

		const summary = {
			total: stats.length,
			byLevel: {
				1: stats.filter((s) => s.authLevel === 1).length,
				2: stats.filter((s) => s.authLevel === 2).length,
				3: stats.filter((s) => s.authLevel === 3).length,
				4: stats.filter((s) => s.authLevel === 4).length,
			},
			passkeyUsers: stats.filter((s) => s.passkeyEnabled).length,
			notionUsers: stats.filter((s) => s.notionEnabled).length,
			completeAuthUsers: stats.filter((s) => s.authLevel === 4).length,
		};

		return summary;
	}),

	/**
	 * 認証状態を強制的に再計算（メンテナンス用）
	 */
	recalculateAuthState: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// ユーザー情報とパスキーの有無を取得
		const [userResult, passkeyResult] = await Promise.all([
			ctx.db.select().from(users).where(eq(users.id, userId)).limit(1),
			ctx.db
				.select({ count: passkeys.id })
				.from(passkeys)
				.where(eq(passkeys.userId, userId))
				.limit(1),
		]);

		const user = userResult[0];
		if (!user) {
			throw new Error("ユーザーが見つかりません");
		}

		const hasPasskey = passkeyResult.length > 0;

		const currentAuth: UserAuthData = {
			passkeyEnabled: hasPasskey,
			notionEnabled: user.notionEnabled,
			notionAccessToken: user.notionAccessToken,
			notionClothingDatabaseId: user.notionClothingDatabaseId,
			notionOutfitsDatabaseId: user.notionOutfitsDatabaseId,
			authLevel: user.authLevel,
		};

		// 認証状態を再計算
		const authStatus = analyzeAuthStatus(currentAuth);
		const updateData = calculateAuthUpdate(currentAuth, {
			passkeyEnabled: hasPasskey,
		});

		// データベースを更新
		await ctx.db
			.update(users)
			.set({
				passkeyEnabled: updateData.passkeyEnabled,
				authLevel: updateData.authLevel,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));

		return authStatus;
	}),
});
