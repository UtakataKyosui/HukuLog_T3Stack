"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const isExpired = searchParams.get("expired") === "true";
	const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");

	const handlePasskeySignUp = async () => {
		setIsLoading(true);
		try {
			console.log("Starting Better Auth passkey signup...");
			
			// ステップ1: 匿名ユーザーとしてサインイン
			const anonymousResult = await authClient.signIn.anonymous();
			
			if (!anonymousResult?.data) {
				console.error("Anonymous signin result:", anonymousResult);
				throw new Error("匿名ユーザーの作成に失敗しました");
			}
			
			console.log("Anonymous user created successfully:", anonymousResult.data.user.id);
			
			// 少し待機してセッション確立を確実にする
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// ステップ2: パスキーを追加（Better Authの推奨方法）
			console.log("Adding passkey...");
			const passkeyResult = await authClient.passkey.addPasskey({
				name: "メインパスキー"
			});
			
			console.log("Passkey result:", passkeyResult);
			
			// Better Authのパスキー追加は成功時にvoidを返すか、エラー時にthrowする
			console.log("Passkey added successfully");
			
			// 成功後、プロフィール設定ページにリダイレクト
			router.push("/setup-profile");
			
		} catch (error) {
			console.error("Passkey signup error:", error);
			const errorMessage = error instanceof Error ? error.message : 'パスキー登録に失敗しました';
			
			// WebAuthnエラーのハンドリング
			if (errorMessage.includes('NotAllowedError') || errorMessage.includes('InvalidStateError')) {
				alert("パスキーの作成がキャンセルされました。もう一度お試しください。");
			} else if (errorMessage.includes('NotSupportedError')) {
				alert("お使いのブラウザまたはデバイスはパスキーをサポートしていません。Googleアカウントでの登録をお試しください。");
				// フォールバック: Googleで登録
				try {
					await authClient.signIn.social({
						provider: "google",
						callbackURL: "/setup-passkey",
					});
				} catch (googleError) {
					console.error("Google signup error:", googleError);
					alert("Googleでの登録も失敗しました。");
				}
			} else {
				alert(`パスキー登録エラー: ${errorMessage}`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleAuth = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/setup-profile",
			});
		} catch (error) {
			console.error("Google auth error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNotionAuth = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.oauth2({
				providerId: "notion",
				callbackURL: "/setup-profile",
			});
		} catch (error) {
			console.error("Notion auth error:", error);
			alert("Notionでのログインに失敗しました。");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasskeyAuth = async () => {
		setIsLoading(true);
		try {
			const result = await authClient.signIn.passkey();
			
			if (result?.error) {
				throw new Error(result.error.message);
			}
			
			router.push("/");
		} catch (error) {
			console.error("Passkey auth error:", error);
			alert("パスキーでのログインに失敗しました。パスキーが登録されているか確認してください。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-theme-surface to-theme-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="font-bold text-2xl text-theme-text">
						{isSignUp ? "アカウント作成" : "ログイン"}
					</CardTitle>
					<CardDescription className="text-theme-text-secondary">
						{isSignUp
							? "安全で簡単なパスキーでアカウント作成"
							: "安全で簡単な方法でログイン"}
					</CardDescription>

					{isExpired && (
						<div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
							<p className="text-orange-700 text-sm">
								⏰ セッションの有効期限が切れました。再度ログインしてください。
							</p>
						</div>
					)}

					<div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
						<p className="text-green-700 text-sm">
							🔒 パスワードは不要です。生体認証で安全にログイン
						</p>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{isSignUp && (
						<div className="space-y-4">
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
								<p className="text-blue-800 text-sm">
									🔑 パスキーのみでアカウント作成が可能<br />
									メールアドレス不要で、生体認証による安全な登録
								</p>
							</div>
							<Button
								onClick={handlePasskeySignUp}
								className="w-full bg-slate-800 text-white hover:bg-slate-700"
								disabled={isLoading}
							>
								{isLoading ? "登録中..." : "🔑 パスキーのみで新規登録"}
							</Button>
							
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-slate-300 border-t" />
								</div>
								<div className="relative flex justify-center text-xs">
									<span className="bg-white px-2 text-slate-500">
										または
									</span>
								</div>
							</div>
							
							<Button
								onClick={handleGoogleAuth}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "登録中..." : "Googleのみで新規登録"}
							</Button>
							
							<Button
								onClick={handleNotionAuth}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "登録中..." : "Notionで新規登録"}
							</Button>
						</div>
					)}

					{!isSignUp && (
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-slate-300 border-t" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-white px-2 text-slate-600">
									ログイン方法を選択
								</span>
							</div>
						</div>
					)}

					{!isSignUp && (
						<div className="space-y-3">
							<Button
								onClick={handlePasskeyAuth}
								className="w-full bg-slate-800 text-white hover:bg-slate-700"
								disabled={isLoading}
							>
								{isLoading ? "ログイン中..." : "🔑 パスキーでログイン"}
							</Button>

							<Button
								onClick={handleGoogleAuth}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "ログイン中..." : "Googleでログイン"}
							</Button>

							<Button
								onClick={handleNotionAuth}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "ログイン中..." : "Notionでログイン"}
							</Button>
						</div>
					)}

					<div className="text-center">
						<Button
							variant="link"
							onClick={() => setIsSignUp(!isSignUp)}
							className="text-slate-600 hover:text-slate-800"
						>
							{isSignUp
								? "既にアカウントをお持ちですか？"
								: "アカウントを作成しますか？"}
						</Button>
					</div>

					<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
						<h4 className="mb-2 font-medium text-blue-800 text-sm">
							🔑 パスキーについて
						</h4>
						<ul className="space-y-1 text-blue-700 text-xs">
							<li>• 指紋や顔認証でログイン</li>
							<li>• パスワードより安全</li>
							<li>• デバイスに安全に保存</li>
							<li>• パスワードを覚える必要なし</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
