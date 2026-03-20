"use client";

import React from "react";
import { useAttendance, useUserInfo } from "@/hooks/query";
import { AttendanceDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import {
  AlertTriangle,
  Bell,
  ShieldAlert,
  TrendingUp
} from "lucide-react";
import ShinyText from "@/components/ShinyText";

const AttendancePage = () => {
  const { data, isPending } = useAttendance();
  const { data: userInfo } = useUserInfo();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (!data || data.length === 0)
    return (
      <div className="flex w-full justify-center items-center h-screen">
        <ShinyText text="No attendance data found" speed={2} delay={0} color="#a1a1aa" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} />
      </div>
    );

  const overallPercent = (data.reduce((acc, curr) => acc + (Number(curr.courseAttendance) || 0), 0) / data.length).toFixed(0);
  const isOverallSafe = Number(overallPercent) >= 75;
  const criticalSubjects = data.filter((item) => Number(item.courseAttendance) < 75);
  const safeSkipSubjects = data.filter((item) => item.courseAttendanceStatus?.status === "margin");
  const totalRecoveryClasses = criticalSubjects.reduce((sum, item) => sum + (item.courseAttendanceStatus?.classes || 0), 0);
  const totalSafeSkips = safeSkipSubjects.reduce((sum, item) => sum + (item.courseAttendanceStatus?.classes || 0), 0);
  const lowestSubject = [...data].sort((a, b) => Number(a.courseAttendance) - Number(b.courseAttendance))[0];

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

        {/* Overall Status Card */}
        <section className="relative">
           <div className={`relative h-[300px] w-full rounded-[40px] overflow-hidden flex flex-col items-center justify-center border border-white/10`}>
              {/* Abstract Green Shape (simplified as a tilted box) */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
                 <div className="h-48 w-48 bg-emerald-500 rotate-12 rounded-3xl blur-[80px]" />
                 <div className="absolute h-56 w-56 border-[20px] border-emerald-500 rotate-[-15deg] rounded-3xl opacity-60" />
              </div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80">Overall Status</p>
                 <div className="flex items-baseline justify-center">
                    <span className="text-[100px] font-black leading-none tracking-tighter">{overallPercent}</span>
                    <span className="text-4xl font-black text-zinc-500 mb-4 ml-1">%</span>
                 </div>
                 <p className={`mt-2 text-[10px] font-black uppercase tracking-[0.4em] ${isOverallSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOverallSafe ? 'On Track' : 'Critical'}
                 </p>
              </div>
           </div>

           {/* Trend Card */}
           <div className="mt-5 rounded-[32px] bg-zinc-900/40 border border-white/5 p-6 flex items-center justify-between backdrop-blur-md">
              <div className="space-y-1">
                 <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">30 Day Trend</p>
                 <h3 className="text-lg font-black tracking-tight">+4.2% Growth</h3>
              </div>
              <div className="h-10 w-32 relative">
                 {/* Simple SVG Sparkline */}
                 <svg viewBox="0 0 100 20" className="h-full w-full">
                    <path d="M0,15 Q25,18 50,10 T100,2" fill="none" stroke="#52e2a0" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="100" cy="2" r="2" fill="#52e2a0" />
                 </svg>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InsightCard
            icon={criticalSubjects.length > 0 ? AlertTriangle : TrendingUp}
            label="Danger Subjects"
            value={String(criticalSubjects.length)}
            tone={criticalSubjects.length > 0 ? "red" : "emerald"}
            helper={criticalSubjects.length > 0 ? `${totalRecoveryClasses} recovery classes needed` : "No urgent attendance risks"}
          />
          <InsightCard
            icon={ShieldAlert}
            label="Safe To Skip"
            value={String(totalSafeSkips)}
            tone="sky"
            helper="Total safe margins across subjects"
          />
          <InsightCard
            icon={TrendingUp}
            label="Lowest Subject"
            value={lowestSubject?.courseCode || "--"}
            tone="amber"
            helper={lowestSubject ? `${lowestSubject.courseAttendance}% attendance` : "Waiting for attendance data"}
          />
        </section>

        <section className="rounded-[32px] border border-red-400/15 bg-red-500/8 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-200/80">Attendance Predictor</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white">
            {criticalSubjects.length > 0 ? "Action needed this week" : "You still have breathing room"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {criticalSubjects.length > 0
              ? `${criticalSubjects[0]?.courseTitle || "One subject"} is below 75%. Focus on the next ${criticalSubjects[0]?.courseAttendanceStatus?.classes || 0} class${(criticalSubjects[0]?.courseAttendanceStatus?.classes || 0) === 1 ? "" : "es"} to get back on track.`
              : `You currently have ${totalSafeSkips} safe skip chances across all margin subjects. Use them carefully around labs, quizzes, and internal assessments.`}
          </p>
        </section>

        {/* Active Disciplines */}
        <section className="flex flex-col gap-6">
           <h2 className="text-2xl font-black tracking-tight">Active Disciplines</h2>
           <div className="flex flex-col gap-4">
              {data.map((item, i) => (
                <SubjectCard key={i} item={item} />
              ))}
           </div>
        </section>

      </div>
    </main>
  );
};

const SubjectCard = ({ item }: { item: AttendanceDetail }) => {
  const isSafe = Number(item.courseAttendance) >= 75;
  const status = isSafe ? "SAFE" : "CRITICAL";
  const classesCount = item.courseAttendanceStatus?.classes || 0;
  
  return (
    <div className="rounded-[32px] bg-zinc-900/30 border border-white/5 p-7 flex flex-col gap-6 group transition-all hover:bg-zinc-900/50">
       <div className="flex items-start justify-between">
          <div className="space-y-1">
             <h3 className="text-xl font-bold tracking-tight leading-none">{item.courseTitle}</h3>
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Module ID: {item.courseCode}</p>
          </div>
          <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
             {status}
          </span>
       </div>

       <div className="flex items-end justify-between">
          <div className="space-y-2">
             <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black tracking-tighter">{item.courseAttendance}%</span>
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Attendance</span>
             </div>
             <p className={`text-[10px] font-bold ${isSafe ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                {item.courseAttendanceStatus?.status === "required" 
                  ? `Need ${classesCount} more attended class${classesCount === 1 ? "" : "es"} to recover` 
                  : `Can safely miss ${classesCount} class${classesCount === 1 ? "" : "es"} before 75%`}
             </p>
             <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
               Conducted {item.courseConducted} · Absent {item.courseAbsent}
             </p>
          </div>
          
          {/* Mini Bar Chart / Sparkline */}
          <div className="flex items-end gap-1.5 h-12">
             {[30, 60, 45, 80, 50, 90, 70].map((h, i) => (
               <div 
                 key={i} 
                 className={`w-2 rounded-full ${isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20'}`} 
                 style={{ height: `${h}%` }}
               >
                  {i === 6 && <div className={`w-full h-full rounded-full ${isSafe ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />}
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const InsightCard = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: "red" | "emerald" | "sky" | "amber";
}) => {
  const tones = {
    red: "bg-red-500/10 text-red-300 border-red-400/15",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-400/15",
    sky: "bg-sky-500/10 text-sky-300 border-sky-400/15",
    amber: "bg-amber-500/10 text-amber-200 border-amber-400/15",
  };

  return (
    <div className={`rounded-[28px] border p-5 backdrop-blur-xl ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{label}</p>
        <Icon size={16} />
      </div>
      <div className="mt-4 text-2xl font-black tracking-tight text-white">{value}</div>
      <p className="mt-2 text-xs leading-5 text-zinc-300">{helper}</p>
    </div>
  );
};

export default AttendancePage;
