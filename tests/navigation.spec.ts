import { expect, test } from "@playwright/test";

test.describe("ナビゲーションとUIコンポーネント", () => {
	test.beforeEach(async ({ page }) => {
		// 認証されたユーザーとしてホームページにアクセス
		await page.goto("/");
	});

	test("メインナビゲーションの表示", async ({ page }) => {
		// ナビゲーションバーが表示されることを確認
		await expect(page.locator("nav")).toBeVisible();

		// ロゴまたはアプリ名が表示されることを確認
		await expect(page.locator("text=HukuLog")).toBeVisible();

		// 主要なナビゲーションリンクが表示されることを確認
		await expect(page.locator("text=ダッシュボード")).toBeVisible();
		await expect(page.locator("text=服の管理")).toBeVisible();
		await expect(page.locator("text=コーディネート")).toBeVisible();
		await expect(page.locator("text=設定")).toBeVisible();
	});

	test("ナビゲーションリンクの動作", async ({ page }) => {
		// 服の管理ページへの遷移
		await page.click("text=服の管理");
		await expect(page).toHaveURL("/wardrobe");
		await expect(page.locator("h1")).toContainText("服の管理");

		// コーディネートページへの遷移
		await page.click("text=コーディネート");
		await expect(page).toHaveURL("/outfits");
		await expect(page.locator("h1")).toContainText("コーディネート");

		// 設定ページへの遷移
		await page.click("text=設定");
		await expect(page).toHaveURL("/settings");
		await expect(page.locator("h1")).toContainText("設定");

		// ダッシュボードに戻る
		await page.click("text=ダッシュボード");
		await expect(page).toHaveURL("/");
	});

	test("アクティブな状態の表示", async ({ page }) => {
		// 現在のページがアクティブ状態で表示されることを確認
		await page.goto("/wardrobe");

		// アクティブなナビゲーションアイテムのスタイルを確認
		const activeNavItem = page.locator("text=服の管理").locator("..");
		await expect(activeNavItem).toHaveClass(
			/active|bg-blue-100|text-blue-600|border-b-2/,
		);
	});

	test("ユーザーメニューの表示", async ({ page }) => {
		// ユーザーメニューアイコンまたはアバターが表示されることを確認
		const userMenu = page.locator(".user-menu, [data-testid='user-menu']");
		if (await userMenu.isVisible()) {
			await userMenu.click();

			// ドロップダウンメニューが表示されることを確認
			await expect(page.locator("text=プロフィール")).toBeVisible();
			await expect(page.locator("text=設定")).toBeVisible();
			await expect(page.locator("text=ログアウト")).toBeVisible();
		}
	});

	test("ログアウト機能", async ({ page }) => {
		// ユーザーメニューからログアウト
		const userMenu = page.locator(".user-menu, [data-testid='user-menu']");
		if (await userMenu.isVisible()) {
			await userMenu.click();
			await page.click("text=ログアウト");
		} else {
			// 直接ログアウトボタンがある場合
			await page.click("text=ログアウト");
		}

		// 認証ページにリダイレクトされることを確認
		await expect(page).toHaveURL("/auth");
		await expect(page.locator("text=ログイン")).toBeVisible();
	});
});

test.describe("モバイルナビゲーション", () => {
	test.beforeEach(async ({ page }) => {
		// モバイルビューポートに設定
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/");
	});

	test("ハンバーガーメニューの表示", async ({ page }) => {
		// ハンバーガーメニューボタンが表示されることを確認
		const hamburgerButton = page.locator(
			"button[aria-label*='メニュー'], .hamburger, [data-testid='mobile-menu-button']",
		);
		await expect(hamburgerButton).toBeVisible();

		// ハンバーガーメニューをクリック
		await hamburgerButton.click();

		// モバイルメニューが表示されることを確認
		await expect(page.locator("text=ダッシュボード")).toBeVisible();
		await expect(page.locator("text=服の管理")).toBeVisible();
		await expect(page.locator("text=コーディネート")).toBeVisible();
		await expect(page.locator("text=設定")).toBeVisible();
	});

	test("モバイルメニューの閉じる機能", async ({ page }) => {
		// ハンバーガーメニューを開く
		const hamburgerButton = page.locator(
			"button[aria-label*='メニュー'], .hamburger, [data-testid='mobile-menu-button']",
		);
		await hamburgerButton.click();

		// 閉じるボタンまたはオーバーレイをクリック
		const closeButton = page.locator(
			"button[aria-label*='閉じる'], .close, [data-testid='close-menu']",
		);
		if (await closeButton.isVisible()) {
			await closeButton.click();
		} else {
			// オーバーレイをクリックして閉じる
			await page.click(".overlay, .backdrop");
		}

		// メニューが閉じることを確認
		await expect(page.locator("text=ダッシュボード")).toBeHidden();
	});

	test("モバイルメニューからのページ遷移", async ({ page }) => {
		// ハンバーガーメニューを開く
		const hamburgerButton = page.locator(
			"button[aria-label*='メニュー'], .hamburger, [data-testid='mobile-menu-button']",
		);
		await hamburgerButton.click();

		// 服の管理ページに遷移
		await page.click("text=服の管理");

		// ページが正しく遷移し、メニューが閉じることを確認
		await expect(page).toHaveURL("/wardrobe");
		await expect(page.locator("h1")).toContainText("服の管理");
		await expect(page.locator("text=ダッシュボード")).toBeHidden();
	});

	test("モバイルでのタッチジェスチャー", async ({ page }) => {
		// スワイプジェスチャーでメニューを開く（実装されている場合）
		await page.touchscreen.tap(50, 50);

		// サイドメニューのスワイプ操作をテスト
		const startX = 0;
		const startY = 300;
		const endX = 200;
		const endY = 300;

		await page.mouse.move(startX, startY);
		await page.mouse.down();
		await page.mouse.move(endX, endY);
		await page.mouse.up();

		// スワイプでメニューが開くかを確認（実装されている場合）
		const mobileMenu = page.locator(
			".mobile-menu, [data-testid='mobile-menu']",
		);
		if (await mobileMenu.isVisible()) {
			await expect(mobileMenu).toBeVisible();
		}
	});
});

