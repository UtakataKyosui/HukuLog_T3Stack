"use client";

import { UpgradePrompt } from "@/components/subscription/upgrade-prompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSubscriptionLimits } from "@/hooks/use-subscription-limits";
import { api } from "@/trpc/react";
import { Star, X } from "lucide-react";
import { useState } from "react";

interface CreateOutfitFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

export default function CreateOutfitForm({
	onSuccess,
	onCancel,
}: CreateOutfitFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		occasion: "",
		season: "",
		rating: "",
		lastWorn: "",
		tags: "",
	});
	const [selectedClothingItems, setSelectedClothingItems] = useState<number[]>(
		[],
	);

	const { checkCanAddOutfit, showUpgradePrompt, promptType, dismissPrompt } =
		useSubscriptionLimits();

	const { data: clothingItems } = api.clothing.getAll.useQuery();
	const { data: categories } = api.clothing.getCategories.useQuery();
	const createOutfit = api.outfit.create.useMutation({
		onSuccess: () => {
			onSuccess();
		},
		onError: (error) => {
			console.error("Failed to create outfit:", error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 制限チェック
		if (!checkCanAddOutfit()) {
			return;
		}

		const data = {
			name: formData.name,
			description: formData.description || undefined,
			occasion: formData.occasion || undefined,
			season:
				(formData.season as "spring" | "summer" | "fall" | "winter" | "all") ||
				undefined,
			rating: formData.rating ? Number.parseInt(formData.rating) : undefined,
			lastWorn: formData.lastWorn ? new Date(formData.lastWorn) : undefined,
			tags: formData.tags
				? formData.tags
						.split(",")
						.map((tag) => tag.trim())
						.filter(Boolean)
				: [],
			clothingItemIds: selectedClothingItems,
		};

		createOutfit.mutate(data);
	};

	const toggleClothingItem = (itemId: number) => {
		setSelectedClothingItems((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId],
		);
	};

	const getCategoryName = (categoryId: number) => {
		return categories?.find((cat) => cat.id === categoryId)?.name ?? "未分類";
	};

	const renderStars = (rating: number) => {
		return (
			<div className="flex gap-1">
				{Array.from({ length: 5 }, (_, i) => (
					<button
						key={i}
						type="button"
						onClick={() =>
							setFormData({ ...formData, rating: (i + 1).toString() })
						}
						className={`p-1 ${
							i < rating ? "text-yellow-400" : "text-gray-300"
						} transition-colors hover:text-yellow-400`}
					>
						<Star className="h-5 w-5 fill-current" />
					</button>
				))}
			</div>
		);
	};

	return (
		<>
			{showUpgradePrompt && (
				<UpgradePrompt
					type={promptType}
					onClose={dismissPrompt}
					showAsModal={true}
				/>
			)}

			<div className="max-h-[70vh] overflow-y-auto">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<Label htmlFor="name">コーディネート名 *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>
					</div>

					<div>
						<Label htmlFor="description">説明</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label htmlFor="occasion">シーン</Label>
							<Select
								value={formData.occasion}
								onValueChange={(value) =>
									setFormData({ ...formData, occasion: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="シーンを選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="casual">カジュアル</SelectItem>
									<SelectItem value="work">仕事</SelectItem>
									<SelectItem value="formal">フォーマル</SelectItem>
									<SelectItem value="party">パーティー</SelectItem>
									<SelectItem value="date">デート</SelectItem>
									<SelectItem value="travel">旅行</SelectItem>
									<SelectItem value="sports">スポーツ</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="season">季節</Label>
							<Select
								value={formData.season}
								onValueChange={(value) =>
									setFormData({ ...formData, season: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="季節を選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="spring">春</SelectItem>
									<SelectItem value="summer">夏</SelectItem>
									<SelectItem value="fall">秋</SelectItem>
									<SelectItem value="winter">冬</SelectItem>
									<SelectItem value="all">オールシーズン</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label>評価</Label>
							{renderStars(Number.parseInt(formData.rating) || 0)}
						</div>
						<div>
							<Label htmlFor="lastWorn">最後に着用した日</Label>
							<Input
								id="lastWorn"
								type="date"
								value={formData.lastWorn}
								onChange={(e) =>
									setFormData({ ...formData, lastWorn: e.target.value })
								}
							/>
						</div>
					</div>

					<div>
						<Label htmlFor="tags">タグ（カンマ区切り）</Label>
						<Input
							id="tags"
							value={formData.tags}
							onChange={(e) =>
								setFormData({ ...formData, tags: e.target.value })
							}
							placeholder="例: お気に入り, 夏用, デート"
						/>
					</div>

					<div>
						<Label>服を選択</Label>
						<div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-md border p-4">
							{clothingItems?.length === 0 ? (
								<p className="py-4 text-center text-gray-500">
									服が登録されていません。先に服を追加してください。
								</p>
							) : (
								clothingItems?.map((item) => (
									<div
										key={item.id}
										className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${
											selectedClothingItems.includes(item.id)
												? "border-blue-200 bg-blue-50"
												: "hover:bg-gray-50"
										}`}
										onClick={() => toggleClothingItem(item.id)}
									>
										<div className="flex items-center gap-3">
											{item.imageUrl && (
												<img
													src={item.imageUrl}
													alt={item.name}
													className="h-12 w-12 rounded object-cover"
												/>
											)}
											<div>
												<p className="font-medium">{item.name}</p>
												<div className="mt-1 flex gap-1">
													<Badge variant="secondary" className="text-xs">
														{getCategoryName(item.categoryId)}
													</Badge>
													{item.color && (
														<Badge variant="outline" className="text-xs">
															{item.color}
														</Badge>
													)}
												</div>
											</div>
										</div>
										{selectedClothingItems.includes(item.id) && (
											<div className="text-blue-600">
												<X className="h-5 w-5" />
											</div>
										)}
									</div>
								))
							)}
						</div>
						<p className="mt-2 text-gray-600 text-sm">
							選択中: {selectedClothingItems.length} 着
						</p>
					</div>

					<div className="flex flex-col justify-end gap-3 border-slate-200 border-t pt-4 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 sm:w-auto"
						>
							キャンセル
						</Button>
						<Button
							type="submit"
							disabled={
								createOutfit.isPending || selectedClothingItems.length === 0
							}
							className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
						>
							{createOutfit.isPending ? "作成中..." : "作成"}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
}
