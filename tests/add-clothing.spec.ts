import { expect, test } from "@playwright/test";

test.describe("服の追加機能", () => {
	test.beforeEach(async ({ page }) => {
		// テスト前にホームページに移動
		await page.goto("/");

		// ログインが必要な場合はログインボタンをクリック
		// 実際のアプリではログイン処理が必要ですが、
		// テスト環境では認証をスキップするかモックする必要があります
	});

	test("新しい服を正常に追加できる", async ({ page }) => {
		// 服の管理ページに移動
		await page.click("text=服の管理");

		// 服の管理ページが表示されることを確認
		await expect(page).toHaveURL("/wardrobe");
		await expect(page.locator("h1")).toContainText("服の管理");

		// 「新しいお洋服を追加」ボタンをクリック
		await page.click("text=新しいお洋服を追加");

		// フォームモーダルが表示されることを確認
		await expect(page.locator("text=新しいお洋服を追加")).toBeVisible();

		// カテゴリを先に作成（カテゴリが存在しない場合）
		await page.click("text=+ 新しいカテゴリ");

		// カテゴリ名を入力
		await page.fill('input[placeholder="例: パーカー"]', "テストカテゴリ");

		// カテゴリタイプを選択
		await page.selectOption("select", "tops");

		// カテゴリ作成ボタンをクリック
		await page.click("text=カテゴリ作成");

		// カテゴリ作成完了を待つ
		await page.waitForTimeout(1000);

		// 服の情報を入力
		await page.fill('input[placeholder="例: 白いTシャツ"]', "テスト用Tシャツ");

		// 作成したカテゴリを選択
		await page.selectOption("select", { label: "テストカテゴリ" });

		// オプション情報を入力
		await page.fill('input[placeholder="例: ユニクロ"]', "テストブランド");
		await page.fill('input[placeholder="例: 白、ネイビー"]', "白");
		await page.fill('input[placeholder="例: M、L"]', "M");

		// 季節を選択
		await page.selectOption('select[aria-describedby="season-help"]', "spring");

		// 価格を入力
		await page.fill('input[placeholder="2980"]', "1980");

		// タグを入力
		await page.fill(
			'input[placeholder="例: カジュアル, お気に入り, 夏用"]',
			"テスト, カジュアル",
		);

		// メモを入力
		await page.fill(
			'textarea[placeholder="この服についてのメモや着こなしのポイントなど..."]',
			"これはテスト用の服です",
		);

		// 服を追加ボタンをクリック
		await page.click("text=服を追加");

		// 服が追加されたことを確認（モーダルが閉じる）
		await expect(page.locator("text=新しいお洋服を追加")).toBeHidden();

		// 追加された服が一覧に表示されることを確認
		await expect(page.locator("text=テスト用Tシャツ")).toBeVisible();
		await expect(page.locator("text=テストブランド")).toBeVisible();
		await expect(page.locator("text=白")).toBeVisible();
		await expect(page.locator("text=M")).toBeVisible();
	});

	test("必須項目が未入力の場合は服を追加できない", async ({ page }) => {
		// 服の管理ページに移動
		await page.click("text=服の管理");

		// 「新しいお洋服を追加」ボタンをクリック
		await page.click("text=新しいお洋服を追加");

		// 名前を入力せずに追加ボタンをクリック
		const addButton = page.locator("text=服を追加");
		await expect(addButton).toBeDisabled();

		// 名前だけ入力してもカテゴリが選択されていないと追加できない
		await page.fill('input[placeholder="例: 白いTシャツ"]', "テスト用Tシャツ");
		await expect(addButton).toBeDisabled();
	});

	test("カテゴリの新規作成が正常に動作する", async ({ page }) => {
		// 服の管理ページに移動
		await page.click("text=服の管理");

		// 「新しいお洋服を追加」ボタンをクリック
		await page.click("text=新しいお洋服を追加");

		// 新しいカテゴリボタンをクリック
		await page.click("text=+ 新しいカテゴリ");

		// カテゴリ作成フォームが表示されることを確認
		await expect(page.locator("text=カテゴリ名")).toBeVisible();
		await expect(page.locator("text=タイプ")).toBeVisible();

		// カテゴリ名を入力
		await page.fill('input[placeholder="例: パーカー"]', "E2Eテストカテゴリ");

		// カテゴリタイプを選択
		await page.selectOption("select", "bottoms");

		// カテゴリ作成ボタンをクリック
		await page.click("text=カテゴリ作成");

		// カテゴリ作成フォームが閉じることを確認
		await expect(
			page.locator('input[placeholder="例: パーカー"]'),
		).toBeHidden();

		// 作成したカテゴリがセレクトボックスに表示されることを確認
		await expect(page.locator("option[value]")).toContainText(
			"E2Eテストカテゴリ",
		);
	});

	test("フォームのキャンセル機能が正常に動作する", async ({ page }) => {
		// 服の管理ページに移動
		await page.click("text=服の管理");

		// 「新しいお洋服を追加」ボタンをクリック
		await page.click("text=新しいお洋服を追加");

		// フォームが表示されることを確認
		await expect(page.locator("text=新しいお洋服を追加")).toBeVisible();

		// 何か入力
		await page.fill('input[placeholder="例: 白いTシャツ"]', "キャンセルテスト");

		// キャンセルボタンをクリック
		await page.click("text=キャンセル");

		// モーダルが閉じることを確認
		await expect(page.locator("text=新しいお洋服を追加")).toBeHidden();
	});
});
