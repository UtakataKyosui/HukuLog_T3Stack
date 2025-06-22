import { SubscriptionManagement } from "@/components/subscription/subscription-management";
import { getServerSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function SubscriptionPage() {
	const session = await getServerSession();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-4xl">
				<h1 className="mb-8 font-bold text-3xl text-theme-text">
					サブスクリプション管理
				</h1>
				<SubscriptionManagement />
			</div>
		</div>
	);
}
