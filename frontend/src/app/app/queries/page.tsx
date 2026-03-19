"use client";

import React from "react";
import { BookOpenText, CheckCircle2, Send } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { getApiBase } from "@/lib/api";

export default function QueriesPage() {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setStatus("loading");
    setError("");

    try {
      const token = localStorage.getItem("classivo_token");
      const response = await fetch(`${getApiBase()}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error((payload && typeof payload.error === "string" && payload.error) || "Failed to send query");
      }

      setStatus("success");
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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

            {status === "error" ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {status === "success" ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                Query sent successfully. Admin will receive it in the dashboard.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading" || !subject.trim() || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-premium-gold/20 bg-premium-gold px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-[#f3cf63] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {status === "loading" ? "Sending..." : "Send Query"}
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
