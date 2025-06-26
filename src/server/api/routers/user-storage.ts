import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userStorageRouter = createTRPCRouter({
  getStoragePreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select({
        storageType: users.storageType,
        notionAccessToken: users.notionAccessToken,
        notionClothingDatabaseId: users.notionClothingDatabaseId,
        notionOutfitsDatabaseId: users.notionOutfitsDatabaseId,
      })
      .from(users)
      .where(eq(users.id, ctx.session.user.id))
      .limit(1);

    return user[0] ?? {
      storageType: "postgresql" as const,
      notionAccessToken: null,
      notionClothingDatabaseId: null,
      notionOutfitsDatabaseId: null,
    };
  }),

  updateStorageType: protectedProcedure
    .input(
      z.object({
        storageType: z.enum(["postgresql", "notion"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(users)
        .set({
          storageType: input.storageType,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id));

      return {
        success: true,
        message: `データ保存方法を${input.storageType === "postgresql" ? "PostgreSQL" : "Notion"}に変更しました`,
      };
    }),

  updateNotionConfiguration: protectedProcedure
    .input(
      z.object({
        notionAccessToken: z.string().min(1),
        notionClothingDatabaseId: z.string().min(1),
        notionOutfitsDatabaseId: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(users)
        .set({
          notionAccessToken: input.notionAccessToken,
          notionClothingDatabaseId: input.notionClothingDatabaseId,
          notionOutfitsDatabaseId: input.notionOutfitsDatabaseId,
          storageType: "notion", // Notion設定時は自動的にNotionに切り替え
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id));

      return {
        success: true,
        message: "Notion設定を保存し、データ保存方法をNotionに変更しました",
      };
    }),

  setupInitialStorage: protectedProcedure
    .input(
      z.object({
        storageType: z.enum(["postgresql", "notion"]),
        notionAccessToken: z.string().optional(),
        notionClothingDatabaseId: z.string().optional(),
        notionOutfitsDatabaseId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: Partial<typeof users.$inferInsert> = {
        storageType: input.storageType,
        updatedAt: new Date(),
      };

      if (input.storageType === "notion") {
        if (!input.notionAccessToken || !input.notionClothingDatabaseId || !input.notionOutfitsDatabaseId) {
          throw new Error("Notionを選択する場合は、アクセストークンとデータベースIDが必要です");
        }
        
        updateData.notionAccessToken = input.notionAccessToken;
        updateData.notionClothingDatabaseId = input.notionClothingDatabaseId;
        updateData.notionOutfitsDatabaseId = input.notionOutfitsDatabaseId;
      }

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.session.user.id));

      return {
        success: true,
        message: `初期データ保存方法を${input.storageType === "postgresql" ? "PostgreSQL" : "Notion"}に設定しました`,
      };
    }),

  validateNotionConfiguration: protectedProcedure
    .input(
      z.object({
        notionAccessToken: z.string().min(1),
        notionClothingDatabaseId: z.string().min(1),
        notionOutfitsDatabaseId: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Notion APIクライアントを一時的に作成してテスト
        const { NotionAPIClient } = await import("@/lib/notion-api");
        
        const notionClient = new NotionAPIClient({
          apiKey: input.notionAccessToken,
          clothingDatabaseId: input.notionClothingDatabaseId,
          outfitsDatabaseId: input.notionOutfitsDatabaseId,
        });

        // 両方のデータベースにアクセス可能かテスト
        await Promise.all([
          notionClient.getClothingItems("test-user", { limit: 1 }),
          notionClient.getOutfits("test-user", { limit: 1 }),
        ]);

        return {
          success: true,
          message: "Notion設定が正常に検証されました",
        };
      } catch (error) {
        console.error("Notion validation error:", error);
        throw new Error("Notion設定の検証に失敗しました。アクセストークンとデータベースIDを確認してください。");
      }
    }),

  resetNotionConfiguration: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(users)
      .set({
        storageType: "postgresql",
        notionAccessToken: null,
        notionClothingDatabaseId: null,
        notionOutfitsDatabaseId: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.session.user.id));

    return {
      success: true,
      message: "Notion設定をリセットし、PostgreSQLに戻しました",
    };
  }),
});