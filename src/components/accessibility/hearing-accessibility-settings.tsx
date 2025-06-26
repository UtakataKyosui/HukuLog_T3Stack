"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell, Eye, Info, Monitor, Settings, Vibrate } from "lucide-react";
import { useEffect, useState } from "react";

interface HearingAccessibilitySettings {
	enableVisualNotifications: boolean;
	enableVibration: boolean;
	notificationDuration: number;
	enableFlashIndicator: boolean;
	showDetailedMessages: boolean;
	enableStatusBar: boolean;
	enableKeyboardShortcutFeedback: boolean;
}

export function HearingAccessibilitySettings() {
	const [settings, setSettings] = useState<HearingAccessibilitySettings>({
		enableVisualNotifications: true,
		enableVibration: true,
		notificationDuration: 4000,
		enableFlashIndicator: true,
		showDetailedMessages: true,
		enableStatusBar: true,
		enableKeyboardShortcutFeedback: true,
	});

	// 設定の読み込み
	useEffect(() => {
		const saved = localStorage.getItem("accessibility-preferences");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setSettings((prev) => ({ ...prev, ...parsed }));
			} catch (error) {
				console.error("Failed to parse hearing accessibility settings:", error);
			}
		}
	}, []);

	// 設定の保存
	const saveSettings = (newSettings: Partial<HearingAccessibilitySettings>) => {
		const updated = { ...settings, ...newSettings };
		setSettings(updated);
		localStorage.setItem("accessibility-preferences", JSON.stringify(updated));

		// 設定変更の視覚的フィードバック
		if (updated.enableVisualNotifications) {
			// カスタムイベントを発火して視覚的フィードバックシステムに通知
			const event = new CustomEvent("accessibility-setting-changed", {
				detail: {
					type: "success",
					title: "設定変更完了",
					message: "聴覚アクセシビリティ設定が更新されました",
				},
			});
			document.dispatchEvent(event);
		}
	};

	// テスト機能
	const testVisualFeedback = () => {
		const event = new CustomEvent("accessibility-test-notification", {
			detail: {
				type: "info",
				title: "テスト通知",
				message:
					"これは聴覚障害者向けの視覚的通知のテストです。画面の右上に表示されます。",
			},
		});
		document.dispatchEvent(event);

		// バイブレーションテスト
		if (settings.enableVibration && "vibrate" in navigator) {
			navigator.vibrate([200, 100, 200]);
		}
	};

	const testFlashIndicator = () => {
		const event = new CustomEvent("accessibility-test-flash");
		document.dispatchEvent(event);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-theme-text">
					<Eye className="h-5 w-5" />
					聴覚アクセシビリティ設定
				</CardTitle>
				<CardDescription className="text-theme-text-secondary">
					聴覚障害者の方向けの視覚的フィードバックと通知設定
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 視覚的通知設定 */}
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Bell className="h-4 w-4 text-theme-primary" />
						視覚的通知
					</h3>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-theme-text">画面右上に通知を表示</Label>
							<Button
								size="sm"
								variant={
									settings.enableVisualNotifications ? "default" : "outline"
								}
								onClick={() =>
									saveSettings({
										enableVisualNotifications:
											!settings.enableVisualNotifications,
									})
								}
								className="min-w-16"
							>
								{settings.enableVisualNotifications ? "ON" : "OFF"}
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<Label className="text-theme-text">
								画面全体のフラッシュ表示
							</Label>
							<Button
								size="sm"
								variant={settings.enableFlashIndicator ? "default" : "outline"}
								onClick={() =>
									saveSettings({
										enableFlashIndicator: !settings.enableFlashIndicator,
									})
								}
								className="min-w-16"
							>
								{settings.enableFlashIndicator ? "ON" : "OFF"}
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<Label className="text-theme-text">詳細メッセージ表示</Label>
							<Button
								size="sm"
								variant={settings.showDetailedMessages ? "default" : "outline"}
								onClick={() =>
									saveSettings({
										showDetailedMessages: !settings.showDetailedMessages,
									})
								}
								className="min-w-16"
							>
								{settings.showDetailedMessages ? "ON" : "OFF"}
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<Label className="text-theme-text">
								キーボードショートカット使用時の通知
							</Label>
							<Button
								size="sm"
								variant={
									settings.enableKeyboardShortcutFeedback
										? "default"
										: "outline"
								}
								onClick={() =>
									saveSettings({
										enableKeyboardShortcutFeedback:
											!settings.enableKeyboardShortcutFeedback,
									})
								}
								className="min-w-16"
							>
								{settings.enableKeyboardShortcutFeedback ? "ON" : "OFF"}
							</Button>
						</div>
					</div>
				</div>

				{/* バイブレーション設定 */}
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Vibrate className="h-4 w-4 text-theme-accent" />
						バイブレーション（モバイル）
					</h3>

					<div className="flex items-center justify-between">
						<Label className="text-theme-text">
							操作時の振動フィードバック
						</Label>
						<Button
							size="sm"
							variant={settings.enableVibration ? "default" : "outline"}
							onClick={() =>
								saveSettings({ enableVibration: !settings.enableVibration })
							}
							className="min-w-16"
							disabled={!("vibrate" in navigator)}
						>
							{settings.enableVibration ? "ON" : "OFF"}
						</Button>
					</div>

					{!("vibrate" in navigator) && (
						<p className="text-theme-text-secondary text-xs">
							※ このデバイスはバイブレーション機能に対応していません
						</p>
					)}
				</div>

				{/* 状態表示設定 */}
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Monitor className="h-4 w-4 text-theme-success" />
						状態表示
					</h3>

					<div className="flex items-center justify-between">
						<Label className="text-theme-text">
							画面下部に現在状態を常時表示
						</Label>
						<Button
							size="sm"
							variant={settings.enableStatusBar ? "default" : "outline"}
							onClick={() =>
								saveSettings({ enableStatusBar: !settings.enableStatusBar })
							}
							className="min-w-16"
						>
							{settings.enableStatusBar ? "ON" : "OFF"}
						</Button>
					</div>
				</div>

				{/* 通知時間設定 */}
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Settings className="h-4 w-4 text-theme-secondary" />
						通知表示時間
					</h3>

					<div className="grid grid-cols-4 gap-2">
						{[2000, 4000, 6000, 8000].map((duration) => (
							<Button
								key={duration}
								size="sm"
								variant={
									settings.notificationDuration === duration
										? "default"
										: "outline"
								}
								onClick={() => saveSettings({ notificationDuration: duration })}
								className="text-xs"
							>
								{duration / 1000}秒
							</Button>
						))}
					</div>
				</div>

				{/* テスト機能 */}
				<div className="space-y-4">
					<h3 className="flex items-center gap-2 font-medium text-sm text-theme-text">
						<Info className="h-4 w-4 text-theme-warning" />
						動作テスト
					</h3>

					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={testVisualFeedback}
							className="flex-1"
						>
							通知テスト
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={testFlashIndicator}
							className="flex-1"
						>
							フラッシュテスト
						</Button>
					</div>
				</div>

				{/* 使用方法の説明 */}
				<div className="rounded-lg border border-theme-primary bg-theme-primary/10 p-4">
					<h4 className="mb-2 font-medium text-sm text-theme-primary">
						💡 聴覚アクセシビリティ機能について
					</h4>
					<ul className="space-y-1 text-theme-text-secondary text-xs">
						<li>
							• <strong>視覚的通知</strong>: 操作結果や状態変更を画面右上に表示
						</li>
						<li>
							• <strong>フラッシュ表示</strong>:
							重要な変更時に画面全体が一瞬光る
						</li>
						<li>
							• <strong>バイブレーション</strong>:
							モバイルデバイスで触覚フィードバック
						</li>
						<li>
							• <strong>状態表示バー</strong>:
							現在のテーマと利用可能な操作を画面下部に表示
						</li>
						<li>
							• <strong>詳細メッセージ</strong>: 操作の詳細説明と時刻を表示
						</li>
					</ul>
				</div>

				{/* 緊急時の操作説明 */}
				<div className="rounded-lg border border-theme-warning bg-theme-warning/10 p-4">
					<h4 className="mb-2 font-medium text-sm text-theme-warning">
						🚨 緊急時の操作方法
					</h4>
					<ul className="space-y-1 text-theme-text-secondary text-xs">
						<li>
							• <strong>Escapeキー3回連続</strong>:
							即座にハイコントラストモードに切り替え
						</li>
						<li>
							• <strong>Ctrl+Shift+H</strong>:
							ハイコントラストテーマに即切り替え
						</li>
						<li>
							• <strong>Alt+T</strong>: クイックテーマセレクターを開く
						</li>
						<li>• 全ての操作で視覚的フィードバックが提供されます</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
