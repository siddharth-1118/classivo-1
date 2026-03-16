import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export const Badge = ({ className = "", variant = "default", children, ...props }: BadgeProps) => {

    const variants = {
        default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
        success: "bg-premium-gold/10 text-premium-gold border border-premium-gold/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20",
        outline: "bg-transparent text-zinc-400 border border-zinc-700",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};

