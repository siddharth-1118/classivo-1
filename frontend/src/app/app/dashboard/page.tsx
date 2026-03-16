"use client";
import React from "react";
import {
    ArrowBigUpDash,
    Zap,
    MapPin,
    RotateCcw,
    Calendar as CalendarIcon,
    Equal
} from "lucide-react";
import { useAttendance, useTimetable, useMarks, useUserInfo, useDayOrder } from "@/hooks/query";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { TotalMarksCard } from "@/app/components/TotalMarksCard";

// Helper to parse time string "08:00 AM - 09:50 AM" to minutes from 8:00 AM
const parseTime = (timeStr: string) => {
    try {
        const [startStr] = timeStr.split("-").map(t => t.trim());

        const parseToMinutes = (t: string) => {
            const [time, modifier] = t.split(" ");
            let [hours, minutes] = time.split(":").map(Number);

            if (modifier === "PM" && hours < 12) hours += 12;
            if (modifier === "AM" && hours === 12) hours = 0;

            return hours * 60 + minutes;
        };

        return parseToMinutes(startStr);
    } catch (e) {
        return 0;
    }
};

const DashboardPage = () => {
    const { data: attendanceData } = useAttendance();
    const { data: timetableData, refetch: refetchTimetable, isFetching: isFetchingTimetable } = useTimetable();
    const { data: marksData } = useMarks();
    const { data: userInfo } = useUserInfo();
    const { data: dayOrderData, refetch: refetchDayOrder, isFetching: isFetchingDayOrder } = useDayOrder();

    // Calculate aggregate attendance
    const averageAttendance = attendanceData && attendanceData.length > 0
        ? (attendanceData.reduce((acc, curr) => acc + Number(curr.courseAttendance), 0) / attendanceData.length).toFixed(1)
        : "0.0";

    // Determine today's schedule based on day order from API
    let todayScheduleRaw = [] as any[];
    let dayOrderLabel = "";
    let isHoliday = false;

    if (dayOrderData && typeof dayOrderData.dayOrder !== "undefined") {
        const d = Number(dayOrderData.dayOrder);
        if (isNaN(d) || d === 0) {
            // Holiday or unknown
            isHoliday = true;
            dayOrderLabel = "Holiday";
            todayScheduleRaw = [];
        } else {
            const idx = d - 1;
            if (timetableData && timetableData.length > idx && idx >= 0) {
                todayScheduleRaw = timetableData[idx]?.class ?? [];
                dayOrderLabel = `Day ${d}`;
            } else if (timetableData && timetableData.length > 0) {
                // fallback to first day
                todayScheduleRaw = timetableData[0]?.class ?? [];
                dayOrderLabel = `Day ${d}`;
            }
        }
    } else {
        // No day order info; fallback to first day
        todayScheduleRaw = timetableData && timetableData.length > 0 ? timetableData[0]?.class : [];
        dayOrderLabel = timetableData && timetableData.length > 0 ? (timetableData[0]?.dayOrder ?? "") : "";
    }

    // Filter out empty classes and sort
    const sortedSchedule = [...(todayScheduleRaw || [])]
        .filter(cls => cls.isClass && cls.courseTitle) // Ensure it's a class and has a title
        .sort((a, b) => {
            return parseTime(a.time) - parseTime(b.time);
        });

    const currentDate = new Date();
    const dateNum = currentDate.getDate();
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    const initials = userInfo?.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        // OUTER WRAPPER: Full screen, no max-width, relative positioning
        <main className="relative min-h-screen w-full  overflow-hidden text-white selection:bg-gray bg-zinc-900/10 border border-white/10 rounded-lg">
            <div className="min-h-14 px-4 justify-between items-center flex text-lg  border-b border-slate-400/10 py-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-white/90">CLASSIVO</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-premium-gold/20 text-premium-gold/60">DASHBOARD</Badge>
                    <div className="tech-badge ml-2 hidden sm:flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-premium-gold animate-pulse"></span>
                        <span>V.7.1_STITCH_SYS</span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative z-10 shadow-2xl pb-1">
                        <span className="text-xl text-white tracking-widest font-display">
                            {initials}
                        </span>
                    </div>
                </div>
            </div>
            <div className="h-[1px] w-full bg-white/10">
                <Button variant="ghost" size="sm" className="rounded-full bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0 mt-2" onClick={async () => { try { await Promise.all([refetchTimetable?.(), refetchDayOrder?.()]); } catch (e) { } }} aria-label="Refresh timetable">
                    {(isFetchingTimetable || isFetchingDayOrder) ? <RotateCcw size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                </Button>
            </div>
            <div className="relative z-10 flex flex-col h-full p-1 sm:p-6 md:p-8 mx-auto">

                {/* Header Section - Mobile Optimized */}
                <header className="flex flex-col space-y-4 sm:space-y-6 mb-8 mt-3 sm:mb-8 shrink-0">
                    {/* <div className="flex justify-between items-start gap-4 mb-4 px-2">

                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-white/10 transition-all shrink-0 mt-2"
                            onClick={async () => {
                                try {
                                    await Promise.all([refetchTimetable?.(), refetchDayOrder?.()]);
                                } catch (e) { }
                            }}
                            aria-label="Refresh timetable"
                        >
                            {(isFetchingTimetable || isFetchingDayOrder) ? <RotateCcw size={20} className="animate-spin" /> : <RotateCcw size={20} />}
                        </Button>
                    </div> */}
                </header>

                {/* Main Content - Mobile-first Vertical Stack */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-h-0 overflow-y-auto custom-scrollbar relative z-10">

                    {/* Stats Cards - Full Width on Mobile, 2-column on sm and up */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 shrink-0 h-auto">
                        {/* Attendance Stat */}
                        <Card className="p-5 sm:p-6 relative overflow-hidden group bg-[#121315] border-white/5 backdrop-blur-md hover:border-white/10 transition-all flex flex-col justify-between shadow-none">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-[#8A8F98] text-[11px] font-medium uppercase tracking-[0.1em]">Attendance</h3>
                                </div>
                                <div className="mt-2">
                                    <div className="flex items-baseline gap-1.5 mb-3">
                                        <span className="text-3xl sm:text-4xl font-medium text-[#EDEDED] tracking-tight font-display">{averageAttendance}%</span>
                                    </div>

                                    <div className="w-full bg-zinc-800/30 rounded-full h-1 overflow-hidden">
                                        <div
                                            className="bg-premium-gold h-full rounded-full"
                                            style={{ width: `${averageAttendance}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Marks Stat using new Component */}
                        <TotalMarksCard marks={marksData || []} />
                    </div>

                    {/* Schedule Section */}
                    <Card className="flex-1 p-0 flex flex-col bg-zinc-900/10 border-zinc-800/50 backdrop-blur-sm overflow-hidden shrink-0 sm:shrink">
                        <div className="p-4 sm:p-6 border-b border-zinc-800/50 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-base sm:text-lg font-medium text-white font-display">Today's Schedule</h2>
                                <div className="flex items-center gap-2 text-Classivo-text-grey text-sm">
                                    <CalendarIcon size={14} />
                                    <span>{dayOrderLabel}</span>
                                </div>
                            </div>
                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                                {isHoliday ? "Holiday" : `${sortedSchedule.length} Events`}
                            </span>
                        </div>

                        {/* Timeline View - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative min-h-0 pb-32">
                            {/* Vertical Line - Hidden on mobile, shown on sm and up */}
                            <div className="hidden sm:block absolute left-20 top-6 bottom-6 w-px bg-zinc-800/50 z-0"></div>

                            <div className="space-y-4 sm:space-y-6 relative z-10">
                                {sortedSchedule.length > 0 ? (
                                    sortedSchedule.map((cls, i) => (
                                        <div key={i} className="group flex items-start gap-4 sm:gap-6">
                                            {/* Time Column */}
                                            <div className="w-14 sm:w-16 text-right shrink-0">
                                                <p className="text-xs sm:text-sm font-medium text-[#EDEDED]">{cls.time.split("-")[0]}</p>
                                                <p className="text-[10px] sm:text-[11px] text-[#8A8F98] mt-0.5">{cls.time.split("-")[1]}</p>
                                            </div>

                                            {/* Dot & Line container */}
                                            <div className="relative flex flex-col items-center h-full pt-1.5">
                                                <div className="w-2 h-2 rounded-full bg-[#27D796] shadow-[0_0_8px_rgba(39,215,150,0.4)] shrink-0 z-10"></div>
                                                {/* Line connection - simplified */}
                                                {i !== sortedSchedule.length - 1 && (
                                                    <div className="w-px h-full bg-zinc-800/50 absolute top-2 bottom-0 left-1/2 -translate-x-1/2"></div>
                                                )}
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 p-3 sm:p-4 rounded-lg bg-[#121315] border border-white/5 hover:border-white/10 transition-all group-hover:bg-[#161719]">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-[#EDEDED] text-sm sm:text-base mb-1 truncate">{cls.courseTitle}</h3>
                                                        <div className="flex items-center gap-3 text-xs text-[#8A8F98]">
                                                            <span className="flex items-center gap-1.5"><MapPin size={12} /> {cls.courseRoomNo}</span>
                                                            <span className="text-zinc-600">|</span>
                                                            <span>{cls.courseCode}</span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 text-[10px] uppercase tracking-wider font-medium border ${cls.courseType === "Practical" ? "text-amber-400 border-amber-400/20" : "text-premium-gold border-premium-gold/20"} bg-transparent`}
                                                    >
                                                        {cls.courseType || "Theory"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 sm:py-20 text-zinc-500 flex flex-col items-center justify-center h-full">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-zinc-900/20 flex items-center justify-center mb-3 sm:mb-4 border border-zinc-800">
                                            <Zap className="text-zinc-700" size={24} />
                                        </div>
                                        <p className="text-base sm:text-lg font-medium text-white">{isHoliday ? "No Classes today" : "No classes scheduled"}</p>
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

export default DashboardPage;


