"use client";

import { useTheme } from "@/components/providers/theme-provider";
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
	const { theme } = useTheme();
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

	const {
		data: categories,
		refetch: refetchCategories,
		isLoading,
		error,
	} = api.clothing.getCategories.useQuery();
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

	// テーマに応じたクラス名を決定
	const getThemeClasses = () => {
		const isDark = theme === "dark" || theme === "high-contrast";
		return {
			label: "text-theme-text",
			input: isDark
				? "border-theme-border focus:border-theme-primary text-theme-text bg-theme-surface"
				: "border-theme-border focus:border-theme-primary text-theme-text bg-theme-background",
			helpText: "text-theme-text-secondary",
			categoryBox: isDark
				? "border-theme-primary bg-theme-primary/10"
				: "border-blue-200 bg-blue-50",
			border: isDark ? "border-theme-border" : "border-slate-200",
		};
	};

	const themeClasses = getThemeClasses();

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

	const handleCreateCategory = () => {
		if (!newCategoryData.name) return;
		createCategory.mutate(newCategoryData);
	};

	return (
		<div className="max-h-[70vh] overflow-y-auto">
			<form onSubmit={handleSubmit} className="space-y-4 bg-theme-background">
				<div>
					<Label htmlFor="name" className={themeClasses.label}>
						名前 *
					</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						placeholder="例: 白いTシャツ"
						required
						aria-describedby="name-help"
						className={themeClasses.input}
					/>
					<p id="name-help" className={`mt-1 text-xs ${themeClasses.helpText}`}>
						服の名前を入力してください
					</p>
				</div>

				<div>
					<div className="flex items-center justify-between">
						<Label htmlFor="categoryId" className={themeClasses.label}>
							カテゴリ *
						</Label>
						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={() => setShowNewCategory(!showNewCategory)}
							className="text-theme-primary text-xs hover:text-theme-secondary"
						>
							+ 新しいカテゴリ
						</Button>
					</div>

					{showNewCategory && (
						<div className={`mb-2 rounded-lg p-3 ${themeClasses.categoryBox}`}>
							<div className="space-y-2">
								<div>
									<Label
										htmlFor="newCategoryName"
										className={`text-xs ${themeClasses.label}`}
									>
										カテゴリ名
									</Label>
									<Input
										id="newCategoryName"
										value={newCategoryData.name}
										onChange={(e) =>
											setNewCategoryData({
												...newCategoryData,
												name: e.target.value,
											})
										}
										placeholder="例: パーカー"
										className={`text-sm ${themeClasses.input}`}
										required
									/>
								</div>
								<div>
									<Label
										htmlFor="newCategoryType"
										className={`text-xs ${themeClasses.label}`}
									>
										タイプ
									</Label>
									<Select
										value={newCategoryData.type}
										onValueChange={(value) =>
											setNewCategoryData({ ...newCategoryData, type: value })
										}
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
										type="button"
										size="sm"
										disabled={createCategory.isPending || !newCategoryData.name}
										onClick={handleCreateCategory}
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
							</div>
						</div>
					)}

					<Select
						value={formData.categoryId}
						onValueChange={(value) =>
							setFormData({ ...formData, categoryId: value })
						}
					>
						<SelectTrigger
							aria-describedby="category-help"
							className={themeClasses.input}
						>
							<SelectValue
								placeholder={
									isLoading
										? "カテゴリ読み込み中..."
										: error
											? "カテゴリ読み込みエラー"
											: "カテゴリを選択してください"
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{isLoading ? (
								<SelectItem value="loading" disabled>
									読み込み中...
								</SelectItem>
							) : error ? (
								<SelectItem value="error" disabled>
									エラー: {error.message}
								</SelectItem>
							) : categories?.length === 0 ? (
								<SelectItem value="no-categories" disabled>
									カテゴリがありません。上の「+
									新しいカテゴリ」から作成してください。
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
					<p
						id="category-help"
						className={`mt-1 text-xs ${themeClasses.helpText}`}
					>
						服の種類を選択してください。カテゴリがない場合は新しく作成できます。
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label htmlFor="brand" className={themeClasses.label}>
							ブランド
						</Label>
						<Input
							id="brand"
							value={formData.brand}
							onChange={(e) =>
								setFormData({ ...formData, brand: e.target.value })
							}
							placeholder="例: ユニクロ"
							aria-describedby="brand-help"
							className={themeClasses.input}
						/>
						<p
							id="brand-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							ブランド名（任意）
						</p>
					</div>
					<div>
						<Label htmlFor="color" className={themeClasses.label}>
							色
						</Label>
						<Input
							id="color"
							value={formData.color}
							onChange={(e) =>
								setFormData({ ...formData, color: e.target.value })
							}
							placeholder="例: 白、ネイビー"
							aria-describedby="color-help"
							className={themeClasses.input}
						/>
						<p
							id="color-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							色の名前（任意）
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label htmlFor="size" className={themeClasses.label}>
							サイズ
						</Label>
						<Input
							id="size"
							value={formData.size}
							onChange={(e) =>
								setFormData({ ...formData, size: e.target.value })
							}
							placeholder="例: M、L"
							aria-describedby="size-help"
							className={themeClasses.input}
						/>
						<p
							id="size-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							サイズ（任意）
						</p>
					</div>
					<div>
						<Label htmlFor="season" className={themeClasses.label}>
							季節
						</Label>
						<Select
							value={formData.season}
							onValueChange={(value) =>
								setFormData({ ...formData, season: value })
							}
						>
							<SelectTrigger
								aria-describedby="season-help"
								className={themeClasses.input}
							>
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
						<p
							id="season-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							着用する季節（任意）
						</p>
					</div>
				</div>

				<div>
					<Label htmlFor="imageUrl" className={themeClasses.label}>
						画像URL
					</Label>
					<Input
						id="imageUrl"
						type="url"
						value={formData.imageUrl}
						onChange={(e) =>
							setFormData({ ...formData, imageUrl: e.target.value })
						}
						placeholder="https://example.com/image.jpg"
						aria-describedby="imageUrl-help"
						className={themeClasses.input}
					/>
					<p
						id="imageUrl-help"
						className={`mt-1 text-xs ${themeClasses.helpText}`}
					>
						画像のURL（任意）
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<Label htmlFor="price" className={themeClasses.label}>
							価格（円）
						</Label>
						<Input
							id="price"
							type="number"
							value={formData.price}
							onChange={(e) =>
								setFormData({ ...formData, price: e.target.value })
							}
							placeholder="2980"
							aria-describedby="price-help"
							className={themeClasses.input}
							min="0"
						/>
						<p
							id="price-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							購入価格（任意）
						</p>
					</div>
					<div>
						<Label htmlFor="purchaseDate" className={themeClasses.label}>
							購入日
						</Label>
						<Input
							id="purchaseDate"
							type="date"
							value={formData.purchaseDate}
							onChange={(e) =>
								setFormData({ ...formData, purchaseDate: e.target.value })
							}
							aria-describedby="date-help"
							className={themeClasses.input}
						/>
						<p
							id="date-help"
							className={`mt-1 text-xs ${themeClasses.helpText}`}
						>
							購入した日付（任意）
						</p>
					</div>
				</div>

				<div>
					<Label htmlFor="tags" className={themeClasses.label}>
						タグ（カンマ区切り）
					</Label>
					<Input
						id="tags"
						value={formData.tags}
						onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
						placeholder="例: カジュアル, お気に入り, 夏用"
						aria-describedby="tags-help"
						className={themeClasses.input}
					/>
					<p id="tags-help" className={`mt-1 text-xs ${themeClasses.helpText}`}>
						タグをカンマで区切って入力（任意）
					</p>
				</div>

				<div>
					<Label htmlFor="notes" className={themeClasses.label}>
						メモ
					</Label>
					<Textarea
						id="notes"
						value={formData.notes}
						onChange={(e) =>
							setFormData({ ...formData, notes: e.target.value })
						}
						rows={3}
						placeholder="この服についてのメモや着こなしのポイントなど..."
						aria-describedby="notes-help"
						className={themeClasses.input}
					/>
					<p
						id="notes-help"
						className={`mt-1 text-xs ${themeClasses.helpText}`}
					>
						自由にメモを記入（任意）
					</p>
				</div>

				<div
					className={`flex flex-col justify-end gap-3 border-t pt-4 sm:flex-row ${themeClasses.border}`}
				>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						className="w-full border-theme-border text-theme-text hover:bg-theme-surface sm:w-auto"
					>
						キャンセル
					</Button>
					<Button
						type="submit"
						disabled={
							createClothingItem.isPending ||
							!formData.name ||
							!formData.categoryId
						}
						className="w-full bg-theme-primary text-theme-background hover:bg-theme-secondary sm:w-auto"
					>
						{createClothingItem.isPending ? "追加中..." : "服を追加"}
					</Button>
				</div>
			</form>
		</div>
	);
}
