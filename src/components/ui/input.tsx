import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-theme-text-secondary focus:border-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
