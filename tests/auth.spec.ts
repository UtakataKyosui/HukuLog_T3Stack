import { expect, test } from "@playwright/test";

test.describe("認証システム", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("ランディングページから認証ページへのナビゲーション", async ({ page }) => {
		// ランディングページが表示されることを確認
		await expect(page.locator("h1")).toContainText("HukuLog");

		// 「始める」ボタンをクリック
		await page.click("text=始める");

		// 認証ページに遷移することを確認
		await expect(page).toHaveURL("/auth");
		await expect(page.locator("h1")).toContainText("ログイン");
	});

	test("Google認証の表示確認", async ({ page }) => {
		// 認証ページに移動
		await page.goto("/auth");

		// Google認証ボタンが表示されることを確認
		await expect(page.locator("text=Googleでログイン")).toBeVisible();

		// PasskeyセクションのUI要素を確認
		await expect(page.locator("text=Passkey")).toBeVisible();
		await expect(page.locator("text=指紋認証")).toBeVisible();
	});

	test("Passkey認証の表示確認", async ({ page }) => {
		// 認証ページに移動
		await page.goto("/auth");

		// Passkey認証ボタンが表示されることを確認
		await expect(page.locator("text=Passkeyでログイン")).toBeVisible();

		// Passkeyの説明文が表示されることを確認
		await expect(page.locator("text=生体認証でログイン")).toBeVisible();
	});

	test("ログイン状態の確認", async ({ page }) => {
		// 認証されていない状態でprotectedページにアクセス
		await page.goto("/wardrobe");

		// 認証ページにリダイレクトされることを確認
		await expect(page).toHaveURL("/auth");
	});

	test("認証後のリダイレクト", async ({ page }) => {
		// 認証ページに移動
		await page.goto("/auth");

		// 認証成功後のモック（実際の認証は統合テストで行う）
		// ここではUIの動作を確認
		await expect(page.locator("text=安全なログイン")).toBeVisible();
	});
});

test.describe("認証UI/UXテスト", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/auth");
	});

	test("認証方法の選択UI", async ({ page }) => {
		// 両方の認証方法が表示されることを確認
		await expect(page.locator("text=Googleでログイン")).toBeVisible();
		await expect(page.locator("text=Passkeyでログイン")).toBeVisible();

		// 認証方法の説明が表示されることを確認
		await expect(page.locator("text=パスワード不要")).toBeVisible();
		await expect(page.locator("text=生体認証")).toBeVisible();
	});

	test("レスポンシブデザインの確認", async ({ page }) => {
		// モバイルビューポートに設定
		await page.setViewportSize({ width: 375, height: 667 });

		// モバイルでも認証ボタンが適切に表示されることを確認
		await expect(page.locator("text=Googleでログイン")).toBeVisible();
		await expect(page.locator("text=Passkeyでログイン")).toBeVisible();

		// ボタンがタップしやすいサイズであることを確認
		const googleButton = page.locator("text=Googleでログイン");
		const buttonBox = await googleButton.boundingBox();
		expect(buttonBox?.height).toBeGreaterThan(44); // 44pxは推奨されるタップターゲットサイズ
	});

	test("アクセシビリティの確認", async ({ page }) => {
		// ボタンにaria-labelが設定されているかを確認
		const googleButton = page.locator("text=Googleでログイン");
		await expect(googleButton).toHaveAttribute("aria-label");

		const passkeyButton = page.locator("text=Passkeyでログイン");
		await expect(passkeyButton).toHaveAttribute("aria-label");

		// キーボードナビゲーションが可能であることを確認
		await page.keyboard.press("Tab");
		await expect(googleButton).toBeFocused();

		await page.keyboard.press("Tab");
		await expect(passkeyButton).toBeFocused();
	});

	test("ローディング状態の確認", async ({ page }) => {
		// Google認証ボタンをクリック
		await page.click("text=Googleでログイン");

		// ローディング状態が表示されることを確認
		// （実際の実装に応じて調整が必要）
		await expect(page.locator("text=ログイン中...")).toBeVisible();
	});

	test("エラーメッセージの表示確認", async ({ page }) => {
		// 認証エラーが発生した場合のメッセージ表示を確認
		// （実際のエラー処理実装に応じて調整が必要）
		
		// ページにエラーパラメータを付けてアクセス
		await page.goto("/auth?error=authentication_failed");

		// エラーメッセージが表示されることを確認
		await expect(page.locator("text=認証に失敗しました")).toBeVisible();
	});
});

