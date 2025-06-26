import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { NotionAPIClient } from "@/lib/notion-api";

export const notionSetupRouter = createTRPCRouter({
  validatePageAccess: protectedProcedure
    .input(
      z.object({
        notionAccessToken: z.string().min(1),
        pageId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 一時的なNotionクライアントを作成してページアクセスを検証
        const notionClient = new NotionAPIClient({
          apiKey: input.notionAccessToken,
          clothingDatabaseId: "", // 検証時は不要
          outfitsDatabaseId: "", // 検証時は不要
        });

        const result = await notionClient.validatePageAccess(input.pageId);
        
        return {
          success: true,
          pageTitle: result.pageTitle,
          message: `ページ「${result.pageTitle}」にアクセスできました`,
        };
      } catch (error) {
        console.error("Page access validation error:", error);
        throw new Error(error instanceof Error ? error.message : "ページアクセスの検証に失敗しました");
      }
    }),

  createDatabases: protectedProcedure
    .input(
      z.object({
        notionAccessToken: z.string().min(1),
        pageId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Notionクライアントを作成してデータベースを自動作成
        const notionClient = new NotionAPIClient({
          apiKey: input.notionAccessToken,
          clothingDatabaseId: "", // 作成前なので空
          outfitsDatabaseId: "", // 作成前なので空
        });

        const result = await notionClient.createDatabasesInPage(input.pageId);
        
        return {
          success: true,
          clothingDatabaseId: result.clothingDatabaseId,
          outfitsDatabaseId: result.outfitsDatabaseId,
          clothingDatabaseUrl: result.clothingDatabaseUrl,
          outfitsDatabaseUrl: result.outfitsDatabaseUrl,
          message: "データベースを正常に作成しました",
        };
      } catch (error) {
        console.error("Database creation error:", error);
        throw new Error("データベースの作成に失敗しました。統合がページに招待されているか確認してください。");
      }
    }),

  setupWithDatabaseCreation: protectedProcedure
    .input(
      z.object({
        notionAccessToken: z.string().min(1),
        pageId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Step 1: ページアクセスの検証
        const notionClient = new NotionAPIClient({
          apiKey: input.notionAccessToken,
          clothingDatabaseId: "",
          outfitsDatabaseId: "",
        });

        const pageValidation = await notionClient.validatePageAccess(input.pageId);
        
        // Step 2: データベースの自動作成
        const databaseResult = await notionClient.createDatabasesInPage(input.pageId);
        
        // Step 3: ユーザー設定にNotionの情報を保存
        const { users } = await import("@/server/db/schema");
        const { eq } = await import("drizzle-orm");
        
        await ctx.db
          .update(users)
          .set({
            storageType: "notion",
            notionAccessToken: input.notionAccessToken,
            notionClothingDatabaseId: databaseResult.clothingDatabaseId,
            notionOutfitsDatabaseId: databaseResult.outfitsDatabaseId,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.session.user.id));

        return {
          success: true,
          pageTitle: pageValidation.pageTitle,
          clothingDatabaseId: databaseResult.clothingDatabaseId,
          outfitsDatabaseId: databaseResult.outfitsDatabaseId,
          clothingDatabaseUrl: databaseResult.clothingDatabaseUrl,
          outfitsDatabaseUrl: databaseResult.outfitsDatabaseUrl,
          message: `ページ「${pageValidation.pageTitle}」にデータベースを作成し、Notion設定を完了しました`,
        };
      } catch (error) {
        console.error("Complete Notion setup error:", error);
        throw new Error(error instanceof Error ? error.message : "Notionセットアップに失敗しました");
      }
    }),
});