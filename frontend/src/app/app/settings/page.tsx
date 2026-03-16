"use client";
import React from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/query";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { ChevronRight, User, Bell, Shield, Palette, LogOut, Moon, Book, TrendingUp } from "lucide-react";

const SettingsPage = () => {
    const { data: userInfo } = useUserInfo();

    return (
        <main className="min-h-screen w-full text-white overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 pb-1 pt-1">

                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                </header>

                {/* Settings Lists (Linear Style) */}
                <div className="space-y-6">

                    {/* Manual Mode */}
                    {/* Account Section */}
                    <section>
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 pl-1">
                            Account
                        </h2>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">

                            <Link href="/app/profile" className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Profile</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-zinc-500 mb-0.5">{userInfo?.name || "User"}</span>
                                    <ChevronRight size={16} className="text-zinc-600" />
                                </div>
                            </Link>

                            <Link href="https://academia.srmist.edu.in/reset" className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Security</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-zinc-500 mb-0.5">Change Password</span>
                                    <ChevronRight size={16} className="text-zinc-600" />
                                </div>
                            </Link>

                            <Link href="/app/notifications" className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Push Notifications</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-zinc-500 opacity-0">On/Off</span>
                                </div>
                            </Link>


                        </div>
                    </section>

                    {/* Academics Section*/}

                    <section>
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 pl-1">
                            Academics
                        </h2>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                            <Link href="/app/course" className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <Book size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Courses</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <ChevronRight size={16} className="text-zinc-600" />
                                </div>
                            </Link>
                            <Link href="/app/percentage" className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                                        <TrendingUp size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Percentages</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <ChevronRight size={16} className="text-zinc-600" />
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Logout Section*/}
                    <section>
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 pl-1">
                            Logout
                        </h2>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                            <Link href="/auth/logout" className="flex items-center justify-between p-4 group hover:bg-red-500/10 cursor-pointer transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <LogOut size={18} />
                                    </div>
                                    <p className="text-sm font-medium text-red-500">Log Out</p>
                                </div>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-700 font-mono">Classivo v6.0.0-beta</p>
                </div>

            </div>
        </main>
    );
};

export default SettingsPage;
