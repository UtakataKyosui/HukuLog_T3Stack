import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/server/auth";

export default async function Home() {
	const session = await getServerSession();

	// ログイン済みユーザーはコーディネート一覧にリダイレクト
	if (session?.user) {
		redirect("/outfits");
	}

	return (
		<main className="theme-bg min-h-screen">
			<div className="theme-bg container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16">
				{/* ヒーローセクション */}
				<div className="max-w-4xl text-center">
					<h1 className="theme-text mb-6 font-extrabold text-5xl tracking-tight sm:text-[6rem]">
						服管理アプリ
					</h1>
					<p className="theme-text-secondary mb-8 font-medium text-xl">
						服とコーディネートを効率的に管理し、毎日のスタイリングをもっと楽しく
					</p>
					<div className="flex justify-center gap-4">
						<Link
							href="/login"
							className="clean-button px-8 py-4 font-bold text-lg text-white"
						>
							🔑 ログインして始める
						</Link>
						<Link
							href="#features"
							className="clean-card theme-text flex items-center px-8 py-4 font-bold text-lg transition-opacity hover:opacity-80"
						>
							📖 機能を見る
						</Link>
					</div>
				</div>

				{/* 機能紹介セクション */}
				<section id="features" className="w-full max-w-6xl">
					<h2 className="theme-text mb-12 text-center font-bold text-3xl">
						主な機能
					</h2>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						<div className="clean-card p-6 text-center">
							<div className="mb-4 text-5xl">👔</div>
							<h3 className="theme-text mb-3 font-bold text-xl">服の管理</h3>
							<p className="theme-text-secondary">
								写真付きで服を登録し、ブランド、色、サイズ、購入価格などの詳細情報を記録できます
							</p>
						</div>
						<div className="clean-card p-6 text-center">
							<div className="mb-4 text-5xl">📋</div>
							<h3 className="theme-text mb-3 font-bold text-xl">
								コーディネート
							</h3>
							<p className="theme-text-secondary">
								登録した服を組み合わせてコーディネートを作成し、シーンや評価と共に保存できます
							</p>
						</div>
						<div className="clean-card p-6 text-center">
							<div className="mb-4 text-5xl">🔍</div>
							<h3 className="theme-text mb-3 font-bold text-xl">検索・整理</h3>
							<p className="theme-text-secondary">
								カテゴリ、季節、タグで効率的に検索し、着用履歴で重複を防げます
							</p>
						</div>
					</div>
				</section>

				{/* セキュリティ・安全性 */}
				<section className="w-full max-w-4xl">
					<div className="clean-card p-8 text-center">
						<h3 className="theme-text mb-6 font-bold text-2xl">
							🔒 安全でパスワードレス
						</h3>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<h4 className="theme-text mb-3 font-semibold text-lg">
									Passkeyログイン
								</h4>
								<p className="theme-text-secondary text-sm">
									指紋や顔認証で安全にログイン。パスワードを覚える必要はありません。
								</p>
							</div>
							<div>
								<h4 className="theme-text mb-3 font-semibold text-lg">
									プライベート
								</h4>
								<p className="theme-text-secondary text-sm">
									あなたのデータは完全にプライベート。他のユーザーからは見えません。
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* PWA対応 */}
				<section className="w-full max-w-4xl">
					<div className="clean-card p-8 text-center">
						<h3 className="theme-text mb-4 font-bold text-2xl">📱 PWA対応</h3>
						<p className="theme-text-secondary mb-6">
							スマートフォンのホーム画面にアプリを追加して、オフラインでも利用可能
						</p>
						<div className="flex flex-wrap justify-center gap-4 text-sm">
							<span className="theme-bg-primary/10 theme-border theme-text-secondary rounded-full border px-3 py-1">
								📲 ホーム画面追加
							</span>
							<span className="theme-bg-primary/10 theme-border theme-text-secondary rounded-full border px-3 py-1">
								📡 オフライン閱覧
							</span>
							<span className="theme-bg-primary/10 theme-border theme-text-secondary rounded-full border px-3 py-1">
								🔔 プッシュ通知
							</span>
						</div>
					</div>
				</section>

				{/* CTA */}
				<div className="text-center">
					<h3 className="theme-text mb-4 font-bold text-2xl">
						今すぐ始めましょう
					</h3>
					<p className="theme-text-secondary mb-6">
						無料で利用開始できます。GoogleやPasskeyで簡単ログイン。
					</p>
					<Link
						href="/login"
						className="clean-button px-12 py-4 font-bold text-white text-xl"
					>
						🔑 無料で始める
					</Link>
				</div>
			</div>
		</main>
	);
}
