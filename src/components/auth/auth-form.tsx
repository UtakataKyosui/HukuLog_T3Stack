"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	handleGoogleAuth,
	handleNotionAuth,
	handlePasskeyAuth,
	handlePasskeySignUp,
} from "@/lib/auth-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const isExpired = searchParams.get("expired") === "true";
	const [isSignUp, setIsSignUp] = useState(
		searchParams.get("mode") === "signup",
	);

	const handlePasskeySignUpClick = async () => {
		const result = await handlePasskeySignUp(
			() => setIsLoading(true),
			() => setIsLoading(false),
		);

		if (result) {
			// 成功後、プロフィール設定ページにリダイレクト
			router.push("/setup-profile");
		}
	};

	const handleGoogleAuthClick = async () => {
		await handleGoogleAuth(
			"/setup-profile",
			() => setIsLoading(true),
			() => setIsLoading(false),
		);
	};

	const handleNotionAuthClick = async () => {
		await handleNotionAuth(
			"/setup-profile",
			() => setIsLoading(true),
			() => setIsLoading(false),
		);
	};

	const handlePasskeyAuthClick = async () => {
		const result = await handlePasskeyAuth(
			() => setIsLoading(true),
			() => setIsLoading(false),
		);

		if (result) {
			router.push("/");
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
									🔑 パスキーのみでアカウント作成が可能
									<br />
									メールアドレス不要で、生体認証による安全な登録
								</p>
							</div>
							<Button
								onClick={handlePasskeySignUpClick}
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
									<span className="bg-white px-2 text-slate-500">または</span>
								</div>
							</div>

							<Button
								onClick={handleGoogleAuthClick}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "登録中..." : "Googleのみで新規登録"}
							</Button>

							<Button
								onClick={handleNotionAuthClick}
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
								onClick={handlePasskeyAuthClick}
								className="w-full bg-slate-800 text-white hover:bg-slate-700"
								disabled={isLoading}
							>
								{isLoading ? "ログイン中..." : "🔑 パスキーでログイン"}
							</Button>

							<Button
								onClick={handleGoogleAuthClick}
								variant="outline"
								className="w-full border-slate-300 hover:bg-slate-50"
								disabled={isLoading}
							>
								{isLoading ? "ログイン中..." : "Googleでログイン"}
							</Button>

							<Button
								onClick={handleNotionAuthClick}
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
