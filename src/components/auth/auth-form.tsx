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
import { authClient, passkey } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);
	const [isPasskeyOnlySignUp, setIsPasskeyOnlySignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const router = useRouter();

	const handleEmailAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (isSignUp) {
				if (isPasskeyOnlySignUp) {
					// First create account with email/temporary password, then add passkey
					const tempPassword = crypto.randomUUID();
					await authClient.signUp.email({
						email,
						password: tempPassword,
						name,
					});
					// Then add a passkey to the account
					await authClient.passkey.addPasskey();
				} else {
					// Traditional email/password registration
					await authClient.signUp.email({
						email,
						password,
						name,
					});
				}
			} else {
				await authClient.signIn.email({
					email,
					password,
				});
			}
			router.push("/");
		} catch (error) {
			console.error("Authentication error:", error);
			alert(
				isPasskeyOnlySignUp
					? "パスキーでの登録に失敗しました。"
					: "認証に失敗しました。",
			);
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
			await authClient.signIn.passkey();
			router.push("/");
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
						ワードローブ管理にアクセス
					</CardDescription>
					{!isSignUp && (
						<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
							<p className="text-blue-700 text-sm">
								💡 パスキーでの簡単ログインも利用できます
							</p>
						</div>
					)}
				</CardHeader>
				<CardContent className="space-y-4">
					<form onSubmit={handleEmailAuth} className="space-y-4">
						{isSignUp && (
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
									required={isSignUp}
									className="border-slate-300 focus:border-slate-500"
								/>
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="email" className="text-slate-700">
								メールアドレス
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="email@example.com"
								autoComplete="username webauthn"
								required
								className="border-slate-300 focus:border-slate-500"
							/>
						</div>

						{!isPasskeyOnlySignUp && (
							<div className="space-y-2">
								<Label htmlFor="password" className="text-slate-700">
									パスワード
								</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="パスワードを入力"
									required={!isPasskeyOnlySignUp}
									className="border-slate-300 focus:border-slate-500"
								/>
							</div>
						)}

						<Button
							type="submit"
							className="w-full bg-slate-800 text-white hover:bg-slate-700"
							disabled={isLoading}
						>
							{isLoading
								? "処理中..."
								: isSignUp
									? isPasskeyOnlySignUp
										? "🔑 パスキーで新規登録"
										: "アカウント作成"
									: "ログイン"}
						</Button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-slate-300 border-t" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-slate-600">または</span>
						</div>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleGoogleAuth}
							variant="outline"
							className="w-full border-slate-300 hover:bg-slate-50"
							disabled={isLoading}
						>
							Googleでログイン
						</Button>

						<Button
							onClick={handlePasskeyAuth}
							variant="outline"
							className="w-full border-slate-300 hover:bg-slate-50"
							disabled={isLoading}
						>
							🔑 パスキーでログイン
						</Button>

						{isSignUp && !isPasskeyOnlySignUp && (
							<div className="text-center">
								<Button
									variant="link"
									onClick={() => setIsPasskeyOnlySignUp(true)}
									className="text-blue-600 text-sm hover:text-blue-800"
								>
									🔑 パスワードなしでパスキーのみで登録する
								</Button>
							</div>
						)}

						{isSignUp && isPasskeyOnlySignUp && (
							<div className="space-y-2 text-center">
								<p className="text-slate-600 text-sm">
									パスキーのみで登録します（パスワード不要）
								</p>
								<Button
									variant="link"
									onClick={() => setIsPasskeyOnlySignUp(false)}
									className="text-slate-500 text-sm hover:text-slate-700"
								>
									パスワードでの登録に戻る
								</Button>
							</div>
						)}
					</div>

					<div className="text-center">
						<Button
							variant="link"
							onClick={() => {
								setIsSignUp(!isSignUp);
								setIsPasskeyOnlySignUp(false);
								setPassword("");
							}}
							className="text-slate-600 hover:text-slate-800"
						>
							{isSignUp
								? "既にアカウントをお持ちですか？"
								: "アカウントを作成しますか？"}
						</Button>
					</div>

					{isSignUp && (
						<div
							className={`mt-4 rounded-lg border p-3 ${
								isPasskeyOnlySignUp
									? "border-blue-200 bg-blue-50"
									: "border-green-200 bg-green-50"
							}`}
						>
							<h4
								className={`mb-2 font-medium text-sm ${
									isPasskeyOnlySignUp ? "text-blue-800" : "text-green-800"
								}`}
							>
								{isPasskeyOnlySignUp
									? "パスキーのみで登録"
									: "パスキーについて"}
							</h4>
							<ul
								className={`space-y-1 text-xs ${
									isPasskeyOnlySignUp ? "text-blue-700" : "text-green-700"
								}`}
							>
								<li>• 指紋や顔認証でログイン</li>
								<li>• パスワードより安全</li>
								<li>• デバイスに安全に保存</li>
								{isPasskeyOnlySignUp && <li>• パスワードを覚える必要なし</li>}
							</ul>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
