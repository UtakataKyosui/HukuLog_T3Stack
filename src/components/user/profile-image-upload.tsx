"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Upload, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function ProfileImageUpload() {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

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

	const currentImage = previewUrl || profile?.image;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					プロフィール画像
				</CardTitle>
				<CardDescription>
					あなたのプロフィール画像を設定してください（最大5MB）
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* 現在の画像表示 */}
				<div className="flex flex-col items-center gap-4 sm:flex-row">
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
							className="w-full sm:w-auto"
						>
							<Upload className="mr-2 h-4 w-4" />
							{isUploading ? "アップロード中..." : "画像を選択"}
						</Button>

						{currentImage && (
							<Button
								variant="outline"
								onClick={handleRemoveImage}
								disabled={updateProfile.isPending}
								className="w-full border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
							>
								<X className="mr-2 h-4 w-4" />
								画像を削除
							</Button>
						)}
					</div>
				</div>

				{/* アップロード進行状況 */}
				{isUploading && (
					<div className="rounded-lg bg-blue-50 p-4">
						<p className="text-blue-800 text-sm">
							📷 画像をアップロード中です...
						</p>
					</div>
				)}

				{/* 注意事項 */}
				<div className="space-y-1 text-slate-500 text-xs">
					<p>• 対応ファイル形式: JPEG, PNG, GIF, WebP</p>
					<p>• ファイルサイズ: 最大5MB</p>
					<p>• 推奨サイズ: 400x400px以上の正方形</p>
				</div>
			</CardContent>
		</Card>
	);
}
