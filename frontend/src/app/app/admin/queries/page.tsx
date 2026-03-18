"use client";

import React, { useState, useEffect } from "react";
import { 
    ShieldAlert, 
    RefreshCw, 
    Mail, 
    User, 
    Clock, 
    MessageSquare,
    Lock
} from "lucide-react";
import Link from "next/link";

interface StudentQuery {
    id: string;
    student_name: string;
    reg_number: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

const AdminQueriesPage = () => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchQueries = async () => {
        const token = localStorage.getItem("token");
        if (token !== "ADMIN_SESSION_SECRET_2026") {
            setIsAuthorized(false);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://siddu1118-classivo-backend.hf.space";
            const response = await fetch(`${apiBase}/api/admin/queries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch queries");
            }

            const data = await response.json();
            setQueries(data);
            setIsAuthorized(true);
        } catch (err: any) {
            setError(err.message);
            // If the backend says unauthorized, reflect it here
            if (err.message.toLowerCase().includes("unauthorized")) {
                setIsAuthorized(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-2xl">
                            <ShieldAlert className="text-red-400" size={40} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-zinc-400 mb-8">You do not have administrative privileges to view this page. Please login with an admin account.</p>
                    <Link 
                        href="/auth/logout"
                        className="inline-block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (isAuthorized === null && loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <RefreshCw className="text-amber-500 animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <MessageSquare className="text-amber-400" />
                            Student Support Queries
                        </h1>
                        <p className="text-zinc-400 mt-1">Manage and respond to student inquiries from the portal.</p>
                    </div>
                    <button
                        onClick={fetchQueries}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-white/5 transition-all text-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh Data
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid gap-6">
                    {queries.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-12 text-center">
                            <p className="text-zinc-500">{loading ? "Fetching queries..." : "No student queries found yet."}</p>
                        </div>
                    ) : (
                        queries.map((query) => (
                            <div 
                                key={query.id}
                                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-amber-500/30 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Sidebar of the card */}
                                    <div className="md:w-64 space-y-3 shrink-0 border-r border-white/5 md:pr-6">
                                        <div className="flex items-center gap-2 text-zinc-300 font-semibold truncate">
                                            <User size={16} className="text-amber-400" />
                                            {query.student_name}
                                        </div>
                                        <div className="text-xs text-zinc-500 font-mono">{query.reg_number}</div>
                                        <div className="flex items-center gap-2 text-zinc-400 text-xs truncate">
                                            <Mail size={14} />
                                            {query.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] pt-2">
                                            <Clock size={12} />
                                            {new Date(query.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Subject</div>
                                            <h3 className="text-xl font-bold text-white mb-2">{query.subject}</h3>
                                        </div>
                                        <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5 text-zinc-300 text-sm leading-relaxed">
                                            {query.message}
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <a 
                                                href={`mailto:${query.email}?subject=Re: ${query.subject}`}
                                                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold transition-all border border-amber-500/20"
                                            >
                                                Reply via Email
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQueriesPage;
