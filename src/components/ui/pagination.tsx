"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	showInfo?: boolean;
	totalItems?: number;
	itemsPerPage?: number;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	showInfo = true,
	totalItems,
	itemsPerPage = 50,
}: PaginationProps) {
	// ページ番号の配列を生成
	const getPageNumbers = () => {
		const pages: (number | "ellipsis")[] = [];
		const maxVisiblePages = 7; // 表示する最大ページ数

		if (totalPages <= maxVisiblePages) {
			// 全ページを表示
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// 省略表示
			pages.push(1);

			if (currentPage <= 4) {
				// 最初の方のページ
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				// 最後の方のページ
				pages.push("ellipsis");
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// 中間のページ
				pages.push("ellipsis");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			{/* ページネーション情報 */}
			{showInfo && totalItems && (
				<div className="text-center text-slate-600 text-sm">
					{totalItems}件中{" "}
					{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
					{Math.min(currentPage * itemsPerPage, totalItems)}件を表示
				</div>
			)}

			{/* ページネーション */}
			<div className="flex flex-wrap items-center justify-center gap-1">
				{/* 前のページボタン */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="flex items-center gap-1"
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">前へ</span>
				</Button>

				{/* ページ番号 */}
				{pageNumbers.map((page, index) => (
					<div key={page === "ellipsis" ? `ellipsis-${index}` : `page-${page}`}>
						{page === "ellipsis" ? (
							<Button variant="ghost" size="sm" disabled>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						) : (
							<Button
								variant={currentPage === page ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(page)}
								className={`min-w-[40px] ${
									currentPage === page
										? "bg-blue-600 text-white hover:bg-blue-700"
										: ""
								}`}
							>
								{page}
							</Button>
						)}
					</div>
				))}

				{/* 次のページボタン */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="flex items-center gap-1"
				>
					<span className="hidden sm:inline">次へ</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* モバイル用ページジャンプ */}
			<div className="flex items-center justify-center gap-2 sm:hidden">
				<span className="text-slate-600 text-sm">ページ</span>
				<select
					value={currentPage}
					onChange={(e) => onPageChange(Number(e.target.value))}
					className="rounded border border-slate-300 px-2 py-1 text-sm"
				>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<option key={page} value={page}>
							{page}
						</option>
					))}
				</select>
				<span className="text-slate-600 text-sm">/ {totalPages}</span>
			</div>
		</div>
	);
}
