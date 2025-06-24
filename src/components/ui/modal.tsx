"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
}: ModalProps) {
	const { theme } = useTheme();

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const sizeClasses = {
		sm: "max-w-md",
		md: "max-w-lg",
		lg: "max-w-2xl",
		xl: "max-w-4xl",
	};

	// テーマに応じたスタイルクラスを決定
	const getThemeClasses = () => {
		return {
			modalBg: 'bg-theme-background',
			border: 'border-theme-border',
			title: 'text-theme-text',
			closeButton: 'text-theme-text-secondary hover:bg-theme-surface hover:text-theme-text',
		};
	};

	const themeClasses = getThemeClasses();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			{/* Overlay */}
			<div className="absolute inset-0" onClick={onClose} />

			{/* Modal Content */}
			<div
				className={`relative w-full ${sizeClasses[size]} flex max-h-[90vh] flex-col overflow-hidden rounded-lg border shadow-xl ${themeClasses.border} ${themeClasses.modalBg}`}
			>
				{/* Header */}
				{title && (
					<div className={`flex flex-shrink-0 items-center justify-between border-b p-4 sm:p-6 ${themeClasses.border}`}>
						<h2 className={`font-bold text-lg sm:text-xl ${themeClasses.title}`}>
							{title}
						</h2>
						<button
							onClick={onClose}
							className={`rounded-full p-2 transition-colors ${themeClasses.closeButton}`}
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
			</div>
		</div>
	);
}
