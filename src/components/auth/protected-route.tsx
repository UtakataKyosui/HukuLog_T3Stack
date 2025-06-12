"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	session: any;
}

export function ProtectedRoute({ children, session }: ProtectedRouteProps) {
	const router = useRouter();

	useEffect(() => {
		if (!session?.user) {
			router.push("/");
		}
	}, [session, router]);

	if (!session?.user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="text-center">
					<div className="mb-4 text-4xl">🔒</div>
					<h1 className="mb-2 font-bold text-slate-800 text-xl">
						ログインが必要です
					</h1>
					<p className="text-slate-600">
						この機能をご利用いただくにはログインが必要です
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
