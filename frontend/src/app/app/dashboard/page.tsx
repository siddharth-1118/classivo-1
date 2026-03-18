"use client";
import React from "react";
import Link from "next/link";
import {
  Zap,
  MapPin,
  RotateCcw,
  Calendar as CalendarIcon,
  Sparkles,
  Clock3,
  ChartNoAxesCombined,
} from "lucide-react";
import { useAttendance, useTimetable, useMarks, useUserInfo, useDayOrder } from "@/hooks/query";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { TotalMarksCard } from "@/app/components/TotalMarksCard";

const parseTime = (timeStr: string) => {
  try {
    const [startStr] = timeStr.split("-").map((t) => t.trim());
    const parseToMinutes = (t: string) => {
      const [time, modifier] = t.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return parseToMinutes(startStr);
  } catch {
    return 0;
  }
};

const DashboardPage = () => {
  const { data: attendanceData } = useAttendance();
  const { data: timetableData, refetch: refetchTimetable, isFetching: isFetchingTimetable } = useTimetable();
  const { data: marksData } = useMarks();
  const { data: userInfo } = useUserInfo();
  const { data: dayOrderData, refetch: refetchDayOrder, isFetching: isFetchingDayOrder } = useDayOrder();

  const averageAttendance =
    attendanceData && attendanceData.length > 0
      ? (attendanceData.reduce((acc, curr) => acc + Number(curr.courseAttendance), 0) / attendanceData.length).toFixed(1)
      : "0.0";

  let todayScheduleRaw = [] as any[];
  let dayOrderLabel = "";
  let isHoliday = false;

  if (dayOrderData && typeof dayOrderData.dayOrder !== "undefined") {
    const d = Number(dayOrderData.dayOrder);
    if (isNaN(d) || d === 0) {
      isHoliday = true;
      dayOrderLabel = "Holiday";
      todayScheduleRaw = [];
    } else {
      const idx = d - 1;
      if (timetableData && timetableData.length > idx && idx >= 0) {
        todayScheduleRaw = timetableData[idx]?.class ?? [];
        dayOrderLabel = `Day ${d}`;
      } else if (timetableData && timetableData.length > 0) {
        todayScheduleRaw = timetableData[0]?.class ?? [];
        dayOrderLabel = `Day ${d}`;
      }
    }
  } else {
    todayScheduleRaw = timetableData && timetableData.length > 0 ? timetableData[0]?.class : [];
    dayOrderLabel = timetableData && timetableData.length > 0 ? (timetableData[0]?.dayOrder ?? "") : "";
  }

  const sortedSchedule = [...(todayScheduleRaw || [])]
    .filter((cls) => cls.isClass && cls.courseTitle)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const currentDate = new Date();
  const dateNum = currentDate.getDate();
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

  const initials = userInfo?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="relative min-h-screen w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_30%)]" />
      <div className="relative z-10 flex h-full flex-col p-3 sm:p-6 md:p-8">
        <header className="mb-6 rounded-[28px] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-premium-gold/25 bg-premium-gold/10 text-[10px] uppercase tracking-[0.22em] text-premium-gold">
                  Dashboard
                </Badge>
                <span className="hidden text-xs uppercase tracking-[0.22em] text-zinc-500 sm:inline">
                  Academic overview
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Welcome{userInfo?.name ? `, ${userInfo.name.split(" ")[0]}` : ""}.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Review today&apos;s academic summary, access attendance and marks quickly, and monitor scheduled classes from a refined premium interface.
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
                  } catch {}
                }}
                aria-label="Refresh timetable"
              >
                {(isFetchingTimetable || isFetchingDayOrder) ? <RotateCcw size={18} className="animate-spin" /> : <RotateCcw size={18} />}
              </Button>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <span className="text-lg text-white font-display">{initials}</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DashInfo icon={<Sparkles size={12} />} label="Today" value={dayName} subValue={`Date ${dateNum}`} />
            <DashInfo
              icon={<Clock3 size={12} />}
              label="Day Order"
              value={dayOrderLabel || "Not available"}
              subValue={isHoliday ? "Holiday or no scheduled classes" : "Current academic day status"}
            />
            <DashInfo
              icon={<ChartNoAxesCombined size={12} />}
              label="Events"
              value={`${sortedSchedule.length}`}
              subValue="Scheduled classes in this view"
            />
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-5 sm:gap-6 min-h-0 overflow-y-auto custom-scrollbar relative z-10">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 shrink-0 h-auto">
            <Link href="/app/attendance" className="block">
              <Card className="p-5 sm:p-6 relative overflow-hidden group bg-white/8 border-white/10 backdrop-blur-xl hover:border-premium-gold/30 hover:bg-white/10 transition-all flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.2)] cursor-pointer">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-zinc-400 text-[11px] font-medium uppercase tracking-[0.16em]">Attendance</h3>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-3xl sm:text-4xl font-medium text-white tracking-tight font-display">{averageAttendance}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-premium-gold to-amber-200 h-full rounded-full" style={{ width: `${averageAttendance}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/app/marks" className="block">
              <div className="cursor-pointer">
                <TotalMarksCard marks={marksData || []} />
              </div>
            </Link>
          </div>

          <Card className="flex-1 p-0 flex flex-col bg-black/20 border-white/10 backdrop-blur-xl overflow-hidden shrink-0 sm:shrink shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base sm:text-lg font-medium text-white font-display">Today&apos;s Schedule</h2>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <CalendarIcon size={14} />
                  <span>{dayOrderLabel}</span>
                </div>
              </div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                {isHoliday ? "Holiday" : `${sortedSchedule.length} Events`}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative min-h-0 pb-32">
              <div className="hidden sm:block absolute left-20 top-6 bottom-6 w-px bg-white/10 z-0" />
              <div className="space-y-4 sm:space-y-6 relative z-10">
                {sortedSchedule.length > 0 ? (
                  sortedSchedule.map((cls, i) => (
                    <div key={i} className="group flex items-start gap-4 sm:gap-6">
                      <div className="w-14 sm:w-16 text-right shrink-0">
                        <p className="text-xs sm:text-sm font-medium text-white">{cls.time.split("-")[0]}</p>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">{cls.time.split("-")[1]}</p>
                      </div>

                      <div className="relative flex flex-col items-center h-full pt-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-premium-gold shadow-[0_0_12px_rgba(212,175,55,0.55)] shrink-0 z-10" />
                        {i !== sortedSchedule.length - 1 ? (
                          <div className="w-px h-full bg-white/10 absolute top-2 bottom-0 left-1/2 -translate-x-1/2" />
                        ) : null}
                      </div>

                      <div className="flex-1 p-3 sm:p-4 rounded-2xl bg-white/6 border border-white/10 hover:border-premium-gold/20 transition-all group-hover:bg-white/10">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm sm:text-base mb-1 truncate">{cls.courseTitle}</h3>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                              <span className="flex items-center gap-1.5"><MapPin size={12} /> {cls.courseRoomNo}</span>
                              <span className="text-zinc-600">|</span>
                              <span>{cls.courseCode}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] uppercase tracking-wider font-medium border ${
                              cls.courseType === "Practical" ? "text-sky-200 border-sky-300/20 bg-sky-300/10" : "text-premium-gold border-premium-gold/20 bg-premium-gold/10"
                            }`}
                          >
                            {cls.courseType || "Theory"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 sm:py-20 text-zinc-500 flex flex-col items-center justify-center h-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 sm:mb-4 border border-white/10">
                      <Zap className="text-premium-gold" size={24} />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-white">{isHoliday ? "No classes scheduled today" : "No scheduled classes available"}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

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

export default DashboardPage;
