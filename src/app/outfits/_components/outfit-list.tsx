"use client";

import {
	type OutfitFilters,
	OutfitSearchFilters,
} from "@/components/search/search-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { api } from "@/trpc/react";
import { Calendar, Edit3, Plus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import CreateOutfitForm from "./create-outfit-form";

export default function OutfitList() {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<OutfitFilters>({
		search: "",
		occasion: "all",
		season: "all",
		tags: [],
		rating: "all",
	});

	const itemsPerPage = 12; // 1ページあたりのアイテム数

	const { data: outfits, refetch } = api.outfit.getAll.useQuery({
		limit: 100, // フィルタリング用に多めに取得
		offset: 0,
	});
	const deleteOutfit = api.outfit.delete.useMutation({
		onSuccess: () => {
			refetch();
		},
	});

	const handleDelete = (id: number) => {
		if (confirm("このコーディネートを削除してもよろしいですか？")) {
			deleteOutfit.mutate({ id });
		}
	};

	const formatDate = (date: Date | null) => {
		if (!date) return "";
		return new Date(date).toLocaleDateString("ja-JP");
	};

	const renderStars = (rating: number | null) => {
		if (!rating) return null;
		return (
			<div className="flex items-center gap-1">
				{Array.from({ length: 5 }, (_, i) => (
					<Star
						key={`display-star-${i + 1}`}
						className={`h-4 w-4 ${
							i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
	};

	// フィルタリングされたコーデのリスト
	const filteredOutfits = useMemo(() => {
		if (!outfits) return [];

		return outfits.filter((outfit) => {
			// テキスト検索
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const searchMatch =
					outfit.name.toLowerCase().includes(searchLower) ||
					outfit.description?.toLowerCase().includes(searchLower);
				if (!searchMatch) return false;
			}

			// 場面フィルター
			if (
				filters.occasion &&
				filters.occasion !== "all" &&
				outfit.occasion !== filters.occasion
			) {
				return false;
			}

			// 季節フィルター
			if (filters.season && filters.season !== "all") {
				// "all-season"の場合は"all"値のアイテムを表示
				const targetSeason =
					filters.season === "all-season" ? "all" : filters.season;
				if (outfit.season !== targetSeason) {
					return false;
				}
			}

			// 評価フィルター
			if (filters.rating && filters.rating !== "all") {
				const minRating = Number.parseInt(filters.rating);
				if (!outfit.rating || outfit.rating < minRating) {
					return false;
				}
			}

			// タグフィルター
			if (filters.tags.length > 0) {
				const hasMatchingTag = filters.tags.some((filterTag) =>
					outfit.tags?.some((itemTag) =>
						itemTag.toLowerCase().includes(filterTag.toLowerCase()),
					),
				);
				if (!hasMatchingTag) return false;
			}

			return true;
		});
	}, [outfits, filters]);

	// ページネーション処理
	const paginatedOutfits = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredOutfits.slice(startIndex, endIndex);
	}, [filteredOutfits, currentPage]);

	const totalPages = Math.ceil(filteredOutfits.length / itemsPerPage);

	// フィルターが変更されたときに1ページ目に戻る
	const handleFiltersChange = (newFilters: OutfitFilters) => {
		setFilters(newFilters);
		setCurrentPage(1);
	};

	// 利用可能なタグを取得
	const availableTags = useMemo(() => {
		if (!outfits) return [];
		const allTags = outfits.flatMap((outfit) => outfit.tags || []);
		return [...new Set(allTags)].sort();
	}, [outfits]);

	return (
		<div className="space-y-6">
			{/* 検索・フィルター */}
			<OutfitSearchFilters
				filters={filters}
				onFiltersChange={handleFiltersChange}
				availableTags={availableTags}
			/>

			<div className="clean-card flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
				<div className="flex items-center gap-3">
					<span className="text-2xl">📼</span>
					<div>
						<p className="font-bold text-lg text-slate-900">
							マイコーディネート
						</p>
						<span className="text-slate-700 text-sm">
							{filteredOutfits.length}件中{" "}
							{Math.min(
								(currentPage - 1) * itemsPerPage + 1,
								filteredOutfits.length,
							)}
							-{Math.min(currentPage * itemsPerPage, filteredOutfits.length)}
							件を表示
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={() => setShowCreateForm(true)}
					className="clean-button flex w-full items-center justify-center gap-2 px-4 py-3 font-bold text-white sm:w-auto sm:px-6"
				>
					<Plus className="h-4 w-4" />
					新しいコーデを作成
				</button>
			</div>

			<Modal
				isOpen={showCreateForm}
				onClose={() => setShowCreateForm(false)}
				title="新しいコーディネートを作成"
				size="lg"
			>
				<CreateOutfitForm
					onSuccess={() => {
						setShowCreateForm(false);
						refetch();
					}}
					onCancel={() => setShowCreateForm(false)}
				/>
			</Modal>

			{filteredOutfits.length === 0 ? (
				<div className="clean-card">
					<div className="flex flex-col items-center justify-center py-16">
						<div className="mb-4 text-6xl">
							{outfits?.length === 0 ? "📼" : "🔍"}
						</div>
						<p className="text-center font-medium text-lg text-slate-900">
							{outfits?.length === 0
								? "まだコーディネートが作成されていません"
								: "検索条件に一致するコーデが見つかりません"}
						</p>
						<p className="mt-2 text-center text-slate-700">
							{outfits?.length === 0
								? "「新しいコーデを作成」ボタンから始めましょう！"
								: "別の検索条件をお試しください"}
						</p>
					</div>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
						{paginatedOutfits.map((outfit) => (
							<div
								key={outfit.id}
								className="clean-card transition-all duration-300 hover:shadow-clean-lg"
								data-testid="outfit-item"
							>
								<div className="p-4">
									<div className="mb-3 flex items-start justify-between">
										<h3 className="line-clamp-2 font-bold text-lg text-slate-900">
											{outfit.name}
										</h3>
										<div className="ml-2 flex gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													// TODO: Add edit functionality
												}}
												className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
											>
												<Edit3 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(outfit.id)}
												className="h-8 w-8 rounded-full p-0 text-red-400 hover:bg-red-50 hover:text-red-600"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
									<div className="space-y-3">
										{outfit.description && (
											<p className="line-clamp-2 text-slate-700 text-sm">
												{outfit.description}
											</p>
										)}

										<div className="flex flex-wrap gap-2">
											{outfit.occasion && (
												<Badge className="rounded-full bg-slate-800 px-3 py-1 text-white text-xs">
													{outfit.occasion}
												</Badge>
											)}
											{outfit.season && (
												<Badge className="rounded-full bg-slate-200 px-3 py-1 text-slate-800 text-xs">
													{outfit.season}
												</Badge>
											)}
										</div>

										{outfit.rating && (
											<div className="flex items-center gap-2">
												{renderStars(outfit.rating)}
												<span className="text-slate-600 text-sm">
													{outfit.rating}/5
												</span>
											</div>
										)}

										{outfit.lastWorn && (
											<div className="flex items-center gap-2 text-slate-600 text-sm">
												<Calendar className="h-4 w-4" />
												最後に着用: {formatDate(new Date(outfit.lastWorn))}
											</div>
										)}

										{outfit.tags && outfit.tags.length > 0 && (
											<div className="flex flex-wrap gap-1">
												{outfit.tags.slice(0, 3).map((tag) => (
													<Badge
														key={tag}
														className="rounded-full border-slate-200 bg-slate-100 px-2 py-1 text-slate-700 text-xs"
													>
														#{tag}
													</Badge>
												))}
												{outfit.tags.length > 3 && (
													<Badge className="rounded-full border-slate-200 bg-slate-100 px-2 py-1 text-slate-700 text-xs">
														+{outfit.tags.length - 3}
													</Badge>
												)}
											</div>
										)}

										<div className="text-slate-500 text-xs">
											作成日: {formatDate(new Date(outfit.createdAt))}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* ページネーション */}
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						totalItems={filteredOutfits.length}
						itemsPerPage={itemsPerPage}
					/>
				</>
			)}
		</div>
	);
}
