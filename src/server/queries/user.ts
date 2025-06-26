import { db } from "@/server/db";
import { accounts, passkeys } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserPasskeyCount(userId: string): Promise<number> {
	const userPasskeys = await db
		.select()
		.from(passkeys)
		.where(eq(passkeys.userId, userId));

	return userPasskeys.length;
}

export async function userHasPasskeys(userId: string): Promise<boolean> {
	const count = await getUserPasskeyCount(userId);
	return count > 0;
}

export async function userHasGoogleAccount(userId: string): Promise<boolean> {
	const googleAccount = await db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, userId));

	return googleAccount.some((account) => account.providerId === "google");
}

export async function userIsPasskeyOnly(userId: string): Promise<boolean> {
	const userAccounts = await db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, userId));

	// パスキーが存在し、かつGoogleアカウントが存在しない場合
	const hasPasskey = await userHasPasskeys(userId);
	const hasGoogle = userAccounts.some(
		(account) => account.providerId === "google",
	);

	return hasPasskey && !hasGoogle;
}

export async function getUserAuthMethod(
	userId: string,
): Promise<"passkey-only" | "google-with-passkey" | "google-only" | "unknown"> {
	const hasPasskey = await userHasPasskeys(userId);
	const hasGoogle = await userHasGoogleAccount(userId);

	if (hasPasskey && !hasGoogle) {
		return "passkey-only";
	} else if (hasGoogle && hasPasskey) {
		return "google-with-passkey";
	} else if (hasGoogle && !hasPasskey) {
		return "google-only";
	} else {
		return "unknown";
	}
}

export async function getUserAccountInfo(userId: string) {
	const userAccounts = await db
		.select({
			id: accounts.id,
			providerId: accounts.providerId,
			accountId: accounts.accountId,
		})
		.from(accounts)
		.where(eq(accounts.userId, userId));

	const userPasskeysCount = await getUserPasskeyCount(userId);

	return {
		accounts: userAccounts,
		passkeyCount: userPasskeysCount,
		hasGoogle: userAccounts.some((acc) => acc.providerId === "google"),
		hasPasskeys: userPasskeysCount > 0,
	};
}