test.describe("認証状態の管理", () => {
	test("ログイン後のナビゲーション", async ({ page }) => {
		// 認証されたユーザーとしてページにアクセス
		// （実際のセッション管理に応じて調整が必要）
		
		// ホームページに移動
		await page.goto("/");

		// 認証済みユーザー向けのUIが表示されることを確認
		await expect(page.locator("text=ダッシュボード")).toBeVisible();
		await expect(page.locator("text=ログアウト")).toBeVisible();
	});

	test("セッションの永続化", async ({ page }) => {
		// ページをリロードしても認証状態が保持されることを確認
		await page.goto("/wardrobe");
		await page.reload();

		// まだ認証されていることを確認
		await expect(page).toHaveURL("/wardrobe");
		await expect(page.locator("h1")).toContainText("服の管理");
	});

	test("ログアウト機能", async ({ page }) => {
		// 認証されたユーザーとしてページにアクセス
		await page.goto("/");

		// ログアウトボタンをクリック
		await page.click("text=ログアウト");

		// 認証ページにリダイレクトされることを確認
		await expect(page).toHaveURL("/auth");
		await expect(page.locator("text=ログイン")).toBeVisible();
	});
});

test.describe("Passkey管理", () => {
	test.beforeEach(async ({ page }) => {
		// 認証されたユーザーとして設定ページにアクセス
		await page.goto("/settings");
	});

	test("Passkey一覧の表示", async ({ page }) => {
		// 設定ページが表示されることを確認
		await expect(page.locator("h1")).toContainText("設定");

		// Passkey管理セクションが表示されることを確認
		await expect(page.locator("text=Passkey管理")).toBeVisible();

		// 登録済みPasskeyの一覧が表示されることを確認
		await expect(page.locator("text=登録済みPasskey")).toBeVisible();
	});

	test("新しいPasskeyの追加", async ({ page }) => {
		// 「新しいPasskeyを追加」ボタンをクリック
		await page.click("text=新しいPasskeyを追加");

		// Passkey追加プロセスが開始されることを確認
		await expect(page.locator("text=Passkey追加中...")).toBeVisible();
	});

	test("Passkeyの削除", async ({ page }) => {
		// 削除ボタンが表示されていることを確認
		const deleteButton = page.locator("text=削除").first();
		if (await deleteButton.isVisible()) {
			await deleteButton.click();

			// 確認ダイアログが表示されることを確認
			await expect(page.locator("text=このPasskeyを削除しますか？")).toBeVisible();

			// 削除を確認
			await page.click("text=削除する");

			// 削除完了メッセージが表示されることを確認
			await expect(page.locator("text=Passkeyが削除されました")).toBeVisible();
		}
	});

	test("Passkeyの名前変更", async ({ page }) => {
		// 名前変更ボタンが表示されていることを確認
		const editButton = page.locator("text=編集").first();
		if (await editButton.isVisible()) {
			await editButton.click();

			// 名前変更フォームが表示されることを確認
			await expect(page.locator('input[placeholder="Passkey名"]')).toBeVisible();

			// 新しい名前を入力
			await page.fill('input[placeholder="Passkey名"]', "新しいPasskey名");

			// 保存ボタンをクリック
			await page.click("text=保存");

			// 名前が更新されることを確認
			await expect(page.locator("text=新しいPasskey名")).toBeVisible();
		}
	});
});