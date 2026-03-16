"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid,
    CalendarCheck,
    Clock,
    GraduationCap,
    Calendar,
    LogOut,
    Settings
} from "lucide-react";

const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
        { name: "Attendance", href: "/app/attendance", icon: CalendarCheck },
        { name: "Timetable", href: "/app/timetable", icon: Clock },
        { name: "Marks", href: "/app/marks", icon: GraduationCap },
        { name: "Calendar", href: "/app/calendar", icon: Calendar },
        { name: "Settings", href: "/app/settings", icon: Settings },
    ];

    // Only show sidebar on app pages and NOT on auth pages or landing
    if (!pathname.startsWith("/app")) return null;

    return (
        <aside className="fixed left-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex">
            <div className="glass-dock rounded-2xl p-3 flex flex-col gap-4 items-center bg-zinc-950/40 backdrop-blur-xl border border-white/10 shadow-glow-gold">
                {/* Logo / Brand */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">V</span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  relative group p-3 rounded-xl transition-all duration-300
                  ${isActive
                                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }
                `}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                                {/* Tooltip */}
                                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                    <Link
                        href="/auth/logout"
                        className="p-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group"
                    >
                        <LogOut size={20} />
                        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Logout
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

