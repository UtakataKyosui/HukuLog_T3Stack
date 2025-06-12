import { Navigation } from "@/components/navigation";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import ClothingList from "./_components/clothing-list";

export default async function WardrobePage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/");
	}

	return (
		<div className="gradient-light min-h-screen">
			<Navigation />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-4xl text-slate-900">服の管理</h1>
					<p className="text-lg text-slate-700">お洋服を素敵に管理しましょう</p>
				</div>
				<ClothingList />
			</div>
		</div>
	);
}
