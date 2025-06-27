import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

async function checkTableStructure() {
	console.log("🔍 Checking current table structure...");

	const connection = postgres(env.DATABASE_URL);

	try {
		// workspace_userテーブルの構造を確認
		const columns = await connection`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'workspace_user'
      ORDER BY ordinal_position;
    `;

		console.log("\n📋 Current workspace_user table structure:");
		console.table(columns);

		// 既存のユーザー数を確認
		const userCount = await connection`
      SELECT COUNT(*) as total_users FROM "workspace_user"
    `;

		console.log(`\n👥 Total users: ${userCount[0]?.total_users || 0}`);

		// passkeyテーブルとの関連を確認
		const passkeyRelation = await connection`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        COUNT(p.id) as passkey_count
      FROM "workspace_user" u
      LEFT JOIN "workspace_passkey" p ON u.id = p."userId"
      GROUP BY u.id, u.name, u.email
      LIMIT 10;
    `;

		console.log("\n🔑 User-Passkey relationship:");
		console.table(passkeyRelation);
	} catch (error) {
		console.error("❌ Failed to check table structure:", error);
	} finally {
		await connection.end();
	}
}

checkTableStructure().catch(console.error);
