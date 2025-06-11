"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
	href?: string;
	children?: React.ReactNode;
}

export function BackButton({ href, children = "戻る" }: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (href) {
			router.push(href);
		} else {
			router.back();
		}
	};

	return (
		<Button
			onClick={handleClick}
			variant="ghost"
			size="sm"
			className="mb-4 text-slate-600 hover:text-slate-800"
		>
			<ArrowLeft className="h-4 w-4 mr-2" />
			{children}
		</Button>
	);
}