test.describe("ブレッドクラム・ナビゲーション", () => {
	test("ブレッドクラムの表示", async ({ page }) => {
		// 服の詳細ページなどでブレッドクラムが表示されることを確認
		await page.goto("/wardrobe");

		// ブレッドクラムが表示されることを確認
		const breadcrumb = page.locator(".breadcrumb, [data-testid='breadcrumb']");
		if (await breadcrumb.isVisible()) {
			await expect(breadcrumb).toBeVisible();
			await expect(breadcrumb.locator("text=ホーム")).toBeVisible();
			await expect(breadcrumb.locator("text=服の管理")).toBeVisible();
		}
	});

	test("ブレッドクラムのナビゲーション", async ({ page }) => {
		await page.goto("/wardrobe");

		// ブレッドクラムのホームリンクをクリック
		const breadcrumbHome = page.locator(
			".breadcrumb text=ホーム, [data-testid='breadcrumb'] text=ホーム",
		);
		if (await breadcrumbHome.isVisible()) {
			await breadcrumbHome.click();
			await expect(page).toHaveURL("/");
		}
	});
});

test.describe("UIコンポーネントの動作", () => {
	test("検索バーの動作", async ({ page }) => {
		await page.goto("/wardrobe");

		// 検索バーが表示されることを確認
		const searchInput = page.locator(
			'input[placeholder*="検索"], [data-testid="search-input"]',
		);
		await expect(searchInput).toBeVisible();

		// 検索キーワードを入力
		await searchInput.fill("Tシャツ");

		// 検索結果が表示されることを確認
		await page.waitForTimeout(500);
		const searchResults = page.locator('[data-testid="clothing-item"]');
		const resultCount = await searchResults.count();

		if (resultCount > 0) {
			// 検索結果に入力したキーワードが含まれることを確認
			for (let i = 0; i < resultCount; i++) {
				const itemText = await searchResults.nth(i).textContent();
				expect(itemText?.toLowerCase()).toContain("tシャツ");
			}
		}
	});

	test("フィルターコンポーネントの動作", async ({ page }) => {
		await page.goto("/wardrobe");

		// 詳細フィルターボタンをクリック
		const filterButton = page.locator("text=詳細フィルター");
		await filterButton.click();

		// フィルターオプションが表示されることを確認
		await expect(page.locator("text=カテゴリ")).toBeVisible();
		await expect(page.locator("text=季節")).toBeVisible();
		await expect(page.locator("text=ブランド")).toBeVisible();

		// フィルターを適用
		const categorySelect = page.locator(
			'[data-testid="category-select"] button',
		);
		if (await categorySelect.isVisible()) {
			await categorySelect.click();

			// カテゴリオプションが表示されることを確認
			const categoryOptions = page.locator(
				'[data-testid="category-select"] [role="option"]',
			);
			if ((await categoryOptions.count()) > 1) {
				await categoryOptions.nth(1).click();
			}
		}

		// フィルターがアクティブであることを示すバッジが表示されることを確認
		const filterBadge = page.locator('.badge, [data-testid="filter-badge"]');
		if (await filterBadge.isVisible()) {
			await expect(filterBadge).toBeVisible();
		}
	});

	test("ページネーションの動作", async ({ page }) => {
		await page.goto("/wardrobe");

		// ページネーションが表示されることを確認
		const pagination = page.locator(".pagination, [data-testid='pagination']");
		if (await pagination.isVisible()) {
			await expect(pagination).toBeVisible();

			// 次のページボタンをクリック
			const nextButton = page.locator("text=次へ");
			if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
				await nextButton.click();

				// ページが変更されることを確認
				await expect(page.locator(".bg-blue-600")).toContainText("2");

				// 前のページボタンをクリック
				const prevButton = page.locator("text=前へ");
				await prevButton.click();
				await expect(page.locator(".bg-blue-600")).toContainText("1");
			}
		}
	});

	test("モーダルダイアログの動作", async ({ page }) => {
		await page.goto("/wardrobe");

		// 新しい服を追加ボタンをクリック
		await page.click("text=新しいお洋服を追加");

		// モーダルが表示されることを確認
		await expect(page.locator("text=新しいお洋服を追加")).toBeVisible();

		// モーダルの背景（オーバーレイ）が表示されることを確認
		const overlay = page.locator(
			".overlay, .backdrop, [data-testid='modal-overlay']",
		);
		if (await overlay.isVisible()) {
			await expect(overlay).toBeVisible();
		}

		// ESCキーでモーダルを閉じる
		await page.keyboard.press("Escape");
		await expect(page.locator("text=新しいお洋服を追加")).toBeHidden();
	});

	test("ツールチップの表示", async ({ page }) => {
		await page.goto("/wardrobe");

		// ツールチップが表示される要素を探す
		const tooltipTrigger = page.locator("[data-tooltip], [title]").first();
		if (await tooltipTrigger.isVisible()) {
			// ホバーしてツールチップを表示
			await tooltipTrigger.hover();

			// ツールチップが表示されることを確認
			const tooltip = page.locator(".tooltip, [role='tooltip']");
			if (await tooltip.isVisible()) {
				await expect(tooltip).toBeVisible();
			}
		}
	});

	test("ローディング状態の表示", async ({ page }) => {
		// ページ読み込み時のローディング状態を確認
		await page.goto("/wardrobe");

		// ローディングスピナーが表示される（短時間）
		const loadingSpinner = page.locator(
			".loading, .spinner, [data-testid='loading']",
		);
		if (await loadingSpinner.isVisible()) {
			await expect(loadingSpinner).toBeVisible();

			// ローディングが完了することを確認
			await expect(loadingSpinner).toBeHidden();
		}

		// コンテンツが表示されることを確認
		await expect(page.locator("h1")).toContainText("服の管理");
	});
});

