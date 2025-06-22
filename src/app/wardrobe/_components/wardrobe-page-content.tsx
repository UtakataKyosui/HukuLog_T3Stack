"use client";

import { LimitReachedBanner } from "@/components/subscription/limit-reached-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import AddClothingForm from "./add-clothing-form";
import ClothingList from "./clothing-list";

export function WardrobePageContent() {
	const [showAddForm, setShowAddForm] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedSeason, setSelectedSeason] = useState("");
	const [showBanner, setShowBanner] = useState(true);

	const { usage, limits, isNearClothingLimit } = useSubscriptionLimits();

	const handleAddSuccess = () => {
		setShowAddForm(false);
	};

	const isAtOrNearLimit =
		usage &&
		limits &&
		(usage.clothingItemsCount >= limits.limits.maxClothingItems ||
			isNearClothingLimit());

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="mb-4 font-bold text-3xl text-theme-text">
					ワードローブ管理
				</h1>
				<p className="text-theme-text-secondary">
					あなたの服を整理して、コーディネートを楽しみましょう
				</p>
			</div>

			{/* 制限警告バナー */}
			{isAtOrNearLimit && usage && limits && showBanner && (
				<div className="mb-6">
					<LimitReachedBanner
						type="clothing"
						currentCount={usage.clothingItemsCount}
						limit={limits.limits.maxClothingItems}
						onDismiss={() => setShowBanner(false)}
					/>
				</div>
			)}

			{/* 検索・フィルター */}
			<div className="mb-6 rounded-lg border border-theme-border bg-theme-surface p-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-theme-text-secondary" />
						<Input
							placeholder="服を検索..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="border-theme-border pl-10"
						/>
					</div>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="rounded-md border border-theme-border bg-theme-background px-3 py-2 text-theme-text focus:border-theme-primary focus:outline-none"
					>
						<option value="">全カテゴリ</option>
						<option value="tops">トップス</option>
						<option value="bottoms">ボトムス</option>
						<option value="outerwear">アウター</option>
						<option value="shoes">靴</option>
						<option value="accessories">アクセサリー</option>
					</select>
					<select
						value={selectedSeason}
						onChange={(e) => setSelectedSeason(e.target.value)}
						className="rounded-md border border-theme-border bg-theme-background px-3 py-2 text-theme-text focus:border-theme-primary focus:outline-none"
					>
						<option value="">全シーズン</option>
						<option value="spring">春</option>
						<option value="summer">夏</option>
						<option value="fall">秋</option>
						<option value="winter">冬</option>
						<option value="all">オールシーズン</option>
					</select>
				</div>
				<div className="mt-4 flex items-center justify-between">
					<div className="text-sm text-theme-text-secondary">
						{usage && limits
							? `${usage.clothingItemsCount} / ${
									limits.limits.maxClothingItems === -1
										? "無制限"
										: limits.limits.maxClothingItems
								} 点の服を登録済み`
							: "読み込み中..."}
					</div>
					<Button
						onClick={() => setShowAddForm(true)}
						className="bg-theme-primary text-theme-background hover:bg-theme-secondary"
					>
						<Plus className="mr-2 h-4 w-4" />
						服を追加
					</Button>
				</div>
			</div>

			{/* フォーム表示 */}
			{showAddForm && (
				<div className="mb-6 rounded-lg border border-theme-border bg-theme-surface p-6">
					<h2 className="mb-4 font-semibold text-lg text-theme-text">
						新しい服を追加
					</h2>
					<AddClothingForm
						onSuccess={handleAddSuccess}
						onCancel={() => setShowAddForm(false)}
					/>
				</div>
			)}

			{/* 服一覧 */}
			<ClothingList
				searchTerm={searchTerm}
				selectedCategory={selectedCategory}
				selectedSeason={selectedSeason}
			/>
		</div>
	);
}
