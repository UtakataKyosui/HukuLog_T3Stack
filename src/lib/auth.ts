import { env } from "@/env";
import { db } from "@/server/db";
import {
	accounts,
	passkeys,
	sessions,
	users,
	verifications,
} from "@/server/db/schema";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "better-auth/plugins/passkey";

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
		passkey({
			rpID:
				process.env.NODE_ENV === "production"
					? new URL(process.env.NEXT_PUBLIC_APP_URL || "").hostname
					: process.env.CODESPACE_NAME
						? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
						: "localhost",
			rpName: "Workspace App",
			origin: [
				...(process.env.NODE_ENV === "production" &&
				process.env.NEXT_PUBLIC_APP_URL
					? [process.env.NEXT_PUBLIC_APP_URL]
					: []),
				...(process.env.CODESPACE_NAME
					? [
							`https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
						]
					: []),
				"http://localhost:3000",
				"https://localhost:3000",
			],
		}),
		stripe({
			stripeSecretKey: env.STRIPE_SECRET_KEY!,
			stripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
			stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET!,
		}),
		nextCookies(),
	],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
});

export type Session = typeof auth.$Infer.Session;
