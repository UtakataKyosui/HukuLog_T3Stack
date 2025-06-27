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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Star, Lock, Link, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
							? "最高レベルのセキュリティと利便性を実現"
							: "安全で簡単な方法でログイン"}
					</CardDescription>

					{isExpired && (
						<div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
							<p className="text-orange-700 text-sm">
								⏰ セッションの有効期限が切れました。再度ログインしてください。
							</p>
						</div>
					)}

					{isSignUp && (
						<Alert className="mt-4 border-blue-200 bg-blue-50">
							<Star className="h-4 w-4 text-blue-600" />
							<AlertDescription className="text-blue-800">
								<div className="space-y-2">
									<p className="font-medium">🎯 推奨: Passkey + Notion 統合認証</p>
									<div className="grid grid-cols-2 gap-2 text-xs">
										<div className="flex items-center gap-1">
											<Lock className="h-3 w-3" />
											<span>最高セキュリティ</span>
										</div>
										<div className="flex items-center gap-1">
											<Link className="h-3 w-3" />
											<span>自由なデータ管理</span>
										</div>
									</div>
								</div>
							</AlertDescription>
						</Alert>
					)}

					{!isSignUp && (
						<div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
							<p className="text-green-700 text-sm">
								🔒 パスワードは不要です。生体認証で安全にログイン
							</p>
						</div>
					)}
				</CardHeader>
				<CardContent className="space-y-4">
					{isSignUp && (
						<div className="space-y-4">
							{/* 推奨統合認証セクション */}
							<div className="rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
								<div className="flex items-center gap-2 mb-3">
									<Star className="h-5 w-5 text-blue-600" />
									<span className="font-semibold text-blue-800">推奨: 完全認証セットアップ</span>
									<Badge className="bg-blue-600">おすすめ</Badge>
								</div>
								<p className="text-blue-700 text-sm mb-3">
									Passkey + Notionで最高レベルのセキュリティと利便性を実現
								</p>
								<div className="grid grid-cols-2 gap-3 text-xs">
									<div className="flex items-center gap-1">
										<CheckCircle className="h-3 w-3 text-green-600" />
										<span className="text-green-700">生体認証</span>
									</div>
									<div className="flex items-center gap-1">
										<CheckCircle className="h-3 w-3 text-green-600" />
										<span className="text-green-700">データ所有権</span>
									</div>
									<div className="flex items-center gap-1">
										<CheckCircle className="h-3 w-3 text-green-600" />
										<span className="text-green-700">パスワード不要</span>
									</div>
									<div className="flex items-center gap-1">
										<CheckCircle className="h-3 w-3 text-green-600" />
										<span className="text-green-700">自由編集</span>
									</div>
								</div>
								<p className="text-xs text-blue-600 mt-2">
									※ 最初に基本認証を行い、後で追加認証を段階的に設定します
								</p>
							</div>

							{/* 基本認証オプション */}
							<div className="space-y-3">
								<div className="text-center">
									<span className="text-sm text-gray-600">まず基本認証から開始</span>
								</div>
								
								<Button
									onClick={handlePasskeySignUpClick}
									className="w-full bg-slate-800 text-white hover:bg-slate-700"
									disabled={isLoading}
								>
									{isLoading ? "登録中..." : "🔑 Passkeyで始める"}
								</Button>

								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-slate-300 border-t" />
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="bg-white px-2 text-slate-500">または</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<Button
										onClick={handleGoogleAuthClick}
										variant="outline"
										className="border-slate-300 hover:bg-slate-50"
										disabled={isLoading}
									>
										{isLoading ? "登録中..." : "Google"}
									</Button>

									<Button
										onClick={handleNotionAuthClick}
										variant="outline"
										className="border-slate-300 hover:bg-slate-50"
										disabled={isLoading}
									>
										{isLoading ? "登録中..." : "Notion"}
									</Button>
								</div>
							</div>

							{/* 段階的セットアップの説明 */}
							<div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
								<h4 className="font-medium text-gray-800 text-sm mb-2">
									📋 セットアップフロー
								</h4>
								<div className="space-y-1 text-xs text-gray-600">
									<div className="flex items-center gap-2">
										<span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">1</span>
										<span>基本認証でアカウント作成</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="bg-gray-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">2</span>
										<span>プロフィール設定</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="bg-gray-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">3</span>
										<span>追加認証セットアップ（推奨）</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="bg-gray-400 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">4</span>
										<span>利用開始</span>
									</div>
								</div>
							</div>
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
