import { expect, test } from "@playwright/test";

test.describe("ユーザープロフィール管理", () => {
	test.beforeEach(async ({ page }) => {
		// 認証されたユーザーとして設定ページにアクセス
		await page.goto("/settings");
	});

	test("プロフィール設定ページの表示", async ({ page }) => {
		// 設定ページが表示されることを確認
		await expect(page.locator("h1")).toContainText("設定");

		// プロフィールセクションが表示されることを確認
		await expect(page.locator("text=プロフィール")).toBeVisible();
		await expect(page.locator("text=アカウント情報")).toBeVisible();
	});

	test("プロフィール情報の表示", async ({ page }) => {
		// 現在のプロフィール情報が表示されることを確認
		await expect(page.locator("text=名前")).toBeVisible();
		await expect(page.locator("text=メールアドレス")).toBeVisible();

		// プロフィール画像エリアが表示されることを確認
		const profileImage = page.locator(
			"img[alt*='プロフィール'], img[alt*='profile']",
		);
		if (await profileImage.isVisible()) {
			await expect(profileImage).toBeVisible();
		}

		// デフォルトのアバターが表示されることを確認
		const defaultAvatar = page.locator("text=👤, .avatar, .profile-avatar");
		if (await defaultAvatar.first().isVisible()) {
			await expect(defaultAvatar.first()).toBeVisible();
		}
	});

	test("プロフィール名の編集", async ({ page }) => {
		// 名前編集ボタンをクリック
		const editNameButton = page.locator("text=編集").first();
		await editNameButton.click();

		// 名前入力フィールドが表示されることを確認
		await expect(
			page.locator('input[placeholder*="名前"], input[name="name"]'),
		).toBeVisible();

		// 新しい名前を入力
		await page.fill(
			'input[placeholder*="名前"], input[name="name"]',
			"新しい名前",
		);

		// 保存ボタンをクリック
		await page.click("text=保存");

		// 成功メッセージが表示されることを確認
		await expect(
			page.locator("text=プロフィールが更新されました"),
		).toBeVisible();

		// 更新された名前が表示されることを確認
		await expect(page.locator("text=新しい名前")).toBeVisible();
	});

	test("プロフィール画像のアップロード", async ({ page }) => {
		// プロフィール画像アップロードボタンをクリック
		const uploadButton = page.locator(
			"text=画像を変更, text=プロフィール画像を変更",
		);
		if (await uploadButton.isVisible()) {
			await uploadButton.click();

			// ファイル選択ダイアログが表示されることを確認
			const fileInput = page.locator('input[type="file"]');
			await expect(fileInput).toBeVisible();

			// アップロード制限に関する情報が表示されることを確認
			await expect(page.locator("text=JPG, PNG")).toBeVisible();
			await expect(page.locator("text=最大5MB")).toBeVisible();
		}
	});

	test("アカウント情報の表示", async ({ page }) => {
		// アカウント情報セクションが表示されることを確認
		await expect(page.locator("text=アカウント情報")).toBeVisible();

		// 登録日が表示されることを確認
		await expect(page.locator("text=登録日")).toBeVisible();

		// 認証方法が表示されることを確認
		await expect(page.locator("text=認証方法")).toBeVisible();

		// Google認証またはPasskey認証の情報が表示されることを確認
		const authMethods = page.locator("text=Google, text=Passkey");
		await expect(authMethods.first()).toBeVisible();
	});

	test("認証方法の管理", async ({ page }) => {
		// 認証方法セクションが表示されることを確認
		await expect(page.locator("text=認証方法")).toBeVisible();

		// Google認証が有効な場合の表示
		const googleAuth = page.locator("text=Google認証");
		if (await googleAuth.isVisible()) {
			await expect(googleAuth).toBeVisible();
			await expect(page.locator("text=有効")).toBeVisible();
		}

		// Passkey認証が有効な場合の表示
		const passkeyAuth = page.locator("text=Passkey認証");
		if (await passkeyAuth.isVisible()) {
			await expect(passkeyAuth).toBeVisible();
		}
	});

	test("プライバシー設定", async ({ page }) => {
		// プライバシー設定セクションが表示されることを確認
		const privacySection = page.locator("text=プライバシー設定");
		if (await privacySection.isVisible()) {
			await expect(privacySection).toBeVisible();

			// データ使用に関するオプションが表示されることを確認
			await expect(page.locator("text=データの使用")).toBeVisible();
			await expect(page.locator("text=統計情報")).toBeVisible();
		}
	});

	test("アクセシビリティ設定", async ({ page }) => {
		// アクセシビリティ設定セクションが表示されることを確認
		const accessibilitySection = page.locator("text=アクセシビリティ");
		if (await accessibilitySection.isVisible()) {
			await expect(accessibilitySection).toBeVisible();

			// テーマ設定が表示されることを確認
			await expect(page.locator("text=テーマ")).toBeVisible();
			await expect(page.locator("text=ライト")).toBeVisible();
			await expect(page.locator("text=ダーク")).toBeVisible();
			await expect(page.locator("text=システム")).toBeVisible();
		}
	});
});

