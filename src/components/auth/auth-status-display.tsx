"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
	CheckCircle, 
	Lock, 
	Key, 
	Link, 
	Star, 
	AlertCircle,
	ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { 
	getAuthLevelDisplay, 
	getAuthLevelIcon, 
	getAuthPromptMessage,
	type AuthStatus 
} from "@/lib/auth-state";

interface AuthStatusDisplayProps {
	variant?: "card" | "banner" | "compact";
	showPrompt?: boolean;
	className?: string;
}

export function AuthStatusDisplay({ 
	variant = "card", 
	showPrompt = true,
	className = "" 
}: AuthStatusDisplayProps) {
	const router = useRouter();
	const { data: authStatus, isLoading, error } = api.authState.getAuthStatus.useQuery();

	if (isLoading) {
		return (
			<div className={`animate-pulse ${className}`}>
				<div className="h-20 bg-gray-200 rounded-lg"></div>
			</div>
		);
	}

	if (error || !authStatus) {
		return null;
	}

	const progressPercentage = (authStatus.level / 4) * 100;
	const promptMessage = getAuthPromptMessage(authStatus);

	if (variant === "compact") {
		return (
			<div className={`flex items-center gap-3 ${className}`}>
				<div className="text-2xl">
					{getAuthLevelIcon(authStatus.level)}
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-sm">
							{getAuthLevelDisplay(authStatus.level)}
						</span>
						<Badge variant={authStatus.level === 4 ? "default" : "secondary"}>
							{authStatus.level}/4
						</Badge>
					</div>
					<div className="text-xs text-gray-600 mt-1">
						{authStatus.description}
					</div>
				</div>
			</div>
		);
	}

	if (variant === "banner") {
		return (
			<Alert className={`${className} ${authStatus.level === 4 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
				<div className="flex items-center gap-3">
					<div className="text-xl">
						{getAuthLevelIcon(authStatus.level)}
					</div>
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<span className="font-medium">
								{getAuthLevelDisplay(authStatus.level)}
							</span>
							<Progress value={progressPercentage} className="w-20 h-2" />
							<span className="text-sm text-gray-600">
								{authStatus.level}/4
							</span>
						</div>
						<AlertDescription>
							{authStatus.description}
						</AlertDescription>
						{showPrompt && authStatus.level < 4 && (
							<Button
								size="sm"
								variant="outline"
								className="mt-2"
								onClick={() => router.push(promptMessage.actionUrl)}
							>
								{promptMessage.actionText}
								<ArrowRight className="ml-1 h-3 w-3" />
							</Button>
						)}
					</div>
				</div>
			</Alert>
		);
	}

	// Default: card variant
	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="text-2xl">
							{getAuthLevelIcon(authStatus.level)}
						</div>
						<div>
							<CardTitle className="text-lg">
								{getAuthLevelDisplay(authStatus.level)}
							</CardTitle>
							<CardDescription>
								認証レベル {authStatus.level}/4
							</CardDescription>
						</div>
					</div>
					<Badge variant={authStatus.level === 4 ? "default" : "secondary"}>
						{Math.round(progressPercentage)}%
					</Badge>
				</div>
				<Progress value={progressPercentage} className="mt-2" />
			</CardHeader>
			<CardContent className="space-y-4">
				{/* 認証状態の詳細 */}
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						{authStatus.passkeyEnabled ? (
							<CheckCircle className="h-5 w-5 text-green-600" />
						) : (
							<Lock className="h-5 w-5 text-gray-400" />
						)}
						<span className={authStatus.passkeyEnabled ? "text-green-700" : "text-gray-600"}>
							Passkey認証
						</span>
						{authStatus.passkeyEnabled && (
							<Badge variant="outline" className="text-xs">
								完了
							</Badge>
						)}
					</div>
					
					<div className="flex items-center gap-3">
						{authStatus.notionEnabled ? (
							<CheckCircle className="h-5 w-5 text-green-600" />
						) : (
							<Link className="h-5 w-5 text-gray-400" />
						)}
						<span className={authStatus.notionEnabled ? "text-green-700" : "text-gray-600"}>
							Notion連携
						</span>
						{authStatus.notionEnabled && (
							<Badge variant="outline" className="text-xs">
								完了
							</Badge>
						)}
					</div>
				</div>

				{/* 説明文 */}
				<p className="text-sm text-gray-600">
					{authStatus.description}
				</p>

				{/* 次のアクション */}
				{showPrompt && authStatus.level < 4 && (
					<div className="pt-3 border-t">
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4 text-amber-600" />
								<span className="font-medium text-sm">
									{promptMessage.title}
								</span>
							</div>
							<p className="text-sm text-gray-600">
								{promptMessage.message}
							</p>
							<Button
								onClick={() => router.push(promptMessage.actionUrl)}
								className="w-full"
								size="sm"
							>
								{promptMessage.actionText}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				{/* 完全認証達成時 */}
				{authStatus.level === 4 && (
					<div className="pt-3 border-t">
						<div className="flex items-center gap-2 text-green-700">
							<Star className="h-4 w-4" />
							<span className="font-medium text-sm">
								おめでとうございます！
							</span>
						</div>
						<p className="text-sm text-green-600 mt-1">
							すべての認証機能が利用可能です。最高レベルのセキュリティと利便性をお楽しみください。
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * 認証レベルアイコンコンポーネント
 */
export function AuthLevelIcon({ level, size = 24 }: { level: number; size?: number }) {
	const iconMap = {
		1: Lock,
		2: Key,
		3: Link,
		4: Star,
	};

	const Icon = iconMap[level as keyof typeof iconMap] || Lock;
	const colorMap = {
		1: "text-gray-500",
		2: "text-blue-500",
		3: "text-purple-500",
		4: "text-yellow-500",
	};

	return (
		<Icon 
			size={size} 
			className={colorMap[level as keyof typeof colorMap] || "text-gray-500"} 
		/>
	);
}

/**
 * 認証完了度プログレスバー
 */
export function AuthProgressBar({ 
	authStatus, 
	showLabel = true,
	className = "" 
}: { 
	authStatus: AuthStatus; 
	showLabel?: boolean;
	className?: string;
}) {
	const progressPercentage = (authStatus.level / 4) * 100;

	return (
		<div className={`space-y-2 ${className}`}>
			{showLabel && (
				<div className="flex justify-between text-sm">
					<span>認証完了度</span>
					<span className="font-medium">
						{authStatus.level}/4 ({Math.round(progressPercentage)}%)
					</span>
				</div>
			)}
			<Progress value={progressPercentage} className="h-2" />
		</div>
	);
}