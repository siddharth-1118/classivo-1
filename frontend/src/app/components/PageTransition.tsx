"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { getPageIndex } from "@/config/nav";

// Hook to check for mobile viewport
function useIsMobile() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useLayoutEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
}
export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const prevPathRef = useRef(pathname);
    const [direction, setDirection] = useState(0);
    const isMobile = useIsMobile();

    // Use useLayoutEffect to determine direction BEFORE paint
    useLayoutEffect(() => {
        if (prevPathRef.current !== pathname) {
            const prevIndex = getPageIndex(prevPathRef.current);
            const currIndex = getPageIndex(pathname);

            if (prevIndex !== -1 && currIndex !== -1) {
                setDirection(currIndex > prevIndex ? 1 : -1);
            } else {
                setDirection(0);
            }
            prevPathRef.current = pathname;
        }
    }, [pathname]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
            position: "absolute" as const, // Absolute positioning for smoother overlap
        }),
        center: {
            x: 0,
            opacity: 1,
            position: "relative" as const,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
            position: "absolute" as const, // Absolute positioning on exit to avoid layout shifts
        }),
    };

    if (!isMobile) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                <motion.div
                    key={pathname}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 100, damping: 20 }, // Smoother spring
                        opacity: { duration: 0.4 },
                    }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
