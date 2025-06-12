import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import ClothingList from "./_components/clothing-list";

export default async function WardrobePage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/");
	}

	return (
		<div className="theme-bg-surface min-h-screen">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 text-center">
					<h1 className="theme-text mb-2 font-bold text-4xl">服の管理</h1>
					<p className="theme-text-secondary text-lg">お洋服を素敵に管理しましょう</p>
				</div>
				<ClothingList />
			</div>
		</div>
	);
}
