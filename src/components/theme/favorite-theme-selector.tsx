"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Heart, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteTheme {
	id: string;
	name: string;
	addedAt: number;
}

export function FavoriteThemeSelector() {
	const { theme, setTheme, allThemes } = useTheme();
	const [favoriteThemes, setFavoriteThemes] = useState<FavoriteTheme[]>([]);

	// お気に入りテーマをローカルストレージから読み込み
	useEffect(() => {
		const saved = localStorage.getItem("favorite-themes");
		if (saved) {
			try {
				setFavoriteThemes(JSON.parse(saved));
			} catch (error) {
				console.error("Failed to parse favorite themes:", error);
			}
		}
	}, []);

	// お気に入りテーマを保存
	const saveFavoriteThemes = (themes: FavoriteTheme[]) => {
		setFavoriteThemes(themes);
		localStorage.setItem("favorite-themes", JSON.stringify(themes));
	};

	// お気に入りテーマでテーマ変更
	const handleFavoriteThemeChange = (favoriteId: string) => {
		if (favoriteId === "none") return;

		const favorite = favoriteThemes.find((f) => f.id === favoriteId);
		if (favorite) {
			setTheme(favorite.id as any);

			// 視覚的フィードバック
			const event = new CustomEvent("accessibility-setting-changed", {
				detail: {
					type: "success",
					title: "お気に入りテーマ適用",
					message: `「${favorite.name}」に切り替えました`,
				},
			});
			document.dispatchEvent(event);
		}
	};

	// お気に入りから削除
	const removeFavorite = (favoriteId: string) => {
		const favorite = favoriteThemes.find((f) => f.id === favoriteId);
		if (!favorite) return;

		const updated = favoriteThemes.filter((f) => f.id !== favoriteId);
		saveFavoriteThemes(updated);

		// 視覚的フィードバック
		const event = new CustomEvent("accessibility-setting-changed", {
			detail: {
				type: "info",
				title: "お気に入りから削除",
				message: `「${favorite.name}」をお気に入りから削除しました`,
			},
		});
		document.dispatchEvent(event);
	};

	// 現在のテーマがお気に入りに登録されているかチェック
	const currentThemeIsFavorite = favoriteThemes.some((f) => f.id === theme);
	const currentFavoriteValue = currentThemeIsFavorite ? theme : "none";

	// キーボードショートカット（Alt + 1,2,3）
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.altKey && ["1", "2", "3"].includes(e.key)) {
				e.preventDefault();
				const index = Number.parseInt(e.key) - 1;
				if (favoriteThemes[index]) {
					setTheme(favoriteThemes[index].id as any);

					// 視覚的フィードバック
					const event = new CustomEvent("accessibility-setting-changed", {
						detail: {
							type: "success",
							title: `お気に入り${e.key}番適用`,
							message: `「${favoriteThemes[index].name}」に切り替えました`,
						},
					});
					document.dispatchEvent(event);
				}
			}
		};

		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [favoriteThemes, setTheme]);

	// お気に入りテーマがない場合は何も表示しない
	if (favoriteThemes.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-2">
			<div className="flex min-w-0 items-center gap-2">
				<Heart className="h-4 w-4 flex-shrink-0 text-theme-accent" />
				<Select
					value={currentFavoriteValue}
					onValueChange={handleFavoriteThemeChange}
				>
					<SelectTrigger
						className="h-8 w-[140px] border-theme-border bg-theme-surface text-xs"
						aria-label="お気に入りテーマを選択"
					>
						<SelectValue placeholder="お気に入り選択" />
					</SelectTrigger>
					<SelectContent className="border-theme-border bg-theme-surface">
						<SelectItem value="none" className="text-theme-text-secondary">
							選択してください
						</SelectItem>
						{favoriteThemes.map((favorite, index) => (
							<SelectItem
								key={favorite.id}
								value={favorite.id}
								className="text-theme-text hover:bg-theme-primary/10"
							>
								<div className="flex w-full items-center gap-2">
									<span className="font-mono text-theme-text-secondary text-xs">
										{index + 1}
									</span>
									<span className="truncate">{favorite.name}</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* 削除ボタン（現在のテーマがお気に入りの場合のみ表示） */}
			{currentThemeIsFavorite && (
				<Button
					size="sm"
					variant="ghost"
					onClick={() => removeFavorite(theme)}
					className="h-8 w-8 p-0 text-theme-text-secondary hover:bg-theme-error/10 hover:text-theme-error"
					aria-label={`現在のテーマ「${allThemes.find((t) => t.id === theme)?.name}」をお気に入りから削除`}
					title="お気に入りから削除"
				>
					<Trash2 className="h-3 w-3" />
				</Button>
			)}
		</div>
	);
}
