import { HearingAccessibilitySettings } from "@/components/accessibility/hearing-accessibility-settings";
import { PasskeyManager } from "@/components/auth/passkey-manager";
import { PasskeySetupPrompt } from "@/components/auth/passkey-setup-prompt";
import { AccessibilitySettings } from "@/components/settings/accessibility-settings";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ProfileImageUpload } from "@/components/user/profile-image-upload";
import { getServerSession } from "@/server/auth";
import {
	getUserAccountInfo,
	getUserAuthMethod,
	userHasGoogleAccount,
	userHasPasskeys,
} from "@/server/queries/user";
import { CreditCard, Crown, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	}

	const hasPasskeys = await userHasPasskeys(session.user.id);
	const hasGoogleAccount = await userHasGoogleAccount(session.user.id);
	const authMethod = await getUserAuthMethod(session.user.id);
	const accountInfo = await getUserAccountInfo(session.user.id);

	return (
		<div className="theme-bg-surface min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="theme-text mb-2 font-bold text-4xl">設定</h1>
					<p className="theme-text-secondary text-lg">
						アカウントとセキュリティの設定
					</p>
				</div>

				<div className="mx-auto max-w-2xl space-y-6">
					<ProfileImageUpload />

					<div className="clean-card p-6">
						<h2 className="mb-4 font-semibold text-theme-text text-xl">
							アカウント情報
						</h2>
						<div className="space-y-3 text-theme-text">
							<p>
								<span className="font-medium">名前:</span> {session.user?.name}
							</p>
							{authMethod !== "passkey-only" && (
								<p>
									<span className="font-medium">メール:</span>{" "}
									{session.user?.email}
								</p>
							)}
							<p>
								<span className="font-medium">認証方法:</span>{" "}
								{authMethod === "passkey-only" ? (
									<span className="inline-flex items-center gap-1 rounded-full border border-theme-primary bg-theme-primary/10 px-2 py-1 text-sm text-theme-primary">
										🔑 パスキーのみ
									</span>
								) : authMethod === "google-with-passkey" ? (
									<span className="inline-flex items-center gap-1 rounded-full border border-theme-success bg-theme-success/10 px-2 py-1 text-sm text-theme-success">
										Google + パスキー
									</span>
								) : authMethod === "google-only" ? (
									<span className="inline-flex items-center gap-1 rounded-full border border-theme-success bg-theme-success/10 px-2 py-1 text-sm text-theme-success">
										Google
									</span>
								) : (
									<span className="inline-flex items-center gap-1 rounded-full border border-theme-border bg-theme-surface px-2 py-1 text-sm text-theme-text-secondary">
										不明
									</span>
								)}
							</p>
						</div>
					</div>

					{/* パスキー設定プロンプト（Googleユーザーでパスキーがない場合のみ） */}
					{!hasPasskeys && hasGoogleAccount && <PasskeySetupPrompt />}

					{/* パスキーのみユーザー向けメッセージ */}
					{authMethod === "passkey-only" && (
						<div className="clean-card border-theme-primary bg-theme-primary/5 p-6">
							<h3 className="mb-3 flex items-center gap-2 font-semibold text-theme-primary">
								🔑 パスキー認証でセキュア
							</h3>
							<p className="text-sm text-theme-text-secondary">
								あなたはパスキーのみで認証しているため、最高レベルのセキュリティを享受しています。
								パスワードを覚える必要もなく、フィッシング攻撃からも完全に保護されています。
							</p>
						</div>
					)}

					{/* サブスクリプション管理 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-theme-text">
								<Crown className="h-5 w-5 text-theme-accent" />
								プレミアム機能
							</CardTitle>
							<CardDescription className="text-theme-text-secondary">
								サブスクリプションの管理と課金設定
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-medium text-theme-text">現在のプラン</h3>
									<p className="text-sm text-theme-text-secondary">
										フリープラン - 基本機能をご利用中
									</p>
								</div>
								<Link href="/subscription">
									<Button className="bg-theme-primary text-theme-background hover:bg-theme-secondary">
										<Crown className="mr-2 h-4 w-4" />
										プランを確認
									</Button>
								</Link>
							</div>
							<div className="rounded-lg border border-theme-border bg-theme-surface p-3">
								<p className="text-sm text-theme-text-secondary">
									💡
									プレミアムプランで無制限の服・コーディネート登録、画像アップロード、AI機能をご利用いただけます。
								</p>
							</div>
						</CardContent>
					</Card>

					<PasskeyManager />

					<HearingAccessibilitySettings />

					<AccessibilitySettings />

					<ThemeSelector />

					{/* デバッグ情報（開発環境のみ） */}
					{process.env.NODE_ENV === "development" && (
						<details className="clean-card p-6">
							<summary className="cursor-pointer font-semibold text-theme-text">
								🔧 デバッグ情報 (開発環境のみ)
							</summary>
							<div className="mt-4 space-y-2 text-sm text-theme-text">
								<div>
									<strong>ユーザーID:</strong> {session.user.id}
								</div>
								<div>
									<strong>認証方法判定:</strong> {authMethod}
								</div>
								<div>
									<strong>パスキー有無:</strong>{" "}
									{accountInfo.hasPasskeys ? "あり" : "なし"} (
									{accountInfo.passkeyCount}個)
								</div>
								<div>
									<strong>Google有無:</strong>{" "}
									{accountInfo.hasGoogle ? "あり" : "なし"}
								</div>
								<div>
									<strong>アカウント情報:</strong>
									<pre className="mt-2 overflow-auto rounded border border-theme-border bg-theme-surface p-2 text-theme-text text-xs">
										{JSON.stringify(accountInfo.accounts, null, 2)}
									</pre>
								</div>
							</div>
						</details>
					)}
				</div>
			</div>
		</div>
	);
}
