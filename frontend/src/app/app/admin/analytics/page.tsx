"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, BarChart3, Lock, LogIn, RefreshCw, Users } from "lucide-react";
import { getApiBase } from "@/lib/api";
import { clearAdminSession, getAdminSession, isAdminAuthenticated, setAdminSession } from "@/utils/adminSession";

type AnalyticsSummary = {
  totalPageViews: number;
  last7dPageViews: number;
  totalVisitors: number;
  last7dVisitors: number;
  totalLogins: number;
  last7dLogins: number;
  uniqueLoggedInUsers: number;
};

type TopPage = {
  path: string;
  views: number;
};

type RecentEvent = {
  eventType: string;
  path?: string;
  userEmail?: string;
  createdAt: string;
};

const defaultEmail = "admin@classivo.com";
const defaultPassword = "ClassivoAdmin2026!";

const AdminAnalyticsPage = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState(defaultEmail);
  const [adminPassword, setAdminPassword] = useState(defaultPassword);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (email?: string, password?: string) => {
    setLoading(true);
    setError("");
    try {
      const session = getAdminSession();
      const response = await fetch(`${getApiBase()}/api/admin/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || session.email || adminEmail || defaultEmail,
          password: password || session.password || adminPassword || defaultPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      setSummary(data.summary);
      setTopPages(data.topPages || []);
      setRecentEvents(data.recentEvents || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [adminEmail, adminPassword]);

  useEffect(() => {
    const session = getAdminSession();
    if (session.email) setAdminEmail(session.email);
    if (session.password) setAdminPassword(session.password);

    if (isAdminAuthenticated()) {
      setIsAuthorized(true);
      fetchAnalytics(session.email, session.password);
      return;
    }
    setIsAuthorized(false);
  }, [fetchAnalytics]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSession(adminEmail, adminPassword);
    setIsAuthorized(true);
    fetchAnalytics(adminEmail, adminPassword);
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/10 rounded-2xl">
              <Lock className="text-cyan-300" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Analytics Login</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Verify your admin credentials to open the analytics dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
              placeholder={defaultEmail}
              required
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-zinc-800/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50"
              placeholder="Enter admin password"
              required
            />
            {error ? <p className="text-red-400 text-xs text-center">{error}</p> : null}
            <button
              type="submit"
              className="w-full bg-cyan-300 hover:bg-cyan-200 text-black font-bold py-3 rounded-xl transition-all"
            >
              Open Analytics
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="text-cyan-300" />
              Admin Analytics
            </h1>
            <p className="text-zinc-400 mt-1">Track page views, visitors, logins, and recent activity inside Classivo.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/app/admin/queries"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl border border-white/5 text-sm"
            >
              Open Queries
            </Link>
            <button
              onClick={() => fetchAnalytics()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl border border-white/5 text-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => {
                clearAdminSession();
                setIsAuthorized(false);
              }}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-sm"
            >
              Lock
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Activity size={18} />} label="Total Page Views" value={summary?.totalPageViews ?? 0} helper={`Last 7d: ${summary?.last7dPageViews ?? 0}`} />
          <StatCard icon={<Users size={18} />} label="Visitors" value={summary?.totalVisitors ?? 0} helper={`Last 7d: ${summary?.last7dVisitors ?? 0}`} />
          <StatCard icon={<LogIn size={18} />} label="Successful Logins" value={summary?.totalLogins ?? 0} helper={`Last 7d: ${summary?.last7dLogins ?? 0}`} />
          <StatCard icon={<BarChart3 size={18} />} label="Unique Logged-In Users" value={summary?.uniqueLoggedInUsers ?? 0} helper="Based on login events" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Top Pages</h2>
            <div className="mt-5 space-y-3">
              {topPages.length === 0 ? (
                <p className="text-zinc-500 text-sm">No page-view data yet.</p>
              ) : (
                topPages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
                    <span className="text-sm text-zinc-200 break-all">{page.path}</span>
                    <span className="text-sm font-semibold text-cyan-200">{page.views}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <div className="mt-5 space-y-3">
              {recentEvents.length === 0 ? (
                <p className="text-zinc-500 text-sm">No recent analytics events yet.</p>
              ) : (
                recentEvents.map((event, index) => (
                  <div key={`${event.createdAt}-${index}`} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-cyan-300">{event.eventType.replaceAll("_", " ")}</span>
                      <span className="text-xs text-zinc-500">{new Date(event.createdAt).toLocaleString()}</span>
                    </div>
                    {event.path ? <div className="mt-2 text-sm text-zinc-200">{event.path}</div> : null}
                    {event.userEmail ? <div className="mt-1 text-xs text-zinc-500">{event.userEmail}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 text-cyan-200">
        {icon}
        <span className="text-xs uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm text-zinc-500">{helper}</div>
    </div>
  );
}

export default AdminAnalyticsPage;
