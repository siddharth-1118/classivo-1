"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, X, ArrowRight, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const CommunityJoinModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Only show on /app paths, which implies the user is logged in
        if (pathname.startsWith("/app")) {
            // Check session storage to see if we've shown it this session
            // User said "on every login", but typically that means once per session
            // If "every login" literally means every time they enter the app, we can do that too.
            const hasShownThisSession = sessionStorage.getItem("community_modal_shown");
            
            if (!hasShownThisSession) {
                // Short delay for better UX
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem("community_modal_shown", "true");
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [pathname]);

    const handleJoin = () => {
        window.open("https://chat.whatsapp.com/KCbxvabSvRbK96h67JF3Io", "_blank");
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        <div className="morphism-glass border border-premium-gold/20 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden bg-premium-obsidian/40">
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-premium-gold/10 blur-[60px] rounded-full" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-premium-gold/5 blur-[60px] rounded-full" />

                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-3xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                                    <Users className="text-premium-gold" size={40} />
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                                    Join the Elite <br />
                                    <span className="text-premium-gold">Classivo Community</span>
                                </h2>

                                <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                                    Connect with top students, get instant updates, and share resources with the Classivo network.
                                </p>

                                <div className="flex flex-col w-full gap-4">
                                    <button
                                        onClick={handleJoin}
                                        className="w-full py-5 px-8 rounded-2xl bg-premium-gold text-black font-bold text-lg flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)] group"
                                    >
                                        <MessageCircle size={24} />
                                        Join WhatsApp Group
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommunityJoinModal;
