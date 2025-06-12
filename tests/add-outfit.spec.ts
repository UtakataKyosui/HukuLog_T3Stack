import { expect, test } from "@playwright/test";

test.describe("コーディネートの追加機能", () => {
	test.beforeEach(async ({ page }) => {
		// テスト前にホームページに移動
		await page.goto("/");

		// 事前に服を追加しておく（コーディネートには服が必要）
		await page.click("text=服の管理");
		await page.click("text=新しいお洋服を追加");

		// カテゴリを作成
		await page.click("text=+ 新しいカテゴリ");
		await page.fill('input[placeholder="例: パーカー"]', "テストトップス");
		await page.selectOption("select", "tops");
		await page.click("text=カテゴリ作成");
		await page.waitForTimeout(500);

		// 服を追加
		await page.fill('input[placeholder="例: 白いTシャツ"]', "テストシャツ");
		await page.selectOption("select", { label: "テストトップス" });
		await page.click("text=服を追加");
		await page.waitForTimeout(500);
	});

	test("新しいコーディネートを正常に追加できる", async ({ page }) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// コーディネートページが表示されることを確認
		await expect(page).toHaveURL("/outfits");
		await expect(page.locator("h1")).toContainText("コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// フォームモーダルが表示されることを確認
		await expect(page.locator("text=新しいコーディネートを作成")).toBeVisible();

		// コーディネート名を入力
		await page.fill('input[placeholder*="例:"]', "テストコーディネート");

		// 説明を入力
		await page.fill("textarea", "これはテスト用のコーディネートです");

		// シーンを選択
		await page.selectOption("select", "casual");

		// 季節を選択（2つ目のselectを指定）
		await page.selectOption("select:nth-of-type(2)", "spring");

		// 評価（星）をクリック
		await page.click(
			".fa-star:nth-of-type(4), .lucide-star:nth-of-type(4), button:has(svg):nth-of-type(4)",
		);

		// 最後に着用した日を入力
		await page.fill('input[type="date"]', "2024-01-15");

		// タグを入力
		await page.fill('input[placeholder*="タグ"]', "カジュアル, お気に入り");

		// 服を選択（事前に追加した服）
		await page.click("text=テストシャツ");

		// 作成ボタンをクリック
		await page.click("text=作成");

		// コーディネートが追加されたことを確認（モーダルが閉じる）
		await expect(page.locator("text=新しいコーディネートを作成")).toBeHidden();

		// 追加されたコーディネートが一覧に表示されることを確認
		await expect(page.locator("text=テストコーディネート")).toBeVisible();
	});

	test("必須項目が未入力の場合はコーディネートを追加できない", async ({
		page,
	}) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// 名前を入力せずに作成ボタンをクリック
		const createButton = page.locator("text=作成");
		await expect(createButton).toBeDisabled();

		// 名前だけ入力しても服が選択されていないと作成できない
		await page.fill('input[placeholder*="例:"]', "テストコーディネート");
		await expect(createButton).toBeDisabled();
	});

	test("服が登録されていない場合の表示確認", async ({ page }) => {
		// データベースをクリアするため、新しいセッションを開始
		await page.goto("/outfits");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// 服が登録されていない場合のメッセージが表示されることを確認
		// （実際のメッセージは実装に依存）
		await expect(page.locator("text=服が登録されていません")).toBeVisible();
	});

	test("評価機能が正常に動作する", async ({ page }) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// 3つ星をクリック
		await page.click("button:nth-of-type(3):has(svg)");

		// 3つ星が選択されていることを確認（CSSクラスや色の変化）
		// 実装によって確認方法は異なります
		const thirdStar = page.locator("button:nth-of-type(3):has(svg)");
		await expect(thirdStar).toHaveClass(/text-yellow-400/);
	});

	test("服の選択/選択解除が正常に動作する", async ({ page }) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// 服を選択
		const clothingItem = page.locator("text=テストシャツ").first();
		await clothingItem.click();

		// 選択されたことを確認（背景色の変化など）
		await expect(clothingItem.locator("..")).toHaveClass(/border-blue-200/);

		// 選択中の服数が表示されることを確認
		await expect(page.locator("text=選択中: 1 着")).toBeVisible();

		// 同じ服をクリックして選択解除
		await clothingItem.click();

		// 選択解除されたことを確認
		await expect(page.locator("text=選択中: 0 着")).toBeVisible();
	});

	test("フォームのキャンセル機能が正常に動作する", async ({ page }) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// フォームが表示されることを確認
		await expect(page.locator("text=新しいコーディネートを作成")).toBeVisible();

		// 何か入力
		await page.fill('input[placeholder*="例:"]', "キャンセルテスト");

		// キャンセルボタンをクリック
		await page.click("text=キャンセル");

		// モーダルが閉じることを確認
		await expect(page.locator("text=新しいコーディネートを作成")).toBeHidden();
	});

	test("タグの入力と表示が正常に動作する", async ({ page }) => {
		// コーディネートページに移動
		await page.click("text=コーディネート");

		// 「新しいコーディネートを作成」ボタンをクリック
		await page.click("text=新しいコーディネートを作成");

		// 必須項目を入力
		await page.fill('input[placeholder*="例:"]', "タグテストコーディネート");

		// 服を選択
		await page.click("text=テストシャツ");

		// タグを入力（カンマ区切り）
		await page.fill(
			'input[placeholder*="タグ"]',
			"カジュアル, デート, お気に入り",
		);

		// 作成ボタンをクリック
		await page.click("text=作成");

		// コーディネートが作成されたことを確認
		await expect(page.locator("text=タグテストコーディネート")).toBeVisible();

		// タグが正しく表示されることを確認
		await expect(page.locator("text=カジュアル")).toBeVisible();
		await expect(page.locator("text=デート")).toBeVisible();
		await expect(page.locator("text=お気に入り")).toBeVisible();
	});
});
