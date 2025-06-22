"use client";

import { useSession } from "@/components/providers/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useState } from "react";

interface SubscriptionPlan {
	id: string;
	name: string;
	price: number;
	maxClothingItems: number;
	maxOutfits: number;
	canUploadImages: boolean;
	features: string[];
	stripePriceId?: string;
	isPopular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
	{
		id: "free",
		name: "フリープラン",
		price: 0,
		maxClothingItems: 50,
		maxOutfits: 10,
		canUploadImages: false,
		features: [
			"服の登録 最大50点",
			"コーディネート作成 最大10件",
			"基本的なタグ機能",
			"テーマカスタマイズ",
		],
	},
	{
		id: "basic",
		name: "ベーシックプラン",
		price: 490,
		maxClothingItems: 200,
		maxOutfits: 50,
		canUploadImages: true,
		features: [
			"服の登録 最大200点",
			"コーディネート作成 最大50件",
			"画像アップロード機能",
			"高度な検索・フィルター",
			"タグ・カテゴリー無制限",
			"カラーパレット機能",
		],
		stripePriceId: "price_basic_monthly",
	},
	{
		id: "premium",
		name: "プレミアムプラン",
		price: 990,
		maxClothingItems: -1, // unlimited
		maxOutfits: -1, // unlimited
		canUploadImages: true,
		features: [
			"服の登録 無制限",
			"コーディネート作成 無制限",
			"画像アップロード機能",
			"AI活用コーディネート提案",
			"詳細な分析・統計機能",
			"データエクスポート機能",
			"優先サポート",
		],
		stripePriceId: "price_premium_monthly",
		isPopular: true,
	},
];

export function SubscriptionManagement() {
	const { session } = useSession();
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const handleSubscribe = async (plan: SubscriptionPlan) => {
		if (!plan.stripePriceId) return;

		setIsLoading(plan.id);

		try {
			const response = await fetch("/api/stripe/create-subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					priceId: plan.stripePriceId,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create subscription");
			}

			const { subscriptionId, clientSecret } = await response.json();

			// Stripe Elements を使用してサブスクリプション確認画面へリダイレクト
			// 実際の実装では Stripe Elements を使用する必要があります
			console.log("Subscription created:", subscriptionId, clientSecret);
		} catch (error) {
			console.error("Subscription error:", error);
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<div className="space-y-8">
			{/* 現在のプラン表示 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-theme-text">
						<Crown className="h-5 w-5 text-theme-accent" />
						現在のプラン
					</CardTitle>
					<CardDescription className="text-theme-text-secondary">
						現在ご利用中のプランと使用状況
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold text-theme-text">フリープラン</h3>
							<p className="text-sm text-theme-text-secondary">
								服の登録: 12/50点 | コーディネート: 3/10件
							</p>
						</div>
						<Badge variant="secondary" className="text-theme-text">
							無料
						</Badge>
					</div>
				</CardContent>
			</Card>

			{/* プラン比較 */}
			<div>
				<h2 className="mb-6 font-bold text-2xl text-theme-text">
					プランを選択
				</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{subscriptionPlans.map((plan) => (
						<Card
							key={plan.id}
							className={`relative ${
								plan.isPopular
									? "border-theme-primary shadow-lg"
									: "border-theme-border"
							}`}
						>
							{plan.isPopular && (
								<div className="-top-3 -translate-x-1/2 absolute left-1/2 transform">
									<Badge className="bg-theme-primary text-theme-background">
										<Star className="mr-1 h-3 w-3" />
										人気
									</Badge>
								</div>
							)}
							<CardHeader>
								<CardTitle className="text-theme-text">{plan.name}</CardTitle>
								<div className="flex items-baseline gap-1">
									<span className="font-bold text-3xl text-theme-text">
										¥{plan.price.toLocaleString()}
									</span>
									{plan.price > 0 && (
										<span className="text-sm text-theme-text-secondary">
											/月
										</span>
									)}
								</div>
								<CardDescription className="text-theme-text-secondary">
									{plan.price === 0
										? "基本機能を無料でお試し"
										: plan.isPopular
											? "最も人気のプラン"
											: "充実した機能でスタイル管理"}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<ul className="space-y-2">
									{plan.features.map((feature, index) => (
										<li
											key={index}
											className="flex items-center gap-2 text-sm text-theme-text"
										>
											<Check className="h-4 w-4 flex-shrink-0 text-theme-primary" />
											{feature}
										</li>
									))}
								</ul>
								{plan.id !== "free" && (
									<Button
										className="w-full bg-theme-primary text-theme-background hover:bg-theme-secondary"
										onClick={() => handleSubscribe(plan)}
										disabled={isLoading === plan.id}
									>
										{isLoading === plan.id ? (
											<div className="flex items-center gap-2">
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
												処理中...
											</div>
										) : (
											<div className="flex items-center gap-2">
												<Zap className="h-4 w-4" />
												アップグレード
											</div>
										)}
									</Button>
								)}
								{plan.id === "free" && (
									<Button
										variant="outline"
										className="w-full border-theme-border text-theme-text"
										disabled
									>
										現在のプラン
									</Button>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* FAQ */}
			<Card>
				<CardHeader>
					<CardTitle className="text-theme-text">よくある質問</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h4 className="mb-1 font-medium text-theme-text">
							プランはいつでも変更できますか？
						</h4>
						<p className="text-sm text-theme-text-secondary">
							はい、いつでもプランの変更・キャンセルが可能です。アップグレードは即座に反映され、ダウングレードは次の請求サイクルから適用されます。
						</p>
					</div>
					<div>
						<h4 className="mb-1 font-medium text-theme-text">
							データは引き継がれますか？
						</h4>
						<p className="text-sm text-theme-text-secondary">
							プラン変更時も、登録済みの服やコーディネートデータはすべて保持されます。ダウングレード時は制限を超えた分は非表示になりますが、データは削除されません。
						</p>
					</div>
					<div>
						<h4 className="mb-1 font-medium text-theme-text">支払い方法は？</h4>
						<p className="text-sm text-theme-text-secondary">
							クレジットカード（Visa、Mastercard、JCB、American
							Express）にて毎月自動決済されます。
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
