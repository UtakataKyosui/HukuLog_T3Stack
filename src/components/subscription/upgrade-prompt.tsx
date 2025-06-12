"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Crown, Sparkles, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UpgradePromptProps {
	type: "clothing_limit" | "outfit_limit" | "image_upload" | "general";
	onClose?: () => void;
	currentCount?: number;
	limit?: number;
	showAsModal?: boolean;
}

export function UpgradePrompt({
	type,
	onClose,
	currentCount,
	limit,
	showAsModal = false,
}: UpgradePromptProps) {
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(true);

	const handleClose = () => {
		setIsVisible(false);
		onClose?.();
	};

	const handleUpgrade = () => {
		router.push("/subscription");
	};

	if (!isVisible) return null;

	const getPromptContent = () => {
		switch (type) {
			case "clothing_limit":
				return {
					title: "服の登録上限に到達",
					description: `現在 ${currentCount}/${limit} 点の服が登録されています。さらに服を追加するにはプランのアップグレードが必要です。`,
					benefits: [
						"ベーシックプラン: 200点まで登録可能",
						"プレミアムプラン: 無制限で登録可能",
						"画像アップロード機能",
						"高度な検索・フィルター機能",
					],
					icon: <Crown className="h-6 w-6 text-theme-accent" />,
				};
			case "outfit_limit":
				return {
					title: "コーディネート作成上限に到達",
					description: `現在 ${currentCount}/${limit} 件のコーディネートを作成済みです。さらに作成するにはプランのアップグレードが必要です。`,
					benefits: [
						"ベーシックプラン: 50件まで作成可能",
						"プレミアムプラン: 無制限で作成可能",
						"AI活用コーディネート提案",
						"詳細な分析・統計機能",
					],
					icon: <Sparkles className="h-6 w-6 text-theme-accent" />,
				};
			case "image_upload":
				return {
					title: "画像アップロード機能を利用",
					description:
						"画像をアップロードして服やコーディネートをより分かりやすく管理しましょう。",
					benefits: [
						"服の写真を保存して視覚的に管理",
						"コーディネート写真の保存",
						"カラーパレット自動生成",
						"画像検索機能",
					],
					icon: <Zap className="h-6 w-6 text-theme-accent" />,
				};
			default:
				return {
					title: "プレミアム機能を利用",
					description:
						"より多くの機能を利用してスタイル管理を充実させましょう。",
					benefits: [
						"無制限の服・コーディネート登録",
						"画像アップロード機能",
						"AI活用機能",
						"詳細な分析機能",
					],
					icon: <Crown className="h-6 w-6 text-theme-accent" />,
				};
		}
	};

	const content = getPromptContent();

	const CardComponent = (
		<Card
			className={`${
				showAsModal
					? "w-full max-w-md border-theme-primary shadow-2xl"
					: "border-theme-primary"
			}`}
		>
			<CardHeader className="relative">
				{onClose && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClose}
						className="absolute top-2 right-2 h-6 w-6 p-0 text-theme-text-secondary hover:text-theme-text"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
				<div className="flex items-center gap-3">
					{content.icon}
					<div>
						<CardTitle className="text-theme-text">{content.title}</CardTitle>
						<Badge className="mt-1 bg-theme-accent text-theme-background">
							<Crown className="mr-1 h-3 w-3" />
							プレミアム機能
						</Badge>
					</div>
				</div>
				<CardDescription className="mt-2 text-theme-text-secondary">
					{content.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<h4 className="mb-2 font-medium text-sm text-theme-text">
						アップグレードで利用できる機能：
					</h4>
					<ul className="space-y-1">
						{content.benefits.map((benefit, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-sm text-theme-text"
							>
								<div className="h-1.5 w-1.5 rounded-full bg-theme-primary" />
								{benefit}
							</li>
						))}
					</ul>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleUpgrade}
						className="flex-1 bg-theme-primary text-theme-background hover:bg-theme-secondary"
					>
						<Zap className="mr-2 h-4 w-4" />
						プランを見る
					</Button>
					{onClose && (
						<Button
							variant="outline"
							onClick={handleClose}
							className="border-theme-border text-theme-text hover:bg-theme-surface"
						>
							後で
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);

	if (showAsModal) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
				{CardComponent}
			</div>
		);
	}

	return CardComponent;
}
