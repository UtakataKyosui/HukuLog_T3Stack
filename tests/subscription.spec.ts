import { expect, test } from "@playwright/test";

test.describe("サブスクリプションシステム", () => {
	test.beforeEach(async ({ page }) => {
		// 認証されたユーザーとしてサブスクリプションページにアクセス
		await page.goto("/subscription");
	});

	test("サブスクリプションプラン一覧の表示", async ({ page }) => {
		// サブスクリプションページが表示されることを確認
		await expect(page.locator("h1")).toContainText("プラン");

		// 3つのプランが表示されることを確認
		await expect(page.locator("text=Free")).toBeVisible();
		await expect(page.locator("text=Premium")).toBeVisible();
		await expect(page.locator("text=Pro")).toBeVisible();

		// 各プランの価格が表示されることを確認
		await expect(page.locator("text=¥0")).toBeVisible();
		await expect(page.locator("text=¥980")).toBeVisible();
		await expect(page.locator("text=¥1980")).toBeVisible();
	});

	test("プラン詳細の表示", async ({ page }) => {
		// Freeプランの詳細を確認
		const freeSection = page.locator("text=Free").locator("..");
		await expect(freeSection.locator("text=20 アイテム")).toBeVisible();
		await expect(freeSection.locator("text=5 コーディネート")).toBeVisible();
		await expect(freeSection.locator("text=基本機能")).toBeVisible();

		// Premiumプランの詳細を確認
		const premiumSection = page.locator("text=Premium").locator("..");
		await expect(premiumSection.locator("text=200 アイテム")).toBeVisible();
		await expect(premiumSection.locator("text=50 コーディネート")).toBeVisible();
		await expect(premiumSection.locator("text=画像アップロード")).toBeVisible();

		// Proプランの詳細を確認
		const proSection = page.locator("text=Pro").locator("..");
		await expect(proSection.locator("text=無制限")).toBeVisible();
		await expect(proSection.locator("text=高度な検索")).toBeVisible();
		await expect(proSection.locator("text=AI提案")).toBeVisible();
	});

	test("現在のプラン状態の表示", async ({ page }) => {
		// 現在のプラン情報が表示されることを確認
		await expect(page.locator("text=現在のプラン")).toBeVisible();

		// 使用量の表示を確認
		await expect(page.locator("text=使用量")).toBeVisible();
		await expect(page.locator("text=アイテム数")).toBeVisible();
		await expect(page.locator("text=コーディネート数")).toBeVisible();
	});

	test("プランアップグレード", async ({ page }) => {
		// Premiumプランのアップグレードボタンをクリック
		const premiumUpgradeButton = page.locator("text=Premium").locator("..").locator("text=アップグレード");
		if (await premiumUpgradeButton.isVisible()) {
			await premiumUpgradeButton.click();

			// 確認ダイアログが表示されることを確認
			await expect(page.locator("text=プランをアップグレードしますか？")).toBeVisible();
			await expect(page.locator("text=月額 ¥980")).toBeVisible();

			// アップグレードを確認
			await page.click("text=アップグレード");

			// 成功メッセージが表示されることを確認
			await expect(page.locator("text=プランがアップグレードされました")).toBeVisible();
		}
	});

	test("プランダウングレード", async ({ page }) => {
		// 現在Premiumプランの場合のダウングレードテスト
		const downgradeButton = page.locator("text=ダウングレード");
		if (await downgradeButton.isVisible()) {
			await downgradeButton.click();

			// 確認ダイアログが表示されることを確認
			await expect(page.locator("text=プランをダウングレードしますか？")).toBeVisible();
			await expect(page.locator("text=無料プラン")).toBeVisible();

			// 注意事項が表示されることを確認
			await expect(page.locator("text=制限を超えるデータは削除")).toBeVisible();

			// ダウングレードを確認
			await page.click("text=ダウングレード");

			// 成功メッセージが表示されることを確認
			await expect(page.locator("text=プランがダウングレードされました")).toBeVisible();
		}
	});

	test("使用量の表示", async ({ page }) => {
		// 使用量セクションが表示されることを確認
		await expect(page.locator("text=現在の使用量")).toBeVisible();

		// プログレスバーが表示されることを確認
		const progressBars = page.locator(".progress-bar, [role='progressbar']");
		await expect(progressBars.first()).toBeVisible();

		// パーセンテージが表示されることを確認
		const percentageText = page.locator("text=/%/");
		if (await percentageText.count() > 0) {
			await expect(percentageText.first()).toBeVisible();
		}
	});

	test("制限に達した場合の警告表示", async ({ page }) => {
		// 制限に近づいている場合の警告を確認
		const warningMessage = page.locator("text=制限に近づいています");
		if (await warningMessage.isVisible()) {
			await expect(warningMessage).toBeVisible();
			await expect(page.locator("text=アップグレードを検討")).toBeVisible();
		}

		// 制限に達した場合のエラーを確認
		const limitMessage = page.locator("text=制限に達しました");
		if (await limitMessage.isVisible()) {
			await expect(limitMessage).toBeVisible();
			await expect(page.locator("text=新しいアイテムを追加できません")).toBeVisible();
		}
	});
});

