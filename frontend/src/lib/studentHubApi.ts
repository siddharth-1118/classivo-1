"use client";

import { getApiBase } from "@/lib/api";
import { getAuthToken } from "@/utils/authStorage";

type AdminCredentials = {
  email?: string;
  password?: string;
  token?: string;
};

function buildUrl(path: string) {
  const base = getApiBase();
  return `${base}${path.startsWith("/api") ? path : `/api${path}`}`;
}

function authHeaders(token?: string) {
  if (!token) return {} as Record<string, string>;
  return {
    "X-CSRF-Token": token,
    Authorization: `Bearer ${token}`,
  } as Record<string, string>;
}

async function parseResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(path: string, init: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const token = tokenOverride ?? getAuthToken();
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...authHeaders(token),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  const res = await fetch(url, {
    ...init,
    headers,
  });
  const data = await parseResponse(res);
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data ? String((data as { error?: unknown }).error) : `Request failed (${res.status})`
    );
  }
  return data as T;
}

export async function fetchNotes(semester?: number) {
  const suffix = semester ? `?semester=${semester}` : "";
  return request<{ notes: any[]; mine: any[] }>(`/notes${suffix}`);
}

export async function uploadNote(formData: FormData) {
  return request<{ message: string }>("/notes/upload", { method: "POST", body: formData });
}

export async function fetchCommunityPosts() {
  return request<{ posts: any[] }>("/community/posts");
}

export async function createCommunityPost(formData: FormData) {
  return request<{ message: string }>("/community/posts", { method: "POST", body: formData });
}

export async function fetchReplies(postId: string) {
  return request<{ replies: any[] }>(`/community/posts/${postId}/replies`);
}

export async function createReply(postId: string, body: string) {
  return request<{ message: string }>(`/community/posts/${postId}/replies`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function reportContent(contentType: string, contentId: string, reason: string) {
  return request<{ message: string }>("/community/reports", {
    method: "POST",
    body: JSON.stringify({ contentType, contentId, reason }),
  });
}

export async function fetchFacultyReviews(subject?: string) {
  const suffix = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return request<{ reviews: any[] }>(`/faculty-reviews${suffix}`);
}

export async function createFacultyReview(payload: { subject: string; facultyName?: string; reviewText: string }) {
  return request<{ message: string }>("/faculty-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchEvents() {
  return request<{ events: any[] }>("/events");
}

export async function fetchHostelRoommate() {
  return request<{
    entry: { hostelName: string; roomNumber: string } | null;
    roommates: Array<{ name: string; department: string; hostelName: string; roomNumber: string }>;
    hasMatch: boolean;
    matchCount: number;
  }>("/hostel-roommate");
}

export async function saveHostelRoommate(payload: { hostelName: string; roomNumber: string }) {
  return request<{ message: string }>("/hostel-roommate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminQueries(credentials: AdminCredentials) {
  return request<any[]>("/admin/queries", {
    method: "POST",
    body: JSON.stringify(credentials),
  }, "vss");
}

export async function fetchModeration(credentials: AdminCredentials) {
  return request<{ notes: any[]; reports: any[]; reviews: any[]; events: any[] }>("/admin/moderation", {
    method: "POST",
    body: JSON.stringify(credentials),
  }, "vss");
}

export async function approveNote(id: string, credentials: AdminCredentials) {
  return request<{ message: string }>(`/admin/notes/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(credentials),
  }, "vss");
}

export async function rejectNote(id: string, credentials: AdminCredentials, reason: string) {
  return request<{ message: string }>(`/admin/notes/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ ...credentials, reason }),
  }, "vss");
}

export async function dismissReport(id: string, credentials: AdminCredentials) {
  return request<{ message: string }>(`/admin/reports/${id}/dismiss`, {
    method: "POST",
    body: JSON.stringify(credentials),
  }, "vss");
}

export async function removeReportedContent(id: string, credentials: AdminCredentials) {
  return request<{ message: string }>(`/admin/reports/${id}/remove`, {
    method: "POST",
    body: JSON.stringify(credentials),
  }, "vss");
}

export async function createEvent(formData: FormData) {
  return request<{ message: string }>("/admin/events", {
    method: "POST",
    body: formData,
  }, "vss");
}

export async function deleteEvent(id: string, credentials: AdminCredentials) {
  return request<{ message: string }>(`/admin/events/${id}`, {
    method: "DELETE",
    body: JSON.stringify(credentials),
  }, "vss");
}
