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

export const notionOutfitRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        clothingItemIds: z.array(z.string()),
        occasion: z.enum(["casual", "work", "formal", "party", "date", "travel", "sports"]).optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        lastWorn: z.date().optional(),
        tags: z.array(z.string()).default([]),
        notionAccessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const result = await notionClient.createOutfit({
          ...input,
          userId: ctx.session.user.id,
        });

        return {
          success: true,
          notionPageId: result.id,
          message: "コーデをNotionに保存しました",
        };
      } catch (error) {
        console.error("Notion outfit creation error:", error);
        throw new Error("Notionへのコーデ保存に失敗しました");
      }
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        occasionFilter: z.string().optional(),
        seasonFilter: z.string().optional(),
        searchText: z.string().optional(),
        notionAccessToken: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const result = await notionClient.getOutfits(ctx.session.user.id, {
          limit: input.limit,
          cursor: input.cursor,
          occasionFilter: input.occasionFilter,
          seasonFilter: input.seasonFilter,
          searchText: input.searchText,
        });

        const outfits = result.results.map((page: any) => {
          const properties = page.properties;
          
          const ratingText = properties.Rating?.select?.name || "";
          const rating = ratingText ? ratingText.length : null;

          return {
            id: page.id,
            name: properties.Name?.title?.[0]?.text?.content || "",
            description: properties.Description?.rich_text?.[0]?.text?.content || null,
            clothingItemIds: properties["Clothing Items"]?.relation?.map((rel: any) => rel.id) || [],
            occasion: properties.Occasion?.select?.name || null,
            season: properties.Season?.multi_select?.[0]?.name || null,
            rating,
            lastWorn: properties["Last Worn"]?.date?.start || null,
            tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            createdAt: page.created_time,
            updatedAt: page.last_edited_time,
          };
        });

        return {
          outfits,
          hasMore: result.has_more,
          nextCursor: result.next_cursor,
        };
      } catch (error) {
        console.error("Notion outfit fetch error:", error);
        throw new Error("Notionからのコーデ取得に失敗しました");
      }
    }),

  getById: protectedProcedure
    .input(
      z.object({
        notionPageId: z.string(),
        notionAccessToken: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        // Get outfit details
        const page = await notionClient.client.pages.retrieve({
          page_id: input.notionPageId,
        });

        if (!("properties" in page)) {
          throw new Error("Invalid page type");
        }

        const properties = page.properties;
        
        const ratingText = (properties as any).Rating?.select?.name || "";
        const rating = ratingText ? ratingText.length : null;

        const clothingItemIds = (properties as any)["Clothing Items"]?.relation?.map((rel: any) => rel.id) || [];

        // Get related clothing items details
        const clothingItems = [];
        for (const itemId of clothingItemIds) {
          try {
            const itemPage = await notionClient.client.pages.retrieve({
              page_id: itemId,
            });

            if ("properties" in itemPage) {
              const itemProps = itemPage.properties;
              clothingItems.push({
                id: itemPage.id,
                name: (itemProps as any).Name?.title?.[0]?.text?.content || "",
                brand: (itemProps as any).Brand?.rich_text?.[0]?.text?.content || null,
                color: (itemProps as any).Color?.select?.name || null,
                imageUrl: (itemProps as any).Image?.files?.[0]?.external?.url || null,
              });
            }
          } catch (itemError) {
            console.warn(`Failed to fetch clothing item ${itemId}:`, itemError);
          }
        }

        return {
          id: page.id,
          name: (properties as any).Name?.title?.[0]?.text?.content || "",
          description: (properties as any).Description?.rich_text?.[0]?.text?.content || null,
          clothingItems,
          occasion: (properties as any).Occasion?.select?.name || null,
          season: (properties as any).Season?.multi_select?.[0]?.name || null,
          rating,
          lastWorn: (properties as any)["Last Worn"]?.date?.start || null,
          tags: (properties as any).Tags?.multi_select?.map((tag: any) => tag.name) || [],
          createdAt: page.created_time,
          updatedAt: page.last_edited_time,
        };
      } catch (error) {
        console.error("Notion outfit detail fetch error:", error);
        throw new Error("Notionからのコーデ詳細取得に失敗しました");
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        notionPageId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        clothingItemIds: z.array(z.string()).optional(),
        occasion: z.enum(["casual", "work", "formal", "party", "date", "travel", "sports"]).optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "all"]).optional(),
        rating: z.number().int().min(1).max(5).optional(),
        lastWorn: z.date().optional(),
        tags: z.array(z.string()).optional(),
        notionAccessToken: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const notionClient = createNotionClient(input.notionAccessToken);
        
        const { notionPageId, notionAccessToken, ...updates } = input;
        const result = await notionClient.updateOutfit(notionPageId, updates);

        return {
          success: true,
          notionPageId: result.id,
          message: "コーデを更新しました",
        };
      } catch (error) {
        console.error("Notion outfit update error:", error);
        throw new Error("Notionでのコーデ更新に失敗しました");
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
        
        await notionClient.deleteOutfit(input.notionPageId);

        return {
          success: true,
          message: "コーデを削除しました",
        };
      } catch (error) {
        console.error("Notion outfit delete error:", error);
        throw new Error("Notionでのコーデ削除に失敗しました");
      }
    }),
});