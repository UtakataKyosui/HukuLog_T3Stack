"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Check, Crown, Star, Zap } from "lucide-react";
import { useState } from "react";

export default function SubscriptionPlans() {
	const [loading, setLoading] = useState<string | null>(null);

	const { data: plans } = api.subscription.getPlans.useQuery();
	const { data: currentSubscription, refetch: refetchSubscription } =
		api.subscription.getUserSubscription.useQuery();
	const { data: usage } = api.subscription.getUserUsage.useQuery();

	const subscribeMutation = api.subscription.subscribe.useMutation({
		onSuccess: () => {
			refetchSubscription();
			setLoading(null);
		},
		onError: (error) => {
			console.error("Subscription failed:", error);
			setLoading(null);
		},
	});

	const cancelMutation = api.subscription.cancelSubscription.useMutation({
		onSuccess: () => {
			refetchSubscription();
		},
	});

	const handleSubscribe = (planId: string) => {
		setLoading(planId);
		subscribeMutation.mutate({ planId });
	};

	const handleCancel = () => {
		if (confirm("サブスクリプションをキャンセルしてもよろしいですか？")) {
			cancelMutation.mutate();
		}
	};

	const formatPrice = (price: number) => {
		return price === 0 ? "無料" : `¥${price.toLocaleString()}/月`;
	};

	const getPlanIcon = (planId: string) => {
		switch (planId) {
			case "free":
				return <Star className="h-6 w-6" />;
			case "premium":
				return <Crown className="h-6 w-6" />;
			case "pro":
				return <Zap className="h-6 w-6" />;
			default:
				return <Star className="h-6 w-6" />;
		}
	};

	const getPlanColor = (planId: string) => {
		switch (planId) {
			case "free":
				return "border-gray-200";
			case "premium":
				return "border-blue-500 ring-2 ring-blue-100";
			case "pro":
				return "border-purple-500 ring-2 ring-purple-100";
			default:
				return "border-gray-200";
		}
	};

	const isCurrentPlan = (planId: string) => {
		return currentSubscription?.planId === planId;
	};

	const formatLimit = (limit: number) => {
		return limit === -1 ? "無制限" : `${limit}個まで`;
	};

	return (
		<div className="space-y-8">
			{/* Current Usage */}
			{usage && (
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader>
						<CardTitle className="text-lg">現在の利用状況</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-gray-600 text-sm">登録済みの服</p>
								<p className="font-bold text-2xl text-blue-600">
									{usage.clothingItemsCount} 着
								</p>
							</div>
							<div>
								<p className="text-gray-600 text-sm">作成済みコーデ</p>
								<p className="font-bold text-2xl text-blue-600">
									{usage.outfitsCount} 個
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Current Subscription */}
			{currentSubscription && (
				<Card className="border-green-200 bg-green-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							現在のプラン: {currentSubscription.plan.name}
							{isCurrentPlan("premium") && (
								<Crown className="h-5 w-5 text-blue-500" />
							)}
							{isCurrentPlan("pro") && (
								<Zap className="h-5 w-5 text-purple-500" />
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-2 text-gray-600 text-sm">
							期間:{" "}
							{new Date(
								currentSubscription.currentPeriodStart,
							).toLocaleDateString("ja-JP")}
							{" ～ "}
							{new Date(
								currentSubscription.currentPeriodEnd,
							).toLocaleDateString("ja-JP")}
						</p>
						<p className="text-gray-600 text-sm">
							ステータス:{" "}
							{currentSubscription.status === "active" ? "有効" : "無効"}
						</p>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							onClick={handleCancel}
							disabled={cancelMutation.isPending}
						>
							{cancelMutation.isPending
								? "キャンセル中..."
								: "プランをキャンセル"}
						</Button>
					</CardFooter>
				</Card>
			)}

			{/* Plans */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{plans?.map((plan) => (
					<Card
						key={plan.id}
						className={`relative ${getPlanColor(plan.id)} ${
							plan.id === "premium" ? "scale-105 transform" : ""
						}`}
					>
						{plan.id === "premium" && (
							<div className="-top-3 -translate-x-1/2 absolute left-1/2 transform">
								<Badge className="bg-blue-500 text-white">人気</Badge>
							</div>
						)}

						<CardHeader className="text-center">
							<div className="mb-4 flex justify-center">
								{getPlanIcon(plan.id)}
							</div>
							<CardTitle className="text-xl">{plan.name}</CardTitle>
							<div className="font-bold text-3xl">
								{formatPrice(plan.price)}
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-500" />
									<span className="text-sm">
										服の管理: {formatLimit(plan.maxClothingItems)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-500" />
									<span className="text-sm">
										コーデ作成: {formatLimit(plan.maxOutfits)}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-green-500" />
									<span className="text-sm">
										画像アップロード: {plan.canUploadImages ? "可能" : "不可"}
									</span>
								</div>
							</div>

							<div className="border-t pt-4">
								<p className="mb-2 font-medium text-sm">機能詳細:</p>
								<ul className="space-y-1">
									{plan.features.map((feature, index) => (
										<li
											key={index}
											className="flex items-start gap-2 text-gray-600 text-sm"
										>
											<Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
											{feature}
										</li>
									))}
								</ul>
							</div>
						</CardContent>

						<CardFooter>
							{isCurrentPlan(plan.id) ? (
								<Button disabled className="w-full">
									現在のプラン
								</Button>
							) : plan.id === "free" ? (
								<Button
									variant="outline"
									className="w-full"
									onClick={() => handleSubscribe(plan.id)}
									disabled={loading === plan.id}
								>
									{loading === plan.id
										? "切り替え中..."
										: "無料プランに切り替え"}
								</Button>
							) : (
								<Button
									className="w-full"
									onClick={() => handleSubscribe(plan.id)}
									disabled={loading === plan.id}
								>
									{loading === plan.id ? "申込み中..." : "このプランを選択"}
								</Button>
							)}
						</CardFooter>
					</Card>
				))}
			</div>

			<div className="mt-8 text-center text-gray-600 text-sm">
				<p>
					※
					実際の決済は統合されていません。デモ版では即座にプランが有効になります。
				</p>
			</div>
		</div>
	);
}
