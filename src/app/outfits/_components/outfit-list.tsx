"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Calendar, Edit3, Plus, Shirt, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import CreateOutfitForm from "./create-outfit-form";

export default function OutfitList() {
	const [showCreateForm, setShowCreateForm] = useState(false);

	const { data: outfits, refetch } = api.outfit.getAll.useQuery();
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
						key={i}
						className={`h-4 w-4 ${
							i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Shirt className="h-5 w-5" />
					<span className="text-gray-600 text-sm">
						{outfits?.length ?? 0} コーデ
					</span>
				</div>
				<Button
					onClick={() => setShowCreateForm(true)}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					コーデを作成
				</Button>
			</div>

			{showCreateForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
					<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
						<h2 className="mb-4 font-bold text-xl">
							新しいコーディネートを作成
						</h2>
						<CreateOutfitForm
							onSuccess={() => {
								setShowCreateForm(false);
								refetch();
							}}
							onCancel={() => setShowCreateForm(false)}
						/>
					</div>
				</div>
			)}

			{outfits?.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Shirt className="mb-4 h-12 w-12 text-gray-400" />
						<p className="text-center text-gray-600">
							まだコーディネートが作成されていません。
							<br />
							「コーデを作成」ボタンから始めましょう！
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{outfits?.map((outfit) => (
						<Card key={outfit.id} className="transition-shadow hover:shadow-md">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<CardTitle className="text-lg">{outfit.name}</CardTitle>
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												// TODO: Add edit functionality
											}}
										>
											<Edit3 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(outfit.id)}
											className="text-red-500 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{outfit.description && (
									<p className="text-gray-600 text-sm">{outfit.description}</p>
								)}

								<div className="flex flex-wrap gap-1">
									{outfit.occasion && (
										<Badge variant="secondary">{outfit.occasion}</Badge>
									)}
									{outfit.season && (
										<Badge variant="outline">{outfit.season}</Badge>
									)}
								</div>

								{outfit.rating && (
									<div className="flex items-center gap-2">
										{renderStars(outfit.rating)}
										<span className="text-gray-600 text-sm">
											{outfit.rating}/5
										</span>
									</div>
								)}

								{outfit.lastWorn && (
									<div className="flex items-center gap-2 text-gray-600 text-sm">
										<Calendar className="h-4 w-4" />
										最後に着用: {formatDate(new Date(outfit.lastWorn))}
									</div>
								)}

								{outfit.tags && outfit.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{outfit.tags.map((tag) => (
											<Badge key={tag} variant="outline" className="text-xs">
												{tag}
											</Badge>
										))}
									</div>
								)}

								<div className="text-gray-500 text-xs">
									作成日: {formatDate(new Date(outfit.createdAt))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
