"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BackButtonProps {
	href?: string;
	fallbackHref?: string;
	children?: React.ReactNode;
}

export function BackButton({
	href,
	fallbackHref = "/outfits",
	children = "戻る",
}: BackButtonProps) {
	const router = useRouter();
	const [canGoBack, setCanGoBack] = useState(false);

	useEffect(() => {
		// Check if there's history to go back to
		setCanGoBack(window.history.length > 1);
	}, []);

	const handleClick = () => {
		if (href) {
			// If specific href is provided, use it
			router.push(href);
		} else if (canGoBack) {
			// If we can go back in history, do so
			router.back();
		} else {
			// Fallback to outfits page if no history
			router.push(fallbackHref);
		}
	};

	return (
		<Button
			onClick={handleClick}
			variant="ghost"
			size="sm"
			className="mb-4 text-slate-600 hover:text-slate-800"
		>
			<ArrowLeft className="mr-2 h-4 w-4" />
			{children}
		</Button>
	);
}
