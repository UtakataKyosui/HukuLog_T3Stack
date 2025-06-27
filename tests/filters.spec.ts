import { expect, test } from "@playwright/test";

test.describe("Clothing Filters", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/wardrobe");
	});

	test("should filter by search text", async ({ page }) => {
		// Wait for the search input to be visible
		await page.waitForSelector('input[placeholder="服を検索..."]');

		// Enter search text
		await page.fill('input[placeholder="服を検索..."]', "Tシャツ");

		// Wait for filtering to complete
		await page.waitForTimeout(500);

		// Check that the filtered results contain the search term
		const items = await page.locator('[data-testid="clothing-item"]').all();
		if (items.length > 0) {
			for (const item of items) {
				const text = await item.textContent();
				expect(text?.toLowerCase()).toContain("tシャツ");
			}
		}
	});

	test("should expand and use detailed filters", async ({ page }) => {
		// Click on detailed filters button
		await page.click('button:has-text("詳細フィルター")');

		// Verify that detailed filters are expanded
		await expect(page.locator("text=カテゴリ")).toBeVisible();
		await expect(page.locator("text=季節")).toBeVisible();
		await expect(page.locator("text=ブランド")).toBeVisible();
	});

	test("should filter by category", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Select a category (assuming there's at least one category)
		await page.click('[data-testid="category-select"] button');

		// Wait for dropdown to open and select first non-"all" option
		const categoryOptions = await page
			.locator('[data-testid="category-select"] [role="option"]')
			.all();
		if (categoryOptions.length > 1) {
			await categoryOptions[1].click();

			// Wait for filtering
			await page.waitForTimeout(500);

			// Verify filter badge is shown
			await expect(
				page.locator('button:has-text("詳細フィルター") .badge'),
			).toBeVisible();
		}
	});

	test("should filter by season", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Select spring season
		await page.click('[data-testid="season-select"] button');
		await page.click('[role="option"]:has-text("春")');

		// Wait for filtering
		await page.waitForTimeout(500);

		// Verify filter badge is shown
		await expect(
			page.locator('button:has-text("詳細フィルター") .badge'),
		).toBeVisible();
	});

	test("should filter by brand", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Enter brand name
		await page.fill('input[placeholder="ブランド名"]', "Nike");

		// Wait for filtering
		await page.waitForTimeout(500);

		// Check if any items are visible and contain the brand
		const items = await page.locator('[data-testid="clothing-item"]').all();
		if (items.length > 0) {
			for (const item of items) {
				const text = await item.textContent();
				expect(text?.toLowerCase()).toContain("nike");
			}
		}
	});

	test("should add and remove tags", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Add a new tag
		await page.fill('input[placeholder="タグ名"]', "casual");
		await page.click('button:has-text("追加")');

		// Verify tag appears in selected tags
		await expect(page.locator("text=選択中のタグ:")).toBeVisible();
		await expect(page.locator('.badge:has-text("#casual")')).toBeVisible();

		// Remove the tag
		await page.click('.badge:has-text("#casual") button');

		// Verify tag is removed
		await expect(page.locator('.badge:has-text("#casual")')).not.toBeVisible();
	});

	test("should reset all filters", async ({ page }) => {
		// Apply multiple filters
		await page.fill('input[placeholder="服を検索..."]', "test");
		await page.click('button:has-text("詳細フィルター")');
		await page.fill('input[placeholder="ブランド名"]', "Nike");

		// Click reset button
		await page.click('button:has-text("リセット")');

		// Verify all filters are cleared
		await expect(page.locator('input[placeholder="服を検索..."]')).toHaveValue(
			"",
		);
		await expect(page.locator('input[placeholder="ブランド名"]')).toHaveValue(
			"",
		);
		await expect(page.locator('button:has-text("リセット")')).not.toBeVisible();
	});

	test("should show filter count badge", async ({ page }) => {
		// Apply a filter
		await page.fill('input[placeholder="服を検索..."]', "test");

		// Expand detailed filters and apply more
		await page.click('button:has-text("詳細フィルター")');
		await page.fill('input[placeholder="ブランド名"]', "Nike");

		// Check that badge shows correct count
		const badge = page.locator('button:has-text("詳細フィルター") .badge');
		await expect(badge).toBeVisible();
		const badgeText = await badge.textContent();
		expect(Number.parseInt(badgeText || "0")).toBeGreaterThan(0);
	});

	test("should maintain filters when switching pages", async ({ page }) => {
		// Apply a search filter
		await page.fill('input[placeholder="服を検索..."]', "shirt");

		// Wait for filtering
		await page.waitForTimeout(500);

		// If pagination exists, click next page
		const nextButton = page.locator('button:has-text("次へ")');
		if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
			await nextButton.click();

			// Verify search filter is still applied
			await expect(
				page.locator('input[placeholder="服を検索..."]'),
			).toHaveValue("shirt");
		}
	});
});

