"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Check, Eye, Palette, Vibrate, X } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationMessage {
	id: string;
	type: "success" | "info" | "warning" | "error";
	title: string;
	message: string;
	icon: React.ReactNode;
	duration?: number;
	timestamp: number;
}

interface AccessibilityPreferences {
	enableVisualNotifications: boolean;
	enableVibration: boolean;
	notificationDuration: number;
	enableFlashIndicator: boolean;
	showDetailedMessages: boolean;
}

export function VisualFeedbackSystem() {
	const { theme, themeConfig } = useTheme();
	const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
	const [preferences, setPreferences] = useState<AccessibilityPreferences>({
		enableVisualNotifications: true,
		enableVibration: true,
		notificationDuration: 4000,
		enableFlashIndicator: true,
		showDetailedMessages: true,
	});
	const [flashIndicator, setFlashIndicator] = useState(false);

	// 設定の読み込み
	useEffect(() => {
		const saved = localStorage.getItem("accessibility-preferences");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setPreferences((prev) => ({ ...prev, ...parsed }));
			} catch (error) {
				console.error("Failed to parse accessibility preferences:", error);
			}
		}
	}, []);

	// 設定の保存
	const savePreferences = (newPreferences: AccessibilityPreferences) => {
		setPreferences(newPreferences);
		localStorage.setItem(
			"accessibility-preferences",
			JSON.stringify(newPreferences),
		);
	};

	// バイブレーション機能
	const triggerVibration = (pattern: number[] = [200]) => {
		if (!preferences.enableVibration) return;

		if ("vibrate" in navigator) {
			navigator.vibrate(pattern);
		}
	};

	// フラッシュインジケーター
	const triggerFlashIndicator = () => {
		if (!preferences.enableFlashIndicator) return;

		setFlashIndicator(true);
		setTimeout(() => setFlashIndicator(false), 300);
	};

	// 通知の追加
	const addNotification = (
		notification: Omit<NotificationMessage, "id" | "timestamp">,
	) => {
		if (!preferences.enableVisualNotifications) return;

		const id = Math.random().toString(36).substr(2, 9);
		const newNotification: NotificationMessage = {
			...notification,
			id,
			timestamp: Date.now(),
			duration: notification.duration || preferences.notificationDuration,
		};

		setNotifications((prev) => [...prev, newNotification]);

		// バイブレーション
		const vibrationPatterns = {
			success: [100, 50, 100],
			info: [200],
			warning: [100, 100, 100],
			error: [200, 100, 200, 100, 200],
		};
		triggerVibration(vibrationPatterns[notification.type]);

		// フラッシュインジケーター
		triggerFlashIndicator();

		// 自動削除
		setTimeout(() => {
			removeNotification(id);
		}, newNotification.duration);
	};

	// 通知の削除
	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	// テーマ変更の監視
	const prevThemeRef = useState(theme);
	useEffect(() => {
		if (prevThemeRef[0] !== theme) {
			addNotification({
				type: "success",
				title: "テーマ変更完了",
				message: preferences.showDetailedMessages
					? `テーマが「${themeConfig.name}」に変更されました。${themeConfig.description}`
					: `「${themeConfig.name}」に変更`,
				icon: <Palette className="h-5 w-5" />,
			});
			prevThemeRef[0] = theme;
		}
	}, [theme, themeConfig, preferences.showDetailedMessages]);

	// キーボードショートカットの使用通知
	useEffect(() => {
		const handleKeyboardShortcut = (e: KeyboardEvent) => {
			let shortcutUsed = false;
			let shortcutName = "";

			if (e.altKey && e.key === "t") {
				shortcutUsed = true;
				shortcutName = "クイックテーマセレクター";
			} else if (e.ctrlKey && e.shiftKey) {
				switch (e.key) {
					case "A":
						shortcutUsed = true;
						shortcutName = "アクセシビリティテーマ切り替え";
						break;
					case "H":
						shortcutUsed = true;
						shortcutName = "ハイコントラストテーマ";
						break;
					case "E":
						shortcutUsed = true;
						shortcutName = "目に優しいテーマ";
						break;
					case "L":
						shortcutUsed = true;
						shortcutName = "ライトテーマ";
						break;
					case "D":
						shortcutUsed = true;
						shortcutName = "ダークテーマ";
						break;
				}
			} else if (e.altKey && ["1", "2", "3"].includes(e.key)) {
				shortcutUsed = true;
				shortcutName = `お気に入りテーマ ${e.key}`;
			}

			if (shortcutUsed) {
				addNotification({
					type: "info",
					title: "ショートカット使用",
					message: `${shortcutName}のショートカットを使用しました`,
					icon: <Check className="h-5 w-5" />,
					duration: 2000,
				});
			}
		};

		document.addEventListener("keydown", handleKeyboardShortcut);
		return () =>
			document.removeEventListener("keydown", handleKeyboardShortcut);
	}, []);

	// 緊急時のEscape×3の検出
	useEffect(() => {
		let escapeCount = 0;
		let escapeTimer: NodeJS.Timeout;

		const handleEmergencyEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				escapeCount++;

				if (escapeCount === 3) {
					addNotification({
						type: "warning",
						title: "緊急アクセシビリティモード",
						message:
							"ハイコントラストテーマに切り替えました。視認性が最大化されています。",
						icon: <Eye className="h-5 w-5" />,
						duration: 6000,
					});
					escapeCount = 0;
					clearTimeout(escapeTimer);
				} else if (escapeCount === 1) {
					escapeTimer = setTimeout(() => {
						escapeCount = 0;
					}, 2000);
				}
			} else {
				escapeCount = 0;
				clearTimeout(escapeTimer);
			}
		};

		document.addEventListener("keydown", handleEmergencyEscape);
		return () => {
			document.removeEventListener("keydown", handleEmergencyEscape);
			clearTimeout(escapeTimer);
		};
	}, []);

	// カスタムイベントリスナー（設定変更やテスト用）
	useEffect(() => {
		const handleCustomNotification = (e: CustomEvent) => {
			addNotification({
				type: e.detail.type || "info",
				title: e.detail.title || "通知",
				message: e.detail.message || "",
				icon: <Check className="h-5 w-5" />,
			});
		};

		const handleTestFlash = () => {
			triggerFlashIndicator();
		};

		const handleTestNotification = (e: CustomEvent) => {
			addNotification({
				type: e.detail.type || "info",
				title: e.detail.title || "テスト通知",
				message: e.detail.message || "これはテスト通知です。",
				icon: <Eye className="h-5 w-5" />,
			});
		};

		document.addEventListener(
			"accessibility-setting-changed",
			handleCustomNotification as EventListener,
		);
		document.addEventListener("accessibility-test-flash", handleTestFlash);
		document.addEventListener(
			"accessibility-test-notification",
			handleTestNotification as EventListener,
		);

		return () => {
			document.removeEventListener(
				"accessibility-setting-changed",
				handleCustomNotification as EventListener,
			);
			document.removeEventListener("accessibility-test-flash", handleTestFlash);
			document.removeEventListener(
				"accessibility-test-notification",
				handleTestNotification as EventListener,
			);
		};
	}, []);

	// 通知アイテムのスタイル
	const getNotificationStyle = (type: NotificationMessage["type"]) => {
		const baseClasses =
			"relative p-4 rounded-lg border-l-4 shadow-lg transition-all duration-300 ease-in-out";

		switch (type) {
			case "success":
				return `${baseClasses} bg-theme-success/10 border-theme-success text-theme-success`;
			case "info":
				return `${baseClasses} bg-theme-primary/10 border-theme-primary text-theme-primary`;
			case "warning":
				return `${baseClasses} bg-theme-warning/10 border-theme-warning text-theme-warning`;
			case "error":
				return `${baseClasses} bg-theme-error/10 border-theme-error text-theme-error`;
			default:
				return baseClasses;
		}
	};

	return (
		<>
			{/* フラッシュインジケーター */}
			{flashIndicator && (
				<div
					className="pointer-events-none fixed inset-0 z-[9999] animate-pulse bg-theme-primary/20"
					aria-hidden="true"
				/>
			)}

			{/* 通知エリア */}
			<div className="fixed top-4 right-4 z-50 w-80 max-w-sm space-y-2">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={getNotificationStyle(notification.type)}
						role="alert"
						aria-live="polite"
						aria-atomic="true"
					>
						<div className="flex items-start space-x-3">
							<div className="mt-1 flex-shrink-0">{notification.icon}</div>
							<div className="min-w-0 flex-1">
								<h4 className="font-semibold text-sm">{notification.title}</h4>
								<p className="mt-1 text-sm opacity-90">
									{notification.message}
								</p>
								{preferences.showDetailedMessages && (
									<p className="mt-2 text-xs opacity-75">
										{new Date(notification.timestamp).toLocaleTimeString(
											"ja-JP",
										)}
									</p>
								)}
							</div>
							<button
								onClick={() => removeNotification(notification.id)}
								className="flex-shrink-0 rounded p-1 transition-colors hover:bg-current hover:bg-opacity-20"
								aria-label="通知を閉じる"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* 状態表示バー（画面下部） */}
			<div className="fixed right-0 bottom-0 left-0 z-40 border-theme-border border-t bg-theme-surface p-2">
				<div className="container mx-auto flex items-center justify-between text-sm">
					<div className="flex items-center space-x-4">
						<span className="flex items-center space-x-2">
							<Palette className="h-4 w-4 text-theme-primary" />
							<span className="text-theme-text">
								現在: <strong>{themeConfig.name}</strong>
							</span>
						</span>
						{preferences.enableVibration && (
							<span className="flex items-center space-x-1 text-theme-text-secondary">
								<Vibrate className="h-3 w-3" />
								<span className="text-xs">振動ON</span>
							</span>
						)}
					</div>
					<div className="text-theme-text-secondary text-xs">
						Alt+T: テーマ選択 | Escape×3: 緊急モード
					</div>
				</div>
			</div>

			{/* アクセシビリティ設定の非表示入力（設定保存用） */}
			<div className="sr-only">
				<button
					onClick={() =>
						savePreferences({
							...preferences,
							enableVisualNotifications: !preferences.enableVisualNotifications,
						})
					}
					aria-label="視覚的通知の有効/無効を切り替え"
				>
					視覚的通知: {preferences.enableVisualNotifications ? "有効" : "無効"}
				</button>
				<button
					onClick={() =>
						savePreferences({
							...preferences,
							enableVibration: !preferences.enableVibration,
						})
					}
					aria-label="バイブレーションの有効/無効を切り替え"
				>
					バイブレーション: {preferences.enableVibration ? "有効" : "無効"}
				</button>
			</div>
		</>
	);
}
