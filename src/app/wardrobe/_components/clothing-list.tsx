"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Edit3, Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AddClothingForm from "./add-clothing-form";

export default function ClothingList() {
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingItem, setEditingItem] = useState<number | null>(null);

	const { data: clothingItems, refetch } = api.clothing.getAll.useQuery();
	const { data: categories } = api.clothing.getCategories.useQuery();
	const deleteClothingItem = api.clothing.delete.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	const handleDelete = (id: number) => {
		if (confirm("この服を削除してもよろしいですか？")) {
			deleteClothingItem.mutate({ id });
		}
	};

	const getCategoryName = (categoryId: number) => {
		return categories?.find((cat) => cat.id === categoryId)?.name ?? "未分類";
	};

	const formatPrice = (price: number | null) => {
		if (!price) return "";
		return `¥${price.toLocaleString()}`;
	};

	return (
		<div className="space-y-6">
			<div className="clay-card flex items-center justify-between p-6">
				<div className="flex items-center gap-3">
					<span className="text-2xl">👚</span>
					<div>
						<p className="font-bold text-lg text-slate-900">
							お洋服コレクション
						</p>
						<span className="text-slate-700 text-sm">
							{clothingItems?.length ?? 0} 着のお洋服があります
						</span>
					</div>
				</div>
				<button
					onClick={() => setShowAddForm(true)}
					className="clay-button flex items-center gap-2 px-6 py-3 font-bold text-slate-900"
				>
					<Plus className="h-4 w-4" />
					新しいお洋服を追加
				</button>
			</div>

			{showAddForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
					<div className="bg-white mx-4 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-200">
						<h2 className="mb-4 text-center font-bold text-slate-900 text-xl">
							新しいお洋服を追加
						</h2>
						<AddClothingForm
							onSuccess={() => {
								setShowAddForm(false);
								refetch();
							}}
							onCancel={() => setShowAddForm(false)}
						/>
					</div>
				</div>
			)}

			{clothingItems?.length === 0 ? (
				<div className="clay-card">
					<div className="flex flex-col items-center justify-center py-16">
						<div className="mb-4 text-6xl">👗</div>
						<p className="text-center font-medium text-lg text-slate-900">
							まだお洋服が登録されていません
						</p>
						<p className="mt-2 text-center text-slate-700">
							「新しいお洋服を追加」ボタンから始めましょう！
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{clothingItems?.map((item) => (
						<div
							key={item.id}
							className="clay-card active:clay-card-pressed transition-all duration-300 hover:shadow-pink-lg"
						>
							<div className="p-4">
								<div className="mb-3 flex items-start justify-between">
									<h3 className="font-bold text-lg text-slate-900">
										{item.name}
									</h3>
									<div className="flex gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setEditingItem(item.id)}
											className="rounded-full text-slate-700 hover:bg-pink-100 hover:text-slate-900"
										>
											<Edit3 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(item.id)}
											className="rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
								{item.imageUrl && (
									<img
										src={item.imageUrl}
										alt={item.name}
										className="mb-3 h-48 w-full rounded-xl object-cover shadow-pink"
									/>
								)}
								<div className="mb-3 flex flex-wrap gap-2">
									<Badge className="gradient-pink rounded-full px-3 py-1 text-white">
										{getCategoryName(item.categoryId)}
									</Badge>
									{item.season && (
										<Badge className="gradient-pink-light rounded-full px-3 py-1 text-slate-900">
											{item.season}
										</Badge>
									)}
								</div>
								<div className="space-y-2 text-slate-900 text-sm">
									{item.brand && (
										<p className="flex items-center gap-1">
											<span>🏷️</span> {item.brand}
										</p>
									)}
									{item.color && (
										<p className="flex items-center gap-1">
											<span>🎨</span> {item.color}
										</p>
									)}
									{item.size && (
										<p className="flex items-center gap-1">
											<span>📏</span> {item.size}
										</p>
									)}
									{item.price && (
										<p className="flex items-center gap-1">
											<span>💰</span> {formatPrice(item.price)}
										</p>
									)}
								</div>
								{item.tags && item.tags.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1">
										{item.tags.map((tag) => (
											<Badge
												key={tag}
												className="rounded-full border-pink-200 bg-pink-100 px-2 py-1 text-slate-700 text-xs"
											>
												#{tag}
											</Badge>
										))}
									</div>
								)}
								{item.notes && (
									<p className="mt-3 rounded-lg bg-pink-50 p-2 text-slate-700 text-sm">
										{item.notes}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
