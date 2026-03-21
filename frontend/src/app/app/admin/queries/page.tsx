"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Lock,
  LogOut,
  Shield,
  Inbox,
  Flag,
  FileCheck,
  CalendarPlus2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  approveNote,
  createEvent,
  deleteEvent,
  dismissReport,
  fetchAdminQueries,
  fetchModeration,
  rejectNote,
  removeReportedContent,
} from "@/lib/studentHubApi";
import { clearAdminSession, getAdminSession, isAdminAuthenticated, setAdminSession } from "@/utils/adminSession";

type StudentQuery = {
  id: string;
  user_email: string;
  subject: string;
  message: string;
  created_at: string;
};

type NoteRow = {
  id: string;
  title: string;
  subject: string;
  unit: string;
  student_name: string;
  approval_status: string;
  file_url: string;
};

type ReportRow = {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  reporter_email: string;
  status: string;
};

type ReviewRow = {
  id: string;
  subject: string;
  faculty_name?: string;
  review_text: string;
  status: string;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  event_time: string;
  registration_link?: string;
  image_url?: string;
  status: string;
};

const tabs = [
  { id: "queries", label: "Queries", icon: Inbox },
  { id: "notes", label: "Notes", icon: FileCheck },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "reviews", label: "Reviews", icon: Shield },
  { id: "events", label: "Events", icon: CalendarPlus2 },
];

