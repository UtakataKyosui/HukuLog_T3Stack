"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { Check, Edit2, Upload, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ProfileEditorProps {
	initialName?: string | null;
	authMethod?: string;
	userEmail?: string | null;
}

export function ProfileEditor({
	initialName,
	authMethod,
	userEmail,
}: ProfileEditorProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState(initialName || "");
	const [isSavingName, setIsSavingName] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const { theme } = useTheme();

	const { data: profile, refetch: refetchProfile } =
		api.user.getProfile.useQuery();
	const updateProfile = api.user.updateProfile.useMutation({
		onSuccess: () => {
			refetchProfile();
			router.refresh(); // セッションを更新するため
		},
	});

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// ファイルサイズチェック (5MB)
		if (file.size > 5 * 1024 * 1024) {
			alert(
				"ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。",
			);
			return;
		}

		// ファイルタイプチェック
		if (!file.type.startsWith("image/")) {
			alert("画像ファイルのみアップロード可能です。");
			return;
		}

		// プレビュー表示
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewUrl(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		handleUpload(file);
	};

	const handleUpload = async (file: File) => {
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "アップロードに失敗しました");
			}

			const { url } = await response.json();

			// プロフィールを更新
			await updateProfile.mutateAsync({ image: url });

			alert("プロフィール画像を更新しました！");
		} catch (error) {
			console.error("Upload error:", error);
			alert("アップロードに失敗しました。もう一度お試しください。");
			setPreviewUrl(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleRemoveImage = async () => {
		if (confirm("プロフィール画像を削除してもよろしいですか？")) {
			try {
				await updateProfile.mutateAsync({ image: "" });
				setPreviewUrl(null);
				alert("プロフィール画像を削除しました。");
			} catch (error) {
				console.error("Remove image error:", error);
				alert("画像の削除に失敗しました。");
			}
		}
	};

	const handleNameSave = async () => {
		if (!name.trim()) {
			alert("名前を入力してください。");
			return;
		}

		setIsSavingName(true);
		try {
			await authClient.updateUser({
				name: name.trim(),
			});
			setIsEditingName(false);
			router.refresh(); // セッションを更新
			alert("名前を更新しました！");
		} catch (error) {
			console.error("Name update error:", error);
			alert("名前の更新に失敗しました。");
		} finally {
			setIsSavingName(false);
		}
	};

	const handleNameCancel = () => {
		setName(initialName || "");
		setIsEditingName(false);
	};

	const currentImage = previewUrl || profile?.image;

	// テーマに応じたテキスト色を決定
	const getInputTextColor = () => {
		switch (theme) {
			case "dark":
			case "high-contrast":
				return "text-gray-900"; // ダークテーマでは濃いグレー
			case "light":
			case "eye-friendly":
			default:
				return "text-gray-900"; // ライトテーマでは濃いグレー
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					プロフィールセクション
				</CardTitle>
				<CardDescription>
					プロフィール画像とユーザー名を設定してください
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* メインプロフィールセクション */}
				<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
					{/* プロフィール画像 */}
					<div className="flex flex-col items-center gap-3">
						<div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-slate-200 bg-slate-100 sm:h-32 sm:w-32">
							{currentImage ? (
								<img
									src={currentImage}
									alt="プロフィール画像"
									className="h-full w-full object-cover"
								/>
							) : (
								<User className="h-8 w-8 text-slate-400 sm:h-12 sm:w-12" />
							)}
						</div>

						<div className="flex flex-col gap-2">
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileSelect}
								accept="image/*"
								className="hidden"
							/>

							<Button
								onClick={() => fileInputRef.current?.click()}
								disabled={isUploading}
								size="sm"
								className="text-xs"
							>
								<Upload className="mr-1 h-3 w-3" />
								{isUploading ? "アップロード中..." : "画像を選択"}
							</Button>

							{currentImage && (
								<Button
									variant="outline"
									onClick={handleRemoveImage}
									disabled={updateProfile.isPending}
									size="sm"
									className="border-red-200 text-red-600 text-xs hover:bg-red-50"
								>
									<X className="mr-1 h-3 w-3" />
									削除
								</Button>
							)}
						</div>
					</div>

					{/* ユーザー情報とアカウント情報 */}
					<div className="w-full flex-1 space-y-4 sm:w-auto">
						{/* ユーザー名編集 */}
						<div>
							<h3 className="mb-2 font-medium text-theme-text">ユーザー名</h3>
							<div className="flex items-center gap-2">
								{isEditingName ? (
									<>
										<Input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="ユーザー名を入力"
											className={`flex-1 ${getInputTextColor()}`}
											maxLength={50}
											disabled={isSavingName}
										/>
										<Button
											onClick={handleNameSave}
											disabled={isSavingName || !name.trim()}
											size="sm"
										>
											<Check className="h-4 w-4" />
										</Button>
										<Button
											onClick={handleNameCancel}
											variant="outline"
											disabled={isSavingName}
											size="sm"
										>
											<X className="h-4 w-4" />
										</Button>
									</>
								) : (
									<>
										<div
											className={`flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ${getInputTextColor()}`}
										>
											{name || "名前が設定されていません"}
										</div>
										<Button
											onClick={() => setIsEditingName(true)}
											variant="outline"
											size="sm"
										>
											<Edit2 className="h-4 w-4" />
										</Button>
									</>
								)}
							</div>
							<p className="mt-1 text-slate-500 text-xs">
								最大50文字まで入力できます
							</p>
						</div>

						{/* アカウント情報 */}
						<div className="space-y-3">
							<h3 className="font-medium text-theme-text">アカウント情報</h3>
							<div className="space-y-2 text-sm">
								{authMethod !== "passkey-only" && userEmail && (
									<div className="flex items-center gap-2">
										<span className="w-16 text-slate-600">メール:</span>
										<span className="text-theme-text">{userEmail}</span>
									</div>
								)}
								<div className="flex items-center gap-2">
									<span className="w-16 text-slate-600">認証:</span>
									{authMethod === "passkey-only" ? (
										<span className="inline-flex items-center gap-1 rounded-full border border-theme-primary bg-theme-primary/10 px-2 py-1 text-theme-primary text-xs">
											🔑 パスキーのみ
										</span>
									) : authMethod === "google-with-passkey" ? (
										<span className="inline-flex items-center gap-1 rounded-full border border-theme-success bg-theme-success/10 px-2 py-1 text-theme-success text-xs">
											Google + パスキー
										</span>
									) : authMethod === "google-only" ? (
										<span className="inline-flex items-center gap-1 rounded-full border border-theme-success bg-theme-success/10 px-2 py-1 text-theme-success text-xs">
											Google
										</span>
									) : (
										<span className="inline-flex items-center gap-1 rounded-full border border-theme-border bg-theme-surface px-2 py-1 text-theme-text-secondary text-xs">
											不明
										</span>
									)}
								</div>
							</div>
						</div>

						{/* パスキー認証の説明（控えめなスタイル） */}
						{authMethod === "passkey-only" && (
							<div className="rounded-md border border-theme-primary/20 bg-theme-primary/5 p-3">
								<p className="text-theme-text-secondary text-xs leading-relaxed">
									🔑
									パスキー認証でセキュリティを強化しています。パスワードを覚える必要がなく、フィッシング攻撃からも保護されています。
								</p>
							</div>
						)}
					</div>
				</div>

				{/* 進行状況とお知らせ */}
				{isUploading && (
					<div className="rounded-lg bg-blue-50 p-4">
						<p className="text-blue-800 text-sm">
							📷 画像をアップロード中です...
						</p>
					</div>
				)}

				{isSavingName && (
					<div className="rounded-lg bg-blue-50 p-3">
						<p className="text-blue-800 text-sm">✏️ 名前を更新中です...</p>
					</div>
				)}

				{/* 注意事項 */}
				<div className="space-y-1 text-slate-500 text-xs">
					<p>
						<strong>画像について:</strong>
					</p>
					<p>• 対応ファイル形式: JPEG, PNG, GIF, WebP</p>
					<p>• ファイルサイズ: 最大5MB</p>
					<p>• 推奨サイズ: 400x400px以上の正方形</p>
				</div>
			</CardContent>
		</Card>
	);
}
