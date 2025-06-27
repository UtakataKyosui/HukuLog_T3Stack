"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthStatusDisplay } from "@/components/auth/auth-status-display";
import { 
	CheckCircle, 
	Lock, 
	Link, 
	Star, 
	ArrowRight,
	AlertCircle 
} from "lucide-react";

export default function SetupCompleteAuthPage() {
	const router = useRouter();
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	
	const { 
		data: authStatus, 
		isLoading: authLoading, 
		refetch: refetchAuthStatus 
	} = api.authState.getAuthStatus.useQuery();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionData = await authClient.getSession();
				if (!sessionData) {
					router.push("/login");
					return;
				}
				setSession(sessionData);
			} catch (error) {
				console.error("Session check error:", error);
				router.push("/login");
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [router]);

	// 完全認証が完了している場合はメインページにリダイレクト
	useEffect(() => {
		if (authStatus && authStatus.level === 4) {
			router.push("/outfits");
		}
	}, [authStatus, router]);

	const handleSkipForNow = () => {
		// プロフィール設定が未完了の場合は設定画面へ
		if (!session?.user?.name) {
			router.push("/setup-profile");
		} else {
			router.push("/outfits");
		}
	};

	const handleSetupPasskey = () => {
		router.push("/setup-passkey?auto=true");
	};

	const handleSetupNotion = () => {
		router.push("/setup-storage");
	};

	const handleContinue = () => {
		if (!session?.user?.name) {
			router.push("/setup-profile");
		} else {
			router.push("/outfits");
		}
	};

	if (isLoading || authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-theme-primary border-b-2"></div>
					<div>認証状態を確認中...</div>
				</div>
			</div>
		);
	}

	if (!session || !authStatus) {
		return null; // リダイレクト中
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
			<div className="mx-auto max-w-2xl space-y-6 pt-8">
				{/* ヘッダー */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold text-gray-900">
						🎯 認証セットアップ
					</h1>
					<p className="text-gray-600">
						最高レベルのセキュリティと利便性を実現しましょう
					</p>
				</div>

				{/* 現在の認証状態 */}
				<AuthStatusDisplay variant="card" showPrompt={false} />

				{/* セットアップオプション */}
				<div className="grid gap-4">
					{/* Passkeyセットアップ */}
					{!authStatus.passkeyEnabled && (
						<Card className="border-blue-200 bg-blue-50">
							<CardHeader>
								<div className="flex items-center gap-3">
									<Lock className="h-6 w-6 text-blue-600" />
									<div className="flex-1">
										<CardTitle className="text-lg text-blue-900">
											Passkeyを設定
										</CardTitle>
										<CardDescription className="text-blue-700">
											生体認証で安全・簡単ログイン
										</CardDescription>
									</div>
									<Badge variant="secondary">未設定</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>指紋・顔認証</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>パスワード不要</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>デバイス同期</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>最高セキュリティ</span>
									</div>
								</div>
								<Button 
									onClick={handleSetupPasskey}
									className="w-full bg-blue-600 hover:bg-blue-700"
								>
									Passkeyを設定
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Notion連携セットアップ */}
					{!authStatus.notionEnabled && (
						<Card className="border-purple-200 bg-purple-50">
							<CardHeader>
								<div className="flex items-center gap-3">
									<Link className="h-6 w-6 text-purple-600" />
									<div className="flex-1">
										<CardTitle className="text-lg text-purple-900">
											Notion連携を設定
										</CardTitle>
										<CardDescription className="text-purple-700">
											自分のワークスペースでデータ管理
										</CardDescription>
									</div>
									<Badge variant="secondary">未設定</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 gap-3 text-sm">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>データ所有権</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>自由編集</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>他ツール連携</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span>バックアップ</span>
									</div>
								</div>
								<Button 
									onClick={handleSetupNotion}
									className="w-full bg-purple-600 hover:bg-purple-700"
								>
									Notion連携を設定
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					)}

					{/* 両方完了している場合 */}
					{authStatus.passkeyEnabled && authStatus.notionEnabled && (
						<Card className="border-green-200 bg-green-50">
							<CardHeader>
								<div className="flex items-center gap-3">
									<Star className="h-6 w-6 text-green-600" />
									<div className="flex-1">
										<CardTitle className="text-lg text-green-900">
											🎉 完全認証完了！
										</CardTitle>
										<CardDescription className="text-green-700">
											すべての認証機能が利用可能です
										</CardDescription>
									</div>
									<Badge className="bg-green-600">完了</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-green-700 mb-3">
									おめでとうございます！最高レベルのセキュリティと利便性を実現できました。
								</p>
								<Button 
									onClick={handleContinue}
									className="w-full bg-green-600 hover:bg-green-700"
								>
									アプリを開始
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				{/* 利便性の説明 */}
				{authStatus.level < 4 && (
					<Alert className="border-amber-200 bg-amber-50">
						<AlertCircle className="h-4 w-4 text-amber-600" />
						<AlertDescription className="text-amber-800">
							<p className="font-medium mb-1">なぜ統合認証がおすすめなのか？</p>
							<ul className="space-y-1 text-sm">
								<li>• <strong>Passkey</strong>: パスワードを覚える必要がなく、生体認証で瞬時にログイン</li>
								<li>• <strong>Notion連携</strong>: データを自分で管理でき、他のツールとも自由に連携</li>
								<li>• <strong>組み合わせ</strong>: セキュリティと利便性の両方を実現</li>
							</ul>
						</AlertDescription>
					</Alert>
				)}

				{/* スキップオプション */}
				<div className="text-center space-y-2">
					<Button 
						variant="outline" 
						onClick={handleSkipForNow}
						className="text-gray-600"
					>
						後で設定する
					</Button>
					<p className="text-xs text-gray-500">
						後からいつでも設定画面で追加できます
					</p>
				</div>
			</div>
		</div>
	);
}