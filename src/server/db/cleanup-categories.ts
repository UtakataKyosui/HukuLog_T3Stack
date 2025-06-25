import { sql } from "drizzle-orm";
import { db } from "./index";
import { clothingCategories } from "./schema";

async function cleanupCategories() {
	try {
		console.log("🧹 Cleaning up duplicate categories...");
		
		// まず現在の状況を確認
		const currentCategories = await db.select().from(clothingCategories);
		console.log(`📊 Current categories count: ${currentCategories.length}`);
		
		// 全カテゴリを削除
		await db.delete(clothingCategories);
		console.log("🗑️  All categories deleted");
		
		// 正しいカテゴリのみを挿入
		const correctCategories = [
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
		];
		
		const insertedCategories = await db
			.insert(clothingCategories)
			.values(correctCategories)
			.returning();
		
		console.log(`✅ Inserted ${insertedCategories.length} clean categories:`);
		insertedCategories.forEach((category, index) => {
			console.log(`  ${index + 1}. ID: ${category.id}, Name: "${category.name}", Type: "${category.type}"`);
		});
		
		console.log("🎉 Categories cleanup completed successfully!");
		
	} catch (error) {
		console.error("❌ Error cleaning up categories:", error);
		throw error;
	}
}

cleanupCategories();