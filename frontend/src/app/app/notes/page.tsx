"use client";

import React, { useEffect, useMemo, useState } from "react";
import { uploadNote, fetchNotes } from "@/lib/studentHubApi";
import { useUserInfo } from "@/hooks/query";
import { FileText, Upload, Clock3, CheckCircle2, XCircle, Search } from "lucide-react";

type NoteRow = {
  id: string;
  semester: number;
  subject: string;
  unit: string;
  title: string;
  file_url: string;
  file_name: string;
  approval_status: string;
  created_at: string;
};

export default function NotesPage() {
  const { data: userInfo } = useUserInfo();
  const [approvedNotes, setApprovedNotes] = useState<NoteRow[]>([]);
  const [myNotes, setMyNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const semester = Number(userInfo?.semester ?? 0) || undefined;

  async function loadNotes() {
    try {
      setLoading(true);
      const data = await fetchNotes(semester);
      setApprovedNotes(data.notes ?? []);
      setMyNotes(data.mine ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
  }, [semester]);

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return approvedNotes;
    return approvedNotes.filter((note) =>
      [note.subject, note.unit, note.title, note.file_name].some((value) => value?.toLowerCase().includes(needle))
    );
  }, [approvedNotes, query]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!semester || !subject.trim() || !unit.trim() || !title.trim() || !file) {
      setError("Please fill all note fields and choose a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const formData = new FormData();
      formData.append("semester", String(semester));
      formData.append("subject", subject.trim());
      formData.append("unit", unit.trim());
      formData.append("title", title.trim());
      formData.append("file", file);
      const response = await uploadNote(formData);
      setSuccess(response.message);
      setSubject("");
      setUnit("");
      setTitle("");
      setFile(null);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload note");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 pt-4 text-white">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-premium-gold">
            <FileText size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.24em]">Notes Hub</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Semester Notes</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
            Upload study material for your classmates. Every submission stays hidden until admin approval, and approved
            notes appear here for logged-in students in the same semester.
          </p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <Search size={16} className="text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject, unit, or file name"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center gap-3 text-emerald-300">
            <Upload size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.24em]">Upload Notes</span>
          </div>
          <div className="mt-5 grid gap-3">
            <ReadOnlyField label="Semester" value={semester ? `Semester ${semester}` : "Loading"} />
            <InputField label="Subject" value={subject} onChange={setSubject} placeholder="Eg: Data Structures" />
            <InputField label="Unit" value={unit} onChange={setUnit} placeholder="Eg: Unit 3" />
            <InputField label="Title" value={title} onChange={setTitle} placeholder="Eg: Unit 3 quick revision" />
            <label className="grid gap-2 text-sm text-zinc-300">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">File</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
          {success ? <p className="mt-4 text-sm text-emerald-400">{success}</p> : null}
          <button
            type="submit"
            disabled={uploading}
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-premium-gold px-5 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Submit For Approval"}
          </button>
        </form>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
          <h2 className="text-xl font-semibold">Approved Notes</h2>
          <p className="mt-2 text-sm text-zinc-400">Visible after admin approval.</p>
          <div className="mt-5 grid gap-4">
            {loading ? <EmptyState label="Loading notes..." /> : null}
            {!loading && filteredNotes.length === 0 ? <EmptyState label="No approved notes yet for this filter." /> : null}
            {filteredNotes.map((note) => (
              <a
                key={note.id}
                href={note.file_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-premium-gold/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{note.subject}</div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{note.title}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{note.unit}</p>
                  </div>
                  <CheckCircle2 className="shrink-0 text-emerald-400" size={18} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span>{note.file_name}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">My Uploads</h2>
          <div className="mt-5 grid gap-3">
            {myNotes.length === 0 ? <EmptyState label="You have not uploaded notes yet." /> : null}
            {myNotes.map((note) => (
              <div key={note.id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{note.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {note.subject} · {note.unit}
                    </p>
                  </div>
                  <StatusBadge status={note.approval_status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">{label}</div>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"><CheckCircle2 size={14} /> Approved</span>;
  }
  if (status === "rejected") {
    return <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300"><XCircle size={14} /> Rejected</span>;
  }
  return <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300"><Clock3 size={14} /> Pending</span>;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-premium-gold/40"
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 text-sm text-zinc-300">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200">{value}</div>
    </div>
  );
}
