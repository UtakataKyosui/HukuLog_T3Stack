"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { addPasskey } from "@/lib/auth-utils";
import { useState } from "react";

interface PasskeySetupPromptProps {
	onComplete?: () => void;
	onDismiss?: () => void;
}

export function PasskeySetupPrompt({
	onComplete,
	onDismiss,
}: PasskeySetupPromptProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSetupComplete, setIsSetupComplete] = useState(false);

	const handleSetupPasskey = async () => {
		const result = await addPasskey(
			undefined,
			() => setIsLoading(true),
			() => setIsLoading(false),
			(error) => alert(`パスキーの設定に失敗しました: ${error}`)
		);
		
		if (result) {
			setIsSetupComplete(true);
			onComplete?.();
		}
	};

	if (isSetupComplete) {
		return (
			<Card className="border-green-200 bg-green-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-green-800">
						<span>✅</span>
						パスキーの設定が完了しました
					</CardTitle>
					<CardDescription className="text-green-700">
						次回からはより安全で簡単にログインできます
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-blue-800">
					<span>🔑</span>
					パスキーでさらに安全に
				</CardTitle>
				<CardDescription className="text-blue-700">
					Googleログインに加えて、パスキーを設定すると次回からより簡単にログインできます
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<h4 className="font-medium text-blue-800 text-sm">
						パスキーのメリット
					</h4>
					<ul className="space-y-1 text-blue-700 text-sm">
						<li>• 指紋や顔認証でワンタッチログイン</li>
						<li>• パスワードより安全</li>
						<li>• アカウント乗っ取りのリスクを大幅に削減</li>
						<li>• 複数デバイスで利用可能</li>
					</ul>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={handleSetupPasskey}
						disabled={isLoading}
						className="bg-blue-600 text-white hover:bg-blue-700"
					>
						{isLoading ? "設定中..." : "🔑 パスキーを設定する"}
					</Button>
					<Button
						variant="outline"
						onClick={onDismiss}
						className="border-blue-300 text-blue-700 hover:bg-blue-100"
					>
						後で設定
					</Button>
				</div>

				<div className="rounded-lg border border-blue-200 bg-blue-100 p-3">
					<p className="text-blue-800 text-xs">
						💡
						パスキーは一度設定すると、Googleアカウントなしでもログインできるようになります
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
