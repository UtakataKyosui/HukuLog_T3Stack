import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import OutfitList from "./_components/outfit-list";

export default async function OutfitsPage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/");
	}

	return (
		<div className="theme-bg-surface min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="theme-text mb-2 font-bold text-4xl">
						マイコーディネート
					</h1>
					<p className="theme-text-secondary text-lg">
						素敵なコーデをコレクションして、毎日のおしゃれを楽しもう
					</p>
				</div>
				<OutfitList />
			</div>
		</div>
	);
}
