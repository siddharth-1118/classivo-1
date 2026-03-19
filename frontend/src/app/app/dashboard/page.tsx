"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpenText,
  Calendar,
  CalendarClock,
  ChartNoAxesCombined,
  Clock3,
  GraduationCap,
  MapPin,
  MessageSquare,
  RotateCcw,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { AttendanceDetail, MarkDetail } from "srm-academia-api";
import { useAttendance, useCalendar, useDayOrder, useMarks, useTimetable, useUserInfo } from "@/hooks/query";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { TotalMarksCard } from "@/app/components/TotalMarksCard";

const CALENDAR_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const parseCalendarDate = (monthLabel: string, dateLabel: string) => {
  const [monthPart, yearPart] = monthLabel.split(" '");
  const monthIndex = CALENDAR_MONTH_LABELS.indexOf(monthPart ?? "");
  const dateMatch = dateLabel.match(/\d+/);

  if (monthIndex < 0 || !yearPart || !dateMatch) return null;

  const fullYear = 2000 + Number(yearPart);
  const day = Number(dateMatch[0]);
  if (Number.isNaN(fullYear) || Number.isNaN(day)) return null;

  return new Date(fullYear, monthIndex, day);
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const extractDayOrderNumber = (value: string | undefined) => {
  if (!value) return NaN;
  const matched = value.match(/\d+/);
  return matched ? Number(matched[0]) : NaN;
};

const getScheduleForDayOrder = (dayOrder: string | undefined, timetableData: any[] | undefined): TimetableClass[] => {
  const order = extractDayOrderNumber(dayOrder);
  if (!timetableData || Number.isNaN(order) || order <= 0) return [];

  const matchedDay = timetableData.find((entry) => extractDayOrderNumber(entry.dayOrder) === order);
  return (matchedDay?.class ?? []) as TimetableClass[];
};

const getScheduledClassCount = (schedule: TimetableClass[]) =>
  schedule.filter((cls) => cls.isClass && cls.courseTitle).length;

const getMarkPercentage = (mark: MarkDetail) => {
  const obtained = Number(mark.total?.obtained ?? 0);
  const max = Number(mark.total?.maxMark ?? 0);
  return max > 0 ? (obtained / max) * 100 : 0;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardPage() {
  const { data: attendanceData } = useAttendance();
  const { data: timetableData, refetch: refetchTimetable, isFetching: isFetchingTimetable } = useTimetable();
  const { data: marksData } = useMarks();
  const { data: userInfo } = useUserInfo();
  const { data: dayOrderData, refetch: refetchDayOrder, isFetching: isFetchingDayOrder } = useDayOrder();
  const { data: calendarData } = useCalendar();

  const averageAttendance =
    attendanceData && attendanceData.length > 0
      ? (attendanceData.reduce((acc, curr) => acc + Number(curr.courseAttendance), 0) / attendanceData.length).toFixed(1)
      : "0.0";

  let todayScheduleRaw: TimetableClass[] = [];
  let dayOrderLabel = "";
  let isHoliday = false;

  if (dayOrderData && typeof dayOrderData.dayOrder !== "undefined") {
    const d = Number(dayOrderData.dayOrder);
    if (Number.isNaN(d) || d === 0) {
      isHoliday = true;
      dayOrderLabel = "Holiday";
      todayScheduleRaw = [];
    } else {
      const idx = d - 1;
      if (timetableData && timetableData.length > idx && idx >= 0) {
        todayScheduleRaw = (timetableData[idx]?.class ?? []) as TimetableClass[];
        dayOrderLabel = `Day ${d}`;
      } else if (timetableData && timetableData.length > 0) {
        todayScheduleRaw = (timetableData[0]?.class ?? []) as TimetableClass[];
        dayOrderLabel = `Day ${d}`;
      }
    }
  } else {
    todayScheduleRaw = timetableData && timetableData.length > 0 ? ((timetableData[0]?.class ?? []) as TimetableClass[]) : [];
    dayOrderLabel = timetableData && timetableData.length > 0 ? (timetableData[0]?.dayOrder ?? "") : "";
  }

  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const calendarEntries = (calendarData ?? [])
    .flatMap((month) =>
      month.days
        .map((day) => {
          const parsedDate = parseCalendarDate(month.month, day.date);
          if (!parsedDate) return null;
          return { ...day, parsedDate };
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    )
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  const nextAcademicDay = calendarEntries.find(
    (entry) => entry.parsedDate.getTime() > todayOnly.getTime() && Number(entry.dayOrder) > 0
  );

  const upcomingSchedule = getScheduleForDayOrder(nextAcademicDay?.dayOrder, timetableData);
  const upcomingClassCount = getScheduledClassCount(upcomingSchedule);
  const sortedUpcomingSchedule = [...upcomingSchedule]
    .filter((cls) => cls.isClass && cls.courseTitle)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const sortedSchedule = [...todayScheduleRaw]
    .filter((cls) => cls.isClass && cls.courseTitle)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const greeting = getGreeting();
  const firstName = userInfo?.name?.split(" ")[0] ?? "Student";
  const initials = userInfo?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const riskySubjects = [...(attendanceData ?? [])]
    .filter((subject) => Number(subject.courseAttendance) < 75 || subject.courseAttendanceStatus?.status === "required")
    .sort((a, b) => Number(a.courseAttendance) - Number(b.courseAttendance))
    .slice(0, 3);

  const strongSubjects = [...(attendanceData ?? [])]
    .filter((subject) => Number(subject.courseAttendance) >= 85 && subject.courseAttendanceStatus?.status !== "required")
    .sort((a, b) => Number(b.courseAttendance) - Number(a.courseAttendance))
    .slice(0, 2);

  const rankedMarks = [...(marksData ?? [])]
    .map((mark) => ({ ...mark, percentage: getMarkPercentage(mark) }))
    .sort((a, b) => b.percentage - a.percentage);

  const strongestMark = rankedMarks[0];
  const weakestMark = [...rankedMarks].reverse().find((mark) => mark.percentage > 0);
  const marksAverage =
    rankedMarks.length > 0
      ? rankedMarks.reduce((sum, mark) => sum + mark.percentage, 0) / rankedMarks.length
      : 0;

  const placementReadiness =
    Number(averageAttendance) >= 85 && marksAverage >= 75
      ? "Placement ready"
      : Number(averageAttendance) >= 75 && marksAverage >= 65
        ? "Build consistency"
        : "Needs stronger profile";

  const navItems = [
    { name: "Timetable", href: "/app/timetable", icon: Clock3, color: "text-blue-400" },
    { name: "Attendance", href: "/app/attendance", icon: ChartNoAxesCombined, color: "text-emerald-400" },
    { name: "Marks", href: "/app/marks", icon: TrendingUp, color: "text-purple-400" },
    { name: "Subjects", href: "/app/marks", icon: BookOpenText, color: "text-orange-400" },
    { name: "Chat", href: "/app/chat", icon: MessageSquare, color: "text-indigo-400" },
    { name: "Queries", href: "/app/queries", icon: MessageSquare, color: "text-cyan-300" },
    { name: "Placements", href: "/app/placements", icon: GraduationCap, color: "text-pink-400" },
    { name: "Mess Menu", href: "/app/messmenu", icon: Calendar, color: "text-yellow-400" },
    { name: "Profile", href: "/app/profile", icon: User, color: "text-zinc-400" },
    { name: "Community", href: "https://chat.whatsapp.com/KCbxvabSvRbK96h67JF3Io", icon: Users, color: "text-green-400" },
    { name: "Clubs", href: "/app/clubs", icon: Sparkles, color: "text-pink-400" },
    { name: "Settings", href: "/app/settings", icon: Settings, color: "text-slate-400" },
  ];

  const statusCards = [
    {
      icon: <Sparkles size={12} />,
      label: `Today | ${today.toLocaleDateString("en-US", { weekday: "long" })}`,
      value: isHoliday ? "No classes today" : dayOrderLabel || "Classes today",
      subValue: isHoliday ? "Holiday or no academic schedule listed" : `${sortedSchedule.length} classes scheduled`,
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl px-2 sm:px-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_30%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:90px_90px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_55%)]" />

      <div className="relative z-10 flex h-full flex-col p-3 sm:p-6 md:p-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-[28px] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.28)] [transform-style:preserve-3d] sm:px-6"
          whileHover={{ rotateX: -1.5, rotateY: 1.5, y: -2 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-premium-gold/25 bg-premium-gold/10 text-[10px] uppercase tracking-[0.22em] text-premium-gold">
                  Student OS
                </Badge>
                <span className="hidden text-xs uppercase tracking-[0.22em] text-zinc-500 sm:inline">
                  Daily mission control
                </span>
              </div>
              <h1 className="mt-4 flex items-center gap-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl font-space-grotesk">
                {greeting}, {firstName}
                <ClassivoLogo className="h-8 w-8 text-premium-gold" />
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Classes, attendance, marks, placement momentum, and AI guidance are now arranged like a command center so the student always knows what matters next.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={async () => {
                  try {
                    await Promise.all([refetchTimetable?.(), refetchDayOrder?.()]);
                  } catch {
                    // ignore refresh errors in the UI shell
                  }
                }}
                aria-label="Refresh dashboard"
              >
                {isFetchingTimetable || isFetchingDayOrder ? <RotateCcw size={18} className="animate-spin" /> : <RotateCcw size={18} />}
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <span className="text-lg text-white font-display">{initials}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2">
            {statusCards.map((card) => (
              <motion.div
                key={card.label}
                whileHover={{ y: -4, rotateX: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
                className="[transform-style:preserve-3d]"
              >
                <DashInfo icon={card.icon} label={card.label} value={card.value} subValue={card.subValue} />
              </motion.div>
            ))}
            <motion.div
              whileHover={{ y: -4, rotateX: -4 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="[transform-style:preserve-3d]"
            >
              <UpcomingDayOrderCard
                nextAcademicDay={nextAcademicDay}
                upcomingClassCount={upcomingClassCount}
                classes={sortedUpcomingSchedule}
              />
            </motion.div>
          </div>
        </motion.header>

        <div className="flex-1 flex flex-col gap-4 sm:gap-8 min-h-0 overflow-y-auto custom-scrollbar relative z-10 pb-24">
          <section>
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="h-1.5 w-1.5 rounded-full bg-premium-gold animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Quick Access</h2>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-4">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="group relative h-full overflow-hidden border-zinc-800/50 bg-zinc-900/40 p-2 sm:p-4 transition-all duration-300 hover:border-premium-gold/30 hover:-translate-y-1 cursor-pointer">
                    <Link href={item.href} className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-2 sm:p-3 transition-all group-hover:scale-110 group-hover:bg-premium-gold/10 ${item.color}`}>
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-white sm:text-xs">{item.name}</span>
                        <ClassivoLogo className="hidden h-3 w-3 text-premium-gold opacity-60 transition-opacity group-hover:opacity-100 sm:inline" />
                      </div>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3 [perspective:1800px]">
            <StudentOsPanel
              title="Attendance Intelligence"
              eyebrow="Top priority"
              icon={<ChartNoAxesCombined size={16} />}
              accent="emerald"
              href="/app/attendance"
              description="Safe bunks, must-attend subjects, and the fastest way to avoid shortage."
              items={
                riskySubjects.length > 0
                  ? riskySubjects.map((subject) => `${subject.courseTitle} | ${subject.courseAttendance}% | attend ${subject.courseAttendanceStatus?.classes ?? 0} more`)
                  : strongSubjects.length > 0
                    ? strongSubjects.map((subject) => `${subject.courseTitle} | ${subject.courseAttendance}% | safe margin`)
                    : ["Attendance intelligence will appear once your attendance data loads."]
              }
            />

            <StudentOsPanel
              title="Marks Radar"
              eyebrow="Academic focus"
              icon={<TrendingUp size={16} />}
              accent="blue"
              href="/app/marks"
              description="Know where you're strong, where you're slipping, and what needs recovery next."
              items={[
                strongestMark ? `${strongestMark.subject} is leading at ${strongestMark.percentage.toFixed(0)}%` : "Waiting for marks data",
                weakestMark ? `${weakestMark.subject} needs attention at ${weakestMark.percentage.toFixed(0)}%` : "Your next weak subject will appear here",
                `Average marks level: ${marksAverage > 0 ? marksAverage.toFixed(0) : "0"}%`,
              ]}
            />

            <StudentOsPanel
              title="Placement Launchpad"
              eyebrow="Career mode"
              icon={<GraduationCap size={16} />}
              accent="amber"
              href="/app/placements"
              description="Turn academic consistency into placement readiness with a focused starter hub."
              items={[
                `Readiness status: ${placementReadiness}`,
                `Attendance baseline: ${averageAttendance}%`,
                strongestMark ? `Best proving subject: ${strongestMark.subject}` : "Academic proof points will appear here",
              ]}
            />
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/app/attendance" className="block">
              <Card className="relative flex h-full cursor-pointer flex-col justify-between overflow-hidden border-white/10 bg-white/8 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:border-premium-gold/30 hover:bg-white/10 sm:p-6">
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400">Average Attendance</h3>
                    <CalendarClock className="text-premium-gold opacity-50 transition-opacity group-hover:opacity-100" size={16} />
                  </div>
                  <div className="mt-2">
                    <div className="mb-3 flex items-baseline gap-1.5">
                      <span className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">{averageAttendance}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-premium-gold to-amber-200" style={{ width: `${averageAttendance}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/app/marks" className="block">
              <div className="h-full cursor-pointer">
                <TotalMarksCard marks={marksData || []} />
              </div>
            </Link>
          </div>

          <Card className="overflow-hidden border-white/10 bg-black/20 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col items-start justify-between border-b border-white/10 p-4 sm:p-6 md:flex-row md:items-end">
              <div className="mb-4 md:mb-0">
                <div className="mb-2 flex items-center gap-3">
                  <ClassivoLogo className="h-8 w-8 text-premium-gold" />
                  <h2 className="m-0 text-3xl font-display font-medium tracking-tight text-white">
                    {firstName}'s class timeline
                  </h2>
                </div>
                <p className="m-0 text-sm text-zinc-400">
                  The live schedule view stays anchored below your student OS panels so daily navigation still feels familiar.
                </p>
              </div>
              <div className="hidden gap-3 md:flex">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  SRM Institute of Science and Technology
                </div>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="absolute bottom-6 left-20 top-6 z-0 hidden w-px bg-white/10 sm:block" />
              <div className="relative z-10 space-y-4 sm:space-y-6">
                {sortedSchedule.length > 0 ? (
                  sortedSchedule.map((cls, i) => (
                    <div key={`${cls.courseCode}-${cls.time}-${i}`} className="group flex items-start gap-4 sm:gap-6">
                      <div className="w-14 shrink-0 text-right sm:w-16">
                        <p className="text-xs font-medium text-white sm:text-sm">{cls.time.split("-")[0].trim()}</p>
                        <p className="mt-0.5 text-[10px] text-zinc-500 sm:text-[11px]">{cls.time.split("-")[1]?.trim()}</p>
                      </div>

                      <div className="relative flex h-full flex-col items-center pt-1.5">
                        <div className="z-10 h-2.5 w-2.5 shrink-0 rounded-full bg-premium-gold shadow-[0_0_12px_rgba(212,175,55,0.55)]" />
                        {i !== sortedSchedule.length - 1 ? (
                          <div className="absolute bottom-0 left-1/2 top-2 w-px -translate-x-1/2 bg-white/10" />
                        ) : null}
                      </div>

                      <div className="flex-1 rounded-2xl border border-white/10 bg-white/6 p-3 transition-all group-hover:bg-white/10 hover:border-premium-gold/20 sm:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-1 truncate text-sm font-medium text-white sm:text-base">{cls.courseTitle}</h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={12} /> {cls.courseRoomNo}
                              </span>
                              <span className="text-zinc-600">|</span>
                              <span>{cls.courseCode}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 border text-[10px] font-medium uppercase tracking-wider ${
                              cls.courseType === "Practical"
                                ? "border-sky-300/20 bg-sky-300/10 text-sky-200"
                                : "border-premium-gold/20 bg-premium-gold/10 text-premium-gold"
                            }`}
                          >
                            {cls.courseType || "Theory"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center text-zinc-500 sm:py-20">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 sm:mb-4 sm:h-16 sm:w-16">
                      <Zap className="text-premium-gold" size={24} />
                    </div>
                    <p className="text-base font-medium text-white sm:text-lg">
                      {isHoliday ? "No classes scheduled today" : "No scheduled classes available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

const DashInfo = ({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    <div className="text-sm text-zinc-400">{subValue}</div>
  </div>
);

const UpcomingDayOrderCard = ({
  nextAcademicDay,
  classes,
  upcomingClassCount,
}: {
  nextAcademicDay: { dayOrder: string; parsedDate: Date } | undefined;
  classes: TimetableClass[];
  upcomingClassCount: number;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <ChartNoAxesCombined size={12} />
      Upcoming Classes
    </div>
    <div className="mt-2 text-lg font-semibold text-white">
      {nextAcademicDay ? `Day Order ${nextAcademicDay.dayOrder} Classes` : "No upcoming class day"}
    </div>
    <div className="text-sm text-zinc-400">
      {nextAcademicDay
        ? `${formatDateLabel(nextAcademicDay.parsedDate)} | ${upcomingClassCount} classes`
        : "Calendar data does not list another academic day yet"}
    </div>

    {nextAcademicDay && classes.length > 0 ? (
      <div className="mt-4 grid gap-3">
        {classes.map((cls) => (
          <div key={`${cls.courseCode}-${cls.time}`} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">{cls.courseTitle}</div>
                <div className="mt-1 text-xs text-zinc-400">{cls.courseCode} | {cls.courseRoomNo}</div>
              </div>
              <div className="shrink-0 rounded-xl border border-premium-gold/20 bg-premium-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-premium-gold">
                {cls.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : null}
  </div>
);

const StudentOsPanel = ({
  title,
  eyebrow,
  icon,
  accent,
  description,
  items,
  href,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  accent: "emerald" | "blue" | "amber";
  description: string;
  items: string[];
  href: string;
}) => {
  const accentStyles = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    blue: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    amber: "border-premium-gold/20 bg-premium-gold/10 text-premium-gold",
  };

  return (
    <Card className="border-white/10 bg-black/25 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl border p-2 ${accentStyles[accent]}`}>{icon}</div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{eyebrow}</div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-300">{description}</p>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">
            {item}
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-premium-gold"
      >
        Open section <ArrowRight size={14} />
      </Link>
    </Card>
  );
};
