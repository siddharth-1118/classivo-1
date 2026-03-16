import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", variant = "default", children, ...props }, ref) => {

        const variants = {
            default: "linear-card",
            glass: "glass-obsidian rounded-xl",
            calenderspx: "rounded-xl border",
        };

        return (
            <div
                ref={ref}
                className={`${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";