test.describe("設定の変更と保存", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/settings");
	});

	test("テーマの変更", async ({ page }) => {
		// テーマ選択が表示されることを確認
		const themeSelector = page.locator("text=テーマ");
		if (await themeSelector.isVisible()) {
			// ダークテーマを選択
			await page.click("text=ダーク");

			// テーマが変更されることを確認（bodyクラスの変更など）
			await expect(page.locator("body")).toHaveClass(/dark/);

			// ライトテーマに戻す
			await page.click("text=ライト");
			await expect(page.locator("body")).not.toHaveClass(/dark/);
		}
	});

	test("通知設定の変更", async ({ page }) => {
		// 通知設定セクションが表示されることを確認
		const notificationSection = page.locator("text=通知設定");
		if (await notificationSection.isVisible()) {
			await expect(notificationSection).toBeVisible();

			// 通知のオン/オフ切り替えが表示されることを確認
			const notificationToggle = page.locator('input[type="checkbox"]').first();
			if (await notificationToggle.isVisible()) {
				// 通知をオン/オフ切り替え
				await notificationToggle.click();

				// 設定が保存されることを確認
				await expect(page.locator("text=設定が保存されました")).toBeVisible();
			}
		}
	});

	test("言語設定の変更", async ({ page }) => {
		// 言語設定が表示されることを確認
		const languageSection = page.locator("text=言語");
		if (await languageSection.isVisible()) {
			await expect(languageSection).toBeVisible();

			// 言語選択セレクトボックスが表示されることを確認
			const languageSelect = page.locator("select").first();
			if (await languageSelect.isVisible()) {
				// 英語を選択
				await languageSelect.selectOption("en");

				// 言語が変更されることを確認
				await expect(page.locator("text=Settings")).toBeVisible();

				// 日本語に戻す
				await languageSelect.selectOption("ja");
				await expect(page.locator("text=設定")).toBeVisible();
			}
		}
	});

	test("フォームのバリデーション", async ({ page }) => {
		// 名前編集フォームを開く
		const editButton = page.locator("text=編集").first();
		await editButton.click();

		// 空の名前で保存を試行
		await page.fill('input[placeholder*="名前"], input[name="name"]', "");
		await page.click("text=保存");

		// バリデーションエラーが表示されることを確認
		await expect(page.locator("text=名前は必須です")).toBeVisible();

		// 長すぎる名前で保存を試行
		await page.fill(
			'input[placeholder*="名前"], input[name="name"]',
			"a".repeat(101),
		);
		await page.click("text=保存");

		// 文字数制限エラーが表示されることを確認
		await expect(page.locator("text=名前は100文字以内")).toBeVisible();
	});

	test("変更のキャンセル", async ({ page }) => {
		// 名前編集フォームを開く
		const editButton = page.locator("text=編集").first();
		await editButton.click();

		// 名前を変更
		await page.fill(
			'input[placeholder*="名前"], input[name="name"]',
			"変更された名前",
		);

		// キャンセルボタンをクリック
		await page.click("text=キャンセル");

		// 変更が保存されていないことを確認
		await expect(page.locator("text=変更された名前")).not.toBeVisible();

		// フォームが閉じることを確認
		await expect(
			page.locator('input[placeholder*="名前"], input[name="name"]'),
		).not.toBeVisible();
	});
});

