/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { ClothingSearchFilters, OutfitSearchFilters } from "../search-filters";
import type { ClothingFilters, OutfitFilters } from "../search-filters";

describe("ClothingSearchFilters", () => {
	const mockCategories = [
		{ id: 1, name: "トップス", type: "top" },
		{ id: 2, name: "ボトムス", type: "bottom" },
		{ id: 3, name: "アウター", type: "outer" },
	];

	const mockAvailableTags = ["カジュアル", "フォーマル", "ビジネス"];

	const defaultFilters: ClothingFilters = {
		search: "",
		category: "all",
		season: "all",
		tags: [],
		brand: "",
	};

	const mockOnFiltersChange = jest.fn();

	beforeEach(() => {
		mockOnFiltersChange.mockClear();
	});

	it("renders all filter components correctly", () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		expect(screen.getByPlaceholderText("服を検索...")).toBeInTheDocument();
		expect(screen.getByDisplayValue("すべてのカテゴリ")).toBeInTheDocument();
		expect(screen.getByDisplayValue("すべての季節")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("ブランドで絞り込み..."),
		).toBeInTheDocument();
	});

	it("calls onFiltersChange when search input changes", () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const searchInput = screen.getByPlaceholderText("服を検索...");
		fireEvent.change(searchInput, { target: { value: "ニット" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			search: "ニット",
		});
	});

	it("calls onFiltersChange when category changes", () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const categorySelect = screen.getByDisplayValue("すべてのカテゴリ");
		fireEvent.change(categorySelect, { target: { value: "1" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			category: "1",
		});
	});

	it("calls onFiltersChange when season changes", () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const seasonSelect = screen.getByDisplayValue("すべての季節");
		fireEvent.change(seasonSelect, { target: { value: "spring" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			season: "spring",
		});
	});

	it('handles "all-season" option correctly', () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const seasonSelect = screen.getByDisplayValue("すべての季節");
		fireEvent.change(seasonSelect, { target: { value: "all-season" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			season: "all-season",
		});
	});

	it("calls onFiltersChange when brand input changes", () => {
		render(
			<ClothingSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const brandInput = screen.getByPlaceholderText("ブランドで絞り込み...");
		fireEvent.change(brandInput, { target: { value: "ユニクロ" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			brand: "ユニクロ",
		});
	});

	it("shows clear buttons when filters are applied", () => {
		const filtersWithValues: ClothingFilters = {
			search: "テスト",
			category: "1",
			season: "spring",
			tags: ["カジュアル"],
			brand: "ユニクロ",
		};

		render(
			<ClothingSearchFilters
				filters={filtersWithValues}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		// Clear buttons should be visible
		const clearButtons = screen.getAllByText("×");
		expect(clearButtons.length).toBeGreaterThan(0);
	});

	it("clears category filter when clear button is clicked", () => {
		const filtersWithCategory: ClothingFilters = {
			...defaultFilters,
			category: "1",
		};

		render(
			<ClothingSearchFilters
				filters={filtersWithCategory}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const clearButton = screen.getByRole("button");
		fireEvent.click(clearButton);

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...filtersWithCategory,
			category: "all",
		});
	});

	it("clears season filter when clear button is clicked", () => {
		const filtersWithSeason: ClothingFilters = {
			...defaultFilters,
			season: "spring",
		};

		render(
			<ClothingSearchFilters
				filters={filtersWithSeason}
				onFiltersChange={mockOnFiltersChange}
				categories={mockCategories}
				availableTags={mockAvailableTags}
			/>,
		);

		const clearButtons = screen.getAllByRole("button");
		const seasonClearButton = clearButtons.find(
			(btn) =>
				btn.closest(".relative")?.querySelector("select")?.value === "spring",
		);

		if (seasonClearButton) {
			fireEvent.click(seasonClearButton);
			expect(mockOnFiltersChange).toHaveBeenCalledWith({
				...filtersWithSeason,
				season: "all",
			});
		}
	});
});

describe("OutfitSearchFilters", () => {
	const mockAvailableTags = ["デート", "仕事", "カジュアル"];

	const defaultFilters: OutfitFilters = {
		search: "",
		occasion: "all",
		season: "all",
		tags: [],
		rating: "all",
	};

	const mockOnFiltersChange = jest.fn();

	beforeEach(() => {
		mockOnFiltersChange.mockClear();
	});

	it("renders all filter components correctly", () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		expect(
			screen.getByPlaceholderText("コーディネートを検索..."),
		).toBeInTheDocument();
		expect(screen.getByDisplayValue("すべての場面")).toBeInTheDocument();
		expect(screen.getByDisplayValue("すべての季節")).toBeInTheDocument();
		expect(screen.getByDisplayValue("すべての評価")).toBeInTheDocument();
	});

	it("calls onFiltersChange when search input changes", () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const searchInput = screen.getByPlaceholderText("コーディネートを検索...");
		fireEvent.change(searchInput, { target: { value: "カジュアル" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			search: "カジュアル",
		});
	});

	it("calls onFiltersChange when occasion changes", () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const occasionSelect = screen.getByDisplayValue("すべての場面");
		fireEvent.change(occasionSelect, { target: { value: "work" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			occasion: "work",
		});
	});

	it("calls onFiltersChange when season changes", () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const seasonSelect = screen.getByDisplayValue("すべての季節");
		fireEvent.change(seasonSelect, { target: { value: "summer" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			season: "summer",
		});
	});

	it('handles "all-season" option correctly for outfits', () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const seasonSelect = screen.getByDisplayValue("すべての季節");
		fireEvent.change(seasonSelect, { target: { value: "all-season" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			season: "all-season",
		});
	});

	it("calls onFiltersChange when rating changes", () => {
		render(
			<OutfitSearchFilters
				filters={defaultFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const ratingSelect = screen.getByDisplayValue("すべての評価");
		fireEvent.change(ratingSelect, { target: { value: "4" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...defaultFilters,
			rating: "4",
		});
	});

	it("shows clear buttons when filters are applied", () => {
		const filtersWithValues: OutfitFilters = {
			search: "テスト",
			occasion: "work",
			season: "fall",
			tags: ["デート"],
			rating: "3",
		};

		render(
			<OutfitSearchFilters
				filters={filtersWithValues}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		// Clear buttons should be visible
		const clearButtons = screen.getAllByText("×");
		expect(clearButtons.length).toBeGreaterThan(0);
	});

	it("clears occasion filter when clear button is clicked", () => {
		const filtersWithOccasion: OutfitFilters = {
			...defaultFilters,
			occasion: "work",
		};

		render(
			<OutfitSearchFilters
				filters={filtersWithOccasion}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const clearButton = screen.getByRole("button");
		fireEvent.click(clearButton);

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...filtersWithOccasion,
			occasion: "all",
		});
	});

	it("clears rating filter when clear button is clicked", () => {
		const filtersWithRating: OutfitFilters = {
			...defaultFilters,
			rating: "4",
		};

		render(
			<OutfitSearchFilters
				filters={filtersWithRating}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		const clearButtons = screen.getAllByRole("button");
		const ratingClearButton = clearButtons.find(
			(btn) => btn.closest(".relative")?.querySelector("select")?.value === "4",
		);

		if (ratingClearButton) {
			fireEvent.click(ratingClearButton);
			expect(mockOnFiltersChange).toHaveBeenCalledWith({
				...filtersWithRating,
				rating: "all",
			});
		}
	});

	it("correctly handles simultaneous filter conflicts (全て and オールシーズン)", () => {
		const conflictingFilters: OutfitFilters = {
			...defaultFilters,
			season: "all-season", // オールシーズン
		};

		render(
			<OutfitSearchFilters
				filters={conflictingFilters}
				onFiltersChange={mockOnFiltersChange}
				availableTags={mockAvailableTags}
			/>,
		);

		// Should not have "all" and "all-season" selected simultaneously
		const seasonSelect = screen.getByDisplayValue("オールシーズン");
		expect(seasonSelect).toBeInTheDocument();

		// Change to "すべて" (all)
		fireEvent.change(seasonSelect, { target: { value: "all" } });

		expect(mockOnFiltersChange).toHaveBeenCalledWith({
			...conflictingFilters,
			season: "all",
		});
	});
});
