"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LimitReachedBannerProps {
	type: "clothing" | "outfit";
	currentCount: number;
	limit: number;
	onDismiss?: () => void;
}

export function LimitReachedBanner({
	type,
	currentCount,
	limit,
	onDismiss,
}: LimitReachedBannerProps) {
	const router = useRouter();
	const [isDismissed, setIsDismissed] = useState(false);

	const handleDismiss = () => {
		setIsDismissed(true);
		onDismiss?.();
	};

	const handleUpgrade = () => {
		router.push("/subscription");
	};

	if (isDismissed) return null;

	const isAtLimit = currentCount >= limit;
	const isNearLimit = currentCount >= limit * 0.8;

	if (!isNearLimit) return null;

	const getMessage = () => {
		if (type === "clothing") {
			if (isAtLimit) {
				return "服の登録上限に達しました。さらに追加するにはアップグレードが必要です。";
			}
			return `服の登録が ${currentCount}/${limit} 点になりました。上限が近づいています。`;
		} else {
			if (isAtLimit) {
				return "コーディネート作成上限に達しました。さらに作成するにはアップグレードが必要です。";
			}
			return `コーディネートが ${currentCount}/${limit} 件になりました。上限が近づいています。`;
		}
	};

	return (
		<div
			className={`rounded-lg border p-4 ${
				isAtLimit
					? "border-theme-error bg-theme-error/10"
					: "border-theme-warning bg-theme-warning/10"
			}`}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<AlertTriangle
						className={`h-5 w-5 ${
							isAtLimit ? "text-theme-error" : "text-theme-warning"
						}`}
					/>
					<div>
						<p
							className={`font-medium text-sm ${
								isAtLimit ? "text-theme-error" : "text-theme-warning"
							}`}
						>
							{getMessage()}
						</p>
						<p className="text-theme-text-secondary text-xs">
							プレミアムプランなら無制限で利用できます
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={handleUpgrade}
						className="bg-theme-primary text-theme-background hover:bg-theme-secondary"
					>
						<Crown className="mr-1 h-3 w-3" />
						アップグレード
						<ArrowRight className="ml-1 h-3 w-3" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleDismiss}
						className="text-theme-text-secondary hover:text-theme-text"
					>
						×
					</Button>
				</div>
			</div>
		</div>
	);
}
