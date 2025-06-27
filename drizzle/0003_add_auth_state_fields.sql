-- Add authentication state management fields to users table

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

-- Set notionEnabled=true for users who have Notion configuration
UPDATE "workspace_user" 
SET "notionEnabled" = true 
WHERE "notionAccessToken" IS NOT NULL 
  AND "notionClothingDatabaseId" IS NOT NULL 
  AND "notionOutfitsDatabaseId" IS NOT NULL;

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