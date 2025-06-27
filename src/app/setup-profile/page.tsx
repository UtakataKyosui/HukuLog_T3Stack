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

export default function SetupProfilePage() {
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [session, setSession] = useState<{ user?: { id: string; name?: string } } | null>(null);
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			const sessionData = await authClient.getSession();
			if (!sessionData) {
				router.push("/login");
				return;
			}
			setSession(sessionData);

			// すでに名前が設定されている場合はホームにリダイレクト
			if (sessionData.user?.name) {
				router.push("/outfits");
			}
		};
		checkSession();
	}, [router]);

	const handleSave = async () => {
		if (!name.trim()) {
			alert("名前を入力してください");
			return;
		}

		setIsLoading(true);
		try {
			await authClient.updateUser({
				name: name.trim(),
			});

			// プロフィール設定完了後、メインページにリダイレクト
			router.push("/outfits");
		} catch (error) {
			console.error("Profile setup error:", error);
			alert("プロフィールの設定に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = () => {
		router.push("/outfits");
	};

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>読み込み中...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-theme-surface to-theme-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-theme-text">
						<span>👤</span>
						プロフィール設定
					</CardTitle>
					<CardDescription className="text-theme-text-secondary">
						ようこそ！アプリで使用する名前を設定してください
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="mb-2 block font-medium text-sm text-theme-text"
						>
							名前 <span className="text-red-500">*</span>
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="表示名を入力してください"
							className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-theme-text placeholder:text-theme-text-secondary focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary"
							disabled={isLoading}
							maxLength={50}
							onKeyDown={(e) => {
								if (e.key === "Enter" && name.trim()) {
									handleSave();
								}
							}}
						/>
						<p className="mt-1 text-theme-text-secondary text-xs">
							最大50文字まで入力できます
						</p>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleSave}
							disabled={isLoading || !name.trim()}
							className="w-full bg-theme-primary text-theme-background hover:bg-theme-secondary"
						>
							{isLoading ? "設定中..." : "プロフィールを設定"}
						</Button>
						<Button
							onClick={handleSkip}
							variant="outline"
							className="w-full border-theme-border text-theme-text hover:bg-theme-surface"
						>
							後で設定する
						</Button>
					</div>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
						<p className="text-blue-800 text-xs">
							💡 名前はいつでも設定画面から変更できます
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
