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
import { Eye, Heart, Keyboard, Volume2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteTheme {
	id: string;
	name: string;
	addedAt: number;
}

export function AccessibilitySettings() {
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

	const accessibilityThemes = allThemes.filter((t) =>
		[
			"eye-friendly",
			"high-contrast",
			"deuteranopia",
			"protanopia",
			"tritanopia",
		].includes(t.id),
	);

	const quickSwitchToTheme = (themeId: string) => {
		setTheme(themeId as any);
		// 音声フィードバック用
		const themeConfig = allThemes.find((t) => t.id === themeId);
		if (themeConfig) {
			const announcer = document.getElementById("theme-announcer");
			if (announcer) {
				announcer.textContent = `テーマが ${themeConfig.name} に変更されました`;
				setTimeout(() => {
					announcer.textContent = "";
				}, 3000);
			}
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-theme-text">
					<Eye className="h-5 w-5" />
					アクセシビリティ設定
				</CardTitle>
				<CardDescription className="text-theme-text-secondary">
					視覚障害者の方向けの設定とクイックアクセス機能
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* お気に入りテーマ */}
				{favoriteThemes.length > 0 ? (
					<div className="space-y-3">
						<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
							<Heart className="h-4 w-4 text-theme-accent" />
							お気に入りテーマ (Alt+1,2,3で切り替え)
						</h3>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							{favoriteThemes.map((fav, index) => {
								const themeConfig = allThemes.find((t) => t.id === fav.id);
								if (!themeConfig) return null;
								return (
									<Button
										key={fav.id}
										variant={theme === fav.id ? "default" : "outline"}
										size="sm"
										onClick={() => quickSwitchToTheme(fav.id)}
										className="justify-start"
										aria-label={`お気に入りテーマ ${index + 1}: ${fav.name}. Alt+${index + 1}キーでも切り替え可能`}
									>
										<span className="mr-2 font-mono text-xs">{index + 1}</span>
										{fav.name}
									</Button>
								);
							})}
						</div>
						<div className="rounded-lg border border-theme-primary bg-theme-primary/10 p-3">
							<p className="text-theme-text-secondary text-xs">
								💡 <strong>ナビゲーションバーから簡単アクセス:</strong>
								<br />
								画面上部のハートアイコン付きセレクトボックスから、お気に入りテーマを素早く選択できます。
							</p>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
							<Heart className="h-4 w-4 text-theme-accent" />
							お気に入りテーマ
						</h3>
						<div className="rounded-lg border border-theme-border bg-theme-surface p-4 text-center">
							<p className="mb-2 text-sm text-theme-text-secondary">
								まだお気に入りテーマが登録されていません
							</p>
							<p className="text-theme-text-secondary text-xs">
								画面上部のパレットアイコンから、星マークでお気に入り登録できます（最大3つ）
							</p>
						</div>
					</div>
				)}

				{/* アクセシビリティ専用テーマ */}
				<div className="space-y-3">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Eye className="h-4 w-4" />
						アクセシビリティテーマ
					</h3>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{accessibilityThemes.map((themeConfig) => (
							<Button
								key={themeConfig.id}
								variant={theme === themeConfig.id ? "default" : "outline"}
								size="sm"
								onClick={() => quickSwitchToTheme(themeConfig.id)}
								className="h-auto justify-start p-3"
							>
								<div className="text-left">
									<div className="font-medium">{themeConfig.name}</div>
									<div className="mt-1 text-xs opacity-75">
										{themeConfig.description}
									</div>
								</div>
							</Button>
						))}
					</div>
				</div>

				{/* キーボードショートカット */}
				<div className="space-y-3">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Keyboard className="h-4 w-4" />
						キーボードショートカット
					</h3>
					<div className="grid grid-cols-1 gap-2 text-sm">
						<div className="flex items-center justify-between rounded bg-theme-surface p-2">
							<span className="text-theme-text">
								アクセシビリティテーマ切り替え
							</span>
							<code className="rounded bg-theme-border px-2 py-1 text-xs">
								Ctrl+Shift+A
							</code>
						</div>
						<div className="flex items-center justify-between rounded bg-theme-surface p-2">
							<span className="text-theme-text">ハイコントラスト</span>
							<code className="rounded bg-theme-border px-2 py-1 text-xs">
								Ctrl+Shift+H
							</code>
						</div>
						<div className="flex items-center justify-between rounded bg-theme-surface p-2">
							<span className="text-theme-text">目に優しいテーマ</span>
							<code className="rounded bg-theme-border px-2 py-1 text-xs">
								Ctrl+Shift+E
							</code>
						</div>
						<div className="flex items-center justify-between rounded bg-theme-surface p-2">
							<span className="text-theme-text">緊急ハイコントラスト</span>
							<code className="rounded bg-theme-border px-2 py-1 text-xs">
								Escape×3
							</code>
						</div>
						<div className="flex items-center justify-between rounded bg-theme-surface p-2">
							<span className="text-theme-text">クイックセレクター</span>
							<code className="rounded bg-theme-border px-2 py-1 text-xs">
								Alt+T
							</code>
						</div>
					</div>
				</div>

				{/* 緊急アクセス情報 */}
				<div className="rounded-lg border border-theme-warning bg-theme-warning/10 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-medium text-sm text-theme-warning">
						<Zap className="h-4 w-4" />
						緊急時のアクセス方法
					</h4>
					<ul className="space-y-1 text-theme-text-secondary text-xs">
						<li>
							• <strong>Escapeキー3回連続</strong>
							でハイコントラストモードに即切り替え
						</li>
						<li>
							• <strong>Alt+T</strong>でクイックテーマセレクターを開く
						</li>
						<li>
							• <strong>Ctrl+Shift+H</strong>
							で直接ハイコントラストモードに切り替え
						</li>
						<li>• 画面右上のパレットアイコンからもテーマを変更可能</li>
					</ul>
				</div>

				{/* 音声フィードバック情報 */}
				<div className="rounded-lg border border-theme-primary bg-theme-primary/10 p-4">
					<h4 className="mb-2 flex items-center gap-2 font-medium text-sm text-theme-primary">
						<Volume2 className="h-4 w-4" />
						音声フィードバック
					</h4>
					<p className="text-theme-text-secondary text-xs">
						テーマ変更時にスクリーンリーダーで変更内容がアナウンスされます。
						全ての操作でキーボードナビゲーションが利用可能です。
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
