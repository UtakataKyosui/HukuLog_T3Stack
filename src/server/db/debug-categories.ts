import { db } from "./index";
import { clothingCategories } from "./schema";

async function debugCategories() {
	try {
		console.log("🔍 Debugging categories in database...");

		// 全カテゴリを取得
		const categories = await db.select().from(clothingCategories);

		console.log(`📊 Total categories found: ${categories.length}`);

		if (categories.length > 0) {
			console.log("\n📋 Categories list:");
			categories.forEach((category, index) => {
				console.log(
					`  ${index + 1}. ID: ${category.id}, Name: "${category.name}", Type: "${category.type}"`,
				);
			});

			// 重複チェック
			const uniqueNames = new Set(categories.map((c) => c.name));
			const duplicateCount = categories.length - uniqueNames.size;

			if (duplicateCount > 0) {
				console.log(`\n⚠️  Found ${duplicateCount} duplicate categories!`);

				// 重複を詳細表示
				const nameGroups = categories.reduce(
					(acc, category) => {
						if (!acc[category.name]) acc[category.name] = [];
						acc[category.name].push(category);
						return acc;
					},
					{} as Record<string, typeof categories>,
				);

				for (const [name, items] of Object.entries(nameGroups)) {
					if (items.length > 1) {
						console.log(
							`    "${name}": ${items.length} duplicates (IDs: ${items.map((i) => i.id).join(", ")})`,
						);
					}
				}
			}
		} else {
			console.log("❌ No categories found in database");
		}
	} catch (error) {
		console.error("❌ Error debugging categories:", error);
	}
}

debugCategories();
