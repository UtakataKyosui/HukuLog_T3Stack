import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const userRouter = createTRPCRouter({
	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).optional(),
				image: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			await ctx.db
				.update(users)
				.set({
					name: input.name,
					image: input.image,
					updatedAt: new Date(),
				})
				.where(eq(users.id, userId));

			return { success: true };
		}),

	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const user = await ctx.db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		return user[0] || null;
	}),
});
