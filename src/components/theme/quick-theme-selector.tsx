"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Palette, Star, StarOff } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteTheme {
	id: string;
	name: string;
	addedAt: number;
}

export function QuickThemeSelector() {
	const { theme, setTheme, allThemes } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
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

	// お気に入りテーマの追加/削除
	const toggleFavorite = (themeId: string) => {
		const themeConfig = allThemes.find((t) => t.id === themeId);
		if (!themeConfig) return;

		const isFavorite = favoriteThemes.some((f) => f.id === themeId);

		if (isFavorite) {
			// 削除
			const updated = favoriteThemes.filter((f) => f.id !== themeId);
			saveFavoriteThemes(updated);

			// 視覚的フィードバック
			const event = new CustomEvent("accessibility-setting-changed", {
				detail: {
					type: "info",
					title: "お気に入りから削除",
					message: `「${themeConfig.name}」をお気に入りから削除しました`,
				},
			});
			document.dispatchEvent(event);
		} else {
			// 追加（最大3つまで）
			if (favoriteThemes.length >= 3) {
				// 視覚的フィードバック
				const event = new CustomEvent("accessibility-setting-changed", {
					detail: {
						type: "warning",
						title: "お気に入り上限",
						message: "お気に入りテーマは3つまで登録できます",
					},
				});
				document.dispatchEvent(event);
				return;
			}
			const updated = [
				...favoriteThemes,
				{
					id: themeId,
					name: themeConfig.name,
					addedAt: Date.now(),
				},
			];
			saveFavoriteThemes(updated);

			// 視覚的フィードバック
			const event = new CustomEvent("accessibility-setting-changed", {
				detail: {
					type: "success",
					title: "お気に入りに追加",
					message: `「${themeConfig.name}」をお気に入りに追加しました（Alt+${updated.length}で切り替え）`,
				},
			});
			document.dispatchEvent(event);
		}
	};

	// キーボードショートカット
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// Alt + T でテーマセレクター開閉
			if (e.altKey && e.key === "t") {
				e.preventDefault();
				setIsOpen(!isOpen);
			}
			// Alt + 1, 2, 3 でお気に入りテーマに切り替え
			if (e.altKey && ["1", "2", "3"].includes(e.key)) {
				e.preventDefault();
				const index = Number.parseInt(e.key) - 1;
				if (favoriteThemes[index]) {
					setTheme(favoriteThemes[index].id as any);
				}
			}
		};

		document.addEventListener("keydown", handleKeyPress);
		return () => document.removeEventListener("keydown", handleKeyPress);
	}, [isOpen, favoriteThemes, setTheme]);

	const currentTheme = allThemes.find((t) => t.id === theme);

	return (
		<div className="relative">
			{/* メインボタン */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsOpen(!isOpen)}
				className="text-theme-text-secondary hover:bg-theme-surface hover:text-theme-text"
				aria-label={`現在のテーマ: ${currentTheme?.name}。テーマセレクターを開く (Alt+T)`}
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Palette className="h-4 w-4" />
				<span className="sr-only">テーマ切り替え</span>
			</Button>

			{/* ドロップダウンメニュー */}
			{isOpen && (
				<div
					className="absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border border-theme-border bg-theme-surface p-3 shadow-lg"
					role="menu"
					aria-labelledby="theme-selector-button"
				>
					{/* テーマリスト（お気に入り登録中心） */}
					<div>
						<h3 className="mb-2 flex items-center gap-2 font-medium text-sm text-theme-text">
							<Star className="h-4 w-4 text-theme-accent" />
							テーマ選択・お気に入り登録
						</h3>
						<div className="max-h-48 space-y-1 overflow-y-auto">
							{allThemes.map((themeConfig) => {
								const isFavorite = favoriteThemes.some(
									(f) => f.id === themeConfig.id,
								);
								return (
									<div key={themeConfig.id} className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setTheme(themeConfig.id);
												setIsOpen(false);
											}}
											className={`h-8 flex-1 justify-start ${
												theme === themeConfig.id
													? "bg-theme-primary text-theme-background"
													: "text-theme-text hover:bg-theme-primary/10"
											}`}
											role="menuitem"
										>
											<div className="flex w-full items-center gap-2">
												<div
													className="h-2 w-2 rounded-full border border-theme-border"
													style={{
														backgroundColor: themeConfig.colors.primary,
													}}
													aria-hidden="true"
												/>
												<span className="truncate text-xs">
													{themeConfig.name}
												</span>
											</div>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												toggleFavorite(themeConfig.id);
											}}
											className="h-8 w-6 p-0 text-theme-text-secondary hover:text-theme-accent"
											aria-label={
												isFavorite
													? `${themeConfig.name}をお気に入りから削除`
													: `${themeConfig.name}をお気に入りに追加`
											}
										>
											{isFavorite ? (
												<Star className="h-3 w-3 fill-current text-theme-accent" />
											) : (
												<StarOff className="h-3 w-3" />
											)}
										</Button>
									</div>
								);
							})}
						</div>
					</div>

					{/* ヘルプテキスト */}
					<div className="mt-3 border-theme-border border-t pt-2">
						<p className="text-theme-text-secondary text-xs">
							⭐ 星アイコンでお気に入り登録
						</p>
					</div>
				</div>
			)}

			{/* 背景クリックで閉じる */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
					aria-hidden="true"
				/>
			)}
		</div>
	);
}
