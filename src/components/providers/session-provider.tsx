"use client";

import { authClient } from "@/lib/auth-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

type SessionContextType = {
	session: { user?: { id: string; name?: string; email?: string } } | null;
	isLoading: boolean;
	error: Error | null;
	retry: () => void;
};

const SessionContext = createContext<SessionContextType>({
	session: null,
	isLoading: true,
	error: null,
	retry: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: (failureCount, error: { status?: number } | null) => {
							// 認証エラーの場合はリトライしない
							if (error?.status === 401 || error?.status === 403) {
								return false;
							}
							// ネットワークエラーの場合は最大3回リトライ
							return failureCount < 3;
						},
						staleTime: 5 * 60 * 1000, // 5分間キャッシュ
					},
				},
			}),
	);

	const {
		data: session,
		isPending: isLoading,
		error,
		refetch,
	} = authClient.useSession();

	useEffect(() => {
		// セッションエラーをログに記録（リダイレクトはmiddlewareが処理）
		if (error && !isLoading) {
			console.warn("Session fetch failed:", error);
		}
	}, [error, isLoading]);

	const retry = () => {
		refetch();
	};

	return (
		<QueryClientProvider client={queryClient}>
			<SessionContext.Provider value={{ session, isLoading, error, retry }}>
				{children}
			</SessionContext.Provider>
		</QueryClientProvider>
	);
}

export function useSession() {
	return useContext(SessionContext);
}
