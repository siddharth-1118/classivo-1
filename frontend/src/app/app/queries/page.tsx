"use client";

import React, { useState, useEffect } from "react";
import { BookOpenText, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/app/components/ui/Card";
import { getApiBase } from "@/lib/api";
import { expireSession, getSessionToken } from "@/utils/sessionClient";

export default function QueriesPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(getSessionToken() ?? null);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message cannot be empty.");
      return;
    }
    if (!token) {
      toast.error(expireSession());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${getApiBase()}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": token,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(expireSession(typeof result?.error === "string" ? result.error : undefined));
      }
      if (!response.ok) {
        throw new Error(result.error || "Failed to send query.");
      }

      toast.success(result.message || "Query sent successfully!");
      setSubject("");
      setMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 pb-24 pt-4 sm:px-6">
      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sky-300">
            <BookOpenText size={20} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Student Queries</div>
            <h1 className="text-2xl font-semibold text-white">Send your query to admin</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
          If you have any issue, feedback, or question, type it here. It will be delivered to the admin queries dashboard.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-black/25 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this regarding?"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-premium-gold/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-zinc-500">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain your issue or question..."
                rows={8}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-premium-gold/30 focus:outline-none"
              />
            </div>



            <button
              type="submit"
              disabled={isLoading || !subject.trim() || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-premium-gold/20 bg-premium-gold px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#f3cf63] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {isLoading ? "Sending..." : "Send Query"}
            </button>
          </form>
        </Card>

        <Card className="border-white/10 bg-black/25 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Flow</div>
              <h2 className="text-xl font-semibold text-white">How your query is handled</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              "Write your subject and message here.",
              "The query is sent to the existing backend query endpoint.",
              "Admin receives it inside the admin queries dashboard.",
              "They can review your details and reply from there.",
            ].map((step) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-zinc-200">
                {step}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
