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
			secondary: "#4b5563",
			background: "#ffffff",
			surface: "#f9fafb",
			text: "#000000",
			textSecondary: "#374151",
			border: "#000000",
			accent: "#b45309",
			success: "#065f46",
			warning: "#b45309",
			error: "#991b1b",
		},
	},
	deuteranopia: {
		id: "deuteranopia",
		name: "緑色盲対応",
		description: "2型色覚（緑色盲）の方向けのテーマ",
		colors: {
			primary: "#2563eb",
			secondary: "#6b7280",
			background: "#ffffff",
			surface: "#f8fafc",
			text: "#1e293b",
			textSecondary: "#6b7280",
			border: "#e2e8f0",
			accent: "#ea580c",
			success: "#0891b2",
			warning: "#ea580c",
			error: "#dc2626",
		},
	},
	protanopia: {
		id: "protanopia",
		name: "赤色盲対応",
		description: "1型色覚（赤色盲）の方向けのテーマ",
		colors: {
			primary: "#0284c7",
			secondary: "#6b7280",
			background: "#ffffff",
			surface: "#f8fafc",
			text: "#1e293b",
			textSecondary: "#6b7280",
			border: "#e2e8f0",
			accent: "#0891b2",
			success: "#0284c7",
			warning: "#f59e0b",
			error: "#4b5563",
		},
	},
	tritanopia: {
		id: "tritanopia",
		name: "青色盲対応",
		description: "3型色覚（青色盲）の方向けのテーマ",
		colors: {
			primary: "#dc2626",
			secondary: "#6b7280",
			background: "#ffffff",
			surface: "#f8fafc",
			text: "#1e293b",
			textSecondary: "#6b7280",
			border: "#e2e8f0",
			accent: "#ea580c",
			success: "#dc2626",
			warning: "#ea580c",
			error: "#4b5563",
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

		// CSS カスタムプロパティを設定
		Object.entries(config.colors).forEach(([key, value]) => {
			root.style.setProperty(`--color-${key}`, value);
		});

		// データ属性も設定（CSS セレクターで使用可能）
		root.setAttribute("data-theme", theme);
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
