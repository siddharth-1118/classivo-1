"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Building2,
  Hash,
  MessageSquare,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import useWebSocket from "../../../hooks/useWebSocket";
import useNotifications from "../../../hooks/useNotifications";
import { getSessionToken } from "@/utils/sessionClient";
import { api } from "@/lib/api";

interface UserProfile {
  name: string;
  regNumber: string;
  batch: string;
  section: string;
}

interface ChatMessage {
  action?: string;
  room: string;
  text: string;
  senderId?: string;
  senderAlias?: string;
  senderSection?: string;
  timestamp?: string;
}

type RoomKind = "section" | "topic" | "campus";

type RoomCard = {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  kind: RoomKind;
  accent: string;
};

const TOPIC_ROOMS: RoomCard[] = [
  {
    key: "general",
    title: "General",
    subtitle: "Everyday campus talk",
    description:
      "Open conversation for casual campus updates, meetups, and anything in between.",
    kind: "topic",
    accent: "from-sky-500/20 to-cyan-400/10",
  },
  {
    key: "news",
    title: "News",
    subtitle: "What everyone should know",
    description:
      "Share announcements, deadlines, notices, and what is happening around campus.",
    kind: "topic",
    accent: "from-amber-500/20 to-yellow-400/10",
  },
  {
    key: "sports",
    title: "Sports",
    subtitle: "Matches, squads, banter",
    description:
      "Talk fixtures, tournaments, team selections, and all the sports energy on campus.",
    kind: "topic",
    accent: "from-emerald-500/20 to-lime-400/10",
  },
  {
    key: "memes",
    title: "Memes",
    subtitle: "Pure campus chaos",
    description:
      "Keep it light with meme drops, inside jokes, and the funny side of student life.",
    kind: "topic",
    accent: "from-fuchsia-500/20 to-pink-400/10",
  },
  {
    key: "academics",
    title: "Academics",
    subtitle: "Study help and class talk",
    description:
      "Discuss classes, labs, professors, exams, and academic shortcuts with peers.",
    kind: "topic",
    accent: "from-indigo-500/20 to-violet-400/10",
  },
];

const CAMPUS_ROOM: RoomCard = {
  key: "campus",
  title: "Campus Wide",
  subtitle: "Talk beyond your circle",
  description:
    "Connect with students across the whole campus in one live anonymous room.",
  kind: "campus",
  accent: "from-premium-gold/25 to-orange-400/10",
};

const FEATURE_POINTS = [
  "100% anonymous live room chat",
  "Section rooms appear automatically from logged-in students",
  "Campus-wide room for talking beyond your class",
  "Browser notifications for messages in other active rooms",
];

