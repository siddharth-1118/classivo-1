"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Settings,
    LogOut,
    Hourglass,
    CalendarClock,
    BookOpenText,
    TrendingUp,
    Calculator,
    User,
    Users,
    X,
    Sparkles
} from "lucide-react";
import { useUserInfo } from "@/hooks/query";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const isAppPath = pathname.startsWith("/app");
    const { data: userInfo } = useUserInfo(isAppPath);

    const links = [
        { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
        { name: "Timetable", href: "/app/timetable", icon: Hourglass },
        { name: "Attendance", href: "/app/attendance", icon: CalendarClock },
        { name: "Marks", href: "/app/marks", icon: BookOpenText },
        { name: "Percentage", href: "/app/percentage", icon: TrendingUp },
        { name: "Courses", href: "/app/course", icon: BookOpen },
        { name: "Calendar", href: "/app/calendar", icon: Calendar },
        { name: "GradeX", href: "/app/gradex", icon: Calculator },
        { name: "Mess Menu", href: "/app/messmenu", icon: Calendar },
        { name: "Profile", href: "/app/profile", icon: User },
        { name: "Join Community", href: "https://chat.whatsapp.com/KCbxvabSvRbK96h67JF3Io", icon: Users },
        { name: "Clubs", href: "/app/clubs", icon: Sparkles },
        { name: "Settings", href: "/app/settings", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const handleLogout = () => {
        router.push("/auth/logout");
        onClose();
    };

    if (!pathname.startsWith("/app")) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[50] bg-black/60 backdrop-blur-md md:backdrop-blur-sm"
                    />

                    {/* Sidebar Panel */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-[55] w-full sm:w-80 md:w-72 bg-premium-obsidian border-r border-premium-gold/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                    >
                        {/* Premium Glow Effect */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-premium-gold/5 to-transparent pointer-events-none" />

                        <div className="flex flex-col h-full p-8 relative z-10">
                            {/* Logo Section */}
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold tracking-tighter text-white">
                                        CLASSIVO
                                    </span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors md:hidden"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                                            isActive(link.href)
                                                ? "bg-premium-gold/10 text-premium-gold border border-premium-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <link.icon
                                            size={22}
                                            className={`transition-colors duration-300 ${
                                                isActive(link.href) ? "text-premium-gold" : "text-zinc-600 group-hover:text-premium-gold"
                                            }`}
                                        />
                                        <span className="font-semibold tracking-wide text-sm uppercase">
                                            {link.name}
                                        </span>
                                    </Link>
                                ))}
                            </nav>

                            {/* User Profile & Logout */}
                            <div className="mt-auto pt-8 border-t border-white/5">
                                <div className="flex items-center gap-4 px-2 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-premium-gold to-[#B8860B] flex items-center justify-center text-black font-bold shadow-lg shrink-0">
                                        {userInfo?.name ? getInitials(userInfo.name) : "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-white truncate">
                                            {userInfo?.name || "User"}
                                        </p>
                                        <p className="text-xs text-zinc-500 font-medium truncate uppercase tracking-widest">
                                            {userInfo?.regNumber || "Student Account"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                                >
                                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-bold uppercase tracking-widest text-xs">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
