import { eq } from "drizzle-orm";
import { db } from "./index";
import {
	clothingCategories,
	clothingItems,
	outfitItems,
	outfits,
	subscriptionPlans,
	users,
} from "./schema";

async function seed() {
	console.log("Seeding database...");

	try {
		// Use transaction for better performance and data consistency
		await db.transaction(async (tx) => {
			// Insert all basic data in parallel for better performance
			const [insertedCategories, , insertedUsers] = await Promise.all([
				// Insert clothing categories and return them
				tx
					.insert(clothingCategories)
					.values([
						{ name: "Tシャツ", type: "tops" },
						{ name: "シャツ", type: "tops" },
						{ name: "セーター", type: "tops" },
						{ name: "ジャケット", type: "outerwear" },
						{ name: "コート", type: "outerwear" },
						{ name: "ジーンズ", type: "bottoms" },
						{ name: "チノパン", type: "bottoms" },
						{ name: "スカート", type: "bottoms" },
						{ name: "ドレス", type: "dresses" },
						{ name: "スニーカー", type: "shoes" },
						{ name: "革靴", type: "shoes" },
						{ name: "ブーツ", type: "shoes" },
						{ name: "バッグ", type: "accessories" },
						{ name: "帽子", type: "accessories" },
						{ name: "アクセサリー", type: "accessories" },
					])
					.onConflictDoNothing()
					.returning(),

				// Insert subscription plans with conflict handling
				tx
					.insert(subscriptionPlans)
					.values([
						{
							id: "free",
							name: "無料プラン",
							price: 0,
							maxClothingItems: 20,
							maxOutfits: 5,
							canUploadImages: false,
							features: ["基本的な服の管理", "5個までのコーデ作成"],
						},
						{
							id: "premium",
							name: "プレミアムプラン",
							price: 980,
							maxClothingItems: 200,
							maxOutfits: 50,
							canUploadImages: true,
							features: [
								"200個までの服の管理",
								"50個までのコーデ作成",
								"画像アップロード機能",
								"季節別の整理",
								"詳細なタグ機能",
							],
						},
						{
							id: "pro",
							name: "プロプラン",
							price: 1980,
							maxClothingItems: -1,
							maxOutfits: -1,
							canUploadImages: true,
							features: [
								"無制限の服の管理",
								"無制限のコーデ作成",
								"画像アップロード機能",
								"高度な検索・フィルター",
								"コーデ提案AI機能",
								"統計・分析機能",
							],
						},
					])
					.onConflictDoNothing(),

				// Create demo user in parallel
				tx
					.insert(users)
					.values([
						{
							id: "demo-user-1",
							name: "デモユーザー",
							email: "demo@example.com",
						},
					])
					.onConflictDoNothing()
					.returning(),
			]);

			console.log("Basic data seeded!");

			// Pre-build category lookup map for O(1) access
			const categoryMap = new Map(insertedCategories.map((c) => [c.name, c]));

			const requiredCategoryNames = [
				"Tシャツ",
				"ジーンズ",
				"スニーカー",
				"シャツ",
				"チノパン",
				"ジャケット",
			] as const;
			const missingCategories = requiredCategoryNames.filter(
				(name) => !categoryMap.has(name),
			);

			if (missingCategories.length > 0) {
				throw new Error(
					`Required categories not found: ${missingCategories.join(", ")}`,
				);
			}

			// Helper function to get category with proper type assertion
			const getCategory = (name: string) => {
				const category = categoryMap.get(name);
				if (!category) {
					throw new Error(`Category not found: ${name}`);
				}
				return category;
			};

			// Handle demo user - either newly created or existing
			let demoUser = insertedUsers[0];
			if (!demoUser) {
				// User might already exist, try to find it
				const existingUsers = await tx
					.select()
					.from(users)
					.where(eq(users.id, "demo-user-1"));
				demoUser = existingUsers[0];
				if (!demoUser) {
					throw new Error("Failed to create or find demo user");
				}
			}

			// Insert sample data in batch operations
			const [sampleClothingItems, sampleOutfits] = await Promise.all([
				// Insert clothing items with optimized category lookups
				tx
					.insert(clothingItems)
					.values([
						{
							userId: demoUser.id,
							name: "ベーシック白Tシャツ",
							brand: "ユニクロ",
							color: "白",
							size: "M",
							categoryId: getCategory("Tシャツ").id,
							season: "all",
							price: 1500,
							tags: ["ベーシック", "カジュアル", "定番"],
							notes: "シンプルで合わせやすい定番アイテム",
						},
						{
							userId: demoUser.id,
							name: "ストレッチジーンズ",
							brand: "リーバイス",
							color: "インディゴブルー",
							size: "32",
							categoryId: getCategory("ジーンズ").id,
							season: "all",
							price: 8900,
							tags: ["デニム", "ストレッチ", "カジュアル"],
							notes: "履き心地の良いストレッチデニム",
						},
						{
							userId: demoUser.id,
							name: "スタンスミス",
							brand: "アディダス",
							color: "ホワイト",
							size: "27.0",
							categoryId: getCategory("スニーカー").id,
							season: "all",
							price: 12000,
							tags: ["スニーカー", "定番", "ホワイト"],
							notes: "定番のホワイトスニーカー",
						},
						{
							userId: demoUser.id,
							name: "オックスフォードシャツ",
							brand: "ブルックスブラザーズ",
							color: "ライトブルー",
							size: "M",
							categoryId: getCategory("シャツ").id,
							season: "spring",
							price: 15000,
							tags: ["フォーマル", "オフィス", "上品"],
							notes: "オフィスでも使える上品なシャツ",
						},
						{
							userId: demoUser.id,
							name: "チノパンツ",
							brand: "GAP",
							color: "ベージュ",
							size: "32",
							categoryId: getCategory("チノパン").id,
							season: "all",
							price: 6500,
							tags: ["チノ", "カジュアル", "ベーシック"],
							notes: "カジュアルにもキレイめにも使える",
						},
						{
							userId: demoUser.id,
							name: "テーラードジャケット",
							brand: "ザラ",
							color: "ネイビー",
							size: "M",
							categoryId: getCategory("ジャケット").id,
							season: "spring",
							price: 18000,
							tags: ["ビジネス", "フォーマル", "ネイビー"],
							notes: "ビジネスシーンに最適なネイビージャケット",
						},
					])
					.returning(),

				// Insert outfits
				tx
					.insert(outfits)
					.values([
						{
							userId: demoUser.id,
							name: "カジュアルデイリー",
							description: "普段使いのリラックスしたコーディネート",
							occasion: "casual",
							season: "all",
							rating: 4,
							tags: ["カジュアル", "デイリー", "楽ちん"],
						},
						{
							userId: demoUser.id,
							name: "オフィスカジュアル",
							description: "きちんと感のあるオフィス向けスタイル",
							occasion: "work",
							season: "spring",
							rating: 5,
							tags: ["オフィス", "きれいめ", "ビジネス"],
						},
					])
					.returning(),
			]);

			console.log(
				`Inserted ${sampleClothingItems.length} sample clothing items and ${sampleOutfits.length} outfits`,
			);

			// Create outfit-clothing relationships in single batch
			if (sampleOutfits.length >= 2 && sampleClothingItems.length >= 6) {
				await tx.insert(outfitItems).values([
					// カジュアルデイリー outfit (白Tシャツ + ジーンズ + スニーカー)
					{
						outfitId: sampleOutfits[0]!.id,
						clothingItemId: sampleClothingItems[0]!.id,
					},
					{
						outfitId: sampleOutfits[0]!.id,
						clothingItemId: sampleClothingItems[1]!.id,
					},
					{
						outfitId: sampleOutfits[0]!.id,
						clothingItemId: sampleClothingItems[2]!.id,
					},
					// オフィスカジュアル outfit (シャツ + チノパン + ジャケット)
					{
						outfitId: sampleOutfits[1]!.id,
						clothingItemId: sampleClothingItems[3]!.id,
					},
					{
						outfitId: sampleOutfits[1]!.id,
						clothingItemId: sampleClothingItems[4]!.id,
					},
					{
						outfitId: sampleOutfits[1]!.id,
						clothingItemId: sampleClothingItems[5]!.id,
					},
				]);

				console.log("Created sample outfits with clothing items");
			}
		});

		console.log("Seed completed successfully!");
	} catch (error) {
		console.error("Seed failed:", error);
		throw error;
	} finally {
		// Close database connection to allow process to exit
		await db.$client.end();
	}
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
