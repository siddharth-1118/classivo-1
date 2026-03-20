"use client";

import { useCalendar, useUserInfo } from "@/hooks/query";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  Sparkles,
  Zap
} from "lucide-react";
import { Month } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { getIndex, formattedMonth } from "@/utils/currentMonth";
import ShinyText from "@/components/ShinyText";

type CalendarDay = Month["days"][number];

const sortMonths = (calendarData: Month[] | undefined) => {
  if (!calendarData) return [];
  const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return [...calendarData].sort((a, b) => {
    const partsA = a.month.split(" '");
    const partsB = b.month.split(" '");
    if (partsA.length !== 2 || partsB.length !== 2) return 0;
    const yearA = parseInt(partsA[1]);
    const yearB = parseInt(partsB[1]);
    const monthA = monthsOrder.indexOf(partsA[0]);
    const monthB = monthsOrder.indexOf(partsB[0]);
    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });
};

const Page = () => {
  const { data: calendarData, isPending } = useCalendar();
  const { data: userInfo } = useUserInfo();
  const sortedData = useMemo(() => sortMonths(calendarData), [calendarData]);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const idx = getIndex({ data: sortedData });
    return idx >= 0 ? idx : 0;
  });

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (!sortedData || sortedData.length === 0) {
    return (
      <main className="flex h-screen w-full justify-center items-center">
        <ShinyText text="No Calendar data found" speed={2} delay={0} color="#a1a1aa" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} />
      </main>
    );
  }

  const currentMonth = sortedData[currentIndex];

  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white px-6 pb-32 pt-12 overflow-y-auto font-sans">
      <div className="relative z-10 flex flex-col gap-10 max-w-lg mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
               <span className="text-zinc-500 font-bold text-xs">{userInfo?.name?.[0] || "C"}</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">
              Welcome back, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        {/* Temporal Matrix Header */}
        <section className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Temporal Matrix</p>
                 <h2 className="text-4xl font-black tracking-tighter uppercase">{currentMonth.month}</h2>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                   className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                   disabled={currentIndex === 0}
                 >
                    <ChevronLeft size={24} />
                 </button>
                 <button 
                   onClick={() => setCurrentIndex(prev => Math.min(sortedData.length - 1, prev + 1))}
                   className="h-12 w-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                   disabled={currentIndex === sortedData.length - 1}
                 >
                    <ChevronRight size={24} />
                 </button>
              </div>
           </div>
        </section>

        {/* Daily Chronicle */}
        <section className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">Daily Chronicle</h3>
              <CalendarIcon size={18} className="text-zinc-800" />
           </div>
           
           <div className="flex flex-col gap-4">
              {currentMonth.days.map((day, i) => {
                const isToday = formattedMonth === currentMonth.month && day.date === new Date().getDate().toString();
                return <DayCard key={i} day={day} month={currentMonth.month} isToday={isToday} />;
              })}
           </div>
        </section>

      </div>
    </main>
  );
};

const DayCard = ({ day, month, isToday }: { day: CalendarDay; month: string; isToday: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isToday && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isToday]);

  const event = (day.event || "").toLowerCase();
  const isHoliday = event.includes("holiday") || day.dayOrder === "-";
  const isDeadline = event.includes("last") || event.includes("end") || event.includes("deadline");
  const isWorking = event.includes("working") || (day.dayOrder !== "-" && day.dayOrder !== "");

  let toneColor = "zinc";
  let toneIcon = Zap;
  
  if (isHoliday) { toneColor = "red"; toneIcon = Flag; }
  else if (isDeadline) { toneColor = "premium-gold"; toneIcon = Clock; }
  else if (isWorking) { toneColor = "emerald"; toneIcon = Sparkles; }

  return (
    <div 
      ref={scrollRef}
      className={`rounded-[32px] bg-zinc-900/30 border p-7 flex flex-col gap-6 group transition-all hover:bg-zinc-900/50 ${isToday ? 'border-premium-gold shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-zinc-900/60' : 'border-white/5'}`}
    >
       <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full bg-${toneColor === 'premium-gold' ? 'premium-gold' : toneColor + '-500'}`} />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{day.day}</span>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter">{day.date}</span>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{month.split(" ")[0]}</span>
             </div>
          </div>
          <div className={`h-10 w-10 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-${toneColor === 'premium-gold' ? 'premium-gold' : toneColor + '-400'}`}>
             {React.createElement(toneIcon, { size: 18 })}
          </div>
       </div>

       <div className="space-y-4">
          <div className="rounded-2xl bg-zinc-950/50 border border-white/5 p-4">
             <p className={`text-sm font-medium leading-relaxed ${isHoliday ? 'text-zinc-500 italic' : 'text-zinc-300'}`}>
                {day.event || (isWorking ? `Standard Academic Session - Order ${day.dayOrder}` : 'No specific events logged.')}
             </p>
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Day Order</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isHoliday ? 'bg-zinc-800/50 text-zinc-600 border-zinc-700/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                   {day.dayOrder || "N/A"}
                </span>
             </div>
             <span className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter">Chronicle Ref. {day.date}</span>
          </div>
       </div>
    </div>
  );
};

export default Page;