test.describe("Outfit Filters", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/outfits");
	});

	test("should filter by search text", async ({ page }) => {
		// Wait for the search input to be visible
		await page.waitForSelector('input[placeholder="コーディネートを検索..."]');

		// Enter search text
		await page.fill(
			'input[placeholder="コーディネートを検索..."]',
			"カジュアル",
		);

		// Wait for filtering to complete
		await page.waitForTimeout(500);

		// Check that filtered results contain the search term
		const items = await page.locator('[data-testid="outfit-item"]').all();
		if (items.length > 0) {
			for (const item of items) {
				const text = await item.textContent();
				expect(text?.toLowerCase()).toContain("カジュアル");
			}
		}
	});

	test("should filter by occasion", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Select casual occasion
		await page.click('[data-testid="occasion-select"] button');
		await page.click('[role="option"]:has-text("カジュアル")');

		// Wait for filtering
		await page.waitForTimeout(500);

		// Verify filter badge is shown
		await expect(
			page.locator('button:has-text("詳細フィルター") .badge'),
		).toBeVisible();
	});

	test("should filter by rating", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Select 4+ star rating
		await page.click('[data-testid="rating-select"] button');
		await page.click('[role="option"]:has-text("⭐⭐⭐⭐ (4点以上)")');

		// Wait for filtering
		await page.waitForTimeout(500);

		// Verify filter badge is shown
		await expect(
			page.locator('button:has-text("詳細フィルター") .badge'),
		).toBeVisible();
	});

	test("should filter by season", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Select summer season
		await page.click('[data-testid="season-select"] button');
		await page.click('[role="option"]:has-text("夏")');

		// Wait for filtering
		await page.waitForTimeout(500);

		// Verify filter badge is shown
		await expect(
			page.locator('button:has-text("詳細フィルター") .badge'),
		).toBeVisible();
	});

	test("should add outfit tags and filter by them", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Add a new tag
		await page.fill('input[placeholder="タグ名"]', "date");
		await page.click('button:has-text("追加")');

		// Verify tag appears in selected tags
		await expect(page.locator("text=選択中のタグ:")).toBeVisible();
		await expect(page.locator('.badge:has-text("#date")')).toBeVisible();

		// Wait for filtering
		await page.waitForTimeout(500);
	});

	test("should use available tags for quick selection", async ({ page }) => {
		// Expand detailed filters
		await page.click('button:has-text("詳細フィルター")');

		// Check if available tags section exists
		const availableTagsSection = page.locator("text=利用可能なタグ:");
		if (await availableTagsSection.isVisible()) {
			// Click on first available tag
			const firstTag = page.locator(".bg-slate-100").first();
			if (await firstTag.isVisible()) {
				await firstTag.click();

				// Verify tag is added to selected tags
				await expect(page.locator("text=選択中のタグ:")).toBeVisible();
			}
		}
	});

	test("should reset all outfit filters", async ({ page }) => {
		// Apply multiple filters
		await page.fill('input[placeholder="コーディネートを検索..."]', "test");
		await page.click('button:has-text("詳細フィルター")');

		// Select an occasion
		await page.click('[data-testid="occasion-select"] button');
		await page.click('[role="option"]:has-text("カジュアル")');

		// Click reset button
		await page.click('button:has-text("リセット")');

		// Verify all filters are cleared
		await expect(
			page.locator('input[placeholder="コーディネートを検索..."]'),
		).toHaveValue("");
		await expect(page.locator('button:has-text("リセット")')).not.toBeVisible();
	});
});

test.describe("Pagination", () => {
	test("should navigate between pages in clothing list", async ({ page }) => {
		await page.goto("/wardrobe");

		// Check if pagination exists
		const nextButton = page.locator('button:has-text("次へ")');
		if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
			// Go to next page
			await nextButton.click();

			// Verify page changed
			await expect(page.locator(".bg-blue-600")).toContainText("2");

			// Go back to previous page
			await page.click('button:has-text("前へ")');
			await expect(page.locator(".bg-blue-600")).toContainText("1");
		}
	});

	test("should navigate between pages in outfit list", async ({ page }) => {
		await page.goto("/outfits");

		// Check if pagination exists
		const nextButton = page.locator('button:has-text("次へ")');
		if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
			// Go to next page
			await nextButton.click();

			// Verify page changed
			await expect(page.locator(".bg-blue-600")).toContainText("2");

			// Go back to previous page
			await page.click('button:has-text("前へ")');
			await expect(page.locator(".bg-blue-600")).toContainText("1");
		}
	});

	test("should show correct pagination info", async ({ page }) => {
		await page.goto("/wardrobe");

		// Check pagination info display
		const paginationInfo = page.locator("text=/件中.*件を表示/");
		await expect(paginationInfo).toBeVisible();
	});

	test("should use mobile pagination dropdown", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/wardrobe");

		// Check if mobile pagination dropdown exists
		const pageSelect = page.locator("select");
		if (await pageSelect.isVisible()) {
			// Select page 2 if available
			const options = await pageSelect.locator("option").all();
			if (options.length > 1) {
				await pageSelect.selectOption("2");

				// Verify page changed
				await expect(pageSelect).toHaveValue("2");
			}
		}
	});

	test("should reset to page 1 when filters change", async ({ page }) => {
		await page.goto("/wardrobe");

		// Go to page 2 if possible
		const nextButton = page.locator('button:has-text("次へ")');
		if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
			await nextButton.click();
			await expect(page.locator(".bg-blue-600")).toContainText("2");

			// Apply a filter
			await page.fill('input[placeholder="服を検索..."]', "test");
			await page.waitForTimeout(500);

			// Verify back to page 1
			await expect(page.locator(".bg-blue-600")).toContainText("1");
		}
	});
});
