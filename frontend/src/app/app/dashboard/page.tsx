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
import { useCalendar, useDayOrder, useTimetable, useUserInfo, useAttendance, useMarks } from "@/hooks/query";

type TimetableClass = {
  time: string;
  courseCode: string;
  courseTitle: string;
  courseRoomNo: string;
  courseType: string;
  isClass: boolean;
};

type CalendarEntry = {
  date: Date;
  rawDate: string;
  rawMonth: string;
  dayOrder: string;
  event: string;
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

const parseTimeRange = (timeRange: string) => {
  const [startLabel = "", endLabel = ""] = timeRange.split("-").map((value) => value.trim());
  return {
    start: parseTime(startLabel),
    end: parseTime(endLabel),
  };
};

const formatMinutes = (totalMinutes: number) => {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

const parseAcademicDate = (monthLabel: string, dayLabel: string) => {
  const [monthName, yearSuffix] = monthLabel.split(" '");
  const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName);
  const dayNumber = Number(dayLabel);
  const year = Number(`20${yearSuffix}`);

  if (monthIndex < 0 || Number.isNaN(dayNumber) || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, monthIndex, dayNumber);
};

const extractDayOrderNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return NaN;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : NaN;
};

const isHolidayEntry = (entry?: CalendarEntry | null) => {
  if (!entry) return false;
  const event = entry.event.trim().toLowerCase();
  const dayOrder = entry.dayOrder.trim().toLowerCase();
  return dayOrder === "-" || dayOrder === "" || event.includes("holiday");
};

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export default function DashboardPage() {
  const { data: timetableData } = useTimetable();
  const { data: dayOrderData } = useDayOrder();
  const { data: calendarData } = useCalendar();
  const { data: userInfo } = useUserInfo();
  const { data: attendanceData } = useAttendance();
  const { data: marksData } = useMarks();
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const syncClock = () => setCurrentTime(new Date());

    syncClock();
    const intervalId = window.setInterval(syncClock, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const displayName = (userInfo?.name || "").trim();

  const getScheduleForDayOrder = (dayOrder: number) => {
    if (!timetableData || timetableData.length === 0 || Number.isNaN(dayOrder) || dayOrder <= 0) {
      return [];
    }

    const safeIndex = ((dayOrder - 1) % timetableData.length + timetableData.length) % timetableData.length;

    return ((timetableData[safeIndex]?.class ?? []) as TimetableClass[])
      .filter((cls) => cls.isClass && cls.courseTitle)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  };

  const calendarEntries = React.useMemo(() => {
    return (calendarData ?? [])
      .flatMap((month) =>
        month.days
          .map((day) => {
            const parsedDate = parseAcademicDate(month.month, day.date);
            if (!parsedDate) return null;
            return {
              date: parsedDate,
              rawDate: day.date,
              rawMonth: month.month,
              dayOrder: day.dayOrder ?? "",
              event: day.event ?? "",
            } satisfies CalendarEntry;
          })
          .filter((entry): entry is CalendarEntry => entry !== null)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [calendarData]);

  const today = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const todayCalendarEntry = React.useMemo(
    () => calendarEntries.find((entry) => isSameDate(entry.date, today)) ?? null,
    [calendarEntries, today]
  );

  const upcomingCalendarEntry = React.useMemo(
    () =>
      calendarEntries.find(
        (entry) => entry.date.getTime() > today.getTime() && !isHolidayEntry(entry) && !Number.isNaN(extractDayOrderNumber(entry.dayOrder))
      ) ?? null,
    [calendarEntries, today]
  );

  const activeDayOrder = Number(dayOrderData?.dayOrder);
  const todayDayOrderFromCalendar = extractDayOrderNumber(todayCalendarEntry?.dayOrder);
  const todayDayOrder =
    !Number.isNaN(todayDayOrderFromCalendar) && !isHolidayEntry(todayCalendarEntry)
      ? todayDayOrderFromCalendar
      : !Number.isNaN(activeDayOrder) && activeDayOrder > 0
        ? activeDayOrder
        : 1;

  const totalDayOrders = timetableData?.length ?? 0;
  const nextDayOrderFromCalendar = extractDayOrderNumber(upcomingCalendarEntry?.dayOrder);
  const nextDayOrder =
    !Number.isNaN(nextDayOrderFromCalendar)
      ? nextDayOrderFromCalendar
      : totalDayOrders > 0
        ? (todayDayOrder % totalDayOrders) + 1
        : todayDayOrder + 1;

  const todayIsHoliday = isHolidayEntry(todayCalendarEntry);
  const allTodayClasses = todayIsHoliday ? [] : getScheduleForDayOrder(todayDayOrder);
  const nextDayClasses = getScheduleForDayOrder(nextDayOrder);
  const todayScheduleLabel = todayIsHoliday
    ? (todayCalendarEntry?.event?.trim() || "Holiday")
    : `Day Order ${todayDayOrder}`;
  const nextDayLabel = upcomingCalendarEntry
    ? `${upcomingCalendarEntry.rawDate} ${upcomingCalendarEntry.rawMonth} · Day Order ${nextDayOrder}`
    : `Day Order ${nextDayOrder}`;

  const todayClassWindows = React.useMemo(
    () =>
      allTodayClasses.map((cls) => ({
        ...cls,
        ...parseTimeRange(cls.time),
      })),
    [allTodayClasses]
  );

  const nowMinutes = currentTime ? currentTime.getHours() * 60 + currentTime.getMinutes() : null;
  const ongoingClass =
    nowMinutes === null ? null : todayClassWindows.find((cls) => nowMinutes >= cls.start && nowMinutes <= cls.end) ?? null;
  const nextClassToday =
    nowMinutes === null ? null : todayClassWindows.find((cls) => cls.start > nowMinutes) ?? null;
  const minutesLeftInCurrentClass =
    ongoingClass && nowMinutes !== null ? Math.max(0, ongoingClass.end - nowMinutes) : null;
  const minutesUntilNextClass =
    nextClassToday && nowMinutes !== null ? Math.max(0, nextClassToday.start - nowMinutes) : null;

  const liveClassSummary = React.useMemo(() => {
    if (todayIsHoliday) {
      return {
        eyebrow: "No classes today",
        title: todayCalendarEntry?.event?.trim() || "Holiday on the academic calendar",
        detail: "Today is marked as a holiday, so there are no running or upcoming classes.",
        accent: "from-rose-500/20 via-orange-500/10 to-transparent border-rose-400/20",
      };
    }

    if (allTodayClasses.length === 0) {
      return {
        eyebrow: "Schedule clear",
        title: "No classes scheduled today",
        detail: "There are no timetable entries mapped to today's working schedule.",
        accent: "from-zinc-500/20 via-zinc-400/10 to-transparent border-white/10",
      };
    }

    if (ongoingClass && minutesLeftInCurrentClass !== null) {
      return {
        eyebrow: "Current ongoing class",
        title: ongoingClass.courseTitle,
        detail: `${ongoingClass.time} · ${minutesLeftInCurrentClass === 0 ? "Ending now" : `${formatMinutes(minutesLeftInCurrentClass)} left`} · ${ongoingClass.courseRoomNo || "Room not available"}`,
        accent: "from-emerald-500/20 via-emerald-400/10 to-transparent border-emerald-400/20",
      };
    }

    if (nextClassToday && minutesUntilNextClass !== null) {
      return {
        eyebrow: "Countdown to next class today",
        title: nextClassToday.courseTitle,
        detail: `${nextClassToday.time} · Starts in ${formatMinutes(minutesUntilNextClass)} · ${nextClassToday.courseRoomNo || "Room not available"}`,
        accent: "from-sky-500/20 via-cyan-400/10 to-transparent border-sky-400/20",
      };
    }

    return {
      eyebrow: "Today's classes complete",
      title: "No more classes left today",
      detail: "You've finished today's schedule. Upcoming below shows the next working day order.",
      accent: "from-purple-500/20 via-fuchsia-400/10 to-transparent border-purple-400/20",
    };
  }, [
    allTodayClasses.length,
    minutesLeftInCurrentClass,
    minutesUntilNextClass,
    nextClassToday,
    ongoingClass,
    todayCalendarEntry,
    todayIsHoliday,
  ]);

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
    <main className="relative h-screen w-full overflow-hidden px-4 pb-24 pt-4 text-white font-sans sm:px-6 sm:pt-5">
      <div className="relative z-10 mx-auto flex h-full max-w-lg flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-premium-gold p-0.5">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-zinc-800">
                <User size={20} className="text-zinc-500" />
              </div>
            </div>
            <h1 className="flex flex-wrap items-baseline gap-1.5 text-lg font-black tracking-tight sm:text-xl">
              Welcome back, <span className="text-premium-gold">{displayName || "Student"}</span>
            </h1>
          </div>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-zinc-400">
            <Bell size={18} />
          </button>
        </header>

        <section>
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.28em] text-zinc-500">Academic Status</p>
          <div className="relative">
            <h2 className="text-[28px] font-black leading-[0.9] tracking-tighter sm:text-[34px]">
              Mastering<span className="text-emerald-400">.</span>
            </h2>
            <h2 className="mt-0.5 text-xl italic tracking-tight text-zinc-500 opacity-80 sm:text-2xl">
              the Semester.
            </h2>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/app/attendance"
            className="rounded-[24px] border border-white/10 bg-zinc-900/45 p-3 backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-zinc-900/60 active:scale-[0.99]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={17} />
              </div>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Live <ChevronRight size={11} />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[26px] font-black tracking-tighter">{overallAttendance}%</span>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Attendance</p>
              <p className="text-[10px] text-zinc-400">Open insights</p>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${Math.min(Number(overallAttendance), 100)}%` }}
              />
            </div>
          </Link>

          <Link
            href="/app/marks"
            className="rounded-[24px] border border-white/10 bg-zinc-900/45 p-3 backdrop-blur-md transition-all hover:border-purple-400/30 hover:bg-zinc-900/60 active:scale-[0.99]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles size={17} />
              </div>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Peak <ChevronRight size={11} />
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black tracking-tighter">{totalMarksDisplay}</span>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Total Marks</p>
              <p className="text-[10px] text-zinc-400">Open breakdown</p>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                style={{ width: `${marksProgress}%` }}
              />
            </div>
          </Link>
        </section>

        <section className={`overflow-hidden rounded-[24px] border bg-gradient-to-br p-4 backdrop-blur-md ${liveClassSummary.accent}`}>
          <p className="text-[9px] font-black uppercase tracking-[0.26em] text-zinc-400">{liveClassSummary.eyebrow}</p>
          <h3 className="mt-2 text-lg font-black tracking-tight text-white sm:text-xl">{liveClassSummary.title}</h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-300">{liveClassSummary.detail}</p>

          {!todayIsHoliday && allTodayClasses.length > 0 ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Current</p>
                <p className="mt-1 text-xs font-semibold text-white">{ongoingClass?.courseCode || "No live class"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Time Left</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {minutesLeftInCurrentClass !== null ? formatMinutes(minutesLeftInCurrentClass) : "Waiting"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Next</p>
                <p className="mt-1 text-xs font-semibold text-white">
                  {minutesUntilNextClass !== null ? formatMinutes(minutesUntilNextClass) : "Done"}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3">
          <div className="flex min-h-0 flex-col rounded-[24px] border border-white/10 bg-zinc-900/30 p-3 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black tracking-tight">Today</h3>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-zinc-500">{todayScheduleLabel}</p>
              </div>
              <Link href="/app/timetable" className="flex items-center gap-1 border-b border-zinc-800 pb-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                View
              </Link>
            </div>
            <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
              {allTodayClasses.length > 0 ? (
                allTodayClasses.map((cls, i) => (
                  <div key={i} className="group flex items-center gap-3 rounded-[20px] border border-white/5 bg-zinc-900/30 p-3 transition-all hover:bg-zinc-900/50">
                    <div className="flex min-w-[54px] flex-col items-start">
                      <span className="text-sm font-black tracking-tighter">{cls.time.split(" ")[0]}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{cls.time.split(" ")[1]}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-zinc-800 transition-colors group-hover:bg-premium-gold/30" />
                    <div className="flex-1">
                      <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                        {cls.courseCode}
                      </span>
                      <h4 className="text-xs font-bold leading-tight">{cls.courseTitle}</h4>
                    </div>
                    <ChevronRight size={16} className="text-zinc-700 transition-colors group-hover:text-premium-gold" />
                  </div>
                ))
              ) : (
                <p className="py-3 text-xs italic text-zinc-600">
                  {todayIsHoliday
                    ? `No classes today${todayCalendarEntry?.event ? ` · ${todayCalendarEntry.event}` : ""}.`
                    : "No sessions scheduled for today."}
                </p>
              )}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-[24px] border border-white/10 bg-zinc-900/30 p-3 backdrop-blur-md">
            <div className="mb-2 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-base font-black tracking-tight">Upcoming</h3>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-zinc-500">{nextDayLabel}</p>
              </div>
              <Link
                href={`/app/timetable?dayOrder=${nextDayOrder}`}
                className="flex items-center gap-1 border-b border-zinc-800 pb-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500"
              >
                Open
              </Link>
            </div>
            <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
              {nextDayClasses.length > 0 ? (
                nextDayClasses.map((cls, i) => (
                  <div key={i} className="group flex items-center gap-3 rounded-[20px] border border-white/5 bg-zinc-900/30 p-3 transition-all hover:bg-zinc-900/50">
                    <div className="flex min-w-[54px] flex-col items-start">
                      <span className="text-sm font-black tracking-tighter">{cls.time.split(" ")[0]}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{cls.time.split(" ")[1]}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-zinc-800 transition-colors group-hover:bg-premium-gold/30" />
                    <div className="flex-1">
                      <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.2em] text-sky-400/80">
                        Day Order {nextDayOrder} · {cls.courseCode}
                      </span>
                      <h4 className="text-xs font-bold leading-tight">{cls.courseTitle}</h4>
                    </div>
                    <ChevronRight size={16} className="text-zinc-700 transition-colors group-hover:text-premium-gold" />
                  </div>
                ))
              ) : (
                <p className="py-3 text-xs italic text-zinc-600">
                  {upcomingCalendarEntry
                    ? `No classes found for ${nextDayLabel.toLowerCase()}.`
                    : "No upcoming working day classes found in the academic calendar."}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
