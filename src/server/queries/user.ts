import { db } from "@/server/db";
import { passkeys } from "@/server/db/schema";
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
