import { db } from "./index";
import { clothingCategories, subscriptionPlans } from "./schema";

async function seed() {
	console.log("Seeding database...");

	// Insert clothing categories
	await db.insert(clothingCategories).values([
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
	]);

	// Insert subscription plans
	await db.insert(subscriptionPlans).values([
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
			price: 980, // 980円
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
			price: 1980, // 1980円
			maxClothingItems: -1, // unlimited
			maxOutfits: -1, // unlimited
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
	]);

	console.log("Seed completed!");
}

seed().catch(console.error);
