import { eq, inArray, not, sql } from "drizzle-orm";

import { db } from "./index";
import { clothingCategories, clothingItems } from "./schema";

async function deduplicateCategories() {
	try {
		console.log("🧹 Deduplicating categories...");

		// まず現在の状況を確認
		const currentCategories = await db.select().from(clothingCategories);
		console.log(`📊 Current categories count: ${currentCategories.length}`);

		// カテゴリ名別に最初のIDを取得
		const uniqueCategories = await db
			.select({
				name: clothingCategories.name,
				minId: sql<number>`min(${clothingCategories.id})`.as("min_id"),
			})
			.from(clothingCategories)
			.groupBy(clothingCategories.name);

		console.log(`📋 Unique category names: ${uniqueCategories.length}`);
		uniqueCategories.forEach((category, index) => {
			console.log(
				`  ${index + 1}. "${category.name}" (keeping ID: ${category.minId})`,
			);
		});

		// 重複を削除（最初のID以外を削除）
		const keepIds = uniqueCategories.map((c) => c.minId);

		// まず、重複カテゴリを参照している clothingItems を最初のIDに更新
		console.log(
			"🔄 Updating clothing items to reference first category IDs...",
		);

		for (const uniqueCategory of uniqueCategories) {
			const duplicateIds = await db
				.select({ id: clothingCategories.id })
				.from(clothingCategories)
				.where(eq(clothingCategories.name, uniqueCategory.name));

			const duplicateIdsToUpdate = duplicateIds
				.map((d) => d.id)
				.filter((id) => id !== uniqueCategory.minId);

			if (duplicateIdsToUpdate.length > 0) {
				console.log(
					`  Updating items for "${uniqueCategory.name}" from IDs [${duplicateIdsToUpdate.join(", ")}] to ID ${uniqueCategory.minId}`,
				);

				// 重複IDを参照している服アイテムを最初のIDに更新
				await db
					.update(clothingItems)
					.set({ categoryId: uniqueCategory.minId })
					.where(inArray(clothingItems.categoryId, duplicateIdsToUpdate));
			}
		}
		// 重複カテゴリを削除
		console.log("🗑️  Deleting duplicate categories...");
		const deleteResult = await db
			.delete(clothingCategories)
			.where(not(inArray(clothingCategories.id, keepIds)));

		console.log("✅ Deleted duplicate categories");

		// 最終確認
		const finalCategories = await db.select().from(clothingCategories);
		console.log(`🎉 Final categories count: ${finalCategories.length}`);

		finalCategories.forEach((category, index) => {
			console.log(
				`  ${index + 1}. ID: ${category.id}, Name: "${category.name}", Type: "${category.type}"`,
			);
		});

		console.log("🎉 Categories deduplication completed successfully!");
	} catch (error) {
		console.error("❌ Error deduplicating categories:", error);
		throw error;
	}
}

deduplicateCategories();
