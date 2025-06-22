import { env } from "@/env";
import { getServerSession } from "@/server/auth";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
	apiVersion: "2024-11-20.acacia",
});

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession();

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { priceId } = await req.json();

		if (!priceId) {
			return NextResponse.json(
				{ error: "Price ID is required" },
				{ status: 400 },
			);
		}

		// Stripeカスタマーを作成または取得
		let customer: Stripe.Customer;

		// Better Auth Stripe pluginを使用してカスタマー情報を取得
		const customers = await stripe.customers.list({
			email: session.user.email,
			limit: 1,
		});

		if (customers.data.length > 0) {
			customer = customers.data[0];
		} else {
			customer = await stripe.customers.create({
				email: session.user.email,
				name: session.user.name || undefined,
			});
		}

		// サブスクリプションを作成
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: priceId }],
			payment_behavior: "default_incomplete",
			payment_settings: { save_default_payment_method: "on_subscription" },
			expand: ["latest_invoice.payment_intent"],
		});

		const invoice = subscription.latest_invoice as Stripe.Invoice;
		const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

		return NextResponse.json({
			subscriptionId: subscription.id,
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error("Error creating subscription:", error);
		return NextResponse.json(
			{ error: "Failed to create subscription" },
			{ status: 500 },
		);
	}
}
