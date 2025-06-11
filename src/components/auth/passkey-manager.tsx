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
import { api } from "@/trpc/react";
import { useState } from "react";

export function PasskeyManager() {
	const [isLoading, setIsLoading] = useState(false);
	
	const { data: passkeys, refetch: refetchPasskeys } = api.passkey.getMyPasskeys.useQuery();

	const addPasskey = async () => {
		setIsLoading(true);
		try {
			await authClient.passkey.addPasskey();
			await refetchPasskeys();
			alert("パスキーが追加されました！");
		} catch (error) {
			console.error("Failed to add passkey:", error);
			alert("パスキーの追加に失敗しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-slate-800">パスキー管理</CardTitle>
				<CardDescription>
					登録されたパスキーを管理し、新しいパスキーを追加できます
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<h4 className="font-medium text-slate-700">登録済みパスキー</h4>
					{passkeys && passkeys.length > 0 ? (
						<div className="space-y-2">
							{passkeys.map((pk) => (
								<div
									key={pk.id}
									className="rounded-lg border border-slate-200 p-3"
								>
									<div className="flex items-center justify-between">
										<div>
											<span className="font-medium">{pk.name}</span>
											<span className="ml-2 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
												{pk.deviceType}
											</span>
										</div>
										<span className="text-slate-500 text-sm">
											{new Date(pk.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-slate-500 text-sm">
							登録されたパスキーはありません
						</p>
					)}
				</div>

				<Button onClick={addPasskey} disabled={isLoading} className="w-full">
					{isLoading ? "追加中..." : "🔑 新しいパスキーを追加"}
				</Button>

				<div className="mt-4 text-slate-500 text-xs">
					<p>パスキーについて:</p>
					<ul className="mt-2 list-inside list-disc space-y-1">
						<li>生体認証（指紋、顔認証）やセキュリティキーでログイン</li>
						<li>パスワードより安全で簡単</li>
						<li>デバイスに安全に保存されます</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
