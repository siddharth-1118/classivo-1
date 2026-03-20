"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  ChevronRight,
  Bell,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useDayOrder, useTimetable, useUserInfo, useAttendance, useMarks } from "@/hooks/query";

type TimetableClass = {
  time: string;
  courseCode: string;
  courseTitle: string;
  courseRoomNo: string;
  courseType: string;
  isClass: boolean;
};

const parseTime = (timeStr: string) => {
  try {
    const [startStr] = timeStr.split("-").map((t) => t.trim());
    const [time, modifier] = startStr!.split(" ");
    const [hoursStr, minutesStr] = time.split(":");
    let hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

export default function DashboardPage() {
  const { data: timetableData } = useTimetable();
  const { data: dayOrderData } = useDayOrder();
  const { data: userInfo } = useUserInfo();
  const { data: attendanceData } = useAttendance();
  const { data: marksData } = useMarks();

  const getScheduleForDayOrder = (dayOrder: number) => {
    if (!timetableData || timetableData.length === 0 || Number.isNaN(dayOrder) || dayOrder <= 0) {
      return [];
    }

    const safeIndex = ((dayOrder - 1) % timetableData.length + timetableData.length) % timetableData.length;

    return ((timetableData[safeIndex]?.class ?? []) as TimetableClass[])
      .filter((cls) => cls.isClass && cls.courseTitle)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  };

  const activeDayOrder = Number(dayOrderData?.dayOrder);
  const totalDayOrders = timetableData?.length ?? 0;
  const todayDayOrder = !Number.isNaN(activeDayOrder) && activeDayOrder > 0 ? activeDayOrder : 1;
  const nextDayOrder = totalDayOrders > 0 ? (todayDayOrder % totalDayOrders) + 1 : todayDayOrder + 1;

  const allTodayClasses = getScheduleForDayOrder(todayDayOrder);
  const nextDayClasses = getScheduleForDayOrder(nextDayOrder);
  const nextDayLabel = `Day Order ${nextDayOrder}`;

  const overallAttendance = attendanceData && attendanceData.length > 0
    ? (attendanceData.reduce((acc, curr) => acc + (Number(curr.courseAttendance) || 0), 0) / attendanceData.length).toFixed(1)
    : "0";

  const totalMarksDisplay = marksData && marksData.length > 0
    ? (() => {
        const scoredSubjects = marksData.filter((item) => (item.total?.maxMark || 0) > 0);
        if (scoredSubjects.length === 0) return "0/0";
        const totalObtained = scoredSubjects.reduce((acc, m) => acc + (m.total?.obtained || 0), 0);
        const totalMax = scoredSubjects.reduce((acc, m) => acc + (m.total?.maxMark || 0), 0);
        const formatMark = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);
        return `${formatMark(totalObtained)}/${formatMark(totalMax)}`;
      })()
    : "0/0";

  const marksProgress = (() => {
    const [obtained, max] = totalMarksDisplay.split("/").map(Number);
    return max ? (obtained / max) * 100 : 0;
  })();

  return (
    <main className="relative min-h-screen w-full overflow-y-auto px-4 pb-32 pt-10 text-white font-sans sm:px-6 sm:pt-12">
      <div className="relative z-10 mx-auto flex max-w-lg flex-col gap-8 sm:gap-10">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-premium-gold p-0.5">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-800">
                <User size={24} className="text-zinc-500" />
              </div>
            </div>
            <h1 className="flex flex-wrap items-baseline gap-1.5 text-xl font-black tracking-tight sm:text-2xl">
              Welcome back, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        <section className="mt-2">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Academic Status</p>
          <div className="relative">
            <h2 className="text-[40px] font-black leading-[0.9] tracking-tighter sm:text-[52px]">
              Mastering<span className="text-emerald-400">.</span>
            </h2>
            <h2 className="mt-1 text-3xl italic tracking-tight text-zinc-500 opacity-80 sm:text-4xl">
              the Semester.
            </h2>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <Link
            href="/app/attendance"
            className="rounded-3xl border border-white/10 bg-zinc-900/45 p-5 backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-zinc-900/60 active:scale-[0.99] sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between sm:mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Live <ChevronRight size={12} />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-4xl font-black tracking-tighter">{overallAttendance}%</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Attendance</p>
              <p className="pt-1 text-xs text-zinc-400">Open attendance insights</p>
            </div>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${Math.min(Number(overallAttendance), 100)}%` }}
              />
            </div>
          </Link>

          <Link
            href="/app/marks"
            className="rounded-3xl border border-white/10 bg-zinc-900/45 p-5 backdrop-blur-md transition-all hover:border-purple-400/30 hover:bg-zinc-900/60 active:scale-[0.99] sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between sm:mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles size={22} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Peak <ChevronRight size={12} />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-black tracking-tighter">{totalMarksDisplay}</span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Total Marks</p>
              <p className="pt-1 text-xs text-zinc-400">Open marks breakdown</p>
            </div>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                style={{ width: `${marksProgress}%` }}
              />
            </div>
          </Link>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight">Today&apos;s Schedule</h3>
            <Link href="/app/timetable" className="flex items-center gap-1 border-b border-zinc-800 pb-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              View Full
            </Link>
          </div>
          <div className="space-y-3">
            {allTodayClasses.length > 0 ? (
              allTodayClasses.map((cls, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-3xl border border-white/5 bg-zinc-900/30 p-5 transition-all hover:bg-zinc-900/50 sm:gap-5 sm:p-6">
                  <div className="flex min-w-[64px] flex-col items-start sm:min-w-[70px]">
                    <span className="text-lg font-black tracking-tighter sm:text-xl">{cls.time.split(" ")[0]}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{cls.time.split(" ")[1]}</span>
                  </div>
                  <div className="h-12 w-[1px] bg-zinc-800 transition-colors group-hover:bg-premium-gold/30" />
                  <div className="flex-1">
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                      {cls.courseCode}
                    </span>
                    <h4 className="text-sm font-bold leading-tight sm:text-base">{cls.courseTitle}</h4>
                  </div>
                  <ChevronRight size={18} className="text-zinc-700 transition-colors group-hover:text-premium-gold" />
                </div>
              ))
            ) : (
              <p className="py-4 text-sm italic text-zinc-600">No sessions scheduled for today in the gallery.</p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black tracking-tight">Upcoming</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">{nextDayLabel}</p>
            </div>
            <Link
              href={`/app/timetable?dayOrder=${nextDayOrder}`}
              className="flex items-center gap-1 border-b border-zinc-800 pb-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-500"
            >
              Open Day
            </Link>
          </div>

          <div className="space-y-3">
            {nextDayClasses.length > 0 ? (
              nextDayClasses.map((cls, i) => (
                <div key={i} className="group flex items-center gap-4 rounded-3xl border border-white/5 bg-zinc-900/30 p-5 transition-all hover:bg-zinc-900/50 sm:gap-5 sm:p-6">
                  <div className="flex min-w-[64px] flex-col items-start sm:min-w-[70px]">
                    <span className="text-lg font-black tracking-tighter sm:text-xl">{cls.time.split(" ")[0]}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{cls.time.split(" ")[1]}</span>
                  </div>
                  <div className="h-12 w-[1px] bg-zinc-800 transition-colors group-hover:bg-premium-gold/30" />
                  <div className="flex-1">
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.2em] text-sky-400/80">
                      {nextDayLabel} · {cls.courseCode}
                    </span>
                    <h4 className="text-sm font-bold leading-tight sm:text-base">{cls.courseTitle}</h4>
                  </div>
                  <ChevronRight size={18} className="text-zinc-700 transition-colors group-hover:text-premium-gold" />
                </div>
              ))
            ) : (
              <p className="py-4 text-sm italic text-zinc-600">No classes found for {nextDayLabel.toLowerCase()}.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
