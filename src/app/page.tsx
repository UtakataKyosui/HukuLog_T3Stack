import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { getServerSession } from "@/server/auth";
import { HydrateClient, api } from "@/trpc/server";

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });
	const session = await getServerSession();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<main className="gradient-light min-h-screen">
				<div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16">
					<div className="text-center">
						<h1 className="mb-4 font-extrabold text-5xl text-slate-900 tracking-tight sm:text-[6rem]">
							Wardrobe Manager
						</h1>
						<p className="font-medium text-slate-700 text-xl">
							服とコーディネートを効率的に管理
						</p>
					</div>

					{session ? (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-4">
							<Link
								className="clean-card flex max-w-sm flex-col gap-4 p-6 transition-all duration-300 hover:shadow-clean-lg"
								href="/wardrobe"
							>
								<div className="mb-2 text-4xl">👔</div>
								<h3 className="font-bold text-2xl text-slate-900">
									ワードローブ
								</h3>
								<div className="text-lg text-slate-700">
									服を整理して効率的に管理
								</div>
							</Link>
							<Link
								className="clean-card flex max-w-sm flex-col gap-4 p-6 transition-all duration-300 hover:shadow-clean-lg"
								href="/outfits"
							>
								<div className="mb-2 text-4xl">📋</div>
								<h3 className="font-bold text-2xl text-slate-900">
									コーディネート
								</h3>
								<div className="text-lg text-slate-700">
									コーディネートを保存・管理
								</div>
							</Link>
							<Link
								className="clean-card flex max-w-sm flex-col gap-4 p-6 transition-all duration-300 hover:shadow-clean-lg"
								href="/subscription"
							>
								<div className="mb-2 text-4xl">⭐</div>
								<h3 className="font-bold text-2xl text-slate-900">
									プレミアムプラン
								</h3>
								<div className="text-lg text-slate-700">
									追加機能でより便利に
								</div>
							</Link>
							<Link
								className="clean-card flex max-w-sm flex-col gap-4 p-6 transition-all duration-300 hover:shadow-clean-lg"
								href="/settings"
							>
								<div className="mb-2 text-4xl">⚙️</div>
								<h3 className="font-bold text-2xl text-slate-900">設定</h3>
								<div className="text-lg text-slate-700">
									アカウントとパスキー管理
								</div>
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
							<Link
								className="clean-card flex max-w-sm flex-col gap-4 p-6 transition-all duration-300 hover:shadow-clean-lg"
								href="/login"
							>
								<div className="mb-2 text-4xl">🔑</div>
								<h3 className="font-bold text-2xl text-slate-900">ログイン</h3>
								<div className="text-lg text-slate-700">
									服の管理を始めましょう。GoogleやPasskeyでログインできます
								</div>
							</Link>
							<div className="clean-card flex max-w-sm flex-col gap-4 p-6">
								<div className="mb-2 text-4xl">📱</div>
								<h3 className="font-bold text-2xl text-slate-900">機能紹介</h3>
								<div className="text-lg text-slate-700">
									服の管理、コーデ作成、季節別整理など便利な機能
								</div>
							</div>
						</div>
					)}

					<div className="flex flex-col items-center gap-6">
						{session && (
							<div className="clean-card px-8 py-4">
								<p className="text-center font-medium text-slate-700 text-xl">
									こんにちは、{session.user?.name}さん！
								</p>
							</div>
						)}
						<Link
							href={session ? "/api/auth/signout" : "/login"}
							className="clean-button px-8 py-4 font-bold text-lg text-white"
						>
							{session ? "ログアウト" : "ログインして始める"}
						</Link>
					</div>
				</div>
			</main>
		</HydrateClient>
	);
}
