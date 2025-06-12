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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetupPasskeyPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSetupComplete, setIsSetupComplete] = useState(false);
	const [session, setSession] = useState<any>(null);
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			const sessionData = await authClient.getSession();
			if (!sessionData) {
				router.push("/login");
				return;
			}
			setSession(sessionData);
		};
		checkSession();
	}, [router]);

	const handleSetupPasskey = async () => {
		setIsLoading(true);
		try {
			await authClient.passkey.addPasskey();
			setIsSetupComplete(true);
		} catch (error) {
			console.error("Passkey setup error:", error);
			alert("パスキーの設定に失敗しました。もう一度お試しください。");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = () => {
		router.push("/");
	};

	const handleContinue = () => {
		router.push("/");
	};

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>読み込み中...</div>
			</div>
		);
	}

	if (isSetupComplete) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
				<Card className="w-full max-w-md border-green-200 bg-green-50">
					<CardHeader className="text-center">
						<CardTitle className="flex items-center justify-center gap-2 text-green-800">
							<span>✅</span>
							パスキーの設定が完了しました！
						</CardTitle>
						<CardDescription className="text-green-700">
							次回からはより安全で簡単にログインできます
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={handleContinue}
							className="w-full bg-green-600 text-white hover:bg-green-700"
						>
							アプリを開始
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-slate-800">
						<span>🔑</span>
						パスキーを設定しませんか？
					</CardTitle>
					<CardDescription className="text-slate-600">
						ようこそ、{session.user.name}さん！
						<br />
						パスキーを設定すると次回からより簡単にログインできます
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<h4 className="font-medium text-slate-800 text-sm">
							パスキーのメリット
						</h4>
						<ul className="space-y-1 text-slate-700 text-sm">
							<li>• 指紋や顔認証でワンタッチログイン</li>
							<li>• パスワードより安全</li>
							<li>• アカウント乗っ取りのリスクを大幅に削減</li>
							<li>• 複数デバイスで利用可能</li>
						</ul>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleSetupPasskey}
							disabled={isLoading}
							className="w-full bg-slate-800 text-white hover:bg-slate-700"
						>
							{isLoading ? "設定中..." : "🔑 パスキーを設定する"}
						</Button>
						<Button
							variant="outline"
							onClick={handleSkip}
							className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
						>
							後で設定する
						</Button>
					</div>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
						<p className="text-blue-800 text-xs">
							💡
							パスキーは一度設定すると、Googleアカウントなしでもログインできるようになります
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
