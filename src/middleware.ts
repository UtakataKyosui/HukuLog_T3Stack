import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 静的ファイルとAPIルートは除外
	if (
		pathname.startsWith("/_next/") ||
		pathname.startsWith("/api/") ||
		pathname.includes(".") ||
		pathname.startsWith("/favicon")
	) {
		return NextResponse.next();
	}

	// 公開ページ（認証不要）
	const publicPaths = ["/"];
	if (publicPaths.includes(pathname)) {
		return NextResponse.next();
	}

	// 認証が必要なページのパスを明確に定義
	const protectedPaths = [
		"/outfits",
		"/wardrobe",
		"/settings",
		"/subscription",
	];
	const isProtectedRoute = protectedPaths.some((path) =>
		pathname.startsWith(path),
	);

	if (!isProtectedRoute) {
		// 保護されたルートでない場合はそのまま続行
		return NextResponse.next();
	}

	// Better Auth を使用してセッションチェック
	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		// セッションがない場合はホームページにリダイレクト
		return NextResponse.redirect(new URL("/", request.url));
	}

	// セッションがあれば続行
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - Any file extension
		 */
		"/((?!api|_next/static|_next/image|favicon|.*\\.).*)",
	],
};
