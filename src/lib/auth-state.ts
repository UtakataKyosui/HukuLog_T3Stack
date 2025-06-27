/**
 * 認証状態管理ユーティリティ
 *
 * 認証レベル:
 * 1. 基本認証: Google/Notion OAuth または 匿名+基本設定
 * 2. セキュア認証: Passkey追加
 * 3. データ連携: Notion連携設定
 * 4. 完全認証: Passkey + Notion 両方完了
 */

export type AuthLevel = 1 | 2 | 3 | 4;

export interface AuthStatus {
	level: AuthLevel;
	passkeyEnabled: boolean;
	notionEnabled: boolean;
	completedFeatures: string[];
	missingFeatures: string[];
	nextStep?: string;
	description: string;
}

export interface UserAuthData {
	passkeyEnabled: boolean;
	notionEnabled: boolean;
	notionAccessToken?: string | null;
	notionClothingDatabaseId?: string | null;
	notionOutfitsDatabaseId?: string | null;
	authLevel?: number;
}

/**
 * ユーザーの認証状態を分析し、AuthStatusを返す
 */
export function analyzeAuthStatus(user: UserAuthData): AuthStatus {
	const passkeyEnabled = user.passkeyEnabled || false;
	const notionComplete = !!(
		user.notionEnabled &&
		user.notionAccessToken &&
		user.notionClothingDatabaseId &&
		user.notionOutfitsDatabaseId
	);

	let level: AuthLevel;
	const completedFeatures: string[] = [];
	const missingFeatures: string[] = [];

	// 完了済み機能の確認
	if (passkeyEnabled) {
		completedFeatures.push("passkey");
	} else {
		missingFeatures.push("passkey");
	}

	if (notionComplete) {
		completedFeatures.push("notion");
	} else {
		missingFeatures.push("notion");
	}

	// 認証レベルの決定
	if (passkeyEnabled && notionComplete) {
		level = 4; // 完全認証
	} else if (passkeyEnabled && !notionComplete) {
		level = 2; // セキュア認証
	} else if (!passkeyEnabled && notionComplete) {
		level = 3; // データ連携
	} else {
		level = 1; // 基本認証
	}

	// 次のステップの提案
	let nextStep: string | undefined;
	let description: string;

	switch (level) {
		case 1:
			nextStep = "passkey-and-notion";
			description =
				"Passkeyとnotion連携を設定して、セキュリティと利便性を向上させましょう";
			break;
		case 2:
			nextStep = "notion";
			description =
				"Notion連携を設定して、データを自分のワークスペースで管理しましょう";
			break;
		case 3:
			nextStep = "passkey";
			description =
				"Passkeyを設定して、より安全で便利なログインを実現しましょう";
			break;
		case 4:
			description =
				"完全認証が完了しています。最高レベルのセキュリティと利便性をご利用いただけます";
			break;
	}

	return {
		level,
		passkeyEnabled,
		notionEnabled: notionComplete,
		completedFeatures,
		missingFeatures,
		nextStep,
		description,
	};
}

/**
 * 認証レベルに基づいて機能の使用可否を判定
 */
export function isFeatureEnabled(
	authStatus: AuthStatus,
	feature: string,
): boolean {
	switch (feature) {
		case "basic_clothing":
		case "basic_outfits":
			return authStatus.level >= 1;

		case "advanced_features":
			return authStatus.level >= 2;

		case "notion_sync":
			return authStatus.notionEnabled;

		case "secure_operations":
			return authStatus.passkeyEnabled;

		case "premium_features":
			return authStatus.level >= 4;

		default:
			return true;
	}
}

/**
 * 認証レベルの表示文字列を取得
 */
export function getAuthLevelDisplay(level: AuthLevel): string {
	switch (level) {
		case 1:
			return "基本認証";
		case 2:
			return "セキュア認証";
		case 3:
			return "データ連携";
		case 4:
			return "完全認証";
		default:
			return "不明";
	}
}

/**
 * 認証レベルのアイコンを取得
 */
export function getAuthLevelIcon(level: AuthLevel): string {
	switch (level) {
		case 1:
			return "🔐";
		case 2:
			return "🔑";
		case 3:
			return "🔗";
		case 4:
			return "⭐";
		default:
			return "❓";
	}
}

/**
 * 認証促進メッセージを生成
 */
export function getAuthPromptMessage(authStatus: AuthStatus): {
	title: string;
	message: string;
	actionText: string;
	actionUrl: string;
} {
	switch (authStatus.nextStep) {
		case "passkey":
			return {
				title: "Passkeyでより安全に",
				message: "生体認証で簡単・安全にログインできます",
				actionText: "Passkeyを設定する",
				actionUrl: "/settings/passkey",
			};

		case "notion":
			return {
				title: "Notionでデータを自由に管理",
				message: "自分のNotionワークスペースでデータを管理できます",
				actionText: "Notion連携を設定する",
				actionUrl: "/settings/storage",
			};

		case "passkey-and-notion":
			return {
				title: "認証を完全にセットアップ",
				message: "PasskeyとNotionを設定して最高の体験を実現しましょう",
				actionText: "セットアップを完了する",
				actionUrl: "/setup-complete-auth",
			};

		default:
			return {
				title: "認証完了",
				message: "すべての認証機能が利用可能です",
				actionText: "設定を確認する",
				actionUrl: "/settings",
			};
	}
}

/**
 * 認証設定の更新に必要なフィールドを計算
 */
export function calculateAuthUpdate(
	currentAuth: UserAuthData,
	updates: Partial<UserAuthData>,
): Partial<UserAuthData> {
	const merged = { ...currentAuth, ...updates };
	const newStatus = analyzeAuthStatus(merged);

	return {
		...updates,
		authLevel: newStatus.level,
		passkeyEnabled: newStatus.passkeyEnabled,
		notionEnabled: newStatus.notionEnabled,
		// 完全認証が初めて達成された場合のみauthCompletedAtを設定
		...(newStatus.level === 4 &&
			currentAuth.authLevel !== 4 && {
				authCompletedAt: new Date(),
			}),
	};
}
