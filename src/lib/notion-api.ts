import { Client } from "@notionhq/client";

export interface NotionConfig {
  apiKey: string;
  clothingDatabaseId: string;
  outfitsDatabaseId: string;
  categoriesDatabaseId?: string;
}

export class NotionAPIClient {
  private client: Client;
  private config: NotionConfig;

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.apiKey });
    this.config = config;
  }

  async createClothingItem(clothingData: {
    name: string;
    brand?: string;
    color?: string;
    size?: string;
    categoryId?: number;
    season?: string;
    imageUrl?: string;
    price?: number;
    purchaseDate?: Date;
    notes?: string;
    tags?: string[];
    userId: string;
  }) {
    try {
      const properties: any = {
        Name: {
          title: [
            {
              text: {
                content: clothingData.name,
              },
            },
          ],
        },
        "User ID": {
          rich_text: [
            {
              text: {
                content: clothingData.userId,
              },
            },
          ],
        },
      };

      if (clothingData.brand) {
        properties.Brand = {
          rich_text: [
            {
              text: {
                content: clothingData.brand,
              },
            },
          ],
        };
      }

      if (clothingData.color) {
        properties.Color = {
          select: {
            name: clothingData.color,
          },
        };
      }

      if (clothingData.size) {
        properties.Size = {
          select: {
            name: clothingData.size,
          },
        };
      }

      if (clothingData.season) {
        properties.Season = {
          multi_select: [
            {
              name: clothingData.season,
            },
          ],
        };
      }

      if (clothingData.price) {
        properties.Price = {
          number: clothingData.price,
        };
      }

      if (clothingData.purchaseDate) {
        properties["Purchase Date"] = {
          date: {
            start: clothingData.purchaseDate.toISOString().split('T')[0],
          },
        };
      }

      if (clothingData.notes) {
        properties.Notes = {
          rich_text: [
            {
              text: {
                content: clothingData.notes,
              },
            },
          ],
        };
      }

      if (clothingData.tags && clothingData.tags.length > 0) {
        properties.Tags = {
          multi_select: clothingData.tags.map(tag => ({ name: tag })),
        };
      }

      if (clothingData.imageUrl) {
        properties.Image = {
          files: [
            {
              name: "clothing_image",
              external: {
                url: clothingData.imageUrl,
              },
            },
          ],
        };
      }

      const response = await this.client.pages.create({
        parent: {
          database_id: this.config.clothingDatabaseId,
        },
        properties,
      });

      return response;
    } catch (error) {
      console.error("Notion API error creating clothing item:", error);
      throw error;
    }
  }

  async getClothingItems(userId: string, options?: {
    limit?: number;
    cursor?: string;
    categoryFilter?: string;
    seasonFilter?: string;
    searchText?: string;
  }) {
    try {
      const filter: any = {
        and: [
          {
            property: "User ID",
            rich_text: {
              equals: userId,
            },
          },
        ],
      };

      if (options?.categoryFilter) {
        filter.and.push({
          property: "Category",
          relation: {
            contains: options.categoryFilter,
          },
        });
      }

      if (options?.seasonFilter) {
        filter.and.push({
          property: "Season",
          multi_select: {
            contains: options.seasonFilter,
          },
        });
      }

      if (options?.searchText) {
        filter.and.push({
          or: [
            {
              property: "Name",
              title: {
                contains: options.searchText,
              },
            },
            {
              property: "Brand",
              rich_text: {
                contains: options.searchText,
              },
            },
            {
              property: "Notes",
              rich_text: {
                contains: options.searchText,
              },
            },
          ],
        });
      }

      const response = await this.client.databases.query({
        database_id: this.config.clothingDatabaseId,
        filter,
        page_size: options?.limit || 50,
        start_cursor: options?.cursor,
        sorts: [
          {
            property: "Created",
            direction: "descending",
          },
        ],
      });

      return response;
    } catch (error) {
      console.error("Notion API error getting clothing items:", error);
      throw error;
    }
  }

  async createOutfit(outfitData: {
    name: string;
    description?: string;
    clothingItemIds: string[];
    occasion?: string;
    season?: string;
    rating?: number;
    lastWorn?: Date;
    tags?: string[];
    userId: string;
  }) {
    try {
      const properties: any = {
        Name: {
          title: [
            {
              text: {
                content: outfitData.name,
              },
            },
          ],
        },
        "User ID": {
          rich_text: [
            {
              text: {
                content: outfitData.userId,
              },
            },
          ],
        },
      };

      if (outfitData.description) {
        properties.Description = {
          rich_text: [
            {
              text: {
                content: outfitData.description,
              },
            },
          ],
        };
      }

      if (outfitData.clothingItemIds.length > 0) {
        properties["Clothing Items"] = {
          relation: outfitData.clothingItemIds.map(id => ({ id })),
        };
      }

      if (outfitData.occasion) {
        properties.Occasion = {
          select: {
            name: outfitData.occasion,
          },
        };
      }

      if (outfitData.season) {
        properties.Season = {
          multi_select: [
            {
              name: outfitData.season,
            },
          ],
        };
      }

      if (outfitData.rating) {
        const stars = "⭐".repeat(outfitData.rating);
        properties.Rating = {
          select: {
            name: stars,
          },
        };
      }

      if (outfitData.lastWorn) {
        properties["Last Worn"] = {
          date: {
            start: outfitData.lastWorn.toISOString().split('T')[0],
          },
        };
      }

      if (outfitData.tags && outfitData.tags.length > 0) {
        properties.Tags = {
          multi_select: outfitData.tags.map(tag => ({ name: tag })),
        };
      }

      const response = await this.client.pages.create({
        parent: {
          database_id: this.config.outfitsDatabaseId,
        },
        properties,
      });

      return response;
    } catch (error) {
      console.error("Notion API error creating outfit:", error);
      throw error;
    }
  }

  async getOutfits(userId: string, options?: {
    limit?: number;
    cursor?: string;
    occasionFilter?: string;
    seasonFilter?: string;
    searchText?: string;
  }) {
    try {
      const filter: any = {
        and: [
          {
            property: "User ID",
            rich_text: {
              equals: userId,
            },
          },
        ],
      };

      if (options?.occasionFilter) {
        filter.and.push({
          property: "Occasion",
          select: {
            equals: options.occasionFilter,
          },
        });
      }

      if (options?.seasonFilter) {
        filter.and.push({
          property: "Season",
          multi_select: {
            contains: options.seasonFilter,
          },
        });
      }

      if (options?.searchText) {
        filter.and.push({
          or: [
            {
              property: "Name",
              title: {
                contains: options.searchText,
              },
            },
            {
              property: "Description",
              rich_text: {
                contains: options.searchText,
              },
            },
          ],
        });
      }

      const response = await this.client.databases.query({
        database_id: this.config.outfitsDatabaseId,
        filter,
        page_size: options?.limit || 50,
        start_cursor: options?.cursor,
        sorts: [
          {
            property: "Created",
            direction: "descending",
          },
        ],
      });

      return response;
    } catch (error) {
      console.error("Notion API error getting outfits:", error);
      throw error;
    }
  }

  async updateClothingItem(pageId: string, updates: Partial<{
    name: string;
    brand: string;
    color: string;
    size: string;
    season: string;
    price: number;
    notes: string;
    tags: string[];
  }>) {
    try {
      const properties: any = {};

      if (updates.name) {
        properties.Name = {
          title: [{ text: { content: updates.name } }],
        };
      }

      if (updates.brand) {
        properties.Brand = {
          rich_text: [{ text: { content: updates.brand } }],
        };
      }

      if (updates.color) {
        properties.Color = {
          select: { name: updates.color },
        };
      }

      if (updates.size) {
        properties.Size = {
          select: { name: updates.size },
        };
      }

      if (updates.season) {
        properties.Season = {
          multi_select: [{ name: updates.season }],
        };
      }

      if (updates.price !== undefined) {
        properties.Price = {
          number: updates.price,
        };
      }

      if (updates.notes) {
        properties.Notes = {
          rich_text: [{ text: { content: updates.notes } }],
        };
      }

      if (updates.tags) {
        properties.Tags = {
          multi_select: updates.tags.map(tag => ({ name: tag })),
        };
      }

      const response = await this.client.pages.update({
        page_id: pageId,
        properties,
      });

      return response;
    } catch (error) {
      console.error("Notion API error updating clothing item:", error);
      throw error;
    }
  }

  async deleteClothingItem(pageId: string) {
    try {
      const response = await this.client.pages.update({
        page_id: pageId,
        archived: true,
      });

      return response;
    } catch (error) {
      console.error("Notion API error deleting clothing item:", error);
      throw error;
    }
  }

  async updateOutfit(pageId: string, updates: Partial<{
    name: string;
    description: string;
    clothingItemIds: string[];
    occasion: string;
    season: string;
    rating: number;
    lastWorn: Date;
    tags: string[];
  }>) {
    try {
      const properties: any = {};

      if (updates.name) {
        properties.Name = {
          title: [{ text: { content: updates.name } }],
        };
      }

      if (updates.description) {
        properties.Description = {
          rich_text: [{ text: { content: updates.description } }],
        };
      }

      if (updates.clothingItemIds) {
        properties["Clothing Items"] = {
          relation: updates.clothingItemIds.map(id => ({ id })),
        };
      }

      if (updates.occasion) {
        properties.Occasion = {
          select: { name: updates.occasion },
        };
      }

      if (updates.season) {
        properties.Season = {
          multi_select: [{ name: updates.season }],
        };
      }

      if (updates.rating) {
        const stars = "⭐".repeat(updates.rating);
        properties.Rating = {
          select: { name: stars },
        };
      }

      if (updates.lastWorn) {
        properties["Last Worn"] = {
          date: {
            start: updates.lastWorn.toISOString().split('T')[0],
          },
        };
      }

      if (updates.tags) {
        properties.Tags = {
          multi_select: updates.tags.map(tag => ({ name: tag })),
        };
      }

      const response = await this.client.pages.update({
        page_id: pageId,
        properties,
      });

      return response;
    } catch (error) {
      console.error("Notion API error updating outfit:", error);
      throw error;
    }
  }

  async deleteOutfit(pageId: string) {
    try {
      const response = await this.client.pages.update({
        page_id: pageId,
        archived: true,
      });

      return response;
    } catch (error) {
      console.error("Notion API error deleting outfit:", error);
      throw error;
    }
  }
}