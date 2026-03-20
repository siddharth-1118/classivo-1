"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAttendance, useMarks, useUserInfo } from "@/hooks/query";
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Target,
  TimerReset,
} from "lucide-react";

type PlannerItem = {
  id: string;
  title: string;
  dueDate: string;
  type: "Exam" | "Assignment";
  done: boolean;
};

const quickLinks = [
  {
    title: "Attendance Predictor",
    href: "/app/attendance",
    description: "See shortage risk, recovery classes, and safe skip margin.",
    icon: TimerReset,
    accent: "emerald",
  },
  {
    title: "GradeX Planner",
    href: "/app/gradex",
    description: "Run GPA and marks target simulations before internals.",
    icon: GraduationCap,
    accent: "amber",
  },
  {
    title: "Timetable Exports",
    href: "/app/timetable",
    description: "Download PDF, CSV, calendar export, and check free slots.",
    icon: CalendarClock,
    accent: "sky",
  },
  {
    title: "Marks Strategy",
    href: "/app/marks",
    description: "Track target gaps and focus on your weakest subjects first.",
    icon: Target,
    accent: "purple",
  },
];

const storageKey = "classivo_student_planner_v1";

export default function ProjectsPage() {
  const { data: userInfo } = useUserInfo();
  const { data: attendance } = useAttendance();
  const { data: marks } = useMarks();
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<PlannerItem["type"]>("Assignment");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PlannerItem[];
      setPlannerItems(parsed);
    } catch {
      // Ignore malformed local storage values.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(plannerItems));
  }, [plannerItems]);

  const criticalAttendance = (attendance ?? []).filter((item) => Number(item.courseAttendance) < 75).length;
  const weakMarks = (marks ?? []).filter((item) => {
    const max = item.total?.maxMark || 0;
    if (max <= 0) return false;
    return ((item.total?.obtained || 0) / max) * 100 < 60;
  }).length;

  const upcomingItems = useMemo(
    () =>
      [...plannerItems]
        .filter((item) => !item.done)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [plannerItems]
  );

  const completedCount = plannerItems.filter((item) => item.done).length;

  const addPlannerItem = () => {
    if (!title.trim() || !dueDate) return;
    setPlannerItems((current) => [
      {
        id: `${Date.now()}`,
        title: title.trim(),
        dueDate,
        type,
        done: false,
      },
      ...current,
    ]);
    setTitle("");
    setDueDate("");
    setType("Assignment");
  };

  const toggleItem = (id: string) => {
    setPlannerItems((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const removeItem = (id: string) => {
    setPlannerItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0a] px-6 pb-32 pt-12 text-white">
      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800">
              <span className="text-xs font-bold text-zinc-500">{userInfo?.name?.[0] || "C"}</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">
              Welcome back, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-premium-gold/80">Student Toolkit</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Study smarter outside the dashboard.</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            This space keeps planning tools, exam reminders, target trackers, and quick shortcuts together so students can act fast without digging through the app.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricTile label="Attendance Risks" value={String(criticalAttendance)} helper="Subjects below 75%" />
          <MetricTile label="Marks Risks" value={String(weakMarks)} helper="Subjects below 60%" />
          <MetricTile label="Planner Done" value={String(completedCount)} helper="Tasks completed here" />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-zinc-500" />
            <h3 className="text-2xl font-black tracking-tight">Quick Student Tools</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[30px] border border-white/8 bg-zinc-900/35 p-5 transition-all hover:bg-zinc-900/55"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      <item.icon size={14} />
                      {item.title}
                    </div>
                    <h4 className="text-lg font-bold tracking-tight text-white">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-500 transition group-hover:text-premium-gold">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/8 bg-zinc-900/30 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-premium-gold" />
            <h3 className="text-2xl font-black tracking-tight">Exam And Assignment Tracker</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Add your upcoming internal exams, records, lab submissions, or assignment deadlines here. This stays on your device and helps you plan without needing the dashboard.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CAE lab record"
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
            />
            <div className="flex gap-3">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PlannerItem["type"])}
                className="flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
              </select>
              <button
                onClick={addPlannerItem}
                className="rounded-2xl border border-premium-gold/20 bg-premium-gold/10 px-4 py-3 text-sm font-semibold text-premium-gold transition hover:bg-premium-gold/15"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingItems.length > 0 ? (
              upcomingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-black/25 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${item.type === "Exam" ? "bg-red-500/10 text-red-300" : "bg-sky-500/10 text-sky-300"}`}>
                        {item.type}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.dueDate}</span>
                    </div>
                    <h4 className="mt-2 truncate text-base font-semibold text-white">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2 text-emerald-300"
                    >
                      <CheckSquare size={16} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5 text-sm text-zinc-500">
                No tasks added yet. Start with your next assignment or exam deadline.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[26px] border border-white/8 bg-zinc-900/30 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <div className="mt-3 text-3xl font-black tracking-tight text-white">{value}</div>
      <p className="mt-2 text-xs leading-5 text-zinc-400">{helper}</p>
    </div>
  );
}
