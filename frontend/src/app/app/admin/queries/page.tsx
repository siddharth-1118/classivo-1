"use client";

import React, { useState, useEffect } from "react";
import { 
    ShieldCheck, 
    RefreshCw, 
    Mail, 
    User, 
    Clock, 
    MessageSquare,
    Lock
} from "lucide-react";

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
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [queries, setQueries] = useState<StudentQuery[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchQueries = async (email: string, password: string) => {
        if (!email || !password) return;
        setLoading(true);
        setError("");
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://siddu1118-classivo-backend.hf.space";
            const response = await fetch(`${apiBase}/api/admin/queries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to fetch queries");
            }

            const data = await response.json();
            setQueries(data);
            setIsAuthorized(true);
            localStorage.setItem("classivo_admin_email", email);
            localStorage.setItem("classivo_admin_password", password);
        } catch (err: any) {
            setError(err.message);
            setIsAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedEmail = localStorage.getItem("classivo_admin_email");
        const savedPassword = localStorage.getItem("classivo_admin_password");
        if (savedEmail && savedPassword) {
            setAdminEmail(savedEmail);
            setAdminPassword(savedPassword);
            fetchQueries(savedEmail, savedPassword);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchQueries(adminEmail, adminPassword);
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-amber-500/10 rounded-2xl">
                            <ShieldCheck className="text-amber-400" size={40} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
                    <p className="text-zinc-400 text-center mb-8">Enter your secure admin key to view student support queries.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                placeholder="Admin Email"
                                className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Admin Password"
                                className="w-full bg-zinc-800/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-amber-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                        >
                            {loading ? "Verifying..." : "Access Dashboard"}
                        </button>
                        {error && (
                            <p className="text-red-400 text-sm text-center mt-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {error}
                            </p>
                        )}
                    </form>
                </div>
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
                        onClick={() => fetchQueries(adminEmail, adminPassword)}
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
                            <p className="text-zinc-500">No student queries found yet.</p>
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
