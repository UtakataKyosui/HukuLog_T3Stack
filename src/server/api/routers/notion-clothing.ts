import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { NotionAPIClient } from "@/lib/notion-api";
import { env } from "@/env";

const createNotionClient = (accessToken: string) => {
  const [clothingDbId, outfitsDbId] = (env.NOTION_DATABASE_IDS || "").split(",");
  
  if (!clothingDbId || !outfitsDbId) {
    throw new Error("NOTION_DATABASE_IDS environment variable not configured properly");
  }

  return new NotionAPIClient({
    apiKey: accessToken,
    clothingDatabaseId: clothingDbId.trim(),
    outfitsDatabaseId: outfitsDbId.trim(),
  });
};

export const notionClothingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        brand: z.string().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        categoryId: z.number().optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        imageUrl: z.string().url().optional(),
        price: z.number().int().positive().optional(),
        purchaseDate: z.date().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
        notionAccessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const result = await notionClient.createClothingItem({
          ...input,
          userId: ctx.session.user.id,
        });

        return {
          success: true,
          notionPageId: result.id,
          message: "服データをNotionに保存しました",
        };
      } catch (error) {
        console.error("Notion clothing creation error:", error);
        throw new Error("Notionへの服データ保存に失敗しました");
      }
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        categoryFilter: z.string().optional(),
        seasonFilter: z.string().optional(),
        searchText: z.string().optional(),
        notionAccessToken: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const result = await notionClient.getClothingItems(ctx.session.user.id, {
          limit: input.limit,
          cursor: input.cursor,
          categoryFilter: input.categoryFilter,
          seasonFilter: input.seasonFilter,
          searchText: input.searchText,
        });

        const items = result.results.map((page: any) => {
          const properties = page.properties;
          return {
            id: page.id,
            name: properties.Name?.title?.[0]?.text?.content || "",
            brand: properties.Brand?.rich_text?.[0]?.text?.content || null,
            color: properties.Color?.select?.name || null,
            size: properties.Size?.select?.name || null,
            season: properties.Season?.multi_select?.[0]?.name || null,
            price: properties.Price?.number || null,
            purchaseDate: properties["Purchase Date"]?.date?.start || null,
            notes: properties.Notes?.rich_text?.[0]?.text?.content || null,
            tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            imageUrl: properties.Image?.files?.[0]?.external?.url || null,
            createdAt: page.created_time,
            updatedAt: page.last_edited_time,
          };
        });

        return {
          items,
          hasMore: result.has_more,
          nextCursor: result.next_cursor,
        };
      } catch (error) {
        console.error("Notion clothing fetch error:", error);
        throw new Error("Notionからの服データ取得に失敗しました");
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        notionPageId: z.string(),
        name: z.string().min(1).optional(),
        brand: z.string().optional(),
        color: z.string().optional(),
        size: z.string().optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        price: z.number().int().positive().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notionAccessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const { notionPageId, notionAccessToken, ...updates } = input;
        const result = await notionClient.updateClothingItem(notionPageId, updates);

        return {
          success: true,
          notionPageId: result.id,
          message: "服データを更新しました",
        };
      } catch (error) {
        console.error("Notion clothing update error:", error);
        throw new Error("Notionでの服データ更新に失敗しました");
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        notionPageId: z.string(),
        notionAccessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        await notionClient.deleteClothingItem(input.notionPageId);

        return {
          success: true,
          message: "服データを削除しました",
        };
      } catch (error) {
        console.error("Notion clothing delete error:", error);
        throw new Error("Notionでの服データ削除に失敗しました");
      }
    }),
});