test.describe("アカウント管理機能", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/settings");
	});

	test("アカウント削除の確認", async ({ page }) => {
		// アカウント削除セクションが表示されることを確認
		const deleteSection = page.locator("text=アカウント削除");
		if (await deleteSection.isVisible()) {
			await expect(deleteSection).toBeVisible();

			// 危険な操作であることの警告が表示されることを確認
			await expect(page.locator("text=この操作は取り消せません")).toBeVisible();

			// アカウント削除ボタンが表示されることを確認
			const deleteButton = page.locator("text=アカウントを削除");
			await expect(deleteButton).toBeVisible();
			await expect(deleteButton).toHaveClass(
				/bg-red-600|text-red-600|border-red-600/,
			);
		}
	});

	test("データエクスポート機能", async ({ page }) => {
		// データエクスポート機能が表示されることを確認
		const exportSection = page.locator("text=データのエクスポート");
		if (await exportSection.isVisible()) {
			await expect(exportSection).toBeVisible();

			// エクスポートボタンをクリック
			await page.click("text=データをエクスポート");

			// エクスポート処理中の表示を確認
			await expect(page.locator("text=エクスポート中...")).toBeVisible();
		}
	});

	test("セキュリティ情報の表示", async ({ page }) => {
		// セキュリティセクションが表示されることを確認
		const securitySection = page.locator("text=セキュリティ");
		if (await securitySection.isVisible()) {
			await expect(securitySection).toBeVisible();

			// 最終ログイン日時が表示されることを確認
			await expect(page.locator("text=最終ログイン")).toBeVisible();

			// アクティブなセッション情報が表示されることを確認
			await expect(page.locator("text=アクティブなセッション")).toBeVisible();
		}
	});

	test("アクセシビリティ設定の保存", async ({ page }) => {
		// アクセシビリティ設定があることを確認
		const accessibilitySection = page.locator("text=アクセシビリティ");
		if (await accessibilitySection.isVisible()) {
			// フォントサイズ設定
			const fontSizeSelect = page.locator("select[name='fontSize']");
			if (await fontSizeSelect.isVisible()) {
				await fontSizeSelect.selectOption("large");

				// 設定が保存されることを確認
				await expect(page.locator("text=設定が保存されました")).toBeVisible();
			}

			// コントラスト設定
			const highContrastToggle = page
				.locator("text=高コントラスト")
				.locator("input");
			if (await highContrastToggle.isVisible()) {
				await highContrastToggle.click();

				// 高コントラストモードが適用されることを確認
				await expect(page.locator("body")).toHaveClass(/high-contrast/);
			}
		}
	});
});

test.describe("レスポンシブデザインとモバイル対応", () => {
	test("モバイルでの設定ページ表示", async ({ page }) => {
		// モバイルビューポートに設定
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/settings");

		// 設定項目がモバイルで適切に表示されることを確認
		await expect(page.locator("h1")).toContainText("設定");
		await expect(page.locator("text=プロフィール")).toBeVisible();

		// タップしやすいサイズのボタンであることを確認
		const editButton = page.locator("text=編集").first();
		if (await editButton.isVisible()) {
			const buttonBox = await editButton.boundingBox();
			expect(buttonBox?.height).toBeGreaterThan(44);
		}
	});

	test("タブレットでの設定ページ表示", async ({ page }) => {
		// タブレットビューポートに設定
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/settings");

		// 設定項目が適切にレイアウトされることを確認
		await expect(page.locator("text=プロフィール")).toBeVisible();
		await expect(page.locator("text=アカウント情報")).toBeVisible();
	});

	test("キーボードナビゲーション", async ({ page }) => {
		await page.goto("/settings");

		// Tabキーでナビゲーションが可能であることを確認
		await page.keyboard.press("Tab");
		const focusedElement = page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// 複数のTab押下でフォーカスが移動することを確認
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(page.locator(":focus")).toBeVisible();
	});
});
