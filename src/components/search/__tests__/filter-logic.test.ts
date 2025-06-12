import type { ClothingFilters, OutfitFilters } from "../search-filters";

// Mock data for testing
const mockClothingItems = [
	{
		id: 1,
		name: "ユニクロ ニット",
		brand: "ユニクロ",
		color: "白",
		categoryId: 1,
		season: "spring",
		tags: ["カジュアル", "普段着"],
		notes: "暖かくて着心地が良い",
		userId: "user1",
		createdAt: new Date("2024-01-01"),
	},
	{
		id: 2,
		name: "ZARAのジャケット",
		brand: "ZARA",
		color: "黒",
		categoryId: 3,
		season: "all",
		tags: ["フォーマル", "ビジネス"],
		notes: "オフィス用",
		userId: "user1",
		createdAt: new Date("2024-01-02"),
	},
	{
		id: 3,
		name: "夏のTシャツ",
		brand: "GU",
		color: "青",
		categoryId: 1,
		season: "summer",
		tags: ["カジュアル"],
		notes: null,
		userId: "user1",
		createdAt: new Date("2024-01-03"),
	},
];

const mockOutfits = [
	{
		id: 1,
		name: "オフィスカジュアル",
		description: "仕事用の服装",
		occasion: "work",
		season: "spring",
		rating: 4,
		tags: ["ビジネス", "カジュアル"],
		lastWorn: new Date("2024-01-01"),
		userId: "user1",
		createdAt: new Date("2024-01-01"),
	},
	{
		id: 2,
		name: "デートコーデ",
		description: "お出かけ用",
		occasion: "date",
		season: "all",
		rating: 5,
		tags: ["デート", "おしゃれ"],
		lastWorn: null,
		userId: "user1",
		createdAt: new Date("2024-01-02"),
	},
	{
		id: 3,
		name: "夏の外出",
		description: "暑い日用",
		occasion: "casual",
		season: "summer",
		rating: 3,
		tags: ["夏", "アウトドア"],
		lastWorn: new Date("2024-01-03"),
		userId: "user1",
		createdAt: new Date("2024-01-03"),
	},
];

// Helper function to simulate clothing filtering logic
function filterClothingItems(
	items: typeof mockClothingItems,
	filters: ClothingFilters,
) {
	return items.filter((item) => {
		// テキスト検索
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			const searchMatch =
				item.name.toLowerCase().includes(searchLower) ||
				item.brand?.toLowerCase().includes(searchLower) ||
				item.color?.toLowerCase().includes(searchLower) ||
				item.notes?.toLowerCase().includes(searchLower);
			if (!searchMatch) return false;
		}

		// カテゴリフィルター
		if (
			filters.category &&
			filters.category !== "all" &&
			item.categoryId.toString() !== filters.category
		) {
			return false;
		}

		// 季節フィルター
		if (filters.season && filters.season !== "all") {
			// "all-season"の場合は"all"値のアイテムを表示
			const targetSeason =
				filters.season === "all-season" ? "all" : filters.season;
			if (item.season !== targetSeason) {
				return false;
			}
		}

		// ブランドフィルター
		if (filters.brand) {
			const brandMatch = item.brand
				?.toLowerCase()
				.includes(filters.brand.toLowerCase());
			if (!brandMatch) return false;
		}

		// タグフィルター
		if (filters.tags.length > 0) {
			const hasMatchingTag = filters.tags.some((filterTag) =>
				item.tags?.some((itemTag) =>
					itemTag.toLowerCase().includes(filterTag.toLowerCase()),
				),
			);
			if (!hasMatchingTag) return false;
		}

		return true;
	});
}

