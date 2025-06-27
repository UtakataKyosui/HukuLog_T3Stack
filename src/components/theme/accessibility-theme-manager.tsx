"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { useEffect, useState } from "react";

interface AccessibilitySettings {
	announceThemeChanges: boolean;
	enableQuickToggle: boolean;
	enableKeyboardShortcuts: boolean;
	preferredAccessibilityTheme?: string;
}

export function AccessibilityThemeManager() {
	const { theme, setTheme, allThemes } = useTheme();
	const [settings, setSettings] = useState<AccessibilitySettings>({
		announceThemeChanges: true,
		enableQuickToggle: true,
		enableKeyboardShortcuts: true,
	});

	// 設定をローカルストレージから読み込み
	useEffect(() => {
		const saved = localStorage.getItem("accessibility-theme-settings");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setSettings((prev) => ({ ...prev, ...parsed }));
			} catch (error) {
				console.error("Failed to parse accessibility settings:", error);
			}
		}
	}, []);

	// テーマ変更時の音声アナウンス
	const announceThemeChange = (themeName: string) => {
		if (!settings.announceThemeChanges) return;

		// スクリーンリーダー向けのアナウンス
		const announcement = `テーマが ${themeName} に変更されました`;

		// aria-live領域を使ったアナウンス
		const announcer = document.getElementById("theme-announcer");
		if (announcer) {
			announcer.textContent = announcement;
			// 少し後にクリア（スクリーンリーダーが読み終わるまで）
			setTimeout(() => {
				announcer.textContent = "";
			}, 3000);
		}
	};

	// アクセシビリティテーマへのクイック切り替え
	const switchToAccessibilityTheme = () => {
		const accessibilityThemes = [
			"high-contrast",
			"eye-friendly",
			"deuteranopia",
			"protanopia",
			"tritanopia",
		];
		const currentIndex = accessibilityThemes.indexOf(theme);
		const nextIndex = (currentIndex + 1) % accessibilityThemes.length;
		const nextTheme = accessibilityThemes[nextIndex];

		setTheme(nextTheme as any);
		const themeConfig = allThemes.find((t) => t.id === nextTheme);
		if (themeConfig) {
			announceThemeChange(themeConfig.name);
		}
	};

	// グローバルキーボードショートカット
	useEffect(() => {
		if (!settings.enableKeyboardShortcuts) return;

		const handleGlobalKeyboard = (e: KeyboardEvent) => {
			// Ctrl + Shift + A: アクセシビリティテーマ切り替え
			if (e.ctrlKey && e.shiftKey && e.key === "A") {
				e.preventDefault();
				switchToAccessibilityTheme();
			}

			// Ctrl + Shift + H: ハイコントラストに即切り替え
			if (e.ctrlKey && e.shiftKey && e.key === "H") {
				e.preventDefault();
				setTheme("high-contrast");
				announceThemeChange("ハイコントラスト");
			}

			// Ctrl + Shift + E: 目に優しいテーマに即切り替え
			if (e.ctrlKey && e.shiftKey && e.key === "E") {
				e.preventDefault();
				setTheme("eye-friendly");
				announceThemeChange("目に優しい");
			}

			// Ctrl + Shift + L: ライトテーマに即切り替え
			if (e.ctrlKey && e.shiftKey && e.key === "L") {
				e.preventDefault();
				setTheme("light");
				announceThemeChange("ライト");
			}

			// Ctrl + Shift + D: ダークテーマに即切り替え
			if (e.ctrlKey && e.shiftKey && e.key === "D") {
				e.preventDefault();
				setTheme("dark");
				announceThemeChange("ダーク");
			}
		};

		document.addEventListener("keydown", handleGlobalKeyboard);
		return () => document.removeEventListener("keydown", handleGlobalKeyboard);
	}, [settings.enableKeyboardShortcuts, theme, setTheme, allThemes]);

	// 緊急時の高コントラストモード切り替え（連続でEscapeキー）
	useEffect(() => {
		let escapeCount = 0;
		let escapeTimer: NodeJS.Timeout;

		const handleEscapeSequence = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				escapeCount++;

				if (escapeCount === 1) {
					escapeTimer = setTimeout(() => {
						escapeCount = 0;
					}, 2000); // 2秒以内に3回押す必要がある
				}

				if (escapeCount === 3) {
					// 緊急時のアクセシビリティモード
					setTheme("high-contrast");
					announceThemeChange("緊急アクセシビリティモード: ハイコントラスト");
					escapeCount = 0;
					clearTimeout(escapeTimer);
				}
			} else {
				escapeCount = 0;
				clearTimeout(escapeTimer);
			}
		};

		document.addEventListener("keydown", handleEscapeSequence);
		return () => {
			document.removeEventListener("keydown", handleEscapeSequence);
			clearTimeout(escapeTimer);
		};
	}, [setTheme]);

	return (
		<>
			{/* スクリーンリーダー用のアナウンス領域 */}
			<div
				id="theme-announcer"
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			></div>

			{/* キーボードショートカットのヘルプ（スクリーンリーダー用） */}
			<div className="sr-only">
				<h2>テーマ切り替えキーボードショートカット</h2>
				<ul>
					<li>Ctrl + Shift + A: アクセシビリティテーマ切り替え</li>
					<li>Ctrl + Shift + H: ハイコントラストテーマ</li>
					<li>Ctrl + Shift + E: 目に優しいテーマ</li>
					<li>Ctrl + Shift + L: ライトテーマ</li>
					<li>Ctrl + Shift + D: ダークテーマ</li>
					<li>Escape キー 3回連続: 緊急ハイコントラストモード</li>
					<li>Alt + T: クイックテーマセレクター開閉</li>
					<li>Alt + 1, 2, 3: お気に入りテーマ切り替え</li>
				</ul>
			</div>
		</>
	);
}
