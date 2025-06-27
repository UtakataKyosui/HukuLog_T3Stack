-- 新しいカラムのみを追加する手動マイグレーション
ALTER TABLE "workspace_user" ADD COLUMN IF NOT EXISTS "storageType" varchar(50) DEFAULT 'postgresql' NOT NULL;
ALTER TABLE "workspace_user" ADD COLUMN IF NOT EXISTS "notionAccessToken" text;
ALTER TABLE "workspace_user" ADD COLUMN IF NOT EXISTS "notionClothingDatabaseId" varchar(255);
ALTER TABLE "workspace_user" ADD COLUMN IF NOT EXISTS "notionOutfitsDatabaseId" varchar(255);