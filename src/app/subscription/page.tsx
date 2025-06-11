import { BackButton } from "@/components/back-button";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import SubscriptionPlans from "./_components/subscription-plans";

export default async function SubscriptionPage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/api/auth/signin");
	}

	return (
		<div className="gradient-pink-soft min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<BackButton href="/" />
				<div className="mb-12 text-center">
					<h1 className="mb-4 font-bold text-5xl text-slate-900">
						プレミアムプラン
					</h1>
					<p className="text-slate-700 text-xl">
						もっと便利に！あなたのおしゃれライフをアップグレード
					</p>
				</div>
				<SubscriptionPlans />
			</div>
		</div>
	);
}
