import { HearingAccessibilitySettings } from "@/components/accessibility/hearing-accessibility-settings";
import { PasskeyManager } from "@/components/auth/passkey-manager";
import { PasskeySetupPrompt } from "@/components/auth/passkey-setup-prompt";
import { AccessibilitySettings } from "@/components/settings/accessibility-settings";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { ProfileEditor } from "@/components/user/profile-editor";
import { getServerSession } from "@/server/auth";
import {
	getUserAccountInfo,
	getUserAuthMethod,
	userHasGoogleAccount,
	userHasPasskeys,
} from "@/server/queries/user";
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
					<ProfileEditor
						initialName={session.user?.name}
						authMethod={authMethod}
						userEmail={session.user?.email}
					/>

					{/* パスキー設定プロンプト（Googleユーザーでパスキーがない場合のみ） */}
					{!hasPasskeys && hasGoogleAccount && <PasskeySetupPrompt />}

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
