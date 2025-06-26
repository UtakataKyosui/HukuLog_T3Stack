import { authClient } from "@/lib/auth-client";

/**
 * 認証関連のユーティリティ関数
 */

/**
 * 認証エラーを適切なメッセージに変換する
 */
export function getAuthErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const errorMessage = error.message;

		// WebAuthnエラーのハンドリング
		if (
			errorMessage.includes("NotAllowedError") ||
			errorMessage.includes("InvalidStateError")
		) {
			return "認証がキャンセルされました。もう一度お試しください。";
		}

		if (errorMessage.includes("NotSupportedError")) {
			return "お使いのブラウザまたはデバイスは、この認証方法をサポートしていません。";
		}

		return errorMessage;
	}

	return "認証エラーが発生しました";
}

/**
 * 認証ハンドラーの共通ラッパー
 */
export async function withAuthHandler<T>(
	handler: () => Promise<T>,
	options: {
		onStart?: () => void;
		onComplete?: () => void;
		onError?: (error: string) => void;
		errorPrefix?: string;
	} = {},
): Promise<T | null> {
	const { onStart, onComplete, onError, errorPrefix = "" } = options;

	try {
		onStart?.();
		const result = await handler();
		return result;
	} catch (error) {
		console.error("Auth handler error:", error);
		const errorMessage = getAuthErrorMessage(error);
		const fullErrorMessage = errorPrefix
			? `${errorPrefix}: ${errorMessage}`
			: errorMessage;

		if (onError) {
			onError(fullErrorMessage);
		} else {
			alert(fullErrorMessage);
		}

		return null;
	} finally {
		onComplete?.();
	}
}

/**
 * Notion OAuth認証を実行する
 */
export async function handleNotionAuth(
	callbackURL = "/setup-profile",
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<void> {
	await withAuthHandler(
		async () => {
			// @ts-ignore - Better AuthのgenericOAuth機能を使用
			await authClient.signIn.oauth2({
				providerId: "notion",
				callbackURL,
			});
		},
		{
			onStart,
			onComplete,
			onError,
			errorPrefix: "Notionでのログインに失敗しました",
		},
	);
}

/**
 * Google OAuth認証を実行する
 */
export async function handleGoogleAuth(
	callbackURL = "/setup-profile",
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<void> {
	await withAuthHandler(
		async () => {
			await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
		},
		{
			onStart,
			onComplete,
			onError,
			errorPrefix: "Googleでのログインに失敗しました",
		},
	);
}

/**
 * パスキーログインを実行する
 */
export async function handlePasskeyAuth(
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<any> {
	return await withAuthHandler(
		async () => {
			const result = await authClient.signIn.passkey();

			if (result?.error) {
				throw new Error(result.error.message);
			}

			return result;
		},
		{
			onStart,
			onComplete,
			onError,
			errorPrefix:
				"パスキーでのログインに失敗しました。パスキーが登録されているか確認してください",
		},
	);
}

/**
 * パスキーを追加する
 */
export async function addPasskey(
	name?: string,
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<any> {
	return await withAuthHandler(
		async () => {
			const options = name ? { name } : undefined;
			const result = await authClient.passkey.addPasskey(options);
			return result;
		},
		{
			onStart,
			onComplete,
			onError,
			errorPrefix: "パスキーの追加に失敗しました",
		},
	);
}

/**
 * パスキー新規登録（匿名ユーザー + パスキー追加）を実行する
 */
export async function handlePasskeySignUp(
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<any> {
	return await withAuthHandler(
		async () => {
			console.log("Starting Better Auth passkey signup...");

			// ステップ1: 匿名ユーザーとしてサインイン
			const anonymousResult = await authClient.signIn.anonymous();

			if (!anonymousResult?.data) {
				console.error("Anonymous signin result:", anonymousResult);
				throw new Error("匿名ユーザーの作成に失敗しました");
			}

			console.log(
				"Anonymous user created successfully:",
				anonymousResult.data.user.id,
			);

			// 少し待機してセッション確立を確実にする
			await new Promise((resolve) => setTimeout(resolve, 500));

			// ステップ2: パスキーを追加
			console.log("Adding passkey...");
			const passkeyResult = await authClient.passkey.addPasskey({
				name: "メインパスキー",
			});

			console.log("Passkey result:", passkeyResult);
			console.log("Passkey added successfully");

			return passkeyResult;
		},
		{
			onStart,
			onComplete,
			onError: (error) => {
				// WebAuthnエラーの特別なハンドリング
				if (
					error.includes("NotAllowedError") ||
					error.includes("InvalidStateError")
				) {
					if (onError) {
						onError(
							"パスキーの作成がキャンセルされました。もう一度お試しください。",
						);
					} else {
						alert(
							"パスキーの作成がキャンセルされました。もう一度お試しください。",
						);
					}
				} else if (error.includes("NotSupportedError")) {
					if (onError) {
						onError(
							"お使いのブラウザまたはデバイスはパスキーをサポートしていません。Googleアカウントでの登録をお試しください。",
						);
					} else {
						alert(
							"お使いのブラウザまたはデバイスはパスキーをサポートしていません。Googleアカウントでの登録をお試しください。",
						);
						// フォールバック: Googleで登録
						handleGoogleAuth("/setup-passkey").catch(console.error);
					}
				} else {
					if (onError) {
						onError(`パスキー登録エラー: ${error}`);
					} else {
						alert(`パスキー登録エラー: ${error}`);
					}
				}
			},
		},
	);
}

/**
 * ユーザー情報を更新する
 */
export async function updateUser(
	userData: { name?: string; [key: string]: any },
	onStart?: () => void,
	onComplete?: () => void,
	onError?: (error: string) => void,
): Promise<any> {
	return await withAuthHandler(
		async () => {
			const result = await authClient.updateUser(userData);
			return result;
		},
		{
			onStart,
			onComplete,
			onError,
			errorPrefix: "ユーザー情報の更新に失敗しました",
		},
	);
}
