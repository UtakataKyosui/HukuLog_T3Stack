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
import { Edit, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserNameEditorProps {
	initialName?: string;
}

export function UserNameEditor({ initialName }: UserNameEditorProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState(initialName || "");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

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

			setIsEditing(false);
			router.refresh(); // ページをリフレッシュしてデータを更新
		} catch (error) {
			console.error("Name update error:", error);
			alert("名前の更新に失敗しました");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setName(initialName || "");
		setIsEditing(false);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-theme-text">
					<span>ユーザー名</span>
					{!isEditing && (
						<Button
							onClick={() => setIsEditing(true)}
							variant="outline"
							size="sm"
							className="flex items-center gap-2"
						>
							<Edit className="h-4 w-4" />
							編集
						</Button>
					)}
				</CardTitle>
				<CardDescription>
					表示名を設定してください。アプリ内でこの名前が表示されます。
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isEditing ? (
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="mb-2 block font-medium text-sm text-theme-text"
							>
								名前
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="名前を入力してください"
								className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-theme-text placeholder:text-theme-text-secondary focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary"
								disabled={isLoading}
								maxLength={50}
							/>
							<p className="mt-1 text-theme-text-secondary text-xs">
								最大50文字まで入力できます
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={handleSave}
								disabled={isLoading || !name.trim()}
								className="flex items-center gap-2 bg-theme-primary text-theme-background hover:bg-theme-secondary"
							>
								<Save className="h-4 w-4" />
								{isLoading ? "保存中..." : "保存"}
							</Button>
							<Button
								onClick={handleCancel}
								variant="outline"
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								<X className="h-4 w-4" />
								キャンセル
							</Button>
						</div>
					</div>
				) : (
					<div className="text-theme-text">
						{initialName ? (
							<span className="font-medium">{initialName}</span>
						) : (
							<span className="text-theme-text-secondary italic">
								名前が設定されていません
							</span>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
