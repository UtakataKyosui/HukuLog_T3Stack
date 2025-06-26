ALTER TABLE "workspace_user" ADD COLUMN "isAnonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_user" ADD COLUMN "storageType" varchar(50) DEFAULT 'postgresql' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_user" ADD COLUMN "notionAccessToken" text;--> statement-breakpoint
ALTER TABLE "workspace_user" ADD COLUMN "notionClothingDatabaseId" varchar(255);--> statement-breakpoint
ALTER TABLE "workspace_user" ADD COLUMN "notionOutfitsDatabaseId" varchar(255);