"use client";

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
import { api } from "@/trpc/react";
import { useState } from "react";

interface AddClothingFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

export default function AddClothingForm({
	onSuccess,
	onCancel,
}: AddClothingFormProps) {
	const [formData, setFormData] = useState({
		name: "",
		brand: "",
		color: "",
		size: "",
		categoryId: "",
		season: "",
		imageUrl: "",
		price: "",
		purchaseDate: "",
		notes: "",
		tags: "",
	});
	const [showNewCategory, setShowNewCategory] = useState(false);
	const [newCategoryData, setNewCategoryData] = useState({
		name: "",
		type: "tops",
	});

	const { data: categories, refetch: refetchCategories } = api.clothing.getCategories.useQuery();
	const createCategory = api.clothing.createCategory.useMutation({
		onSuccess: () => {
			refetchCategories();
			setShowNewCategory(false);
			setNewCategoryData({ name: "", type: "tops" });
		},
	});
	const createClothingItem = api.clothing.create.useMutation({
		onSuccess: () => {
			onSuccess();
		},
		onError: (error) => {
			console.error("Failed to create clothing item:", error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const data = {
			name: formData.name,
			brand: formData.brand || undefined,
			color: formData.color || undefined,
			size: formData.size || undefined,
			categoryId: Number.parseInt(formData.categoryId),
			season:
				(formData.season as "spring" | "summer" | "fall" | "winter" | "all") ||
				undefined,
			imageUrl: formData.imageUrl || undefined,
			price: formData.price ? Number.parseInt(formData.price) : undefined,
			purchaseDate: formData.purchaseDate
				? new Date(formData.purchaseDate)
				: undefined,
			notes: formData.notes || undefined,
			tags: formData.tags
				? formData.tags
						.split(",")
						.map((tag) => tag.trim())
						.filter(Boolean)
				: [],
		};

		createClothingItem.mutate(data);
	};

	const handleCreateCategory = (e: React.FormEvent) => {
		e.preventDefault();
		createCategory.mutate(newCategoryData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="name" className="text-slate-700">名前 *</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					placeholder="例: 白いTシャツ"
					required
					aria-describedby="name-help"
					className="border-slate-300 focus:border-blue-500"
				/>
				<p id="name-help" className="text-xs text-slate-500 mt-1">
					服の名前を入力してください
				</p>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<Label htmlFor="categoryId" className="text-slate-700">カテゴリ *</Label>
					<Button
						type="button"
						variant="link"
						size="sm"
						onClick={() => setShowNewCategory(!showNewCategory)}
						className="text-blue-600 hover:text-blue-800 text-xs"
					>
						+ 新しいカテゴリ
					</Button>
				</div>
				
				{showNewCategory && (
					<div className="p-3 border border-blue-200 bg-blue-50 rounded-lg mb-2">
						<form onSubmit={handleCreateCategory} className="space-y-2">
							<div>
								<Label htmlFor="newCategoryName" className="text-xs text-slate-700">カテゴリ名</Label>
								<Input
									id="newCategoryName"
									value={newCategoryData.name}
									onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
									placeholder="例: パーカー"
									className="text-sm"
									required
								/>
							</div>
							<div>
								<Label htmlFor="newCategoryType" className="text-xs text-slate-700">タイプ</Label>
								<Select
									value={newCategoryData.type}
									onValueChange={(value) => setNewCategoryData({ ...newCategoryData, type: value })}
								>
									<SelectTrigger className="text-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="tops">トップス</SelectItem>
										<SelectItem value="bottoms">ボトムス</SelectItem>
										<SelectItem value="outerwear">アウター</SelectItem>
										<SelectItem value="dresses">ワンピース</SelectItem>
										<SelectItem value="shoes">靴</SelectItem>
										<SelectItem value="accessories">アクセサリー</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex gap-2">
								<Button
									type="submit"
									size="sm"
									disabled={createCategory.isPending}
									className="text-xs"
								>
									{createCategory.isPending ? "作成中..." : "カテゴリ作成"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setShowNewCategory(false)}
									className="text-xs"
								>
									キャンセル
								</Button>
							</div>
						</form>
					</div>
				)}
				
				<Select
					value={formData.categoryId}
					onValueChange={(value) =>
						setFormData({ ...formData, categoryId: value })
					}
				>
					<SelectTrigger aria-describedby="category-help" className="border-slate-300 focus:border-blue-500">
						<SelectValue placeholder="カテゴリを選択してください" />
					</SelectTrigger>
					<SelectContent>
						{categories?.length === 0 ? (
							<SelectItem value="" disabled>
								カテゴリがありません。上の「+ 新しいカテゴリ」から作成してください。
							</SelectItem>
						) : (
							categories?.map((category) => (
								<SelectItem key={category.id} value={category.id.toString()}>
									{category.name}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
				<p id="category-help" className="text-xs text-slate-500 mt-1">
					服の種類を選択してください。カテゴリがない場合は新しく作成できます。
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="brand" className="text-slate-700">ブランド</Label>
					<Input
						id="brand"
						value={formData.brand}
						onChange={(e) =>
							setFormData({ ...formData, brand: e.target.value })
						}
						placeholder="例: ユニクロ"
						aria-describedby="brand-help"
						className="border-slate-300 focus:border-blue-500"
					/>
					<p id="brand-help" className="text-xs text-slate-500 mt-1">
						ブランド名（任意）
					</p>
				</div>
				<div>
					<Label htmlFor="color" className="text-slate-700">色</Label>
					<Input
						id="color"
						value={formData.color}
						onChange={(e) =>
							setFormData({ ...formData, color: e.target.value })
						}
						placeholder="例: 白、ネイビー"
						aria-describedby="color-help"
						className="border-slate-300 focus:border-blue-500"
					/>
					<p id="color-help" className="text-xs text-slate-500 mt-1">
						色の名前（任意）
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="size" className="text-slate-700">サイズ</Label>
					<Input
						id="size"
						value={formData.size}
						onChange={(e) => setFormData({ ...formData, size: e.target.value })}
						placeholder="例: M、L"
						aria-describedby="size-help"
						className="border-slate-300 focus:border-blue-500"
					/>
					<p id="size-help" className="text-xs text-slate-500 mt-1">
						サイズ（任意）
					</p>
				</div>
				<div>
					<Label htmlFor="season" className="text-slate-700">季節</Label>
					<Select
						value={formData.season}
						onValueChange={(value) =>
							setFormData({ ...formData, season: value })
						}
					>
						<SelectTrigger aria-describedby="season-help" className="border-slate-300 focus:border-blue-500">
							<SelectValue placeholder="季節を選択してください" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="spring">春</SelectItem>
							<SelectItem value="summer">夏</SelectItem>
							<SelectItem value="fall">秋</SelectItem>
							<SelectItem value="winter">冬</SelectItem>
							<SelectItem value="all">オールシーズン</SelectItem>
						</SelectContent>
					</Select>
					<p id="season-help" className="text-xs text-slate-500 mt-1">
						着用する季節（任意）
					</p>
				</div>
			</div>

			<div>
				<Label htmlFor="imageUrl" className="text-slate-700">画像URL</Label>
				<Input
					id="imageUrl"
					type="url"
					value={formData.imageUrl}
					onChange={(e) =>
						setFormData({ ...formData, imageUrl: e.target.value })
					}
					placeholder="https://example.com/image.jpg"
					aria-describedby="imageUrl-help"
					className="border-slate-300 focus:border-blue-500"
				/>
				<p id="imageUrl-help" className="text-xs text-slate-500 mt-1">
					画像のURL（任意）
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="price" className="text-slate-700">価格（円）</Label>
					<Input
						id="price"
						type="number"
						value={formData.price}
						onChange={(e) =>
							setFormData({ ...formData, price: e.target.value })
						}
						placeholder="2980"
						aria-describedby="price-help"
						className="border-slate-300 focus:border-blue-500"
						min="0"
					/>
					<p id="price-help" className="text-xs text-slate-500 mt-1">
						購入価格（任意）
					</p>
				</div>
				<div>
					<Label htmlFor="purchaseDate" className="text-slate-700">購入日</Label>
					<Input
						id="purchaseDate"
						type="date"
						value={formData.purchaseDate}
						onChange={(e) =>
							setFormData({ ...formData, purchaseDate: e.target.value })
						}
						aria-describedby="date-help"
						className="border-slate-300 focus:border-blue-500"
					/>
					<p id="date-help" className="text-xs text-slate-500 mt-1">
						購入した日付（任意）
					</p>
				</div>
			</div>

			<div>
				<Label htmlFor="tags" className="text-slate-700">タグ（カンマ区切り）</Label>
				<Input
					id="tags"
					value={formData.tags}
					onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
					placeholder="例: カジュアル, お気に入り, 夏用"
					aria-describedby="tags-help"
					className="border-slate-300 focus:border-blue-500"
				/>
				<p id="tags-help" className="text-xs text-slate-500 mt-1">
					タグをカンマで区切って入力（任意）
				</p>
			</div>

			<div>
				<Label htmlFor="notes" className="text-slate-700">メモ</Label>
				<Textarea
					id="notes"
					value={formData.notes}
					onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
					rows={3}
					placeholder="この服についてのメモや着こなしのポイントなど..."
					aria-describedby="notes-help"
					className="border-slate-300 focus:border-blue-500"
				/>
				<p id="notes-help" className="text-xs text-slate-500 mt-1">
					自由にメモを記入（任意）
				</p>
			</div>

			<div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
				<Button 
					type="button" 
					variant="outline" 
					onClick={onCancel}
					className="border-slate-300 text-slate-700 hover:bg-slate-50"
				>
					キャンセル
				</Button>
				<Button 
					type="submit" 
					disabled={createClothingItem.isPending || !formData.name || !formData.categoryId}
					className="bg-blue-600 hover:bg-blue-700 text-white"
				>
					{createClothingItem.isPending ? "追加中..." : "服を追加"}
				</Button>
			</div>
		</form>
	);
}
