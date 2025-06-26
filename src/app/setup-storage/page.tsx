"use client";

import { StorageSelectionEnhanced } from "@/components/setup/storage-selection-enhanced";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetupStoragePage() {
	const [session, setSession] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const sessionData = await authClient.getSession();
				if (!sessionData) {
					router.push("/login");
					return;
				}
				setSession(sessionData);
			} catch (error) {
				console.error("Session check error:", error);
				router.push("/login");
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [router]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-theme-primary border-b-2"></div>
					<div>セッションを確認中...</div>
				</div>
			</div>
		);
	}

	if (!session) {
		return null; // リダイレクト中
	}

	return <StorageSelectionEnhanced />;
}
