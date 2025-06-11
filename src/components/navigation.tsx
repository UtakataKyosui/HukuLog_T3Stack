"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navigation() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
	};

	if (!session) {
		return null;
	}

	return (
		<nav className="bg-white border-b border-slate-200 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center space-x-8">
						<Link href="/" className="text-xl font-bold text-slate-900">
							Wardrobe Manager
						</Link>
						<div className="hidden md:flex space-x-6">
							<Link
								href="/wardrobe"
								className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
							>
								ワードローブ
							</Link>
							<Link
								href="/outfits"
								className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
							>
								コーディネート
							</Link>
							<Link
								href="/subscription"
								className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
							>
								プレミアム
							</Link>
							<Link
								href="/settings"
								className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
							>
								設定
							</Link>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<span className="text-sm text-slate-700">
							こんにちは、{session.user.name}さん
						</span>
						<Button
							onClick={handleSignOut}
							variant="outline"
							size="sm"
							className="text-slate-700 hover:text-slate-900"
						>
							ログアウト
						</Button>
					</div>
				</div>
			</div>
		</nav>
	);
}