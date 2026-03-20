"use client";

import React from "react";
import {
  User,
  ChevronRight,
  Bell,
  CheckCircle2,
  Sparkles
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


  let todayScheduleRaw: TimetableClass[] = [];

  if (dayOrderData && typeof dayOrderData.dayOrder !== "undefined") {
    const d = Number(dayOrderData.dayOrder);
    if (Number.isNaN(d) || d === 0) {
      todayScheduleRaw = [];
    } else {
      const idx = d - 1;
      if (timetableData && timetableData.length > idx && idx >= 0) {
        todayScheduleRaw = (timetableData[idx]?.class ?? []) as TimetableClass[];
      } else if (timetableData && timetableData.length > 0) {
        todayScheduleRaw = (timetableData[0]?.class ?? []) as TimetableClass[];
      }
    }
  } else {
    todayScheduleRaw = timetableData && timetableData.length > 0 ? ((timetableData[0]?.class ?? []) as TimetableClass[]) : [];
  }


  const today = new Date();
  const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();

  const parseEndTime = (timeStr: string) => {
    try {
      const parts = timeStr.split("-").map((t) => t.trim());
      const endStr = parts[1];
      if (!endStr) return 0;
      
      const [time, modifier] = endStr.split(" ");
      const [hoursStr, minutesStr] = time!.split(":");
      let hours = Number(hoursStr);
      const minutes = Number(minutesStr);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    } catch {
      return 0;
    }
  };

  const allTodayClasses = [...todayScheduleRaw]
    .filter((cls) => cls.isClass && cls.courseTitle)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const sortedSchedule = allTodayClasses
    .filter((cls) => parseEndTime(cls.time) > currentTimeMinutes);

  // Calculate overall attendance
  const overallAttendance = attendanceData && attendanceData.length > 0
    ? (attendanceData.reduce((acc, curr) => acc + (Number(curr.courseAttendance) || 0), 0) / attendanceData.length).toFixed(1)
    : "0";

  // Calculate total marks instead of average
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


  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white px-6 pb-32 pt-12 overflow-y-auto font-sans">
      <div className="relative z-10 flex flex-col gap-10 max-w-lg mx-auto">
        
        {/* Curator Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border-2 border-premium-gold p-0.5">
               <div className="h-full w-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <User size={24} className="text-zinc-500" />
               </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-baseline gap-1.5">
              Welcome, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        {/* Hero Section: Mastering the Semester */}
        <section className="mt-2">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Academic Status</p>
           <div className="relative">
              <h2 className="text-[52px] font-black leading-[0.9] tracking-tighter">
                Mastering<span className="text-emerald-400">.</span>
              </h2>
              <h2 className="text-4xl italic font-serif text-zinc-500 tracking-tight mt-1 opacity-80">
                the Semester.
              </h2>
           </div>
        </section>

        {/* Dual Stats Section */}
        <section className="grid grid-cols-2 gap-5">
           {/* Attendance Card */}
           <div className="rounded-3xl bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={22} />
                 </div>
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live</span>
              </div>
              <div className="space-y-1">
                 <span className="text-4xl font-black tracking-tighter">{overallAttendance}%</span>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Attendance</p>
              </div>
              <div className="mt-6 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                   style={{ width: `${Math.min(Number(overallAttendance), 100)}%` }}
                 />
              </div>
           </div>

           {/* Marks Card */}
           <div className="rounded-3xl bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                 <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Sparkles size={22} />
                 </div>
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Peak</span>
              </div>
              <div className="space-y-1">
                 <span className="text-3xl font-black tracking-tighter">{totalMarksDisplay}</span>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total Marks</p>
              </div>
              <div className="mt-6 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.5)]" 
                   style={{ 
                     width: `${(() => {
                        const [obs, max] = totalMarksDisplay.split('/').map(Number);
                        return max ? (obs! / max!) * 100 : 0;
                     })()}%` 
                   }}
                 />
              </div>
           </div>
        </section>

        {/* Today's Schedule */}
        <section className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">Today&apos;s Schedule</h3>
              <button className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-0.5 flex items-center gap-1">
                View Full
              </button>
           </div>
           <div className="space-y-3">
              {allTodayClasses.length > 0 ? (
                allTodayClasses.map((cls, i) => (
                  <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-zinc-900/30 border border-white/5 group transition-all hover:bg-zinc-900/50">
                     <div className="flex flex-col items-start min-w-[70px]">
                        <span className="text-xl font-black tracking-tighter">{cls.time.split(" ")[0]}</span>
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{cls.time.split(" ")[1]}</span>
                     </div>
                     <div className="h-12 w-[1px] bg-zinc-800 group-hover:bg-premium-gold/30 transition-colors" />
                     <div className="flex-1">
                        <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-[0.2em] mb-1 block">
                           {cls.courseCode}
                        </span>
                        <h4 className="font-bold text-base leading-tight">{cls.courseTitle}</h4>
                     </div>
                     <ChevronRight size={18} className="text-zinc-700 group-hover:text-premium-gold transition-colors" />
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-sm italic py-4">No sessions scheduled for today in the gallery.</p>
              )}
           </div>
        </section>

        {/* Upcoming Section */}
        <section className="flex flex-col gap-8">
           <h3 className="text-[28px] font-black tracking-tight">Upcoming</h3>
           
           <div className="space-y-10 relative">
              {/* Vertical timeline line */}
              <div className="absolute left-2.5 top-2 bottom-0 w-[1.5px] bg-zinc-800" />

              {sortedSchedule.length > 0 ? (
                sortedSchedule.map((cls, i) => (
                  <div key={i} className="relative pl-10">
                     {/* Timeline marker */}
                     <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-zinc-950 border-[3px] border-zinc-800 z-10 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-premium-gold shadow-[0_0_8px_rgba(212,175,55,1)]" />
                     </div>

                     <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                              {i === 0 ? "Tomorrow" : "Future"} • {cls.time.split(" ")[0]} {cls.time.split(" ")[1]}
                           </span>
                           <div className="flex -space-x-2">
                              {[...Array(2)].map((_, j) => (
                                <div key={j} className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 overflow-hidden">
                                   <User size={14} className="text-zinc-600 ml-1.5 mt-1.5" />
                                </div>
                              ))}
                              <div className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center text-[8px] font-black text-zinc-500">
                                 +3
                              </div>
                           </div>
                        </div>
                        <h4 className="text-2xl font-black tracking-tight">{cls.courseTitle}</h4>
                        
                        {i === 0 && (
                          <div className="rounded-2xl bg-zinc-900/20 border border-white/5 p-5 mt-1">
                             <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                Preparation for the modular structure presentation. Ensure all data models are mapped at high fidelity.
                             </p>
                          </div>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <div className="pl-10">
                   <p className="text-zinc-600 text-sm font-bold uppercase tracking-[0.2em]">All sessions completed currently.</p>
                </div>
              )}
           </div>
        </section>

      </div>
    </main>
  );
}



