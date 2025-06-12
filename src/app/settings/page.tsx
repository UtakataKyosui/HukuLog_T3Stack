import { PasskeyManager } from "@/components/auth/passkey-manager";
import { PasskeySetupPrompt } from "@/components/auth/passkey-setup-prompt";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { ProfileImageUpload } from "@/components/user/profile-image-upload";
import { getServerSession } from "@/server/auth";
import { userHasPasskeys, userHasGoogleAccount, getUserAuthMethod, getUserAccountInfo } from "@/server/queries/user";
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
						<h2 className="mb-4 font-semibold text-slate-900 text-xl">
							アカウント情報
						</h2>
						<div className="space-y-3">
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
									<span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-800 text-sm">
										🔑 パスキーのみ
									</span>
								) : authMethod === "google-with-passkey" ? (
									<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-800 text-sm">
										Google + パスキー
									</span>
								) : authMethod === "google-only" ? (
									<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-green-800 text-sm">
										Google
									</span>
								) : (
									<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-800 text-sm">
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
						<div className="clean-card border-blue-200 bg-blue-50 p-6">
							<h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-800">
								🔑 パスキー認証でセキュア
							</h3>
							<p className="text-blue-700 text-sm">
								あなたはパスキーのみで認証しているため、最高レベルのセキュリティを享受しています。
								パスワードを覚える必要もなく、フィッシング攻撃からも完全に保護されています。
							</p>
						</div>
					)}

					<PasskeyManager />

					<ThemeSelector />

					{/* デバッグ情報（開発環境のみ） */}
					{process.env.NODE_ENV === "development" && (
						<details className="clean-card p-6">
							<summary className="cursor-pointer font-semibold text-slate-900">
								🔧 デバッグ情報 (開発環境のみ)
							</summary>
							<div className="mt-4 space-y-2 text-sm">
								<div>
									<strong>ユーザーID:</strong> {session.user.id}
								</div>
								<div>
									<strong>認証方法判定:</strong> {authMethod}
								</div>
								<div>
									<strong>パスキー有無:</strong> {accountInfo.hasPasskeys ? "あり" : "なし"} ({accountInfo.passkeyCount}個)
								</div>
								<div>
									<strong>Google有無:</strong> {accountInfo.hasGoogle ? "あり" : "なし"}
								</div>
								<div>
									<strong>アカウント情報:</strong>
									<pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
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
