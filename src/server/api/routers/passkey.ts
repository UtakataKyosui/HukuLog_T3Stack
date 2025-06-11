import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { passkeys } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const passkeyRouter = createTRPCRouter({
  getMyPasskeys: protectedProcedure.query(async ({ ctx }) => {
    const userPasskeys = await ctx.db
      .select({
        id: passkeys.id,
        name: passkeys.name,
        deviceType: passkeys.deviceType,
        createdAt: passkeys.createdAt,
        aaguid: passkeys.aaguid,
      })
      .from(passkeys)
      .where(eq(passkeys.userId, ctx.session.user.id));

    return userPasskeys.map((pk) => ({
      id: pk.id,
      name: pk.name || `${pk.deviceType} デバイス`,
      deviceType: pk.deviceType,
      createdAt: pk.createdAt.toISOString(),
    }));
  }),

  deletePasskey: protectedProcedure
    .input(z.object({ passkeyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(passkeys)
        .where(eq(passkeys.id, input.passkeyId));
      
      return { success: true };
    }),
});