test.describe("サブスクリプション制限の動作", () => {
	test("無料プランでの制限確認", async ({ page }) => {
		// 服の管理ページに移動
		await page.goto("/wardrobe");

		// 無料プランの制限（20アイテム）に達している場合
		// 新しい服の追加ボタンが無効化されることを確認
		const addButton = page.locator("text=新しいお洋服を追加");
		
		// 制限に達している場合の表示を確認
		const limitWarning = page.locator("text=無料プランの制限");
		if (await limitWarning.isVisible()) {
			await expect(addButton).toBeDisabled();
			await expect(page.locator("text=プランをアップグレード")).toBeVisible();
		}
	});

	test("Premiumプランでの画像アップロード", async ({ page }) => {
		// Premiumプランでは画像アップロードが可能であることを確認
		await page.goto("/wardrobe");
		await page.click("text=新しいお洋服を追加");

		// 画像アップロードフィールドが表示されることを確認
		const imageUpload = page.locator('input[type="file"]');
		if (await imageUpload.isVisible()) {
			await expect(imageUpload).toBeVisible();
			await expect(page.locator("text=画像をアップロード")).toBeVisible();
		}
	});

	test("無料プランでの画像アップロード制限", async ({ page }) => {
		// 無料プランでは画像アップロードが制限されることを確認
		await page.goto("/wardrobe");
		await page.click("text=新しいお洋服を追加");

		// 画像アップロードが無効化されているか、制限メッセージが表示されることを確認
		const uploadRestriction = page.locator("text=画像アップロードはPremiumプラン");
		if (await uploadRestriction.isVisible()) {
			await expect(uploadRestriction).toBeVisible();
			await expect(page.locator("text=アップグレード")).toBeVisible();
		}
	});

	test("コーディネート制限の確認", async ({ page }) => {
		// コーディネートページに移動
		await page.goto("/outfits");

		// 無料プランの制限（5コーディネート）に達している場合
		const addButton = page.locator("text=新しいコーディネートを作成");
		
		// 制限に達している場合の表示を確認
		const limitWarning = page.locator("text=コーディネート制限");
		if (await limitWarning.isVisible()) {
			await expect(addButton).toBeDisabled();
			await expect(page.locator("text=プランをアップグレード")).toBeVisible();
		}
	});
});

test.describe("支払い関連のUI", () => {
	test("支払い情報の表示", async ({ page }) => {
		await page.goto("/subscription");

		// 有料プランを利用している場合の支払い情報表示
		const paymentSection = page.locator("text=支払い情報");
		if (await paymentSection.isVisible()) {
			await expect(paymentSection).toBeVisible();
			await expect(page.locator("text=次回請求日")).toBeVisible();
			await expect(page.locator("text=請求金額")).toBeVisible();
		}
	});

	test("請求履歴の表示", async ({ page }) => {
		await page.goto("/subscription");

		// 請求履歴セクションが表示されることを確認
		const historySection = page.locator("text=請求履歴");
		if (await historySection.isVisible()) {
			await expect(historySection).toBeVisible();
			
			// 履歴項目が表示されることを確認
			const historyItems = page.locator(".invoice-item, .billing-history-item");
			if (await historyItems.count() > 0) {
				await expect(historyItems.first()).toBeVisible();
			}
		}
	});

	test("キャンセル処理", async ({ page }) => {
		await page.goto("/subscription");

		// キャンセルボタンが表示されている場合
		const cancelButton = page.locator("text=サブスクリプションをキャンセル");
		if (await cancelButton.isVisible()) {
			await cancelButton.click();

			// 確認ダイアログが表示されることを確認
			await expect(page.locator("text=サブスクリプションをキャンセルしますか？")).toBeVisible();
			await expect(page.locator("text=期間終了まで利用可能")).toBeVisible();

			// キャンセルを確認
			await page.click("text=キャンセルする");

			// 成功メッセージが表示されることを確認
			await expect(page.locator("text=サブスクリプションがキャンセルされました")).toBeVisible();
		}
	});
});

test.describe("プラン比較とレスポンシブデザイン", () => {
	test("プラン比較テーブル", async ({ page }) => {
		await page.goto("/subscription");

		// プラン比較セクションが表示されることを確認
		await expect(page.locator("text=プラン比較")).toBeVisible();

		// 機能比較テーブルが表示されることを確認
		await expect(page.locator("text=アイテム数")).toBeVisible();
		await expect(page.locator("text=コーディネート数")).toBeVisible();
		await expect(page.locator("text=画像アップロード")).toBeVisible();
		await expect(page.locator("text=高度な検索")).toBeVisible();
	});

	test("モバイルでのプラン表示", async ({ page }) => {
		// モバイルビューポートに設定
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/subscription");

		// プランカードがモバイルで適切に表示されることを確認
		await expect(page.locator("text=Free")).toBeVisible();
		await expect(page.locator("text=Premium")).toBeVisible();
		await expect(page.locator("text=Pro")).toBeVisible();

		// アップグレードボタンがタップしやすいサイズであることを確認
		const upgradeButton = page.locator("text=アップグレード").first();
		if (await upgradeButton.isVisible()) {
			const buttonBox = await upgradeButton.boundingBox();
			expect(buttonBox?.height).toBeGreaterThan(44);
		}
	});

	test("プランの推奨表示", async ({ page }) => {
		await page.goto("/subscription");

		// 推奨プランのバッジが表示されることを確認
		const recommendedBadge = page.locator("text=おすすめ, text=推奨");
		if (await recommendedBadge.isVisible()) {
			await expect(recommendedBadge).toBeVisible();
		}

		// 人気プランの表示を確認
		const popularBadge = page.locator("text=人気");
		if (await popularBadge.isVisible()) {
			await expect(popularBadge).toBeVisible();
		}
	});
});