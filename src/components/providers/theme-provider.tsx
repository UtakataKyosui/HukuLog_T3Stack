"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme =
	| "light"
	| "dark"
	| "eye-friendly"
	| "high-contrast"
	| "deuteranopia"
	| "protanopia"
	| "tritanopia";

export interface ThemeConfig {
	id: Theme;
	name: string;
	description: string;
	colors: {
		primary: string;
		secondary: string;
		background: string;
		surface: string;
		text: string;
		textSecondary: string;
		border: string;
		accent: string;
		success: string;
		warning: string;
		error: string;
	};
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
	light: {
		id: "light",
		name: "ライト",
		description: "明るく清潔感のある標準テーマ",
		colors: {
			primary: "#3b82f6",
			secondary: "#64748b",
			background: "#ffffff",
			surface: "#f8fafc",
			text: "#1e293b",
			textSecondary: "#64748b",
			border: "#e2e8f0",
			accent: "#f59e0b",
			success: "#10b981",
			warning: "#f59e0b",
			error: "#ef4444",
		},
	},
	dark: {
		id: "dark",
		name: "ダーク",
		description: "目の疲労を軽減する暗いテーマ",
		colors: {
			primary: "#60a5fa",
			secondary: "#94a3b8",
			background: "#0f172a",
			surface: "#1e293b",
			text: "#f1f5f9",
			textSecondary: "#94a3b8",
			border: "#334155",
			accent: "#fbbf24",
			success: "#34d399",
			warning: "#fbbf24",
			error: "#f87171",
		},
	},
	"eye-friendly": {
		id: "eye-friendly",
		name: "目に優しい",
		description: "ブルーライトを抑えた目に優しいテーマ",
		colors: {
			primary: "#059669",
			secondary: "#6b7280",
			background: "#fefdf8",
			surface: "#f9f7f1",
			text: "#1f2937",
			textSecondary: "#6b7280",
			border: "#d6d3d1",
			accent: "#d97706",
			success: "#059669",
			warning: "#d97706",
			error: "#dc2626",
		},
	},
	"high-contrast": {
		id: "high-contrast",
		name: "ハイコントラスト",
		description: "視認性を最大化した高コントラストテーマ",
		colors: {
			primary: "#000000",
			secondary: "#333333",
			background: "#ffffff",
			surface: "#f0f0f0",
			text: "#000000",
			textSecondary: "#333333",
			border: "#000000",
			accent: "#ff6600",
			success: "#006600",
			warning: "#cc6600",
			error: "#cc0000",
		},
	},
	deuteranopia: {
		id: "deuteranopia",
		name: "緑色盲対応",
		description: "2型色覚（緑色盲）の方向けのテーマ",
		colors: {
			primary: "#0066cc",
			secondary: "#4d79a4",
			background: "#f7f9fc",
			surface: "#e8f2ff",
			text: "#1a365d",
			textSecondary: "#4a5568",
			border: "#bee3f8",
			accent: "#ff7700",
			success: "#0088cc",
			warning: "#ff9500",
			error: "#cc3300",
		},
	},
	protanopia: {
		id: "protanopia",
		name: "赤色盲対応",
		description: "1型色覚（赤色盲）の方向けのテーマ",
		colors: {
			primary: "#0099cc",
			secondary: "#336699",
			background: "#f0f8ff",
			surface: "#e0f0ff",
			text: "#003366",
			textSecondary: "#556b8d",
			border: "#99ccff",
			accent: "#6699cc",
			success: "#0099cc",
			warning: "#ffaa00",
			error: "#666666",
		},
	},
	tritanopia: {
		id: "tritanopia",
		name: "青色盲対応",
		description: "3型色覚（青色盲）の方向けのテーマ",
		colors: {
			primary: "#cc3366",
			secondary: "#996633",
			background: "#fffaf5",
			surface: "#fff0e6",
			text: "#663300",
			textSecondary: "#8b4513",
			border: "#ffcc99",
			accent: "#ff6600",
			success: "#cc3366",
			warning: "#ff9900",
			error: "#999999",
		},
	},
};

interface ThemeContextType {
	theme: Theme;
	themeConfig: ThemeConfig;
	setTheme: (theme: Theme) => void;
	allThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "light",
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	// ローカルストレージからテーマを読み込み
	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as Theme;
		if (savedTheme && themeConfigs[savedTheme]) {
			setThemeState(savedTheme);
		}
		setMounted(true);
	}, []);

	// テーマを変更してローカルストレージに保存
	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	// CSS カスタムプロパティを更新
	useEffect(() => {
		if (!mounted) return;

		const config = themeConfigs[theme];
		const root = document.documentElement;

		// CSS カスタムプロパティを設定（Tailwind v4準拠）
		Object.entries(config.colors).forEach(([key, value]) => {
			// キャメルケースをケバブケースに変換
			const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
			// Tailwind v4の@themeディレクティブ用の命名規則
			root.style.setProperty(`--color-theme-${kebabKey}`, value);
			// 後方互換性のための従来の命名規則
			root.style.setProperty(`--theme-${kebabKey}`, value);
		});

		// データ属性も設定（CSS セレクターで使用可能）
		root.setAttribute("data-theme", theme);

		// bodyクラスも設定（追加の確実性のため）
		document.body.className = document.body.className.replace(/theme-\w+/g, "");
		document.body.classList.add(`theme-${theme}`);

		// 強制的にスタイル再適用
		root.style.setProperty("--force-update", Date.now().toString());
	}, [theme, mounted]);

	const themeConfig = themeConfigs[theme];
	const allThemes = Object.values(themeConfigs);

	// ハイドレーション対策
	if (!mounted) {
		return (
			<ThemeContext.Provider
				value={{
					theme: defaultTheme,
					themeConfig: themeConfigs[defaultTheme],
					setTheme: () => {},
					allThemes,
				}}
			>
				{children}
			</ThemeContext.Provider>
		);
	}

	return (
		<ThemeContext.Provider
			value={{
				theme,
				themeConfig,
				setTheme,
				allThemes,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
