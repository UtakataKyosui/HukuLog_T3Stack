"use client";

import {
	type ClothingFilters,
	ClothingSearchFilters,
} from "@/components/search/search-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { api } from "@/trpc/react";
import { Edit3, Package, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import AddClothingForm from "./add-clothing-form";

export default function ClothingList() {
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingItem, setEditingItem] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<ClothingFilters>({
		search: "",
		category: "all",
		season: "all",
		tags: [],
		brand: "",
	});

	const itemsPerPage = 12; // 1ページあたりのアイテム数

	const { data: clothingItems, refetch } = api.clothing.getAll.useQuery({
		limit: 100, // フィルタリング用に多めに取得
		offset: 0,
	});
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

	// フィルタリングされた服のリスト
	const filteredClothingItems = useMemo(() => {
		if (!clothingItems) return [];

		return clothingItems.filter((item) => {
			// テキスト検索
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const searchMatch =
					item.name.toLowerCase().includes(searchLower) ||
					item.brand?.toLowerCase().includes(searchLower) ||
					item.color?.toLowerCase().includes(searchLower) ||
					item.notes?.toLowerCase().includes(searchLower);
				if (!searchMatch) return false;
			}

			// カテゴリフィルター
			if (
				filters.category &&
				filters.category !== "all" &&
				item.categoryId.toString() !== filters.category
			) {
				return false;
			}

			// 季節フィルター
			if (filters.season && filters.season !== "all") {
				// "all-season"の場合は"all"値のアイテムを表示
				const targetSeason =
					filters.season === "all-season" ? "all" : filters.season;
				if (item.season !== targetSeason) {
					return false;
				}
			}

			// ブランドフィルター
			if (filters.brand) {
				const brandMatch = item.brand
					?.toLowerCase()
					.includes(filters.brand.toLowerCase());
				if (!brandMatch) return false;
			}

			// タグフィルター
			if (filters.tags.length > 0) {
				const hasMatchingTag = filters.tags.some((filterTag) =>
					item.tags?.some((itemTag) =>
						itemTag.toLowerCase().includes(filterTag.toLowerCase()),
					),
				);
				if (!hasMatchingTag) return false;
			}

			return true;
		});
	}, [clothingItems, filters]);

	// ページネーション処理
	const paginatedItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredClothingItems.slice(startIndex, endIndex);
	}, [filteredClothingItems, currentPage]);

	const totalPages = Math.ceil(filteredClothingItems.length / itemsPerPage);

	// フィルターが変更されたときに1ページ目に戻る
	const handleFiltersChange = (newFilters: ClothingFilters) => {
		setFilters(newFilters);
		setCurrentPage(1);
	};

	// 利用可能なタグを取得
	const availableTags = useMemo(() => {
		if (!clothingItems) return [];
		const allTags = clothingItems.flatMap((item) => item.tags || []);
		return [...new Set(allTags)].sort();
	}, [clothingItems]);

	return (
		<div className="space-y-6">
			{/* 検索・フィルター */}
			<ClothingSearchFilters
				filters={filters}
				onFiltersChange={handleFiltersChange}
				categories={categories || []}
				availableTags={availableTags}
			/>

			<div className="clean-card flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
				<div className="flex items-center gap-3">
					<span className="text-2xl">👚</span>
					<div>
						<p className="font-bold text-lg text-slate-900">
							お洋服コレクション
						</p>
						<span className="text-slate-700 text-sm">
							{filteredClothingItems.length}件中{" "}
							{Math.min(
								(currentPage - 1) * itemsPerPage + 1,
								filteredClothingItems.length,
							)}
							-
							{Math.min(
								currentPage * itemsPerPage,
								filteredClothingItems.length,
							)}
							件を表示
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setShowAddForm(true)}
					className="clean-button flex w-full items-center justify-center gap-2 px-4 py-3 font-bold text-white sm:w-auto sm:px-6"
				>
					<Plus className="h-4 w-4" />
					新しいお洋服を追加
				</button>
			</div>

			<Modal
				isOpen={showAddForm}
				onClose={() => setShowAddForm(false)}
				title="新しいお洋服を追加"
				size="md"
			>
				<AddClothingForm
					onSuccess={() => {
						setShowAddForm(false);
						refetch();
					}}
					onCancel={() => setShowAddForm(false)}
				/>
			</Modal>

			{filteredClothingItems.length === 0 ? (
				<div className="clean-card">
					<div className="flex flex-col items-center justify-center py-16">
						<div className="mb-4 text-6xl">
							{clothingItems?.length === 0 ? "👗" : "🔍"}
						</div>
						<p className="text-center font-medium text-lg text-slate-900">
							{clothingItems?.length === 0
								? "まだお洋服が登録されていません"
								: "検索条件に一致する服が見つかりません"}
						</p>
						<p className="mt-2 text-center text-slate-700">
							{clothingItems?.length === 0
								? "「新しいお洋服を追加」ボタンから始めましょう！"
								: "別の検索条件をお試しください"}
						</p>
					</div>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
						{paginatedItems.map((item) => (
							<div
								key={item.id}
								className="clean-card transition-all duration-300 hover:shadow-clean-lg"
								data-testid="clothing-item"
							>
								<div className="p-4">
									<div className="mb-3 flex items-start justify-between">
										<h3 className="line-clamp-2 font-bold text-lg text-slate-900">
											{item.name}
										</h3>
										<div className="ml-2 flex gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setEditingItem(item.id)}
												className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
											>
												<Edit3 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(item.id)}
												className="h-8 w-8 rounded-full p-0 text-red-400 hover:bg-red-50 hover:text-red-600"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
									{item.imageUrl && (
										<img
											src={item.imageUrl}
											alt={item.name}
											className="mb-3 h-48 w-full rounded-xl object-cover shadow-clean"
										/>
									)}
									<div className="mb-3 flex flex-wrap gap-2">
										<Badge className="rounded-full bg-slate-800 px-3 py-1 text-white text-xs">
											{getCategoryName(item.categoryId)}
										</Badge>
										{item.season && (
											<Badge className="rounded-full bg-slate-200 px-3 py-1 text-slate-800 text-xs">
												{item.season}
											</Badge>
										)}
									</div>
									<div className="space-y-2 text-slate-900 text-sm">
										{item.brand && (
											<p className="flex items-center gap-1 truncate">
												<span>🏷️</span>
												<span className="truncate">{item.brand}</span>
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
											{item.tags.slice(0, 3).map((tag) => (
												<Badge
													key={tag}
													className="rounded-full border-slate-200 bg-slate-100 px-2 py-1 text-slate-700 text-xs"
												>
													#{tag}
												</Badge>
											))}
											{item.tags.length > 3 && (
												<Badge className="rounded-full border-slate-200 bg-slate-100 px-2 py-1 text-slate-700 text-xs">
													+{item.tags.length - 3}
												</Badge>
											)}
										</div>
									)}
									{item.notes && (
										<p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 p-2 text-slate-700 text-sm">
											{item.notes}
										</p>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ページネーション */}
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={filteredClothingItems.length}
						itemsPerPage={itemsPerPage}
					/>
				</>
			)}
		</div>
	);
}
