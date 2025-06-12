import { Navigation } from "@/components/navigation";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import OutfitList from "./_components/outfit-list";

export default async function OutfitsPage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/");
	}

	return (
		<div className="gradient-pink-soft min-h-screen">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-slate-900">
						マイコーディネート
					</h1>
					<p className="text-lg text-slate-700">
						素敵なコーデをコレクションして、毎日のおしゃれを楽しもう
					</p>
				</div>
				<OutfitList />
			</div>
		</div>
	);
}
