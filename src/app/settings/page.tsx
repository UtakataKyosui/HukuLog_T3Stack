import { PasskeyManager } from "@/components/auth/passkey-manager";
import { PasskeySetupPrompt } from "@/components/auth/passkey-setup-prompt";
import { Navigation } from "@/components/navigation";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { ProfileImageUpload } from "@/components/user/profile-image-upload";
import { getServerSession } from "@/server/auth";
import { userHasPasskeys } from "@/server/queries/user";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/");
	}

	const hasPasskeys = await userHasPasskeys(session.user.id);

	return (
		<div className="gradient-light min-h-screen">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-slate-900">設定</h1>
					<p className="text-lg text-slate-700">
						アカウントとセキュリティの設定
					</p>
				</div>

				<div className="mx-auto max-w-2xl space-y-6">
					<ProfileImageUpload />

					<div className="clean-card p-6">
						<h2 className="mb-4 font-semibold text-slate-900 text-xl">
							アカウント情報
						</h2>
						<div className="space-y-2">
							<p>
								<span className="font-medium">名前:</span> {session.user?.name}
							</p>
							<p>
								<span className="font-medium">メール:</span>{" "}
								{session.user?.email}
							</p>
						</div>
					</div>

					{/* パスキー設定プロンプト（Googleユーザーでパスキーがない場合） */}
					{!hasPasskeys && session.user?.email && <PasskeySetupPrompt />}

					<PasskeyManager />

					<ThemeSelector />
				</div>
			</div>
		</div>
	);
}