export default function AdminQueriesPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [activeTab, setActiveTab] = useState("queries");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    registrationLink: "",
  });
  const [eventImage, setEventImage] = useState<File | null>(null);

  const credentials = useMemo(
    () => ({ email: adminEmail || "admin@classivo.com", password: adminPassword || "ClassivoAdmin2026!" }),
    [adminEmail, adminPassword]
  );

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [queriesData, moderationData] = await Promise.all([
        fetchAdminQueries(credentials),
        fetchModeration(credentials),
      ]);
      setQueries(queriesData ?? []);
      setNotes(moderationData.notes ?? []);
      setReports(moderationData.reports ?? []);
      setReviews(moderationData.reviews ?? []);
      setEvents(moderationData.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
      clearAdminSession();
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    const session = getAdminSession();
    if (session.email) setAdminEmail(session.email);
    if (session.password) setAdminPassword(session.password);
    if (isAdminAuthenticated()) {
      setIsAuthorized(true);
      void loadAll();
    } else {
      setIsAuthorized(false);
    }
  }, [loadAll]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminSession(adminEmail, adminPassword);
    setIsAuthorized(true);
    void loadAll();
  }

  async function handleApprove(id: string) {
    try {
      await approveNote(id, credentials);
      setSuccess("Note approved.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve note");
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Reason for rejection (optional)") ?? "";
    try {
      await rejectNote(id, credentials, reason);
      setSuccess("Note rejected.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject note");
    }
  }

  async function handleDismissReport(id: string) {
    try {
      await dismissReport(id, credentials);
      setSuccess("Report dismissed.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dismiss report");
    }
  }

  async function handleRemoveReport(id: string) {
    try {
      await removeReportedContent(id, credentials);
      setSuccess("Reported content removed.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove content");
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", credentials.email);
      formData.append("password", credentials.password);
      formData.append("title", eventForm.title);
      formData.append("description", eventForm.description);
      formData.append("eventDate", eventForm.eventDate);
      formData.append("eventTime", eventForm.eventTime);
      formData.append("venue", eventForm.venue);
      formData.append("registrationLink", eventForm.registrationLink);
      if (eventImage) formData.append("image", eventImage);
      await createEvent(formData);
      setSuccess("Event created.");
      setEventForm({ title: "", description: "", eventDate: "", eventTime: "", venue: "", registrationLink: "" });
      setEventImage(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    }
  }

  async function handleDeleteEvent(id: string) {
    try {
      await deleteEvent(id, credentials);
      setSuccess("Event removed.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove event");
    }
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Lock size={28} />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-2 text-center text-sm text-zinc-400">Use the existing admin credentials to open moderation.</p>
          <form onSubmit={handleLogin} className="mt-8 grid gap-4">
            <Input label="Email" value={adminEmail} onChange={setAdminEmail} type="email" />
            <Input label="Password" value={adminPassword} onChange={setAdminPassword} type="password" />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-400">
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Moderation Console</h1>
            <p className="mt-2 text-sm text-zinc-400">Queries, notes approvals, reports, reviews, and event publishing in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app/admin/analytics" className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
              Analytics
            </Link>
            <button
              onClick={() => void loadAll()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-zinc-300"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => {
                clearAdminSession();
                setIsAuthorized(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300"
            >
              <Lock size={16} />
              Lock
            </button>
            <Link
              href="/auth/logout"
              onClick={() => clearAdminSession()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm text-white"
            >
              <LogOut size={16} />
              Logout
            </Link>
          </div>
        </div>

        {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
        {success ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">{success}</div> : null}

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                activeTab === tab.id ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-white/10 bg-white/[0.03] text-zinc-400"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "queries" ? (
          <div className="grid gap-4">
            {queries.length === 0 ? <EmptyState label="No student queries found yet." /> : null}
            {queries.map((query) => (
              <div key={query.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{query.user_email}</div>
                    <h3 className="mt-2 text-xl font-semibold text-white">{query.subject}</h3>
                  </div>
                  <div className="text-xs text-zinc-500">{new Date(query.created_at).toLocaleString()}</div>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{query.message}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <div className="grid gap-4">
            {notes.length === 0 ? <EmptyState label="No note submissions yet." /> : null}
            {notes.map((note) => (
              <div key={note.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{note.student_name} · {note.subject} · {note.unit}</div>
                    <h3 className="mt-2 text-xl font-semibold text-white">{note.title}</h3>
                    <a href={note.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-amber-300 hover:text-amber-200">
                      Open uploaded file
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{note.approval_status}</span>
                    {note.approval_status !== "approved" ? (
                      <button onClick={() => void handleApprove(note.id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs text-emerald-300">
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    ) : null}
                    {note.approval_status !== "rejected" ? (
                      <button onClick={() => void handleReject(note.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-300">
                        <XCircle size={14} /> Reject
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "reports" ? (
          <div className="grid gap-4">
            {reports.length === 0 ? <EmptyState label="No content reports yet." /> : null}
            {reports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{report.content_type} · {report.reporter_email}</div>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{report.reason}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{report.status}</span>
                    <button onClick={() => void handleDismissReport(report.id)} className="rounded-xl bg-zinc-800 px-3 py-2 text-xs text-zinc-200">
                      Dismiss
                    </button>
                    <button onClick={() => void handleRemoveReport(report.id)} className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-300">
                      Remove Content
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "reviews" ? (
          <div className="grid gap-4">
            {reviews.length === 0 ? <EmptyState label="No faculty reviews yet." /> : null}
            {reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{review.subject}</div>
                    {review.faculty_name ? <p className="mt-2 text-sm text-zinc-400">{review.faculty_name}</p> : null}
                  </div>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">{review.status}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{review.review_text}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "events" ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={handleCreateEvent} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-xl font-semibold text-white">Create Event</h2>
              <div className="mt-4 grid gap-3">
                <Input label="Title" value={eventForm.title} onChange={(value) => setEventForm((current) => ({ ...current, title: value }))} />
                <TextArea label="Description" value={eventForm.description} onChange={(value) => setEventForm((current) => ({ ...current, description: value }))} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input label="Date" value={eventForm.eventDate} onChange={(value) => setEventForm((current) => ({ ...current, eventDate: value }))} type="date" />
                  <Input label="Time" value={eventForm.eventTime} onChange={(value) => setEventForm((current) => ({ ...current, eventTime: value }))} placeholder="04:00 PM" />
                </div>
                <Input label="Venue" value={eventForm.venue} onChange={(value) => setEventForm((current) => ({ ...current, venue: value }))} />
                <Input label="Registration Link" value={eventForm.registrationLink} onChange={(value) => setEventForm((current) => ({ ...current, registrationLink: value }))} placeholder="https://..." />
                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Image</span>
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => setEventImage(e.target.files?.[0] ?? null)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300" />
                </label>
              </div>
              <button className="mt-5 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-bold text-black transition hover:brightness-105">Publish Event</button>
            </form>

            <div className="grid gap-4">
              {events.length === 0 ? <EmptyState label="No admin events yet." /> : null}
              {events.map((event) => (
                <div key={event.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                      <p className="mt-2 text-sm text-zinc-400">{event.venue} · {event.event_date} · {event.event_time}</p>
                      {event.registration_link ? (
                        <a href={event.registration_link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-sky-300">
                          Open registration link
                        </a>
                      ) : null}
                    </div>
                    <button onClick={() => void handleDeleteEvent(event.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-300">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">{label}</div>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-32 rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none"
      />
    </label>
  );
}
