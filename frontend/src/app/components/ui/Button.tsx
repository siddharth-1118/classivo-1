import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "ghost" | "solid" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    icon?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "ghost", size = "md", isLoading, icon: Icon, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            ghost: "btn-ghost",
            solid: "bg-premium-gold text-white hover:bg-emerald-600 border border-transparent shadow-glow-gold",
            danger: "border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : Icon ? (
                    <Icon className="mr-2 h-4 w-4" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

