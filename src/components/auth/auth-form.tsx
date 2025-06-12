"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);
	const [name, setName] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const isExpired = searchParams.get("expired") === "true";

	const handlePasskeySignUp = async () => {
		setIsLoading(true);
		try {
			// TODO: Fix passkey API integration
			alert("パスキー登録機能は現在準備中です。");
			// await authClient.signUp.passkey({
			// 	name,
			// });
			// router.push("/");
		} catch (error) {
			console.error("Passkey registration error:", error);
			alert("パスキーでの登録に失敗しました。");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleAuth = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: "/",
			});
		} catch (error) {
			console.error("Google auth error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasskeyAuth = async () => {
		setIsLoading(true);
		try {
			// TODO: Fix passkey API integration
			alert("パスキーログイン機能は現在準備中です。");
			// await authClient.signIn.passkey();
			// router.push("/");
		} catch (error) {
			console.error("Passkey auth error:", error);
			alert("パスキーでのログインに失敗しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="font-bold text-2xl text-slate-800">
						{isSignUp ? "アカウント作成" : "ログイン"}
					</CardTitle>
					<CardDescription className="text-slate-600">
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
							<div className="space-y-2">
								<Label htmlFor="name" className="text-slate-700">
									名前
								</Label>
								<Input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="お名前を入力"
									required
									className="border-slate-300 focus:border-slate-500"
								/>
							</div>
							<Button
								onClick={handlePasskeySignUp}
								className="w-full bg-slate-800 text-white hover:bg-slate-700"
								disabled={isLoading || !name.trim()}
							>
								{isLoading ? "登録中..." : "🔑 パスキーで新規登録"}
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
						</div>
					)}

					<div className="text-center">
						<Button
							variant="link"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setName("");
							}}
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
