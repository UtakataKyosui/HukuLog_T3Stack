import { env } from "@/env";
import { db } from "@/server/db";
import {
	accounts,
	passkeys,
	sessions,
	users,
	verifications,
} from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { anonymous } from "better-auth/plugins/anonymous";
import { passkey } from "better-auth/plugins/passkey";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: users,
			account: accounts,
			session: sessions,
			verification: verifications,
			passkey: passkeys,
		},
	}),
	secret: env.BETTER_AUTH_SECRET || "dev-secret-key",
	baseURL:
		process.env.NODE_ENV === "production"
			? process.env.NEXT_PUBLIC_APP_URL
			: process.env.CODESPACE_NAME
				? `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
				: "http://localhost:3000",
	trustedOrigins: [
		"http://localhost:3000",
		"https://localhost:3000",
		...(process.env.CODESPACE_NAME
			? [
					`https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
				]
			: []),
		...(process.env.NEXT_PUBLIC_APP_URL
			? [process.env.NEXT_PUBLIC_APP_URL]
			: []),
	],
	emailAndPassword: {
		enabled: false,
	},
	socialProviders:
		env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET,
					},
				}
			: {},
	plugins: [
		anonymous(),
		openAPI(),
		passkey({
			rpID:
				process.env.NODE_ENV === "production"
					? new URL(process.env.NEXT_PUBLIC_APP_URL || "").hostname
					: process.env.CODESPACE_NAME
						? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
						: "localhost",
			rpName: "HukuLog App",
			origin:
				process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_APP_URL
					? process.env.NEXT_PUBLIC_APP_URL
					: process.env.CODESPACE_NAME
						? `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
						: "http://localhost:3000",
		}),
		...(env.NOTION_CLIENT_ID && env.NOTION_CLIENT_SECRET
			? [
					genericOAuth({
						config: [
							{
								providerId: "notion",
								clientId: env.NOTION_CLIENT_ID,
								clientSecret: env.NOTION_CLIENT_SECRET,
								authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
								tokenUrl: "https://api.notion.com/v1/oauth/token",
								userInfoUrl: "https://api.notion.com/v1/users/me",
								scopes: ["read"],
								pkce: false,
							},
						],
					}),
				]
			: []),
		nextCookies(),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieName: "better-auth.session_token",
	},
});

export type Session = typeof auth.$Infer.Session;
