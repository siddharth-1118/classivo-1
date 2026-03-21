"use client";

import React, { useEffect, useState } from "react";
import {
  createCommunityPost,
  createReply,
  fetchCommunityPosts,
  fetchReplies,
  reportContent,
} from "@/lib/studentHubApi";
import { MessageSquare, Search, Send, Siren, ImagePlus } from "lucide-react";

type CommunityPost = {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category?: string;
  created_at: string;
  student_name?: string;
  replyCount?: number;
};

type CommunityReply = {
  id: string;
  body: string;
  created_at: string;
  student_name?: string;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activePostId, setActivePostId] = useState<string>("");
  const [replies, setReplies] = useState<Record<string, CommunityReply[]>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [image, setImage] = useState<File | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await fetchCommunityPosts();
      setPosts(data.posts ?? []);
      if (!activePostId && data.posts?.[0]?.id) {
        setActivePostId(data.posts[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load community");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  useEffect(() => {
    if (!activePostId || replies[activePostId]) return;
    void loadReplies(activePostId);
  }, [activePostId, replies]);

  async function loadReplies(postId: string) {
    try {
      const data = await fetchReplies(postId);
      setReplies((current) => ({ ...current, [postId]: data.replies ?? [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load replies");
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      if (image) {
        formData.append("image", image);
      }
      const response = await createCommunityPost(formData);
      setSuccess(response.message);
      setTitle("");
      setDescription("");
      setCategory("general");
      setImage(null);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  }

  async function handleReply(postId: string) {
    const body = (replyDrafts[postId] ?? "").trim();
    if (!body) return;
    try {
      setError("");
      await createReply(postId, body);
      setReplyDrafts((current) => ({ ...current, [postId]: "" }));
      await loadReplies(postId);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    }
  }

  async function handleReport(contentType: string, contentId: string) {
    const reason = window.prompt("Why are you reporting this?");
    if (!reason?.trim()) return;
    try {
      await reportContent(contentType, contentId, reason.trim());
      setSuccess("Report sent to admin.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report content");
    }
  }

  const filteredPosts = posts.filter((post) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [post.title, post.description, post.category].some((value) => value?.toLowerCase().includes(needle));
  });

  const activePost = filteredPosts.find((post) => post.id === activePostId) ?? filteredPosts[0];
  const activeReplies = activePost ? replies[activePost.id] ?? [] : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 pt-4 text-white">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-sky-300">
            <MessageSquare size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.24em]">Community</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Anonymous Student Space</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Ask for help, share updates, or use the lost and found category when you need admin support to step in.
            Posts are anonymous by default and replies stay text-only.
          </p>
          <form onSubmit={handleCreatePost} className="mt-6 grid gap-3">
            <Field label="Title" value={title} onChange={setTitle} placeholder="Post title" />
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, request, or update"
                className="min-h-32 rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition focus:border-sky-400/40"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="general">General</option>
                <option value="lost_and_found">Lost &amp; Found</option>
                <option value="academics">Academics</option>
                <option value="events">Events</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Image (optional)</span>
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                <ImagePlus size={16} />
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  className="w-full bg-transparent"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
            <button className="inline-flex w-fit items-center gap-2 rounded-2xl bg-sky-400 px-5 py-3 text-sm font-bold text-black transition hover:brightness-105">
              <Send size={16} />
              Publish Anonymously
            </button>
          </form>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search size={16} className="text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </div>
            <div className="mt-4 grid gap-3">
              {loading ? <PanelMessage label="Loading community..." /> : null}
              {!loading && filteredPosts.length === 0 ? <PanelMessage label="No posts yet." /> : null}
              {filteredPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setActivePostId(post.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    activePost?.id === post.id ? "border-sky-400/40 bg-sky-400/10" : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{formatCategory(post.category)}</span>
                    <span className="text-xs text-zinc-500">{post.replyCount ?? 0} replies</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{post.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            {!activePost ? <PanelMessage label="Select a post to view the thread." /> : null}
            {activePost ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{formatCategory(activePost.category)}</div>
                    <h2 className="mt-2 text-2xl font-semibold">{activePost.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{activePost.description}</p>
                  </div>
                  <button
                    onClick={() => handleReport("community_post", activePost.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                  >
                    <Siren size={14} />
                    Report
                  </button>
                </div>

                {activePost.image_url ? (
                  <img src={activePost.image_url} alt={activePost.title} className="mt-5 max-h-80 w-full rounded-3xl object-cover" />
                ) : null}

                <div className="mt-6 grid gap-3">
                  {activeReplies.length === 0 ? <PanelMessage label="No replies yet. Start the thread." /> : null}
                  {activeReplies.map((reply) => (
                    <div key={reply.id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-white">{reply.student_name || "Anonymous Student"}</span>
                        <button
                          onClick={() => handleReport("community_reply", reply.id)}
                          className="text-xs text-red-300 transition hover:text-red-200"
                        >
                          Report
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-zinc-300">{reply.body}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  <textarea
                    value={replyDrafts[activePost.id] ?? ""}
                    onChange={(e) => setReplyDrafts((current) => ({ ...current, [activePost.id]: e.target.value }))}
                    placeholder="Reply anonymously"
                    className="min-h-28 rounded-3xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition focus:border-sky-400/40"
                  />
                  <button
                    onClick={() => handleReply(activePost.id)}
                    className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    <Send size={15} />
                    Post Reply
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
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
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40"
      />
    </label>
  );
}

function PanelMessage({ label }: { label: string }) {
  return <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">{label}</div>;
}

function formatCategory(category?: string) {
  return (category ?? "general").replaceAll("_", " ");
}
