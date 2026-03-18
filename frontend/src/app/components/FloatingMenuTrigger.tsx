"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface FloatingMenuTriggerProps {
    onToggle: () => void;
    isOpen: boolean;
}

const FloatingMenuTrigger: React.FC<FloatingMenuTriggerProps> = ({ onToggle, isOpen }) => {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);

    if (!pathname.startsWith("/app") || pathname === "/app/dashboard") return null;

    return (
        <div 
            className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.button
                onClick={onToggle}
                animate={{ 
                    width: isOpen ? 60 : (isHovered ? 80 : 12),
                    height: isOpen ? 60 : (isHovered ? 120 : 60),
                    x: isOpen ? 24 : 0,
                    borderRadius: isOpen ? "30px" : "0 40px 40px 0"
                }}
                className={`relative flex items-center justify-center transition-all duration-500 overflow-hidden ${
                    isOpen 
                        ? "bg-premium-obsidian border border-premium-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.2)]" 
                        : "bg-premium-gold/80 backdrop-blur-md border border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
                }`}
                whileTap={{ scale: 0.95 }}
            >
                {/* Content */}
                <motion.div 
                    animate={{ 
                        rotate: isOpen ? 90 : 0,
                        opacity: (isHovered || isOpen) ? 1 : 0,
                        scale: (isHovered || isOpen) ? 1 : 0.5
                    }}
                    className={`relative z-10 transition-colors duration-500 ${isOpen ? "text-premium-gold" : "text-black"}`}
                >
                    {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
                </motion.div>

                {/* Liquid Effect (simplified) */}
                <AnimatePresence>
                    {isHovered && !isOpen && (
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="absolute inset-0 bg-white/20 blur-md pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Vertical Text when hovered */}
                <AnimatePresence>
                    {isHovered && !isOpen && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute right-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40 rotate-180 [writing-mode:vertical-lr]"
                        >
                            Menu
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default FloatingMenuTrigger;
