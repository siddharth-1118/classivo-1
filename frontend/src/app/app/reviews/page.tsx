"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useCourse } from "@/hooks/query";
import { createFacultyReview, fetchFacultyReviews, reportContent } from "@/lib/studentHubApi";
import { MessageCircleHeart, Search, Siren } from "lucide-react";

type ReviewRow = {
  id: string;
  subject: string;
  faculty_name?: string;
  review_text: string;
  created_at: string;
  student_name?: string;
};

export default function ReviewsPage() {
  const { data: courses } = useCourse();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [subject, setSubject] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadReviews(subjectFilter?: string) {
    try {
      const data = await fetchFacultyReviews(subjectFilter);
      setReviews(data.reviews ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    }
  }

  useEffect(() => {
    void loadReviews(filter);
  }, [filter]);

  const courseNames = useMemo(() => {
    return (courses ?? [])
      .map((course: any) => course.subjectTitle ?? course.courseTitle ?? course.title ?? course.subject ?? "")
      .filter(Boolean);
  }, [courses]);

  const filteredReviews = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return reviews;
    return reviews.filter((review) =>
      [review.subject, review.faculty_name, review.review_text].some((value) => value?.toLowerCase().includes(needle))
    );
  }, [reviews, search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      const response = await createFacultyReview({
        subject: subject.trim(),
        facultyName: facultyName.trim(),
        reviewText: reviewText.trim(),
      });
      setSuccess(response.message);
      setFacultyName("");
      setReviewText("");
      await loadReviews(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    }
  }

  async function handleReport(id: string) {
    const reason = window.prompt("Why are you reporting this review?");
    if (!reason?.trim()) return;
    try {
      await reportContent("faculty_review", id, reason.trim());
      setSuccess("Report sent to admin.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report review");
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 pt-4 text-white">
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-rose-300">
            <MessageCircleHeart size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.24em]">Faculty Reviews</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Anonymous Text Reviews</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Share context that actually helps juniors and classmates: teaching style, exam pattern, and anything worth
            knowing. Reviews are anonymous to students and visible only to logged-in users.
          </p>

          <div className="mt-6 grid gap-3">
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Subject</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Select subject</option>
                {courseNames.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Faculty Name (optional)</span>
              <input
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Faculty name if you know it"
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Review</span>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review"
                className="min-h-36 rounded-3xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white outline-none"
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
          {success ? <p className="mt-4 text-sm text-emerald-400">{success}</p> : null}
          <button className="mt-5 rounded-2xl bg-rose-300 px-5 py-3 text-sm font-bold text-black transition hover:brightness-105">
            Submit Anonymous Review
          </button>
        </form>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recent Reviews</h2>
              <p className="mt-2 text-sm text-zinc-400">Search or filter by subject.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Search size={16} className="text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviews"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">All subjects</option>
                {courseNames.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {filteredReviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
                No reviews found yet.
              </div>
            ) : null}
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{review.subject}</div>
                    {review.faculty_name ? <p className="mt-2 text-sm text-zinc-400">{review.faculty_name}</p> : null}
                  </div>
                  <button
                    onClick={() => handleReport(review.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                  >
                    <Siren size={14} />
                    Report
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{review.review_text}</p>
                <div className="mt-4 text-xs text-zinc-500">{new Date(review.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
