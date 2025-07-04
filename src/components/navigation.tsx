"use client";

import { useSession } from "@/components/providers/session-provider";
import { FavoriteThemeSelector } from "@/components/theme/favorite-theme-selector";
import { QuickThemeSelector } from "@/components/theme/quick-theme-selector";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Menu, Plus, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navigation() {
	const router = useRouter();
	const pathname = usePathname();
	const { session, isLoading } = useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	// リダイレクトはmiddlewareに委ねる（無限ループ防止）

	return (
		<nav className="theme-bg theme-border border-b shadow-lg">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 justify-between">
					{/* Left side - Logo and main nav */}
					<div className="flex items-center space-x-8">
						<Link href="/outfits" className="theme-text font-bold text-xl">
							服管理アプリ
						</Link>

						{/* Desktop navigation */}
						<div className="hidden space-x-6 md:flex">
							<Link
								href="/outfits"
								className="theme-text-secondary theme-text rounded-md px-3 py-2 font-medium text-sm transition-colors hover:opacity-80"
							>
								コーディネート
							</Link>
							<Link
								href="/wardrobe"
								className="theme-text-secondary theme-text rounded-md px-3 py-2 font-medium text-sm transition-colors hover:opacity-80"
							>
								服の管理
							</Link>
						</div>
					</div>

					{/* Right side - Add button, user menu, auth */}
					<div className="flex items-center space-x-4">
						{/* Add button for quick access - セッションがある場合のみ表示 */}
						{session && (
							<div className="hidden space-x-2 lg:flex">
								<Button
									onClick={() => router.push("/outfits?create=true")}
									size="sm"
									className="bg-theme-primary text-theme-background hover:bg-theme-secondary"
								>
									<Plus className="mr-1 h-4 w-4" />
									コーデ作成
								</Button>
								<Button
									onClick={() => router.push("/wardrobe?add=true")}
									variant="outline"
									size="sm"
									className="border-theme-border text-theme-text hover:bg-theme-surface"
								>
									<Plus className="mr-1 h-4 w-4" />
									服を追加
								</Button>
							</div>
						)}

						{/* テーマセレクター - 常に表示 */}
						<div className="flex items-center space-x-3">
							{/* お気に入りテーマセレクター */}
							<div className="hidden lg:block">
								<FavoriteThemeSelector />
							</div>

							{/* クイックテーマセレクター */}
							<QuickThemeSelector />
						</div>

						{/* User menu with avatar - セッションがある場合のみ表示 */}
						{session && (
							<div className="flex items-center space-x-3">
								{/* ユーザー名 - ローディング中はスケルトン表示 */}
								{isLoading ? (
									<div className="hidden h-4 w-16 animate-pulse rounded bg-theme-surface sm:block" />
								) : (
									<span className="hidden max-w-20 truncate text-sm text-theme-text sm:block lg:max-w-none">
										{session.user.name
											? `${session.user.name}さん`
											: "ゲストさん"}
									</span>
								)}

								{/* アバター - ローディング中はスケルトン表示 */}
								{isLoading ? (
									<div className="h-8 w-8 animate-pulse rounded-full bg-theme-surface" />
								) : session.user?.image ? (
									<img
										src={session.user.image}
										alt="プロフィール"
										className="h-8 w-8 rounded-full"
									/>
								) : (
									<div className="flex h-8 w-8 items-center justify-center rounded-full border border-theme-border bg-theme-surface">
										<User className="h-5 w-5 text-theme-text-secondary" />
									</div>
								)}

								<Link
									href="/settings"
									className="rounded-md p-2 text-theme-text-secondary transition-colors hover:text-theme-text"
									title="設定"
								>
									<Settings className="h-5 w-5" />
								</Link>
							</div>
						)}

						{/* Auth button - セッションがある場合のみ表示 */}
						{session && (
							<Button
								onClick={handleSignOut}
								variant="outline"
								size="sm"
								className="border-theme-border text-theme-text hover:bg-theme-surface"
							>
								ログアウト
							</Button>
						)}

						{/* Mobile menu button */}
						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="rounded-md p-2 text-theme-text-secondary hover:bg-theme-surface hover:text-theme-text md:hidden"
						>
							{isMobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile menu */}
				{isMobileMenuOpen && (
					<div className="border-theme-border border-t md:hidden">
						<div className="space-y-1 px-2 pt-2 pb-3">
							{/* ナビゲーションリンク - セッションがある場合のみ表示 */}
							{session && (
								<>
									<Link
										href="/outfits"
										className="block rounded-md px-3 py-2 font-medium text-base text-theme-text hover:bg-theme-surface hover:text-theme-primary"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										コーディネート
									</Link>
									<Link
										href="/wardrobe"
										className="block rounded-md px-3 py-2 font-medium text-base text-theme-text hover:bg-theme-surface hover:text-theme-primary"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										服の管理
									</Link>
									<Link
										href="/subscription"
										className="block rounded-md px-3 py-2 font-medium text-base text-theme-text hover:bg-theme-surface hover:text-theme-primary"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										プレミアム
									</Link>
								</>
							)}

							<div className="space-y-2 pt-2">
								{/* アクションボタン - セッションがある場合のみ表示 */}
								{session && (
									<>
										<Button
											onClick={() => {
												router.push("/outfits?create=true");
												setIsMobileMenuOpen(false);
											}}
											className="w-full bg-theme-primary text-theme-background hover:bg-theme-secondary"
										>
											<Plus className="mr-1 h-4 w-4" />
											コーデ作成
										</Button>
										<Button
											onClick={() => {
												router.push("/wardrobe?add=true");
												setIsMobileMenuOpen(false);
											}}
											variant="outline"
											className="w-full border-theme-border text-theme-text hover:bg-theme-surface"
										>
											<Plus className="mr-1 h-4 w-4" />
											服を追加
										</Button>
									</>
								)}

								{/* モバイル用テーマセレクター - 常に表示 */}
								<div className="space-y-2 border-theme-border border-t pt-2">
									<div className="flex items-center justify-center">
										<FavoriteThemeSelector />
									</div>
									<div className="flex items-center justify-center">
										<QuickThemeSelector />
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