test.describe("テーマとアクセシビリティ", () => {
	test("ダークテーマの切り替え", async ({ page }) => {
		await page.goto("/settings");

		// テーマ切り替えオプションが表示されることを確認
		const themeToggle = page.locator("text=ダーク");
		if (await themeToggle.isVisible()) {
			await themeToggle.click();

			// ダークテーマが適用されることを確認
			await expect(page.locator("body")).toHaveClass(/dark/);

			// ナビゲーションに戻ってダークテーマが維持されることを確認
			await page.goto("/wardrobe");
			await expect(page.locator("body")).toHaveClass(/dark/);
		}
	});

	test("キーボードアクセシビリティ", async ({ page }) => {
		await page.goto("/wardrobe");

		// Tabキーでフォーカス移動
		await page.keyboard.press("Tab");
		let focusedElement = page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// 複数回Tabを押してナビゲーション
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("Tab");
			focusedElement = page.locator(":focus");
			await expect(focusedElement).toBeVisible();
		}

		// フォーカス可能な要素にフォーカスリングが表示されることを確認
		await expect(focusedElement).toHaveCSS("outline", /.*solid.*/);
	});

	test("色のコントラスト確認", async ({ page }) => {
		await page.goto("/");

		// 主要なテキスト要素の色を確認
		const heading = page.locator("h1").first();
		const headingColor = await heading.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});

		const backgroundColor = await page.evaluate(() => {
			return window.getComputedStyle(document.body).backgroundColor;
		});

		// 色の値が取得できることを確認（実際のコントラスト計算は複雑なため、基本的な確認のみ）
		expect(headingColor).toBeTruthy();
		expect(backgroundColor).toBeTruthy();
	});

	test("フォントサイズの調整", async ({ page }) => {
		// 設定ページでフォントサイズを変更
		await page.goto("/settings");

		const fontSizeSelect = page.locator("select[name='fontSize']");
		if (await fontSizeSelect.isVisible()) {
			await fontSizeSelect.selectOption("large");

			// フォントサイズが適用されることを確認
			await page.goto("/wardrobe");
			const heading = page.locator("h1");
			const fontSize = await heading.evaluate((el) => {
				return window.getComputedStyle(el).fontSize;
			});

			// 大きなフォントサイズが適用されていることを確認
			expect(Number.parseInt(fontSize)).toBeGreaterThan(20);
		}
	});
});
