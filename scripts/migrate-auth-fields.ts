import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

const migrationSQL = `
-- Add all missing fields to users table

-- First, add storage-related fields
ALTER TABLE "workspace_user" 
ADD COLUMN IF NOT EXISTS "storageType" varchar(50) DEFAULT 'postgresql' NOT NULL,
ADD COLUMN IF NOT EXISTS "notionAccessToken" text,
ADD COLUMN IF NOT EXISTS "notionClothingDatabaseId" varchar(255),
ADD COLUMN IF NOT EXISTS "notionOutfitsDatabaseId" varchar(255);

-- Then, add authentication state management fields
ALTER TABLE "workspace_user" 
ADD COLUMN IF NOT EXISTS "authLevel" integer DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS "passkeyEnabled" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "notionEnabled" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "preferredAuthMethod" varchar(50) DEFAULT 'passkey',
ADD COLUMN IF NOT EXISTS "authCompletedAt" timestamp with time zone;

-- Update existing users based on current auth state
-- Set passkeyEnabled=true for users who have passkeys
UPDATE "workspace_user" 
SET "passkeyEnabled" = true 
WHERE id IN (
  SELECT DISTINCT "userId" 
  FROM "workspace_passkey"
);

-- Since there are no Notion configurations yet, notionEnabled will remain false for all users

-- Update authLevel based on enabled features
UPDATE "workspace_user" 
SET "authLevel" = CASE 
  WHEN "passkeyEnabled" = true AND "notionEnabled" = true THEN 4  -- 完全認証
  WHEN "passkeyEnabled" = true AND "notionEnabled" = false THEN 2  -- セキュア認証
  WHEN "passkeyEnabled" = false AND "notionEnabled" = true THEN 3  -- データ連携
  ELSE 1  -- 基本認証
END;

-- Set authCompletedAt for users with complete authentication (level 4)
UPDATE "workspace_user" 
SET "authCompletedAt" = NOW() 
WHERE "authLevel" = 4 AND "authCompletedAt" IS NULL;

-- Set preferredAuthMethod based on enabled features
UPDATE "workspace_user" 
SET "preferredAuthMethod" = CASE 
  WHEN "passkeyEnabled" = true THEN 'passkey'
  WHEN "notionEnabled" = true THEN 'notion'
  ELSE 'passkey'
END;
`;

async function runMigration() {
  console.log("🔄 Starting authentication fields migration...");

  const connection = postgres(env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    await connection.unsafe(migrationSQL);
    console.log("✅ Migration completed successfully!");

    // 結果を確認
    const users = await connection`
      SELECT 
        id, 
        name,
        "authLevel",
        "passkeyEnabled",
        "notionEnabled",
        "preferredAuthMethod",
        "authCompletedAt"
      FROM "workspace_user" 
      LIMIT 5
    `;

    console.log("\n📊 Sample user data after migration:");
    console.table(users);

    const stats = await connection`
      SELECT 
        "authLevel",
        COUNT(*) as count
      FROM "workspace_user" 
      GROUP BY "authLevel"
      ORDER BY "authLevel"
    `;

    console.log("\n📈 User distribution by auth level:");
    console.table(stats);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }

  console.log("\n🎉 Migration process completed!");
}

runMigration().catch(console.error);