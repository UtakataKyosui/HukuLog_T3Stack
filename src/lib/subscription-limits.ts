import { db } from "@/server/db";
import {
	clothingItems,
	outfits,
	subscriptionPlans,
	userSubscriptions,
} from "@/server/db/schema";
import { and, count, eq } from "drizzle-orm";

export interface SubscriptionLimits {
	maxClothingItems: number;
	maxOutfits: number;
	canUploadImages: boolean;
	features: string[];
}

export interface UsageStats {
	clothingItemsCount: number;
	outfitsCount: number;
}

// デフォルト（無料プラン）の制限
const DEFAULT_LIMITS: SubscriptionLimits = {
	maxClothingItems: 50,
	maxOutfits: 10,
	canUploadImages: false,
	features: ["基本機能"],
};

/**
 * ユーザーのサブスクリプション制限を取得
 */
export async function getUserSubscriptionLimits(
	userId: string,
): Promise<SubscriptionLimits> {
	try {
		// ユーザーのアクティブなサブスクリプションを取得
		const subscription = await db
			.select({
				plan: subscriptionPlans,
			})
			.from(userSubscriptions)
			.innerJoin(
				subscriptionPlans,
				eq(userSubscriptions.planId, subscriptionPlans.id),
			)
			.where(
				and(
					eq(userSubscriptions.userId, userId),
					eq(userSubscriptions.status, "active"),
				),
			)
			.limit(1);

		if (subscription.length === 0) {
			return DEFAULT_LIMITS;
		}

		const plan = subscription[0].plan;
		return {
			maxClothingItems: plan.maxClothingItems,
			maxOutfits: plan.maxOutfits,
			canUploadImages: plan.canUploadImages,
			features: plan.features,
		};
	} catch (error) {
		console.error("Failed to get subscription limits:", error);
		return DEFAULT_LIMITS;
	}
}

/**
 * ユーザーの現在の使用状況を取得
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
	try {
		const [clothingCount, outfitCount] = await Promise.all([
			db
				.select({ count: count() })
				.from(clothingItems)
				.where(eq(clothingItems.userId, userId)),
			db
				.select({ count: count() })
				.from(outfits)
				.where(eq(outfits.userId, userId)),
		]);

		return {
			clothingItemsCount: clothingCount[0]?.count || 0,
			outfitsCount: outfitCount[0]?.count || 0,
		};
	} catch (error) {
		console.error("Failed to get usage stats:", error);
		return {
			clothingItemsCount: 0,
			outfitsCount: 0,
		};
	}
}

/**
 * ユーザーが制限内かどうかをチェック
 */
export async function checkUserLimits(userId: string): Promise<{
	canAddClothing: boolean;
	canAddOutfit: boolean;
	canUploadImages: boolean;
	limits: SubscriptionLimits;
	usage: UsageStats;
}> {
	const [limits, usage] = await Promise.all([
		getUserSubscriptionLimits(userId),
		getUserUsageStats(userId),
	]);

	return {
		canAddClothing:
			limits.maxClothingItems === -1 ||
			usage.clothingItemsCount < limits.maxClothingItems,
		canAddOutfit:
			limits.maxOutfits === -1 || usage.outfitsCount < limits.maxOutfits,
		canUploadImages: limits.canUploadImages,
		limits,
		usage,
	};
}

/**
 * 制限エラーメッセージを生成
 */
export function getLimitErrorMessage(
	type: "clothing" | "outfit" | "image",
): string {
	switch (type) {
		case "clothing":
			return "服の登録数が上限に達しています。プレミアムプランにアップグレードするか、不要な服を削除してください。";
		case "outfit":
			return "コーディネートの作成数が上限に達しています。プレミアムプランにアップグレードするか、不要なコーディネートを削除してください。";
		case "image":
			return "画像のアップロードはベーシックプラン以上で利用できます。プランをアップグレードしてください。";
		default:
			return "制限に達しています。プランをアップグレードしてください。";
	}
}
