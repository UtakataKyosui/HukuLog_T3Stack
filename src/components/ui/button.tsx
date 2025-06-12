import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 active:transition-transform active:duration-100",
	{
		variants: {
			variant: {
				default: "bg-theme-primary text-theme-background shadow-md border border-theme-primary hover:bg-theme-secondary hover:shadow-lg hover:border-theme-secondary active:bg-theme-primary",
				destructive:
					"bg-theme-error text-theme-background shadow-md border border-theme-error hover:opacity-90 hover:shadow-lg active:opacity-80",
				outline:
					"border-2 border-theme-border bg-theme-background text-theme-text shadow-sm hover:border-theme-primary hover:bg-theme-surface hover:shadow-md active:bg-theme-surface",
				secondary: "bg-theme-surface text-theme-text shadow-sm border border-theme-border hover:bg-theme-border hover:border-theme-secondary active:bg-theme-border",
				ghost: "text-theme-text hover:bg-theme-surface hover:text-theme-primary active:bg-theme-border",
				link: "text-theme-secondary underline-offset-4 hover:text-theme-primary hover:underline",
			},
			size: {
				default: "h-10 px-6 py-2",
				sm: "h-8 px-4 text-xs",
				lg: "h-12 px-8 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
