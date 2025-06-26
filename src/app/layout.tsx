import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { VisualFeedbackSystem } from "@/components/accessibility/visual-feedback-system";
import { Navigation } from "@/components/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccessibilityThemeManager } from "@/components/theme/accessibility-theme-manager";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "服管理アプリ",
	description: "服とコーディネートを効率的に管理",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: "cover",
	themeColor: "#3b82f6",
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="ja" className={`${geist.variable}`}>
			<body>
				<ThemeProvider>
					<AccessibilityThemeManager />
					<VisualFeedbackSystem />
					<SessionProvider>
						<TRPCReactProvider>
							<Navigation />
							{children}
						</TRPCReactProvider>
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
