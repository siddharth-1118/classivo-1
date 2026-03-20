"use client";

import { useCourse, useUserInfo } from "@/hooks/query";
import React from "react";
import { CourseDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { 
  BookOpen, 
  User, 
  MapPin, 
  Clock, 
  Bell, 
  Layers,
  ArrowUpRight,
  ExternalLink
} from "lucide-react";
import ShinyText from "@/components/ShinyText";

const Page = () => {
  const { data, isPending } = useCourse();
  const { data: userInfo } = useUserInfo();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (!data || data.length === 0) {
    return (
      <main className="flex h-screen w-full justify-center items-center">
        <ShinyText text="No Course data found" speed={2} delay={0} color="#a1a1aa" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} />
      </main>
    );
  }

  const totalCredits = data.reduce((acc, curr) => acc + (Number(curr.courseCredit) || 0), 0);

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

        {/* Learning Canvas Hub */}
        <section className="relative">
           <div className={`relative h-[240px] w-full rounded-[40px] overflow-hidden flex flex-col items-center justify-center border border-white/10 bg-zinc-900/40 backdrop-blur-xl`}>
              {/* Dynamic Glow */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
                 <div className="h-40 w-40 bg-blue-500 rounded-full blur-[80px]" />
                 <div className="absolute h-48 w-48 border-[2px] border-blue-400/30 rounded-[50%] animate-pulse" />
              </div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Learning Canvas</p>
                 <div className="flex items-baseline justify-center">
                    <span className="text-8xl font-black leading-none tracking-tighter">{totalCredits}</span>
                    <span className="text-2xl font-black text-zinc-500 ml-2">Credits</span>
                 </div>
                 <div className="mt-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                    <Layers size={12} className="text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Semester Active</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Course Modules */}
        <section className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Active Modules</h2>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{data.length} Subjects</span>
           </div>
           <div className="flex flex-col gap-4">
              {data.map((item, i) => (
                <CourseCard key={i} item={item} />
              ))}
           </div>
        </section>

      </div>
    </main>
  );
};

const CourseCard = ({ item }: { item: CourseDetail }) => {
  return (
    <div className="rounded-[32px] bg-zinc-900/30 border border-white/5 p-7 flex flex-col gap-8 group transition-all hover:bg-zinc-900/50">
       <div className="flex items-start justify-between">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                   {item.courseCode}
                </span>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                   {item.courseType}
                </span>
             </div>
             <h3 className="text-xl font-bold tracking-tight leading-none group-hover:text-premium-gold transition-colors">{item.courseTitle}</h3>
          </div>
          <div className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-premium-gold group-hover:border-premium-gold/30 transition-all">
             <ArrowUpRight size={18} />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                   <User size={14} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Faculty</p>
                   <p className="text-xs font-bold text-zinc-300 truncate max-w-[120px]">{item.courseFaculty}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                   <MapPin size={14} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Location</p>
                   <p className="text-xs font-bold text-zinc-300">{item.courseRoomNo || "Main Hall"}</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                   <Clock size={14} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Slot</p>
                   <p className="text-xs font-bold text-zinc-300 font-mono">
                      {Array.isArray(item.courseSlot) ? item.courseSlot[0] : item.courseSlot}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold">
                   <BookOpen size={14} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[8px] font-black text-premium-gold/60 uppercase tracking-widest">Resources</p>
                   <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-zinc-300">Access</p>
                      <ExternalLink size={10} className="text-zinc-600" />
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="pt-2">
          <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
             <div className="h-full bg-blue-500/50 w-[70%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
          </div>
       </div>
    </div>
  );
};

export default Page;
