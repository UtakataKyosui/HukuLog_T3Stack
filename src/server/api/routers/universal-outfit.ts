import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const universalOutfitRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        occasionFilter: z.string().optional(),
        seasonFilter: z.string().optional(),
        searchText: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // ユーザーのストレージ設定を取得
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

      const userConfig = user[0];
      
      if (!userConfig || userConfig.storageType === "postgresql") {
        // PostgreSQLから取得
        const { outfitRouter } = await import("./outfit");
        const outfitCaller = outfitRouter.createCaller(ctx);
        return await outfitCaller.getAll(input);
      } else if (userConfig.storageType === "notion") {
        // Notionから取得
        if (!userConfig.notionAccessToken || !userConfig.notionOutfitsDatabaseId) {
          console.error("Notion configuration is incomplete.", userConfig);
          throw new Error("Notion設定が不完全です");
        }
        
        const { notionOutfitRouter } = await import("./notion-outfit");
        const notionCaller = notionOutfitRouter.createCaller(ctx);
        return await notionCaller.getAll({
          ...input,
          notionAccessToken: userConfig.notionAccessToken,
        });
      }
      
      throw new Error("不明なストレージタイプです");
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        clothingItemIds: z.array(z.union([z.string(), z.number()])),
        occasion: z.enum(["casual", "work", "formal", "party", "date", "travel", "sports"]).optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        lastWorn: z.date().optional(),
        tags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // ユーザーのストレージ設定を取得
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

      const userConfig = user[0];
      
      if (!userConfig || userConfig.storageType === "postgresql") {
        // PostgreSQLに保存
        const { outfitRouter } = await import("./outfit");
        const outfitCaller = outfitRouter.createCaller(ctx);
        return await outfitCaller.create({
          ...input,
          clothingItemIds: input.clothingItemIds.map(id => Number(id)),
        });
      } else if (userConfig.storageType === "notion") {
        // Notionに保存
        if (!userConfig.notionAccessToken || !userConfig.notionOutfitsDatabaseId) {
          console.error("Notion configuration is incomplete.", userConfig);
          throw new Error("Notion設定が不完全です");
        }
        
        const { notionOutfitRouter } = await import("./notion-outfit");
        const notionCaller = notionOutfitRouter.createCaller(ctx);
        return await notionCaller.create({
          ...input,
          clothingItemIds: input.clothingItemIds.map(id => String(id)),
          notionAccessToken: userConfig.notionAccessToken,
        });
      }
      
      throw new Error("不明なストレージタイプです");
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.union([z.string(), z.number()]),
    }))
    .query(async ({ input, ctx }) => {
      // ユーザーのストレージ設定を取得
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

      const userConfig = user[0];
      
      if (!userConfig || userConfig.storageType === "postgresql") {
        // PostgreSQLから取得
        const { outfitRouter } = await import("./outfit");
        const outfitCaller = outfitRouter.createCaller(ctx);
        return await outfitCaller.getById({ id: Number(input.id) });
      } else if (userConfig.storageType === "notion") {
        // Notionから取得
        if (!userConfig.notionAccessToken || !userConfig.notionOutfitsDatabaseId) {
          console.error("Notion configuration is incomplete.", userConfig);
          throw new Error("Notion設定が不完全です");
        }
        
        const { notionOutfitRouter } = await import("./notion-outfit");
        const notionCaller = notionOutfitRouter.createCaller(ctx);
        return await notionCaller.getById({
          notionPageId: String(input.id),
          notionAccessToken: userConfig.notionAccessToken,
        });
      }
      
      throw new Error("不明なストレージタイプです");
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        clothingItemIds: z.array(z.union([z.string(), z.number()])).optional(),
        occasion: z.enum(["casual", "work", "formal", "party", "date", "travel", "sports"]).optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        lastWorn: z.date().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // ユーザーのストレージ設定を取得
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

      const userConfig = user[0];
      const { id, ...updateData } = input;
      
      if (!userConfig || userConfig.storageType === "postgresql") {
        // PostgreSQLで更新
        const { outfitRouter } = await import("./outfit");
        const outfitCaller = outfitRouter.createCaller(ctx);
        return await outfitCaller.update({ 
          id: Number(id), 
          ...updateData,
          clothingItemIds: updateData.clothingItemIds?.map(id => Number(id)),
        });
      } else if (userConfig.storageType === "notion") {
        // Notionで更新
        if (!userConfig.notionAccessToken || !userConfig.notionOutfitsDatabaseId) {
          console.error("Notion configuration is incomplete.", userConfig);
          throw new Error("Notion設定が不完全です");
        }
        
        const { notionOutfitRouter } = await import("./notion-outfit");
        const notionCaller = notionOutfitRouter.createCaller(ctx);
        return await notionCaller.update({
          notionPageId: String(id),
          notionAccessToken: userConfig.notionAccessToken,
          ...updateData,
          clothingItemIds: updateData.clothingItemIds?.map(id => String(id)),
        });
      }
      
      throw new Error("不明なストレージタイプです");
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.union([z.string(), z.number()]),
    }))
    .mutation(async ({ input, ctx }) => {
      // ユーザーのストレージ設定を取得
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

      const userConfig = user[0];
      
      if (!userConfig || userConfig.storageType === "postgresql") {
        // PostgreSQLで削除
        const { outfitRouter } = await import("./outfit");
        const outfitCaller = outfitRouter.createCaller(ctx);
        return await outfitCaller.delete({ id: Number(input.id) });
      } else if (userConfig.storageType === "notion") {
        // Notionで削除
        if (!userConfig.notionAccessToken || !userConfig.notionOutfitsDatabaseId) {
          console.error("Notion configuration is incomplete.", userConfig);
          throw new Error("Notion設定が不完全です");
        }
        
        const { notionOutfitRouter } = await import("./notion-outfit");
        const notionCaller = notionOutfitRouter.createCaller(ctx);
        return await notionCaller.delete({
          notionPageId: String(input.id),
          notionAccessToken: userConfig.notionAccessToken,
        });
      }
      
      throw new Error("不明なストレージタイプです");
    }),
});