const getSocketBase = () => {
  if (typeof window === "undefined") return "";

  const configured = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim();
  if (configured) {
    try {
      const parsed = new URL(configured);
      const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${parsed.host}/api/chat`;
    } catch {
      // Fall through to local derivation.
    }
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const hostname = window.location.hostname;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const host = isLocal ? `${hostname}:7860` : window.location.host;
  return `${protocol}//${host}/api/chat`;
};

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const mapProfileResponse = (payload: unknown): UserProfile | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const source =
    record.userInfo && typeof record.userInfo === "object"
      ? (record.userInfo as Record<string, unknown>)
      : record;

  const name = typeof source.name === "string" ? source.name : "";
  const regNumber = typeof source.regNumber === "string" ? source.regNumber : "";
  const batch = typeof source.batch === "string" ? source.batch : "";
  const section = typeof source.section === "string" ? source.section : "";

  if (!name && !regNumber && !section) {
    return null;
  }

  return {
    name,
    regNumber,
    batch,
    section,
  };
};

const buildSectionRoom = (section: string, ownSection?: string): RoomCard => ({
  key: section,
  title: titleCase(section),
  subtitle: ownSection === section ? "Your section room" : `Live room for ${titleCase(section)}`,
  description:
    ownSection === section
      ? "Students from your own section land here automatically when they log in."
      : `Jump into ${titleCase(section)} and talk directly with students from that section.`,
  kind: "section",
  accent:
    ownSection === section
      ? "from-emerald-500/20 to-sky-400/10"
      : "from-white/10 to-white/5",
});

const ChatPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { showNotification } = useNotifications();
  const { messages, sendMessage, isConnected } = useWebSocket(
    token && profile ? getSocketBase() : "",
    token || undefined,
    profile?.section,
    profile?.regNumber
  );

  useEffect(() => {
    setToken(getSessionToken() ?? null);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await api.user(token);
        const nextProfile = mapProfileResponse(res);
        if (nextProfile) {
          setProfile(nextProfile);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
      setSelectedRoom((current) => current ?? "campus");
    };

    fetchProfile();

  }, [token]);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    try {
      const message = JSON.parse(lastMessage) as ChatMessage;
      if (message.room !== selectedRoom) {
        showNotification(
          `${titleCase(message.room)} room`,
          `${message.senderAlias ?? "Anonymous"}: ${message.text}`
        );
      }
    } catch {
      // Ignore malformed frames.
    }
  }, [messages, selectedRoom, showNotification]);

  const parsedMessages = useMemo(
    () =>
      messages.reduce<ChatMessage[]>((all, raw) => {
        try {
          all.push(JSON.parse(raw) as ChatMessage);
        } catch {
          // Ignore malformed frames.
        }
        return all;
      }, []),
    [messages]
  );

  const ownSection = profile?.section?.toLowerCase?.() ?? "";

  const sectionRooms = useMemo(() => {
    const activeSectionRooms = rooms.filter(
      (room) => room !== "campus" && !TOPIC_ROOMS.some((topic) => topic.key === room)
    );
    const combined = Array.from(
      new Set([ownSection, ...activeSectionRooms].filter(Boolean))
    );
    return combined.map((section) => buildSectionRoom(section, ownSection));
  }, [rooms, ownSection]);

  const roomCards = useMemo(
    () => [...sectionRooms, CAMPUS_ROOM, ...TOPIC_ROOMS],
    [sectionRooms]
  );

  const roomMessages = useMemo(
    () => parsedMessages.filter((message) => message.room === selectedRoom),
    [parsedMessages, selectedRoom]
  );

  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
    sendMessage(
      JSON.stringify({
        action: "join",
        room,
      })
    );
  };

  const handleSendMessage = () => {
    if (!selectedRoom || newMessage.trim() === "") return;

    sendMessage(
      JSON.stringify({
        action: "message",
        room: selectedRoom,
        text: newMessage,
      })
    );
    setNewMessage("");
  };

  if (!token) {
    return <div className="p-6 text-zinc-400">Loading chat…</div>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-6 px-4 pb-24 pt-4 sm:px-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
           <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-premium-gold font-black">
              <Sparkles className="h-4 w-4" />
              Stealth Tensor - Global Anonymous Hub
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tighter text-white uppercase sm:text-5xl">
              Talk freely. <span className="text-zinc-600 italic font-serif lowercase">Stay anonymus.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-zinc-400 uppercase tracking-widest font-black opacity-60">
              The central nerve center for campus-wide coordination, secrets, and raw energy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
              <div className="flex items-center gap-2 text-zinc-400">
                <User className="h-4 w-4 text-sky-300" />
                Current Section
              </div>
              <div className="mt-2 font-semibold text-white">
                {profile?.section?.toUpperCase() || "Unknown"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
              <div className="flex items-center gap-2 text-zinc-400">
                <BellRing className="h-4 w-4 text-emerald-300" />
                Chat Status
              </div>
              <div className="mt-2 font-semibold text-white">
                {isConnected ? "Live" : "Connecting..."}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {FEATURE_POINTS.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
            >
              {point}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            <Hash className="h-4 w-4" />
            Rooms Tabs
          </div>

          <div className="grid gap-3">
            {roomCards.map((room) => (
              <button
                key={room.key}
                onClick={() => handleRoomSelect(room.key)}
                className={`group rounded-[24px] border p-4 text-left transition-all ${
                  selectedRoom === room.key
                    ? "border-premium-gold/30 bg-[linear-gradient(180deg,rgba(212,175,55,0.16),rgba(255,255,255,0.04))] shadow-[0_16px_50px_rgba(212,175,55,0.08)]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`rounded-2xl border border-white/10 bg-gradient-to-br ${room.accent} p-3 text-white`}
                  >
                    {room.kind === "campus" ? (
                      <Users className="h-5 w-5" />
                    ) : room.kind === "topic" ? (
                      <Sparkles className="h-5 w-5" />
                    ) : room.key === ownSection ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    {room.kind}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-base font-semibold text-white">{room.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {room.subtitle}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{room.description}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {selectedRoom ? (
            <>
              <div className="border-b border-white/10 bg-zinc-900/40 backdrop-blur-3xl px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-premium-gold font-black text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    {selectedRoom === 'campus' ? <Users size={20} /> : selectedRoom[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{titleCase(selectedRoom)} Room</h3>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
                        {isConnected ? 'Live Sync Active' : 'Connecting to Flux...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_35%)] p-6">
                {roomMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-3 text-zinc-500">
                    <MessageSquare className="h-12 w-12 opacity-25" />
                    <p>No messages here yet. Start the conversation.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roomMessages.map((message, index) => {
                      const isOwnMessage = message.senderSection === ownSection;
                      return (
                        <div
                          key={`${message.timestamp ?? index}-${index}`}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-[22px] border px-4 py-3 ${
                              isOwnMessage
                                ? "border-premium-gold/25 bg-premium-gold/12 text-white"
                                : "border-white/10 bg-white/6 text-zinc-100"
                            }`}
                          >
                            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                              <span>{message.senderAlias ?? "Anonymous"}</span>
                              {message.senderSection ? (
                                <span>{titleCase(message.senderSection)}</span>
                              ) : null}
                            </div>
                            <p className="text-sm leading-6">{message.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 bg-black/20 p-4">
                <div className="mx-auto flex max-w-4xl gap-3">
                  <input
                    type="text"
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-premium-gold/30 focus:outline-none"
                    placeholder={`Message ${titleCase(selectedRoom)}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                   <button
                    className="flex items-center justify-center rounded-2xl border border-premium-gold bg-premium-gold px-6 text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-black/10 text-zinc-500">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5">
                <MessageSquare className="h-10 w-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white">Select a room to start</h3>
              <p className="mt-2 text-sm">
                Join your section, another live section, a topic room, or the whole campus.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ChatPage;
