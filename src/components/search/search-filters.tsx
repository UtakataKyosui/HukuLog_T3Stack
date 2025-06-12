"use client";

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
import { Filter, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";

export interface ClothingFilters {
	search: string;
	category: string; // "all" or category ID
	season: string; // "all" or season value
	tags: string[];
	brand: string;
}

export interface OutfitFilters {
	search: string;
	occasion: string; // "all" or occasion value
	season: string; // "all" or season value
	tags: string[];
	rating: string; // "all" or rating value
}

interface ClothingSearchFiltersProps {
	filters: ClothingFilters;
	onFiltersChange: (filters: ClothingFilters) => void;
	categories: Array<{ id: number; name: string; type: string }>;
	availableTags: string[];
}

interface OutfitSearchFiltersProps {
	filters: OutfitFilters;
	onFiltersChange: (filters: OutfitFilters) => void;
	availableTags: string[];
}

export function ClothingSearchFilters({
	filters,
	onFiltersChange,
	categories,
	availableTags,
}: ClothingSearchFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [newTag, setNewTag] = useState("");

	const handleAddTag = () => {
		if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
			onFiltersChange({
				...filters,
				tags: [...filters.tags, newTag.trim()],
			});
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		onFiltersChange({
			...filters,
			tags: filters.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleReset = () => {
		onFiltersChange({
			search: "",
			category: "all",
			season: "all",
			tags: [],
			brand: "",
		});
		setIsExpanded(false);
	};

	const hasActiveFilters =
		filters.search ||
		(filters.category && filters.category !== "all") ||
		(filters.season && filters.season !== "all") ||
		filters.tags.length > 0 ||
		filters.brand;

	return (
		<div className="clean-card space-y-4 p-4">
			{/* メイン検索 */}
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-slate-400" />
					<Input
						placeholder="服を検索..."
						value={filters.search}
						onChange={(e) =>
							onFiltersChange({ ...filters, search: e.target.value })
						}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2"
					>
						<Filter className="h-4 w-4" />
						詳細フィルター
						{hasActiveFilters && (
							<Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
								{
									[
										filters.category,
										filters.season,
										filters.brand,
										...filters.tags,
									].filter(Boolean).length
								}
							</Badge>
						)}
					</Button>
					{hasActiveFilters && (
						<Button
							variant="outline"
							onClick={handleReset}
							className="flex items-center gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							リセット
						</Button>
					)}
				</div>
			</div>

			{/* 詳細フィルター */}
			{isExpanded && (
				<div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
					{/* カテゴリ */}
					<div>
						<Label className="font-medium text-sm">カテゴリ</Label>
						<div className="flex gap-2">
							<Select
								value={filters.category}
								onValueChange={(value) =>
									onFiltersChange({ ...filters, category: value })
								}
							>
								<SelectTrigger className="flex-1" data-testid="category-select">
									<SelectValue placeholder="全て" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全て</SelectItem>
									{categories.map((category) => (
										<SelectItem
											key={category.id}
											value={category.id.toString()}
										>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{filters.category !== "all" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										onFiltersChange({ ...filters, category: "all" })
									}
									className="px-2 text-slate-400 hover:text-slate-600"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* 季節 */}
					<div>
						<Label className="font-medium text-sm">季節</Label>
						<div className="flex gap-2">
							<Select
								value={filters.season}
								onValueChange={(value) =>
									onFiltersChange({ ...filters, season: value })
								}
							>
								<SelectTrigger className="flex-1" data-testid="season-select">
									<SelectValue placeholder="全て" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全て</SelectItem>
									<SelectItem value="spring">春</SelectItem>
									<SelectItem value="summer">夏</SelectItem>
									<SelectItem value="fall">秋</SelectItem>
									<SelectItem value="winter">冬</SelectItem>
									<SelectItem value="all-season">オールシーズン</SelectItem>
								</SelectContent>
							</Select>
							{filters.season !== "all" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onFiltersChange({ ...filters, season: "all" })}
									className="px-2 text-slate-400 hover:text-slate-600"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* ブランド */}
					<div>
						<Label className="font-medium text-sm">ブランド</Label>
						<Input
							placeholder="ブランド名"
							value={filters.brand}
							onChange={(e) =>
								onFiltersChange({ ...filters, brand: e.target.value })
							}
						/>
					</div>

					{/* タグ追加 */}
					<div>
						<Label className="font-medium text-sm">タグを追加</Label>
						<div className="flex gap-2">
							<Input
								placeholder="タグ名"
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
								className="flex-1"
							/>
							<Button
								size="sm"
								onClick={handleAddTag}
								disabled={!newTag.trim()}
							>
								追加
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* 選択されたタグ */}
			{filters.tags.length > 0 && (
				<div className="flex flex-wrap gap-2 pt-2">
					<Label className="self-center font-medium text-sm">
						選択中のタグ:
					</Label>
					{filters.tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="flex items-center gap-1"
						>
							#{tag}
							<button
								onClick={() => handleRemoveTag(tag)}
								className="ml-1 rounded-full p-0.5 hover:bg-slate-300"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}

			{/* 利用可能なタグ */}
			{isExpanded && availableTags.length > 0 && (
				<div className="pt-2">
					<Label className="font-medium text-sm">利用可能なタグ:</Label>
					<div className="mt-2 flex flex-wrap gap-1">
						{availableTags
							.filter((tag) => !filters.tags.includes(tag))
							.slice(0, 10)
							.map((tag) => (
								<button
									key={tag}
									onClick={() =>
										onFiltersChange({
											...filters,
											tags: [...filters.tags, tag],
										})
									}
									className="rounded-full bg-slate-100 px-2 py-1 text-xs transition-colors hover:bg-slate-200"
								>
									#{tag}
								</button>
							))}
					</div>
				</div>
			)}
		</div>
	);
}

export function OutfitSearchFilters({
	filters,
	onFiltersChange,
	availableTags,
}: OutfitSearchFiltersProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [newTag, setNewTag] = useState("");

	const handleAddTag = () => {
		if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
			onFiltersChange({
				...filters,
				tags: [...filters.tags, newTag.trim()],
			});
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		onFiltersChange({
			...filters,
			tags: filters.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleReset = () => {
		onFiltersChange({
			search: "",
			occasion: "all",
			season: "all",
			tags: [],
			rating: "all",
		});
		setIsExpanded(false);
	};

	const hasActiveFilters =
		filters.search ||
		(filters.occasion && filters.occasion !== "all") ||
		(filters.season && filters.season !== "all") ||
		filters.tags.length > 0 ||
		(filters.rating && filters.rating !== "all");

	return (
		<div className="clean-card space-y-4 p-4">
			{/* メイン検索 */}
			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-slate-400" />
					<Input
						placeholder="コーディネートを検索..."
						value={filters.search}
						onChange={(e) =>
							onFiltersChange({ ...filters, search: e.target.value })
						}
						className="pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2"
					>
						<Filter className="h-4 w-4" />
						詳細フィルター
						{hasActiveFilters && (
							<Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
								{
									[
										filters.occasion,
										filters.season,
										filters.rating,
										...filters.tags,
									].filter(Boolean).length
								}
							</Badge>
						)}
					</Button>
					{hasActiveFilters && (
						<Button
							variant="outline"
							onClick={handleReset}
							className="flex items-center gap-2"
						>
							<RotateCcw className="h-4 w-4" />
							リセット
						</Button>
					)}
				</div>
			</div>

			{/* 詳細フィルター */}
			{isExpanded && (
				<div className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
					{/* 場面 */}
					<div>
						<Label className="font-medium text-sm">場面</Label>
						<div className="flex gap-2">
							<Select
								value={filters.occasion}
								onValueChange={(value) =>
									onFiltersChange({ ...filters, occasion: value })
								}
							>
								<SelectTrigger className="flex-1" data-testid="occasion-select">
									<SelectValue placeholder="全て" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全て</SelectItem>
									<SelectItem value="casual">カジュアル</SelectItem>
									<SelectItem value="work">仕事</SelectItem>
									<SelectItem value="formal">フォーマル</SelectItem>
									<SelectItem value="party">パーティー</SelectItem>
									<SelectItem value="date">デート</SelectItem>
									<SelectItem value="sport">スポーツ</SelectItem>
								</SelectContent>
							</Select>
							{filters.occasion !== "all" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										onFiltersChange({ ...filters, occasion: "all" })
									}
									className="px-2 text-slate-400 hover:text-slate-600"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* 季節 */}
					<div>
						<Label className="font-medium text-sm">季節</Label>
						<div className="flex gap-2">
							<Select
								value={filters.season}
								onValueChange={(value) =>
									onFiltersChange({ ...filters, season: value })
								}
							>
								<SelectTrigger className="flex-1" data-testid="season-select">
									<SelectValue placeholder="全て" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全て</SelectItem>
									<SelectItem value="spring">春</SelectItem>
									<SelectItem value="summer">夏</SelectItem>
									<SelectItem value="fall">秋</SelectItem>
									<SelectItem value="winter">冬</SelectItem>
									<SelectItem value="all-season">オールシーズン</SelectItem>
								</SelectContent>
							</Select>
							{filters.season !== "all" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onFiltersChange({ ...filters, season: "all" })}
									className="px-2 text-slate-400 hover:text-slate-600"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* 評価 */}
					<div>
						<Label className="font-medium text-sm">評価</Label>
						<div className="flex gap-2">
							<Select
								value={filters.rating}
								onValueChange={(value) =>
									onFiltersChange({ ...filters, rating: value })
								}
							>
								<SelectTrigger className="flex-1" data-testid="rating-select">
									<SelectValue placeholder="全て" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全て</SelectItem>
									<SelectItem value="5">⭐⭐⭐⭐⭐ (5点)</SelectItem>
									<SelectItem value="4">⭐⭐⭐⭐ (4点以上)</SelectItem>
									<SelectItem value="3">⭐⭐⭐ (3点以上)</SelectItem>
									<SelectItem value="2">⭐⭐ (2点以上)</SelectItem>
									<SelectItem value="1">⭐ (1点以上)</SelectItem>
								</SelectContent>
							</Select>
							{filters.rating !== "all" && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onFiltersChange({ ...filters, rating: "all" })}
									className="px-2 text-slate-400 hover:text-slate-600"
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>

					{/* タグ追加 */}
					<div>
						<Label className="font-medium text-sm">タグを追加</Label>
						<div className="flex gap-2">
							<Input
								placeholder="タグ名"
								value={newTag}
								onChange={(e) => setNewTag(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
								className="flex-1"
							/>
							<Button
								size="sm"
								onClick={handleAddTag}
								disabled={!newTag.trim()}
							>
								追加
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* 選択されたタグ */}
			{filters.tags.length > 0 && (
				<div className="flex flex-wrap gap-2 pt-2">
					<Label className="self-center font-medium text-sm">
						選択中のタグ:
					</Label>
					{filters.tags.map((tag) => (
						<Badge
							key={tag}
							variant="secondary"
							className="flex items-center gap-1"
						>
							#{tag}
							<button
								onClick={() => handleRemoveTag(tag)}
								className="ml-1 rounded-full p-0.5 hover:bg-slate-300"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}

			{/* 利用可能なタグ */}
			{isExpanded && availableTags.length > 0 && (
				<div className="pt-2">
					<Label className="font-medium text-sm">利用可能なタグ:</Label>
					<div className="mt-2 flex flex-wrap gap-1">
						{availableTags
							.filter((tag) => !filters.tags.includes(tag))
							.slice(0, 10)
							.map((tag) => (
								<button
									key={tag}
									onClick={() =>
										onFiltersChange({
											...filters,
											tags: [...filters.tags, tag],
										})
									}
									className="rounded-full bg-slate-100 px-2 py-1 text-xs transition-colors hover:bg-slate-200"
								>
									#{tag}
								</button>
							))}
					</div>
				</div>
			)}
		</div>
	);
}
