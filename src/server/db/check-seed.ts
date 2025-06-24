import { count } from "drizzle-orm";
import { db } from "./index";
import { clothingCategories, subscriptionPlans } from "./schema";

async function checkSeedData() {
	try {
		console.log("🔍 Checking for existing seed data...");

		// カテゴリとサブスクリプションプランの存在をチェック
		const [categoryCount, planCount] = await Promise.all([
			db.select({ count: count() }).from(clothingCategories),
			db.select({ count: count() }).from(subscriptionPlans),
		]);

		const categoriesExist = categoryCount[0]?.count > 0;
		const plansExist = planCount[0]?.count > 0;

		if (categoriesExist && plansExist) {
			console.log("✅ Seed data already exists:");
			console.log(`   - Categories: ${categoryCount[0]?.count}`);
			console.log(`   - Subscription plans: ${planCount[0]?.count}`);
			return true;
		}

		console.log("❌ Seed data missing:");
		if (!categoriesExist) {
			console.log("   - No clothing categories found");
		}
		if (!plansExist) {
			console.log("   - No subscription plans found");
		}
		return false;
	} catch (error) {
		console.error("❌ Error checking seed data:", error);
		return false;
	}
}

export { checkSeedData };

// CLI実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
	checkSeedData()
		.then((exists) => {
			process.exit(exists ? 0 : 1);
		})
		.catch(() => {
			process.exit(1);
		});
}