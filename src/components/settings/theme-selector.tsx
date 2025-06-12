"use client";

import {
	type Theme,
	themeConfigs,
	useTheme,
} from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export function ThemeSelector() {
	const { theme, setTheme, allThemes, themeConfig } = useTheme();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<span>🎨</span>
					テーマ設定
				</CardTitle>
				<CardDescription>
					お好みのテーマを選択してください。アクセシビリティに配慮したテーマも用意されています。
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{allThemes.map((themeConfig) => (
						<div
							key={themeConfig.id}
							className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
								theme === themeConfig.id
									? "theme-border-primary theme-bg-primary/10"
									: "theme-border hover:theme-border-secondary"
							}`}
							onClick={() => setTheme(themeConfig.id)}
						>
							{theme === themeConfig.id && (
								<div className="absolute top-2 right-2">
									<Check className="h-5 w-5 theme-text-primary" />
								</div>
							)}

							<div className="mb-3 flex items-center gap-3">
								<div
									className="theme-preview"
									style={
										{
											"--theme-background": themeConfig.colors.background,
											"--theme-primary": themeConfig.colors.primary,
											"--theme-border": themeConfig.colors.border,
										} as React.CSSProperties
									}
								/>
								<div>
									<Label className="cursor-pointer font-semibold text-sm">
										{themeConfig.name}
									</Label>
									<p className="mt-1 theme-text-secondary text-xs">
										{themeConfig.description}
									</p>
								</div>
							</div>

							{/* カラーパレット表示 */}
							<div className="flex gap-1">
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: themeConfig.colors.primary }}
									title="プライマリ"
								/>
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: themeConfig.colors.secondary }}
									title="セカンダリ"
								/>
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: themeConfig.colors.accent }}
									title="アクセント"
								/>
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: themeConfig.colors.success }}
									title="成功"
								/>
								<div
									className="h-4 w-4 rounded-full border"
									style={{ backgroundColor: themeConfig.colors.error }}
									title="エラー"
								/>
							</div>
						</div>
					))}
				</div>

				{/* アクセシビリティ情報 */}
				<div className="mt-6 rounded-lg theme-bg-primary/10 p-4">
					<h4 className="mb-2 font-medium theme-text text-sm">
						💡 アクセシビリティテーマについて
					</h4>
					<ul className="space-y-1 theme-text-secondary text-xs">
						<li>
							• <strong>目に優しい</strong>: ブルーライトを抑えた暖色系のテーマ
						</li>
						<li>
							• <strong>ハイコントラスト</strong>:
							視認性を最大化した高コントラストテーマ
						</li>
						<li>
							• <strong>緑色盲対応</strong>: 2型色覚（緑色盲）の方向けのテーマ
						</li>
						<li>
							• <strong>赤色盲対応</strong>: 1型色覚（赤色盲）の方向けのテーマ
						</li>
						<li>
							• <strong>青色盲対応</strong>: 3型色覚（青色盲）の方向けのテーマ
						</li>
					</ul>
				</div>

				{/* テーマプレビューエリア */}
				<div className="bg-theme-background border-theme-border text-theme-text rounded-lg border-2 p-4">
					<h4 className="text-theme-text mb-3 font-medium text-sm">
						🎨 テーマプレビュー
					</h4>
					<div className="bg-theme-surface border-theme-border rounded-lg border p-3">
						<p className="text-theme-text mb-2 font-medium">メインテキスト</p>
						<p className="text-theme-text-secondary text-sm">セカンダリテキスト</p>
						<div className="mt-3 flex gap-2">
							<div className="bg-theme-primary h-6 w-6 rounded"></div>
							<div className="bg-theme-accent h-6 w-6 rounded"></div>
							<div className="bg-theme-success h-6 w-6 rounded"></div>
						</div>
					</div>
				</div>

				{/* 現在のテーマ確認 */}
				<div className="theme-bg-surface theme-border rounded-lg border p-4">
					<h4 className="mb-3 font-medium theme-text text-sm">
						🔍 現在適用中のテーマ
					</h4>
					<div className="space-y-2 text-sm">
						<div>
							<strong>テーマID:</strong> <code className="rounded theme-bg-surface px-1">{theme}</code>
						</div>
						<div>
							<strong>テーマ名:</strong> {themeConfig.name}
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<strong>プライマリ:</strong>
								<div className="mt-1 flex items-center gap-2">
									<div 
										className="h-4 w-8 rounded border" 
										style={{ backgroundColor: themeConfig.colors.primary }}
									/>
									<code className="text-xs">{themeConfig.colors.primary}</code>
								</div>
							</div>
							<div>
								<strong>背景:</strong>
								<div className="mt-1 flex items-center gap-2">
									<div 
										className="h-4 w-8 rounded border" 
										style={{ backgroundColor: themeConfig.colors.background }}
									/>
									<code className="text-xs">{themeConfig.colors.background}</code>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end">
					<Button variant="outline" onClick={() => setTheme("light")} size="sm">
						デフォルトに戻す
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
