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
	emailAndPassword: {
		enabled: true,
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
	plugins: [passkey()],
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},
});

export type Session = typeof auth.$Infer.Session;