// Helper function to simulate outfit filtering logic
function filterOutfits(items: typeof mockOutfits, filters: OutfitFilters) {
	return items.filter((outfit) => {
		// テキスト検索
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			const searchMatch =
				outfit.name.toLowerCase().includes(searchLower) ||
				outfit.description?.toLowerCase().includes(searchLower);
			if (!searchMatch) return false;
		}

		// 場面フィルター
		if (
			filters.occasion &&
			filters.occasion !== "all" &&
			outfit.occasion !== filters.occasion
		) {
			return false;
		}

		// 季節フィルター
		if (filters.season && filters.season !== "all") {
			// "all-season"の場合は"all"値のアイテムを表示
			const targetSeason =
				filters.season === "all-season" ? "all" : filters.season;
			if (outfit.season !== targetSeason) {
				return false;
			}
		}

		// 評価フィルター
		if (filters.rating && filters.rating !== "all") {
			const minRating = Number.parseInt(filters.rating);
			if (!outfit.rating || outfit.rating < minRating) {
				return false;
			}
		}

		// タグフィルター
		if (filters.tags.length > 0) {
			const hasMatchingTag = filters.tags.some((filterTag) =>
				outfit.tags?.some((itemTag) =>
					itemTag.toLowerCase().includes(filterTag.toLowerCase()),
				),
			);
			if (!hasMatchingTag) return false;
		}

		return true;
	});
}

describe("Clothing Filter Logic", () => {
	it("filters by search text correctly", () => {
		const filters: ClothingFilters = {
			search: "ニット",
			category: "all",
			season: "all",
			tags: [],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("ユニクロ ニット");
	});

	it("filters by brand correctly", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "all",
			tags: [],
			brand: "ユニクロ",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].brand).toBe("ユニクロ");
	});

	it("filters by category correctly", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "1",
			season: "all",
			tags: [],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(2);
		expect(result.every((item) => item.categoryId === 1)).toBe(true);
	});

	it("filters by season correctly", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "spring",
			tags: [],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].season).toBe("spring");
	});

	it('handles "all-season" filter correctly (shows items with season="all")', () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "all-season",
			tags: [],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].season).toBe("all");
		expect(result[0].name).toBe("ZARAのジャケット");
	});

	it("filters by tags correctly", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "all",
			tags: ["カジュアル"],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(2);
		expect(result.every((item) => item.tags?.includes("カジュアル"))).toBe(
			true,
		);
	});

	it("handles multiple filters correctly", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "spring",
			tags: ["カジュアル"],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("ユニクロ ニット");
	});

	it("returns all items when no filters are applied", () => {
		const filters: ClothingFilters = {
			search: "",
			category: "all",
			season: "all",
			tags: [],
			brand: "",
		};

		const result = filterClothingItems(mockClothingItems, filters);
		expect(result).toHaveLength(3);
	});
});

describe("Outfit Filter Logic", () => {
	it("filters by search text correctly", () => {
		const filters: OutfitFilters = {
			search: "オフィス",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("オフィスカジュアル");
	});

	it("filters by occasion correctly", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "work",
			season: "all",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].occasion).toBe("work");
	});

	it("filters by season correctly", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "spring",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].season).toBe("spring");
	});

	it('handles "all-season" filter correctly (shows outfits with season="all")', () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all-season",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].season).toBe("all");
		expect(result[0].name).toBe("デートコーデ");
	});

	it("filters by rating correctly", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "4",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(2);
		expect(result.every((outfit) => (outfit.rating || 0) >= 4)).toBe(true);
	});

	it("filters by tags correctly", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all",
			tags: ["デート"],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].tags?.includes("デート")).toBe(true);
	});

	it("handles multiple filters correctly", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "work",
			season: "spring",
			tags: ["ビジネス"],
			rating: "4",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("オフィスカジュアル");
	});

	it("returns all items when no filters are applied", () => {
		const filters: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(3);
	});

	it("handles edge case: filters that result in no matches", () => {
		const filters: OutfitFilters = {
			search: "non-existent",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "all",
		};

		const result = filterOutfits(mockOutfits, filters);
		expect(result).toHaveLength(0);
	});

	it("correctly handles filter value conflicts prevention", () => {
		// Test that "all" and "all-season" filters work as expected independently
		const allSeasonFilter: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all-season",
			tags: [],
			rating: "all",
		};

		const allFilter: OutfitFilters = {
			search: "",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "all",
		};

		const allSeasonResult = filterOutfits(mockOutfits, allSeasonFilter);
		const allResult = filterOutfits(mockOutfits, allFilter);

		// "all-season" should only show items with season="all"
		expect(allSeasonResult).toHaveLength(1);
		expect(allSeasonResult[0].season).toBe("all");

		// "all" should show all items regardless of season
		expect(allResult).toHaveLength(3);
	});
});
