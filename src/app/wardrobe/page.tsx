import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { WardrobePageContent } from "./_components/wardrobe-page-content";

export default async function WardrobePage() {
	const session = await getServerAuthSession();

	if (!session) {
		redirect("/");
	}

	return <WardrobePageContent />;
}
