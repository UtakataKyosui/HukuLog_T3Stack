import { db } from "./index";
import { clothingCategories } from "./schema";

async function testTrpcCategories() {
	try {
		console.log("🧪 Testing tRPC categories endpoint logic...");

		// tRPCエンドポイントと同じロジックをテスト
		const categories = await db.select().from(clothingCategories);

		console.log(`📊 Categories found: ${categories.length}`);

		if (categories.length > 0) {
			console.log("📋 Categories available for form:");
			categories.forEach((category, index) => {
				console.log(
					`  ${index + 1}. ID: ${category.id}, Name: "${category.name}", Type: "${category.type}"`,
				);
			});

			// JSONとして出力（AddClothingFormが受け取る形式）
			console.log("\n🔄 JSON format (as received by AddClothingForm):");
			console.log(JSON.stringify(categories, null, 2));
		} else {
			console.log(
				"❌ No categories found - this explains why the form is empty",
			);
		}
	} catch (error) {
		console.error("❌ Error testing categories:", error);
	}
}

testTrpcCategories();
